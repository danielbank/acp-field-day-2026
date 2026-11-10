// state.js — everything the game remembers, plus which screen we're on.
// Screens: 'title' → 'playing' ⇄ 'paused'. (There's no losing in Spud Racer Quest!)

import { CONFIG } from './config.js';
import { createHero } from './entities/hero.js';
import { unlockAudio, playSound, toggleMute } from './audio.js';

const BEST_LEVEL_KEY = 'spud-racer-best-level';

export const state = {
  screen: 'title',
  best: loadBest(),      // highest level ever reached
  difficulty: CONFIG.startDifficulty,   // index into CONFIG.difficulties (stays the same between games)
};

// Fresh values for a brand-new quest.
export function resetRound() {
  Object.assign(state, {
    hero: createHero(),
    fallers: [],         // space junk and beat-bombs
    coins: [],
    tots: [],
    missiles: [],        // your heat-seeking potato missiles
    minions: [],         // DJ Spudz's tater-tot helpers
    signs: [],           // roadside signs
    bossMusic: false,    // should the boss beat be playing?
    targets: [],
    popups: [],          // little floating "+1 XP" texts
    boss: null,          // the UFO from the bossAppears twist
    bossDone: false,
    spudz: null,         // DJ Spudz (boss stage)
    megaTot: null,
    charge: 0,           // mega-tot charge, 0–100
    puzzle: null,
    score: 0,
    xp: 0,
    level: 1,
    lap: 1,              // each lap through the 4 stages gets harder
    stageIndex: 0,
    stageStarted: false,
    stageTime: 0,
    stageDoneTimer: 0,   // short pause after finishing a stage
    hits: 0,             // targets hit this stage
    time: 0,
    spawnTimer: 0,
    coinTimer: 0,
    fireTimer: 0,
    missileTimer: 0,
    missilePresses: 0,   // E presses this frame
    presses: 0,          // SPACE presses this frame (shoot / mash / pick)
    fryPresses: 0,       // F presses this frame
    fryCharge: 0,
    fryTimer: 0,
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

// x, y are game-world spots (shown in 3D), unless onScreen is true (plain screen pixels).
export function addPopup(text, x, y, color, onScreen = false) {
  state.popups.push({ text, x, y, color, onScreen, rise: 0, timeLeft: 1 });
}

export function saveBest(level) {
  state.best = level;
  state.isNewBest = true;
  try { localStorage.setItem(BEST_LEVEL_KEY, String(level)); } catch { /* storage blocked: fine */ }
}

export function endRound() {
  state.screen = 'gameover';
  playSound('gameOver');
}

// The screen state machine: what each action does on each screen.
// Actions come from input.js: 'start', 'tap', 'fry', 'missile', 'left', 'right', 'pause', 'mute', 'blur'.
export function handleAction(action) {
  if (action === 'mute') return toggleMute();
  const screen = state.screen;
  if (screen === 'title' && (action === 'left' || action === 'right')) {
    const n = CONFIG.difficulties.length;
    state.difficulty = (state.difficulty + (action === 'left' ? n - 1 : 1)) % n;
    unlockAudio();
    return playSound('coin');
  }
  if ((screen === 'title' || screen === 'gameover') && (action === 'start' || action === 'tap')) {
    unlockAudio();
    resetRound();
    state.screen = 'playing';
    playSound('start');
  } else if (screen === 'playing' && (action === 'pause' || action === 'blur')) {
    state.screen = 'paused';
  } else if (screen === 'playing' && (action === 'start' || action === 'tap')) {
    state.presses += 1;
  } else if (screen === 'playing' && action === 'fry') {
    state.fryPresses += 1;
  } else if (screen === 'playing' && action === 'missile') {
    state.missilePresses += 1;
  } else if (screen === 'paused' && (action === 'pause' || action === 'start' || action === 'tap')) {
    state.screen = 'playing';
  }
}

function loadBest() {
  try { return Number(localStorage.getItem(BEST_LEVEL_KEY)) || 0; } catch { return 0; }
}

resetRound();
