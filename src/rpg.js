// rpg.js — XP, levels and level-up powers (faster car, bigger/faster tots, the fry move).
// Coins and targets give XP; bonks take a little away, but you never lose a level.

import { CONFIG } from './config.js';
import { state, showBanner, addPopup, saveBest } from './state.js';
import { playSound } from './audio.js';

const R = CONFIG.rpg;

export const xpNeeded = (level) => R.xpToLevel2 + (level - 1) * R.xpGrowthPerLevel;

export function gainXp(amount, x, y) {
  state.xp += amount;
  if (x !== undefined) addPopup(`+${amount} XP`, x, y, CONFIG.colors.accent);
  while (state.xp >= xpNeeded(state.level)) {
    state.xp -= xpNeeded(state.level);
    state.level += 1;
    levelUp();
  }
}

// The current difficulty level's settings (easy / normal / hard).
export const difficulty = () => CONFIG.difficulties[state.difficulty];

// The car got bonked: lose a little XP and slow down for a moment. Returns true if it counted.
export function bonkHero(xpLoss = difficulty().xpLostPerBonk) {
  const hero = state.hero;
  if (hero.hurtTimer > 0 || state.screen !== 'playing') return false;
  hero.hurtTimer = CONFIG.invincibleSeconds;
  hero.slowTimer = CONFIG.hero.slowSeconds;
  loseXp(xpLoss, hero.x, hero.y - hero.h / 2);
  playSound('hit');
  return true;
}

export function loseXp(amount, x, y) {
  state.xp = Math.max(0, state.xp - amount);
  addPopup(`-${amount} XP`, x, y, CONFIG.colors.warning);
}

function levelUp() {
  playSound('levelUp');
  let msg = CONFIG.text.levelUp.replace('{level}', state.level);
  if (state.level === CONFIG.missiles.unlockLevel) msg = CONFIG.text.missileUnlocked;
  if (state.level === CONFIG.fry.unlockLevel) msg = CONFIG.text.fryUnlocked;
  showBanner(msg, 2);
  if (state.level > state.best) saveBest(state.level);
}

// ---- Level-up powers ----
export const carSpeed = () => CONFIG.hero.speed + (state.level - 1) * R.carSpeedPerLevel;
export const totSize = () => CONFIG.tots.size + (state.level - 1) * R.totSizePerLevel;
export const fireCooldown = () => Math.max(CONFIG.tots.fastestFireSeconds,
  CONFIG.tots.fireEverySeconds - (state.level - 1) * R.fireFasterPerLevel);
export const mashPower = () => CONFIG.boss.chargePerMash + (state.level - 1) * CONFIG.boss.chargePerMashPerLevel;
export const fryUnlocked = () => state.level >= CONFIG.fry.unlockLevel;
export const missilesUnlocked = () => state.level >= CONFIG.missiles.unlockLevel;
export const fryReady = () => fryUnlocked() && state.fryCharge >= CONFIG.fry.chargeNeeded;

export function chargeFry(amount) {
  if (fryUnlocked()) state.fryCharge = Math.min(CONFIG.fry.chargeNeeded, state.fryCharge + amount);
}
