// game.js — the rules of one round: score, levels, spawning, moving and bonks.
// Called every frame while the screen is 'playing'.

import { CONFIG } from './config.js';
import { state, showBanner, endRound } from './state.js';
import { input } from './input.js';
import { playSound } from './audio.js';
import { updateHero } from './entities/hero.js';
import { spawnDino, updateDino } from './entities/dino.js';
import { updateBoss, bossHitRadius } from './entities/boss.js';
import { circleHitsHero } from './collision.js';
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

  // send in a new dino
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    state.dinos.push(spawnDino(state.level));
    state.spawnTimer = Math.max(CONFIG.fastestSpawnSeconds,
      CONFIG.spawnEverySeconds - (state.level - 1) * CONFIG.spawnFasterPerLevel);
  }

  // move everything
  if (updateHero(state.hero, dt, input)) bonk();   // scraped the ground: ouch!
  updateLasers(dt);
  if (state.boss) updateBoss(state.boss, dt);

  // a dino that reaches you bonks you and flies off
  state.dinos = state.dinos.filter((d) => {
    if (!updateDino(d, dt)) return true;
    bonk();
    return false;
  });
  if (state.boss && circleHitsHero(state.boss.x, state.boss.y, bossHitRadius(state.boss), state.hero)) bonk();

  if (state.banner && (state.banner.timeLeft -= realDt) <= 0) state.banner = null;
}

// Returns true if the hit counted (the hero wasn't blinking).
function bonk() {
  const hero = state.hero;
  if (hero.hurtTimer > 0 || state.screen !== 'playing') return false;
  state.lives -= 1;
  hero.hurtTimer = CONFIG.invincibleSeconds;
  playSound('hit');
  if (state.lives <= 0) endRound();
  return true;
}
