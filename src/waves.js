// waves.js — the hordes arrive in waves. Between waves the shop opens.
// After the last wave in CONFIG.waves, the dragon shows up!

import { CONFIG } from './config.js';
import { state, showBanner } from './state.js';
import { playSound } from './audio.js';
import { rand, pick } from './view.js';
import { createMob } from './entities/mobs.js';
import { createDragon } from './entities/dragon.js';
import { spawnStars } from './effects.js';

export function updateWaves(dt) {
  if (state.waveState === 'break') {
    state.breakTimer -= dt;
    if (state.breakTimer <= 0) startNextWave();
  } else if (state.waveState === 'fighting') {
    state.spawnTimer -= dt;
    if (state.spawnQueue.length && state.spawnTimer <= 0 && state.mobs.length < CONFIG.maxMobsAtOnce) {
      spawnAtEdge(state.spawnQueue.pop());
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

// Mobs pop in at the edges of the arena (but not inside the shop corner).
function spawnAtEdge(kind) {
  const A = CONFIG.arena;
  const side = pick(['left', 'right', 'front', 'back']);
  let x = rand(40, A.width - 40);
  let y = rand(40, A.depth - 40);
  if (side === 'left') x = 30;
  if (side === 'right') x = A.width - 30;
  if (side === 'front') y = A.depth - 30;
  if (side === 'back') { y = 30; x = rand(260, A.width - 40); }
  if (side === 'left' && y < 160) y = rand(160, A.depth - 40);
  state.mobs.push(createMob(kind, x, y, state.loop));
  spawnStars(x, y, 10, 4);
}
