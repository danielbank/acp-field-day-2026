// minion.js — DJ Spudz's tater-tot helpers. They circle in front of him and shoot pellets.
// Two small tots can COMBINE into a big potato that fires heat-seeking potato missiles.

import { CONFIG } from '../config.js';
import { clampToRoad } from '../track.js';

export function createMinion(boss, big = false) {
  const B = CONFIG.boss;
  return {
    x: boss.x, y: boss.y + 150, big,
    r: big ? B.bigPotatoSize : B.minionSize,
    hp: big ? B.bigPotatoHp : 1,
    t: Math.random() * 6, orbit: 70 + Math.random() * 150, depth: 170 + Math.random() * 70,
    speed: 0.7 + Math.random() * 0.8, shootTimer: 1 + Math.random() * B.minionShootSeconds, hurtTimer: 0,
  };
}

export function updateMinion(m, boss, dt) {
  m.t += dt;
  m.hurtTimer = Math.max(0, m.hurtTimer - dt);
  m.x = clampToRoad(boss.x + Math.cos(m.t * m.speed) * m.orbit, m.r);
  m.y = boss.y + m.depth + Math.sin(m.t * m.speed * 1.3) * 30;
}

export function drawMinion(ctx, m) {
  const r = m.r;
  ctx.save();
  ctx.translate(m.x, m.y + Math.sin(m.t * 5) * r * 0.1);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.1, 0, 0, r * 1.1);
  if (m.big) {
    g.addColorStop(0, m.hurtTimer > 0 ? '#fff' : '#e3c08a');
    g.addColorStop(1, '#7a5229');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.85, r, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6b4a28';
    for (const [dx, dy] of [[-0.4, 0.4], [0.45, -0.5], [0.4, 0.5]]) {
      ctx.beginPath();
      ctx.arc(dx * r, dy * r, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    g.addColorStop(0, m.hurtTimer > 0 ? '#fff' : '#f2c46b');
    g.addColorStop(1, '#a8601a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(-r * 0.75, -r, r * 1.5, r * 2, r * 0.55);
    ctx.fill();
  }
  // face: determined little eyebrows and eyes
  ctx.fillStyle = '#1a1026';
  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 0.2, r * 0.12, 0, Math.PI * 2);
  ctx.arc(r * 0.25, -r * 0.2, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a1026';
  ctx.lineWidth = Math.max(2, r * 0.07);
  ctx.beginPath();
  ctx.moveTo(-r * 0.42, -r * 0.45); ctx.lineTo(-r * 0.1, -r * 0.35);
  ctx.moveTo(r * 0.42, -r * 0.45); ctx.lineTo(r * 0.1, -r * 0.35);
  ctx.moveTo(-r * 0.2, r * 0.25); ctx.lineTo(r * 0.2, r * 0.25);
  ctx.stroke();
  ctx.restore();
}
