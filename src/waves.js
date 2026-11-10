// waves.js — the hordes arrive in waves. Between waves the shop opens.
// After the last wave in CONFIG.waves, the dragon shows up!

import { CONFIG } from './config.js';
import { state, showBanner } from './state.js';
import { playSound } from './audio.js';
import { rand, clamp } from './view.js';
import { hitsProp } from './entities/props.js';
import { createMob } from './entities/mobs.js';
import { createDragon } from './entities/dragon.js';
import { spawnStars } from './effects.js';

const S = CONFIG.shop;

export function updateWaves(dt) {
  if (state.waveState === 'break') {
    state.breakTimer -= dt;
    if (state.breakTimer <= 0) startNextWave();
  } else if (state.waveState === 'fighting') {
    state.spawnTimer -= dt;
    if (state.spawnQueue.length && state.spawnTimer <= 0 && state.mobs.length < CONFIG.maxMobsAtOnce) {
      spawnNearHero(state.spawnQueue.pop());
      state.spawnTimer = CONFIG.spawnEverySeconds;
    }
    if (!state.spawnQueue.length && !state.mobs.length) waveCleared();
  }
}

export function startNextWave() {
  state.wave += 1;
  state.breakTimer = 0;
  if (state.wave > CONFIG.waves.length) {
    state.waveState = 'boss';
    state.mobs.push(createDragon(state.loop));
    showBanner(CONFIG.text.dragonArrives, 2.5);
    playSound('roar');
    return;
  }
  const more = 1 + (state.loop - 1) * CONFIG.newGamePlus.countBoostPerLoop;
  const queue = [];
  for (const [kind, n] of Object.entries(CONFIG.waves[state.wave - 1])) {
    for (let i = 0; i < Math.round(n * more); i++) queue.push(kind);
  }
  queue.sort(() => Math.random() - 0.5);
  state.spawnQueue = queue;
  state.spawnTimer = 0.5;
  state.waveState = 'fighting';
  showBanner(CONFIG.text.waveStart.replace('{wave}', state.wave));
  playSound('wave');
}

function waveCleared() {
  state.waveState = 'break';
  state.breakTimer = CONFIG.breakSeconds;
  const bonus = CONFIG.waveBonusCoins * state.wave;
  state.coins += bonus;
  showBanner(`${CONFIG.text.waveCleared}  +${bonus} coins`, 2.5);
  playSound('victory');
}

// Mobs pop in around you (just out of reach), never inside a pillar or the shop.
function spawnNearHero(kind) {
  const A = CONFIG.arena;
  const hero = state.hero;
  let x = 0;
  let y = 0;
  for (let tries = 0; tries < 20; tries++) {
    const a = rand(0, Math.PI * 2);
    const d = rand(CONFIG.spawnMinDistance, CONFIG.spawnMaxDistance);
    x = clamp(hero.x + Math.cos(a) * d, 40, A.width - 40);
    y = clamp(hero.y + Math.sin(a) * d, 40, A.depth - 40);
    const inShop = x > S.x - 40 && x < S.x + S.w + 40 && y > S.y - 40 && y < S.y + S.h + 40;
    if (!inShop && !hitsProp(x, y, 0) && Math.hypot(x - hero.x, y - hero.y) > 250) break;
  }
  state.mobs.push(createMob(kind, x, y, state.loop));
  spawnStars(x, y, 10, 4);
}
