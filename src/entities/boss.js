// boss.js — a giant, slow, swaying UFO that shows up once per game.
// Only appears when TWISTS.bossAppears is true (see twists.js).

import { CONFIG, TWIST_SETTINGS as S } from '../config.js';

export function createBoss(gravity) {
  const r = S.bossSize;
  return { x: CONFIG.width / 2, y: gravity === 1 ? -r : CONFIG.height + r, r, vy: S.bossSpeed * gravity, t: 0 };
}

export function updateBoss(boss, dt) {
  boss.t += dt;
  boss.y += boss.vy * dt;
  boss.x = CONFIG.width / 2 + Math.sin(boss.t * S.bossWiggle) * (CONFIG.width / 2 - boss.r);
}

export function isBossGone(boss) {
  return boss.y - boss.r > CONFIG.height || boss.y + boss.r < 0;
}

// The boss's "touch zone" is a bit smaller than its drawing (the saucer is flat).
export function bossHitRadius(boss) {
  return boss.r * 0.6;
}

export function drawBoss(ctx, boss) {
  const r = boss.r;
  ctx.save();
  ctx.translate(boss.x, boss.y);
  // glass dome
  ctx.fillStyle = 'rgba(192,192,208,0.85)';
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.2, r * 0.45, r * 0.4, 0, Math.PI, 0);
  ctx.fill();
  // eyes inside the dome
  ctx.fillStyle = '#1a1026';
  ctx.beginPath();
  ctx.arc(-r * 0.15, -r * 0.35, r * 0.07, 0, Math.PI * 2);
  ctx.arc(r * 0.15, -r * 0.35, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // saucer
  ctx.fillStyle = S.bossColor;
  ctx.strokeStyle = CONFIG.colors.silver;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // blinking lights
  for (let i = -2; i <= 2; i++) {
    const on = (Math.floor(boss.t * 4) + i) % 2 === 0;
    ctx.fillStyle = on ? '#fff3b0' : '#5a189a';
    ctx.beginPath();
    ctx.arc(i * r * 0.35, r * 0.05, r * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
