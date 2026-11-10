// state.js — everything the game remembers, plus which screen we're on.
// Screens: 'title' → 'playing' ⇄ 'paused' → 'gameover' → 'playing' …

import { CONFIG } from './config.js';
import { createHero, flap } from './entities/hero.js';
import { unlockAudio, playSound, toggleMute } from './audio.js';
import { fireLaser } from './lasers.js';

const BEST_SCORE_KEY = 'robo-dodge-best';

export const state = {
  screen: 'title',
  best: loadBest(),
};

// Fresh values for a brand-new round.
export function resetRound() {
  Object.assign(state, {
    hero: createHero(),
    dinos: [],
    dinosBonked: 0,
    zapZones: [],        // laser walls flying at you
    zapTimer: CONFIG.zapZone.firstAfterSeconds,
    lasers: [],          // laser beams on screen right now
    pops: [],            // star puffs from bonked things
    laserCooldown: 0,
    boss: null,
    bossesBeaten: 0,
    nextBossAt: CONFIG.boss.dinosToSummon,   // boss shows up when dinosBonked reaches this
    score: 0,
    lives: CONFIG.lives,
    level: 1,
    time: 0,
    spawnTimer: 0,
    gravity: 1,          // 1 = things fall down, -1 = things fall up (gravityFlips twist)
    flipTimer: 0,
    gameSpeed: 1,        // 1 = normal speed (speedUpOverTime twist raises it)
    banner: null,        // big message in the middle, like "LEVEL 2!"
    isNewBest: false,
  });
}

export function showBanner(text, seconds = 1.6) {
  state.banner = { text, timeLeft: seconds };
}

export function endRound() {
  state.screen = 'gameover';
  const finalScore = Math.floor(state.score);
  if (finalScore > state.best) {
    state.best = finalScore;
    state.isNewBest = true;
    try { localStorage.setItem(BEST_SCORE_KEY, String(finalScore)); } catch { /* storage blocked: fine */ }
  }
  playSound('gameOver');
}

// The screen state machine: what each action does on each screen.
// Actions come from input.js: 'start', 'tap', 'fire', 'pause', 'mute', 'blur'.
export function handleAction(action) {
  if (action === 'mute') return toggleMute();
  const screen = state.screen;
  if ((screen === 'title' || screen === 'gameover') && (action === 'start' || action === 'tap')) {
    unlockAudio();
    resetRound();
    state.screen = 'playing';
    playSound('start');
  } else if (screen === 'playing' && action === 'start') {
    flap(state.hero);
    playSound('flap');
  } else if (screen === 'playing' && (action === 'tap' || action === 'fire')) {
    fireLaser();
  } else if (screen === 'playing' && (action === 'pause' || action === 'blur')) {
    state.screen = 'paused';
  } else if (screen === 'paused' && (action === 'pause' || action === 'start' || action === 'tap')) {
    state.screen = 'playing';
  }
}

function loadBest() {
  try { return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0; } catch { return 0; }
}

resetRound();
