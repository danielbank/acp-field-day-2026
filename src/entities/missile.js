// missile.js — heat-seeking potato missiles! Yours fly away and chase the nearest enemy (press E);
// big potatoes fire them at YOU, so dodge sideways.

import { CONFIG } from '../config.js';

export function spawnMissile(hero) {
  const M = CONFIG.missiles;
  return { x: hero.x, y: hero.y - hero.h / 2, vx: 0, vy: -M.speed, r: M.size, t: 0, dead: false };
}

// Turn a little toward the target each frame, then fly forward.
export function steerMissile(m, target, dt) {
  const M = CONFIG.missiles;
  m.t += dt;
  if (target) {
    const want = Math.atan2(target.y - m.y, target.x - m.x);
    const cur = Math.atan2(m.vy, m.vx);
    let diff = want - cur;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const turn = M.turnRate * dt;
    const angle = cur + Math.max(-turn, Math.min(turn, diff));
    m.vx = Math.cos(angle) * M.speed;
    m.vy = Math.sin(angle) * M.speed;
  }
  m.x += m.vx * dt;
  m.y += m.vy * dt;
}

export function isMissileGone(m) {
  return m.dead || m.t > 4 || m.y < -150 || m.y > CONFIG.height + 50;
}

// A potato with fins and a rocket flame, centered on the missile.
export function drawPotatoMissile(ctx, m) {
  const r = m.r;
  ctx.save();
  ctx.translate(m.x, m.y);
  const flick = 0.8 + 0.3 * Math.sin(performance.now() / 30);
  const glow = ctx.createRadialGradient(0, r * 0.6, 0, 0, r * 0.6, r * 1.4 * flick);
  glow.addColorStop(0, 'rgba(255,243,176,0.95)');
  glow.addColorStop(0.4, 'rgba(255,183,3,0.7)');
  glow.addColorStop(1, 'rgba(255,123,84,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, r * 0.6, r * 1.4 * flick, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a7a88';                          // fins
  ctx.beginPath();
  ctx.moveTo(-r * 0.9, r * 0.5); ctx.lineTo(0, -r * 0.1); ctx.lineTo(r * 0.9, r * 0.5);
  ctx.fill();
  const body = ctx.createRadialGradient(-r * 0.25, -r * 0.35, r * 0.1, 0, 0, r);
  body.addColorStop(0, '#e6c48f');
  body.addColorStop(1, '#8a6136');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.6, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1026';
  ctx.beginPath();
  ctx.arc(-r * 0.2, -r * 0.3, r * 0.1, 0, Math.PI * 2);
  ctx.arc(r * 0.2, -r * 0.3, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
