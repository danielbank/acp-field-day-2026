// effects.js — confetti bursts and floating "+50" point popups (screen-only, they don't bonk anything).
// burst() makes confetti, popup() makes floating text; game.js updates them and render.js draws them.

import { CONFIG } from './config.js';
import { state } from './state.js';

const CONFETTI_COLORS = ['#ff4fd8', '#5ef2ff', '#ffd23f', '#7cff6b', '#ff7eb6', '#c77dff'];

// Confetti flying out from screen spot (x, y). colors: optional list of colors to use.
export function burst(x, y, count = 18, colors = CONFETTI_COLORS) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 150 + Math.random() * 350;
    state.particles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 200,
      life: 0.8 + Math.random() * 0.5, size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

export function popup(text, x, y, color = CONFIG.colors.text) {
  state.popups.push({ text, x, y, color, life: 1 });
}

export function updateEffects(dt) {
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 900 * dt;
    p.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
  for (const p of state.popups) { p.y -= 60 * dt; p.life -= dt; }
  state.popups = state.popups.filter((p) => p.life > 0);
}

export function drawEffects(ctx) {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.min(1, p.life * 2);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.font = `bold 28px ${CONFIG.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const p of state.popups) {
    ctx.globalAlpha = Math.min(1, p.life * 2);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}
