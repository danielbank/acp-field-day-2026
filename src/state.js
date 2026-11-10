// state.js — everything the game remembers, plus which screen we're on.
// Screens: 'title' → 'customize' → 'playing' ⇄ 'paused' / 'shop' → 'gameover' or 'victory' (→ New Game+)

import { CONFIG } from './config.js';
import { createHero } from './entities/hero.js';
import { createHazards } from './entities/traps.js';
import { useAbility, placeBoughtTrap } from './roles.js';
import { startNextWave } from './waves.js';
import { handleShopAction } from './shopMenu.js';
import { handleCustomizeAction, isTypingName, loadLook } from './customize.js';
import { unlockAudio, playSound, toggleMute } from './audio.js';
import { followCamera } from './view.js';

const BEST_SCORE_KEY = 'robo-knights-best';

export const state = {
  screen: 'title',
  best: loadBest(),
  look: loadLook(),     // how your knight looks + which role (set on the customize screen)
  loop: 1,              // 1 = first game, 2 = New Game+ 1, …
};

// Fresh values for a new round. `carry` = what you keep in New Game+.
export function resetRound(carry = null) {
  Object.assign(state, {
    hero: createHero(state.look, carry),
    mobs: [],
    projectiles: [],
    traps: [],
    hazards: createHazards(),
    pickups: [],
    effects: [],
    coins: carry?.coins ?? 0,
    score: carry?.score ?? 0,
    time: 0,
    wave: 0,
    waveState: 'break',  // 'break' (shop time) | 'fighting' | 'boss' | 'won'
    breakTimer: CONFIG.firstBreakSeconds,
    spawnQueue: [],
    spawnTimer: 0,
    banner: null,        // big message in the middle, like "WAVE 2!"
    shake: 0,
    shopArmed: true,     // the shop opens when you walk into the door (once per visit)
    isNewBest: false,
  });
  followCamera(state.hero, 0, true);
}

export function showBanner(text, seconds = 1.8) {
  state.banner = { text, timeLeft: seconds };
}

function saveBest() {
  const finalScore = Math.floor(state.score);
  if (finalScore > state.best) {
    state.best = finalScore;
    state.isNewBest = true;
    try { localStorage.setItem(BEST_SCORE_KEY, String(finalScore)); } catch { /* storage blocked: fine */ }
  }
}

export function endRound() {
  state.screen = 'gameover';
  state.endedAt = performance.now();
  saveBest();
  playSound('gameOver');
}

export function winRound() {
  state.screen = 'victory';
  state.endedAt = performance.now();
  state.banner = null;
  saveBest();
  playSound('victory');
}

function startGame() {
  state.loop = 1;
  resetRound();
  state.screen = 'playing';
  playSound('start');
}

// New Game+: keep your upgrades, enchantments, coins, score — and the flaming sword!
function startNewGamePlus() {
  const h = state.hero;
  const carry = { upgrades: h.upgrades, bought: h.bought, weaponEnchant: h.weaponEnchant,
    armorEnchant: h.armorEnchant, trapCharges: h.trapCharges, flameSword: true, elementalSword: h.elementalSword,
    coins: state.coins, score: state.score };
  state.loop += 1;
  resetRound(carry);
  state.screen = 'playing';
  playSound('start');
}

const GO = ['confirm', 'space', 'click'];
const END_SCREEN_WAIT_MS = 1000;   // so mashing keys doesn't skip the game-over / victory screen

function endScreenReady(action) {
  return action === 'confirm' && performance.now() - (state.endedAt ?? 0) > END_SCREEN_WAIT_MS;
}

// The screen state machine: what each action does on each screen.
export function handleAction(action) {
  if (GO.includes(action)) unlockAudio();
  if (action === 'mute' && !(state.screen === 'customize' && isTypingName())) return toggleMute();
  const screen = state.screen;
  if (screen === 'title' && GO.includes(action)) {
    state.screen = 'customize';
    playSound('door');
  } else if (screen === 'customize') {
    if (handleCustomizeAction(action)) startGame();
  } else if (screen === 'playing') {
    if (action === 'pause' || action === 'blur' || action === 'back') state.screen = 'paused';
    else if (action === 'space') useAbility(state.hero);
    else if (action === 'trap') placeBoughtTrap(state.hero);
    else if (action === 'confirm' && state.waveState === 'break') startNextWave();
  } else if (screen === 'shop') {
    handleShopAction(action);
  } else if (screen === 'paused' && ['pause', 'back', ...GO].includes(action)) {
    state.screen = 'playing';
  } else if (screen === 'gameover' && endScreenReady(action)) {
    state.screen = 'customize';
  } else if (screen === 'victory' && endScreenReady(action)) {
    startNewGamePlus();
  }
}

function loadBest() {
  try { return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0; } catch { return 0; }
}
