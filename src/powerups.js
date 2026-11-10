// powerups.js — what each powerup does when you grab it, and its countdown.
// Kinds: 'star' (2X points), 'turbo' (+1 turbo), 'spring' (next jump is MEGA), 'magnet' (pulls coins).

import { CONFIG } from './config.js';
import { state, showBanner } from './state.js';
import { playSound } from './audio.js';

export const POWER_KINDS = ['star', 'turbo', 'spring', 'magnet'];

export function applyPowerup(kind) {
  const P = CONFIG.powerups;
  const powers = state.powers;
  if (kind === 'star') powers.star = P.seconds;
  if (kind === 'magnet') powers.magnet = P.seconds;
  if (kind === 'spring') powers.spring = true;
  if (kind === 'turbo') {
    state.car.turboCharges = Math.min(CONFIG.car.turboMaxCharges, state.car.turboCharges + 1);
  }
  showBanner(CONFIG.text[kind], 1.2);
  playSound('powerup');
}

export function tickPowerups(dt) {
  state.powers.star = Math.max(0, state.powers.star - dt);
  state.powers.magnet = Math.max(0, state.powers.magnet - dt);
}

// Adds points (doubled while the 2X star is active). Returns the points actually added.
export function addPoints(points) {
  const gained = Math.round(points * (state.powers.star > 0 ? CONFIG.powerups.star.multiplier : 1));
  state.score += gained;
  return gained;
}

// Coin magnet: slide coins ahead of you sideways toward the car.
export function pullCoins(dt) {
  if (state.powers.magnet <= 0) return;
  const M = CONFIG.powerups.magnet;
  for (const o of state.things) {
    const ahead = o.z - state.car.z;
    if (o.kind !== 'coin' || ahead < 0 || ahead > M.reach) continue;
    const dx = state.car.x - o.x;
    o.x += Math.sign(dx) * Math.min(Math.abs(dx), M.pullSpeed * dt);
    if (o.h > 0) o.h = Math.max(0, o.h - 3000 * dt);   // pulls high coins down too
  }
}
