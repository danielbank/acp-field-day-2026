// effects.js — just-for-show stuff: bonk stars, puffs, embers, floating numbers, swing arcs, rings and zaps.
// Floor effects draw under everyone; sky effects draw on top.

import { CONFIG } from './config.js';
import { state } from './state.js';
import { toScreen, floorEllipse, rand } from './view.js';
import { text } from './ui.js';

function add(fx) {
  fx.maxLife = fx.life;
  state.effects.push(fx);
}

export function spawnStars(x, y, z, count = 10) {
  for (let i = 0; i < count; i++) {
    const a = rand(0, Math.PI * 2);
    const s = rand(60, 220);
    add({ type: 'star', x, y, z, vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rand(150, 380),
      life: rand(0.5, 0.9), size: rand(5, 10), color: Math.random() < 0.5 ? '#fff3b0' : '#ffffff' });
  }
  add({ type: 'puff', x, y, z, vx: 0, vy: 0, vz: 0, life: 0.4, size: 30, color: '#ffffff' });
}

export function spawnEmbers(x, y, z) {
  add({ type: 'ember', x: x + rand(-10, 10), y, z, vx: rand(-20, 20), vy: 0, vz: rand(60, 120),
    life: 0.5, size: rand(3, 5), color: Math.random() < 0.5 ? '#ff7b00' : '#ffd000' });
}

export function spawnSparkles(x, y, color) {
  for (let i = 0; i < 14; i++) {
    add({ type: 'ember', x: x + rand(-30, 30), y: y + rand(-20, 20), z: rand(0, 60), vx: 0, vy: 0,
      vz: rand(60, 160), life: rand(0.5, 0.9), size: rand(3, 6), color });
  }
}

export function floatText(x, y, z, str, color) {
  add({ type: 'text', x, y, z, vx: 0, vy: 0, vz: 60, life: 0.8, str, color });
}

export function addRing(x, y, r, color, life = 0.35) {
  add({ type: 'ring', x, y, r, color, life });
}

export function addArc(x, y, angle, reach, width, color) {
  add({ type: 'arc', x, y, angle, r: reach, width, color, life: 0.18 });
}

export function addZap(a, b) {
  add({ type: 'zap', x: a.x, y: a.y, x2: b.x, y2: b.y, life: 0.2, color: CONFIG.enchants.zap.color });
}

export function updateEffects(dt) {
  for (const fx of state.effects) {
    fx.life -= dt;
    if (fx.vx === undefined) continue;
    fx.x += fx.vx * dt;
    fx.y += fx.vy * dt;
    fx.z += fx.vz * dt;
    if (fx.type === 'star') fx.vz -= 900 * dt;
    if (fx.z < 0) { fx.z = 0; fx.vz *= -0.4; }
  }
  state.effects = state.effects.filter((fx) => fx.life > 0);
}

export function drawFloorEffects(ctx) {
  for (const fx of state.effects) {
    const k = fx.life / fx.maxLife;
    if (fx.type === 'ring') {
      ctx.strokeStyle = fx.color;
      ctx.globalAlpha = k;
      ctx.lineWidth = 6;
      floorEllipse(ctx, fx.x, fx.y, fx.r * (1.15 - k * 0.5));
      ctx.stroke();
    } else if (fx.type === 'arc') {
      const p = toScreen(fx.x, fx.y);
      ctx.fillStyle = fx.color;
      ctx.globalAlpha = 0.35 * k;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.ellipse(p.x, p.y, fx.r, fx.r * CONFIG.arena.tilt, 0, fx.angle - fx.width / 2, fx.angle + fx.width / 2);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export function drawSkyEffects(ctx) {
  for (const fx of state.effects) {
    const k = fx.life / fx.maxLife;
    const p = toScreen(fx.x, fx.y, fx.z ?? 0);
    ctx.globalAlpha = Math.min(1, k * 1.5);
    if (fx.type === 'star') drawStar(ctx, p.x, p.y, fx.size, fx.color, fx.life * 10);
    else if (fx.type === 'puff') {
      ctx.fillStyle = fx.color;
      ctx.globalAlpha = k * 0.6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, fx.size * (1.6 - k), 0, Math.PI * 2);
      ctx.fill();
    } else if (fx.type === 'ember') {
      ctx.fillStyle = fx.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, fx.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (fx.type === 'text') text(ctx, fx.str, p.x, p.y, 20, fx.color);
    else if (fx.type === 'zap') drawZap(ctx, fx);
  }
  ctx.globalAlpha = 1;
}

export function drawStar(ctx, x, y, size, color, spin = 0) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = spin + (i * Math.PI) / 4;
    const r = i % 2 === 0 ? size : size * 0.4;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

function drawZap(ctx, fx) {
  const a = toScreen(fx.x, fx.y, 25);
  const b = toScreen(fx.x2, fx.y2, 25);
  ctx.strokeStyle = fx.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(a.x + (b.x - a.x) * (i / 6) + rand(-8, 8), a.y + (b.y - a.y) * (i / 6) + rand(-8, 8));
  }
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}
