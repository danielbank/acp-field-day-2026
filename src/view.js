// view.js — the 2.5D camera: turns arena spots (x, depth y, height z) into screen pixels and back.
// Also small math helpers (distance, clamp, random) used everywhere.

import { CONFIG } from './config.js';

const A = CONFIG.arena;

export const toScreen = (x, y, z = 0) => ({ x: A.left + x, y: A.top + y * A.tilt - z });
export const toWorld = (sx, sy) => ({ x: sx - A.left, y: (sy - A.top) / A.tilt });

export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const rand = (min, max) => min + Math.random() * (max - min);
export const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Smallest difference between two angles (-PI..PI)
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// A world angle as it looks on the tilted screen
export const screenAngle = (a) => Math.atan2(Math.sin(a) * A.tilt, Math.cos(a));

export function keepInArena(o, margin = o.r) {
  o.x = clamp(o.x, margin, A.width - margin);
  o.y = clamp(o.y, margin, A.depth - margin);
}

// Traces an ellipse lying flat on the floor (call fill/stroke after).
export function floorEllipse(ctx, x, y, r, a0 = 0, a1 = Math.PI * 2) {
  const p = toScreen(x, y);
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, r, r * A.tilt, 0, a0, a1);
}

// Soft shadow on the floor; it shrinks and fades as things fly higher.
export function drawShadow(ctx, x, y, r, z = 0) {
  const shrink = 1 - Math.min(z / 500, 0.6);
  ctx.fillStyle = `rgba(0,0,0,${0.35 * shrink})`;
  floorEllipse(ctx, x, y, r * shrink);
  ctx.fill();
}
