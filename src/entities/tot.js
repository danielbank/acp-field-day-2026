// tot.js — tater tot blasts that fly up from the car (and the giant MEGA-TOT for the boss).
// A tot is a little rounded golden-brown block with crispy dots.

import { CONFIG } from '../config.js';

export function spawnTot(x, y, r) {
  return { x, y, r, vy: -CONFIG.tots.speed };
}

export function updateTot(t, dt) {
  t.y += t.vy * dt;
}

export function isTotGone(t) {
  return t.y + t.r < 0;
}

export function drawTot(ctx, t) {
  const r = t.r;
  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.fillStyle = CONFIG.tots.color;
  ctx.strokeStyle = CONFIG.tots.outlineColor;
  ctx.lineWidth = Math.max(2, r / 5);
  ctx.beginPath();
  ctx.roundRect(-r * 0.8, -r, r * 1.6, r * 2, r * 0.6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = CONFIG.tots.outlineColor;           // crispy dots
  for (const [dx, dy] of [[-0.3, -0.5], [0.3, -0.1], [-0.2, 0.4], [0.35, 0.6]]) {
    ctx.beginPath();
    ctx.arc(dx * r, dy * r, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
