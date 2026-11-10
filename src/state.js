// state.js — everything the game remembers, plus which screen we're on.
// Screens: 'title' → 'playing' ⇄ 'paused' → 'gameover' → 'playing' …   Modes: 'race' or 'sandbox' (Free Play).

import { CONFIG } from './config.js';
import { SEG } from './road.js';
import { createCar } from './entities/car.js';
import { unlockAudio, playSound, toggleMute } from './audio.js';

const BEST_SCORE_KEY = 'robo-racer-best';

export const state = {
  screen: 'title',
  mode: 'race',
  best: loadBest(),
};

// Fresh values for a brand-new round.
export function resetRound(mode = 'race') {
  Object.assign(state, {
    mode,
    car: createCar(),
    things: [],          // everything on the road (see entities/things.js)
    wave: null,          // the alien blob wave, when one is happening
    waveIn: 0,           // seconds until the next wave arrives (0 = none coming)
    particles: [],       // confetti
    popups: [],          // floating "+50" text
    score: 0,
    lives: CONFIG.lives,
    timeLeft: CONFIG.startTime,
    checkpoints: 0,
    level: 1,            // goes up at every checkpoint (things get closer together)
    nextSpawnZ: CONFIG.spawn.firstThingAt,
    nextCheckpointZ: CONFIG.checkpointEverySegments * SEG,
    gateSpawned: false,
    powers: { star: 0, magnet: 0, spring: false },
    skyX: 0,             // how far the stars have slid sideways (from curves)
    banner: null,        // big message in the middle, like "CHECKPOINT!"
    isNewBest: false,
    endReason: '',
  });
}

export function showBanner(text, seconds = 1.6, color = CONFIG.colors.warning) {
  state.banner = { text, timeLeft: seconds, color };
}

export function endRound(reason) {
  state.screen = 'gameover';
  state.endReason = reason;
  const finalScore = Math.floor(state.score);
  if (finalScore > state.best) {
    state.best = finalScore;
    state.isNewBest = true;
    try { localStorage.setItem(BEST_SCORE_KEY, String(finalScore)); } catch { /* storage blocked: fine */ }
  }
  playSound('gameOver');
}

function startRound(mode) {
  unlockAudio();
  resetRound(mode);
  state.screen = 'playing';
  showBanner(mode === 'sandbox' ? CONFIG.text.freePlay : CONFIG.text.go, 1.2, CONFIG.colors.good);
  playSound('start');
}

// The screen state machine: what each action does on each screen.
// Actions come from input.js: 'start', 'tap', 'freeplay', 'pause', 'quit', 'mute', 'blur' (+ driving actions in game.js).
export function handleAction(action) {
  if (action === 'mute') return toggleMute();
  const screen = state.screen;
  if (screen === 'title' || screen === 'gameover') {
    if (action === 'start' || action === 'tap') startRound('race');
    if (action === 'freeplay') startRound('sandbox');
  } else if (action === 'quit') {
    state.screen = 'title';
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
