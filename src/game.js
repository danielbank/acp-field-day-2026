// game.js — the rules of the quest: steer the car, move junk/coins/tots/missiles, bonks, the fry move,
// then let the current stage do its thing. Called every frame while the screen is 'playing'.

import { CONFIG } from './config.js';
import { state, showBanner, addPopup } from './state.js';
import { input } from './input.js';
import { playSound } from './audio.js';
import { updateHero } from './entities/hero.js';
import { spawnFaller, updateFaller, isOffScreen } from './entities/faller.js';
import { spawnCoin, updateCoin } from './entities/coin.js';
import { updateTot, isTotGone } from './entities/tot.js';
import { spawnMissile, steerMissile, isMissileGone } from './entities/missile.js';
import { updateBoss, bossHitRadius } from './entities/boss.js';
import { circleHitsHero } from './collision.js';
import { updateTwists } from './twists.js';
import { carSpeed, gainXp, chargeFry, fryReady, fryUnlocked, missilesUnlocked, bonkHero, difficulty } from './rpg.js';
import { currentStage, startStage, nextStage } from './stages/index.js';

export function updateGame(realDt) {
  if (!state.stageStarted) startStage();
  updateTwists(realDt);
  const dt = realDt * state.gameSpeed;
  const stage = currentStage();
  const hero = state.hero;
  state.time += dt;
  state.stageTime += dt;

  const slow = hero.slowTimer > 0 ? CONFIG.hero.slowFactor : 1;
  updateHero(hero, dt, input, state.gravity, carSpeed() * slow);
  spawnStuff(dt, stage);
  for (const f of state.fallers) {
    updateFaller(f, dt);
    if (f.homing) {                                  // heat-seeking potato missiles chase the car sideways
      const step = CONFIG.boss.potatoMissileHoming * dt;
      f.x += Math.max(-step, Math.min(step, hero.x - f.x));
    }
  }
  for (const c of state.coins) updateCoin(c, dt);
  for (const t of state.tots) updateTot(t, dt);
  if (state.boss) updateBoss(state.boss, dt);

  useFryMove(dt, stage);
  useMissiles(dt, stage);
  const done = stage.update(dt);
  state.presses = 0;
  state.fryPresses = 0;
  state.missilePresses = 0;

  // your tots can shoot down junk and enemy shots
  state.fallers = state.fallers.filter((f) => {
    const tot = state.tots.find((t) => Math.hypot(t.x - f.x, t.y - f.y) < t.r + f.r);
    if (!tot) return true;
    tot.y = -9999;
    playSound('pop');
    return false;
  });
  // bonks: junk or shots that touch the car disappear and cost a little XP (you never lose!)
  state.fallers = state.fallers.filter((f) => {
    if (circleHitsHero(f.x, f.y, f.r * 0.85, hero) && bonkHero()) return false;
    return !isOffScreen(f);
  });
  if (state.boss && circleHitsHero(state.boss.x, state.boss.y, bossHitRadius(state.boss), hero)) bonkHero();

  // coins: grab them for XP
  state.coins = state.coins.filter((c) => {
    if (circleHitsHero(c.x, c.y, c.r, hero)) {
      gainXp(CONFIG.coins.xp, c.x, c.y);
      chargeFry(1);
      playSound('coin');
      return false;
    }
    return !isOffScreen(c);
  });
  state.tots = state.tots.filter((t) => !isTotGone(t));

  for (const p of state.popups) { p.timeLeft -= realDt; p.rise += 50 * realDt; }
  state.popups = state.popups.filter((p) => p.timeLeft > 0);
  if (state.banner && (state.banner.timeLeft -= realDt) <= 0) state.banner = null;
  if (done) nextStage();
}

function spawnStuff(dt, stage) {
  const D = difficulty();
  const junkEvery = stage.junkEvery() * D.spawnGap;
  state.spawnTimer -= dt;
  if (junkEvery > 0 && state.spawnTimer <= 0 && state.fryTimer <= 0) {
    const f = spawnFaller(state.lap, state.gravity);
    f.vy *= D.junkSpeed;
    state.fallers.push(f);
    state.spawnTimer = junkEvery;
  }
  state.coinTimer -= dt;
  if (stage.coins && state.coinTimer <= 0) {
    state.coins.push(spawnCoin());
    state.coinTimer = CONFIG.coins.spawnEverySeconds;
  }
}

// HEAT-SEEKING POTATO MISSILES: press E. Each one chases the nearest enemy, target or piece of junk.
function useMissiles(dt, stage) {
  const hero = state.hero;
  state.missileTimer = Math.max(0, state.missileTimer - dt);
  if (state.missilePresses > 0) {
    if (!missilesUnlocked()) {
      addPopup(`Missiles unlock at LV ${CONFIG.missiles.unlockLevel}`, hero.x, hero.y - 80, CONFIG.colors.silver);
    } else if (state.missileTimer <= 0) {
      state.missiles.push(spawnMissile(hero));
      state.missileTimer = CONFIG.missiles.cooldownSeconds;
      playSound('missile');
    }
  }
  const candidates = [...(stage.missileTargets ? stage.missileTargets() : []), ...state.fallers];
  for (const m of state.missiles) {
    let target = null;
    let best = Infinity;
    for (const c of candidates) {
      const d = Math.hypot(c.x - m.x, c.y - m.y);
      if (c.y < m.y + 40 && d < best) { best = d; target = c; }
    }
    steerMissile(m, target, dt);
    if (target && Math.hypot(target.x - m.x, target.y - m.y) < m.r + target.r) {
      m.dead = true;
      playSound('megaBonk');
      if (state.fallers.includes(target)) {
        state.fallers = state.fallers.filter((f) => f !== target);
        candidates.splice(candidates.indexOf(target), 1);
        gainXp(1, target.x, target.y);
      } else if (stage.onMissileHit) {
        stage.onMissileHit(target);
      }
    }
  }
  state.missiles = state.missiles.filter((m) => !isMissileGone(m));
}

// ULTIMATE FRY MOVE: press F when the fry meter is full. Clears junk and helps the current stage.
function useFryMove(dt, stage) {
  state.fryTimer = Math.max(0, state.fryTimer - dt);
  if (state.fryTimer > 0) state.fallers = [];
  if (state.fryPresses === 0) return;
  const hero = state.hero;
  if (!fryReady()) {
    const msg = fryUnlocked() ? 'Fry meter not full yet!' : `Fry move unlocks at LV ${CONFIG.fry.unlockLevel}`;
    addPopup(msg, hero.x, hero.y - 80, CONFIG.colors.silver);
    return;
  }
  state.fryCharge = 0;
  state.fryTimer = CONFIG.fry.seconds;
  state.fallers = [];
  if (stage.onFry) stage.onFry();
  showBanner(CONFIG.text.fryMove);
  playSound('fry');
}
