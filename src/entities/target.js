// target.js — floating bullseye targets for tater-tot practice.
// They slide side to side and bob up and down, bouncing off the walls.

import { CONFIG } from '../config.js';
import { ROAD_LEFT, ROAD_RIGHT } from '../track.js';

export function spawnTarget() {
  const s = CONFIG.targets;
  const r = s.size;
  const fromLeft = Math.random() < 0.5;
  return { x: fromLeft ? ROAD_LEFT + r : ROAD_RIGHT - r, baseY: 300 + Math.random() * 120, y: 0, r,
           vx: (fromLeft ? 1 : -1) * s.speed * (0.8 + Math.random() * 0.5), t: Math.random() * 6 };
}

export function updateTarget(tg, dt) {
  tg.t += dt;
  tg.x += tg.vx * dt;
  if (tg.x < ROAD_LEFT + tg.r || tg.x > ROAD_RIGHT - tg.r) {
    tg.vx *= -1;
    tg.x = Math.max(ROAD_LEFT + tg.r, Math.min(ROAD_RIGHT - tg.r, tg.x));
  }
  tg.y = tg.baseY + Math.sin(tg.t * 2) * 20;
}

export function drawTarget(ctx, tg) {
  const rings = ['#ff7b54', '#fff1dc', '#ff7b54', '#fff1dc'];
  rings.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(tg.x, tg.y, tg.r * (1 - i * 0.24), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.strokeStyle = '#5c3a22';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(tg.x, tg.y, tg.r, 0, Math.PI * 2);
  ctx.stroke();
}
