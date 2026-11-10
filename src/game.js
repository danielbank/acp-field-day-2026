// game.js — the rules of the quest: move the car, junk, coins and tots, bonks, the fry move,
// then let the current stage do its thing. Called every frame while the screen is 'playing'.

import { CONFIG } from './config.js';
import { state, showBanner, addPopup } from './state.js';
import { input } from './input.js';
import { playSound } from './audio.js';
import { updateHero } from './entities/hero.js';
import { spawnFaller, updateFaller, isOffScreen } from './entities/faller.js';
import { spawnCoin, updateCoin } from './entities/coin.js';
import { updateTot, isTotGone } from './entities/tot.js';
import { updateBoss, bossHitRadius } from './entities/boss.js';
import { circleHitsHero } from './collision.js';
import { updateTwists } from './twists.js';
import { carSpeed, gainXp, loseXp, chargeFry, fryReady, fryUnlocked } from './rpg.js';
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
  for (const f of state.fallers) updateFaller(f, dt);
  for (const c of state.coins) updateCoin(c, dt);
  for (const t of state.tots) updateTot(t, dt);
  if (state.boss) updateBoss(state.boss, dt);

  useFryMove(dt, stage);
  const done = stage.update(dt);
  state.presses = 0;
  state.fryPresses = 0;

  // bonks: junk that touches the car disappears and costs a little XP (you never lose!)
  state.fallers = state.fallers.filter((f) => {
    if (circleHitsHero(f.x, f.y, f.r * 0.85, hero) && bonk()) return false;
    return !isOffScreen(f);
  });
  if (state.boss && circleHitsHero(state.boss.x, state.boss.y, bossHitRadius(state.boss), hero)) bonk();

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

  for (const p of state.popups) { p.timeLeft -= realDt; p.y -= 40 * realDt; }
  state.popups = state.popups.filter((p) => p.timeLeft > 0);
  if (state.banner && (state.banner.timeLeft -= realDt) <= 0) state.banner = null;
  if (done) nextStage();
}

function spawnStuff(dt, stage) {
  const junkEvery = stage.junkEvery();
  state.spawnTimer -= dt;
  if (junkEvery > 0 && state.spawnTimer <= 0 && state.fryTimer <= 0) {
    state.fallers.push(spawnFaller(state.lap, state.gravity));
    state.spawnTimer = junkEvery;
  }
  state.coinTimer -= dt;
  if (stage.coins && state.coinTimer <= 0) {
    state.coins.push(spawnCoin());
    state.coinTimer = CONFIG.coins.spawnEverySeconds;
  }
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

// Returns true if the bonk counted (the car wasn't blinking).
function bonk() {
  const hero = state.hero;
  if (hero.hurtTimer > 0 || state.screen !== 'playing') return false;
  hero.hurtTimer = CONFIG.invincibleSeconds;
  hero.slowTimer = CONFIG.hero.slowSeconds;
  loseXp(CONFIG.rpg.xpLostPerBonk, hero.x, hero.y - hero.h / 2);
  playSound('hit');
  return true;
}
