// game.js — the rules of one round: score, levels, spawning, moving and bonks.
// Called every frame while the screen is 'playing'.

import { CONFIG } from './config.js';
import { state, showBanner, endRound } from './state.js';
import { input } from './input.js';
import { playSound } from './audio.js';
import { updateHero } from './entities/hero.js';
import { spawnDino, updateDino } from './entities/dino.js';
import { spawnZapZone, updateZapZone } from './entities/zapZone.js';
import { createBoss, updateBoss } from './entities/boss.js';
import { updateTwists } from './twists.js';
import { updateLasers } from './lasers.js';

export function updateGame(realDt) {
  updateTwists(realDt);
  const dt = realDt * state.gameSpeed;

  // score and level
  state.time += dt;
  state.score += CONFIG.scorePerSecond * dt;
  const newLevel = 1 + Math.floor(state.time / CONFIG.secondsPerLevel);
  if (newLevel > state.level) {
    state.level = newLevel;
    showBanner(CONFIG.text.levelUp.replace('{level}', newLevel));
    playSound('levelUp');
  }

  // the raccoon boss shows up after enough dinos get bonked
  if (!state.boss && state.dinosBonked >= state.nextBossAt) {
    state.boss = createBoss(state.bossesBeaten);
    showBanner(CONFIG.text.bossIncoming);
    playSound('boss');
  }

  // send in a new dino (while the boss is here, it sends them instead)
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0 && !state.boss) {
    state.dinos.push(spawnDino(state.level));
    state.spawnTimer = Math.max(CONFIG.fastestSpawnSeconds,
      CONFIG.spawnEverySeconds - (state.level - 1) * CONFIG.spawnFasterPerLevel);
  }

  // send in a zap zone (laser wall)
  state.zapTimer -= dt;
  if (state.zapTimer <= 0) {
    state.zapZones.push(spawnZapZone());
    state.zapTimer = CONFIG.zapZone.everySeconds;
  }

  // move everything
  if (updateHero(state.hero, dt, input)) bonk(CONFIG.damage.ground);   // scraped the ground: ouch!
  updateLasers(dt);
  if (state.boss && updateBoss(state.boss, dt)) {
    state.dinos.push(spawnDino(state.level, state.boss.x, state.boss.y + 60));
  }

  // a laser wall that reaches you: zap if you're inside it, points if you dodged it
  state.zapZones = state.zapZones.filter((z) => {
    const result = updateZapZone(z, dt, state.hero);
    if (result === 'hit') bonk(CONFIG.damage.zapZone);
    if (result === 'passed') { state.score += CONFIG.zapZone.passPoints; playSound('bonus'); }
    return result === null;
  });

  // a dino that reaches you bonks you and flies off
  state.dinos = state.dinos.filter((d) => {
    if (!updateDino(d, dt)) return true;
    bonk(CONFIG.damage.dino);
    return false;
  });

  if (state.banner && (state.banner.timeLeft -= realDt) <= 0) state.banner = null;
}

// Takes away some health. Returns true if the hit counted (the hero wasn't blinking).
function bonk(damage) {
  const hero = state.hero;
  if (hero.hurtTimer > 0 || state.screen !== 'playing') return false;
  state.health = Math.max(0, state.health - damage);
  hero.hurtTimer = CONFIG.invincibleSeconds;
  playSound('hit');
  if (state.health <= 0) endRound();
  return true;
}
