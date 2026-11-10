// twists.js — the three optional TWISTS from config.js.
// Each helper only changes things when its switch in TWISTS is true.

import { TWISTS, TWIST_SETTINGS as S } from './config.js';

// doubleCoins: how much one coin is worth
export function coinValue() {
  return TWISTS.doubleCoins ? S.coinMultiplier : 1;
}

// turboMobs: multiply every mob's speed
export function mobSpeedBoost() {
  return TWISTS.turboMobs ? S.turboSpeed : 1;
}

// giantKnight: how big the knight is
export function knightScale() {
  return TWISTS.giantKnight ? S.giantScale : 1;
}
