// coin.js — shiny gold coins that fall during the race. Grab them for XP!
// Coins move like fallers (y goes down) and get drawn as a gold disc with a shine.

import { CONFIG } from '../config.js';
import { ROAD_LEFT } from '../track.js';

export function spawnCoin() {
  const r = CONFIG.coins.size;
  return { x: ROAD_LEFT + r + Math.random() * (CONFIG.road.width - r * 2), y: -r, r, vy: CONFIG.coins.speed, t: Math.random() * 6 };
}

export function updateCoin(c, dt) {
  c.y += c.vy * dt;
  c.t += dt;
}

export function drawCoin(ctx, c) {
  const squish = Math.abs(Math.cos(c.t * 4));        // spinning coin looks thinner sideways
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.scale(0.3 + 0.7 * squish, 1);
  ctx.fillStyle = CONFIG.coins.color;
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, c.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, c.r * 0.6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = CONFIG.coins.shineColor;
  ctx.beginPath();
  ctx.arc(-c.r * 0.35, -c.r * 0.35, c.r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
