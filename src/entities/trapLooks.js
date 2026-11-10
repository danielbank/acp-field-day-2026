// trapLooks.js — draws booby traps in 3D perspective: spike pads, oil slicks, goo puddles, tacks,
// spring traps (flat on the floor) and bumper posts (which stand up, so they get depth-sorted).

import { CONFIG } from '../config.js';
import { toScreen, tracePoly, floorEllipse } from '../view.js';
import { shade, fogFor } from '../world3d.js';

const H = CONFIG.hazards;

// How squished a floor circle looks at this spot (1 = round, small = very flat).
function squashAt(x, y) {
  const a = toScreen(x, y - 10);
  const b = toScreen(x, y + 10);
  const c = toScreen(x, y);
  return c.s > 0 ? Math.abs(b.y - a.y) / (20 * c.s) : 0.6;
}

export function drawFloorHazard(ctx, hz, t) {
  if (hz.type === 'oil') {
    if (!floorEllipse(ctx, hz.x, hz.y, hz.r)) return;
    ctx.fillStyle = '#120d1c';                           // shiny black oil with a rainbow sheen
    ctx.fill();
    ctx.lineWidth = 3;
    ['rgba(255,77,109,0.35)', 'rgba(255,209,102,0.3)', 'rgba(76,201,240,0.35)'].forEach((color, i) => {
      ctx.strokeStyle = color;
      if (floorEllipse(ctx, hz.x + hz.r * 0.1, hz.y, hz.r * (0.5 - i * 0.1), Math.PI * 1.1 + Math.sin(t) * 0.1, Math.PI * 1.6)) ctx.stroke();
    });
  } else if (hz.type === 'spikes') {
    drawSpikePad(ctx, hz);
  }
}

function drawSpikePad(ctx, hz) {
  const half = H.spikeSize / 2;
  if (!tracePoly(ctx, [[hz.x - half, hz.y - half, 0], [hz.x + half, hz.y - half, 0], [hz.x + half, hz.y + half, 0], [hz.x - half, hz.y + half, 0]])) return;
  ctx.fillStyle = shade(hz.warn ? '#7a3b5c' : '#4a3b6b', 1, fogFor(hz.x, hz.y));
  ctx.strokeStyle = '#1a1026';
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 3; i++) {
      const p = toScreen(hz.x - half + H.spikeSize * (0.2 + i * 0.3), hz.y - half + H.spikeSize * (0.2 + j * 0.3));
      if (p.s <= 0) continue;
      if (hz.up) {
        ctx.fillStyle = '#e0e6f0';
        ctx.strokeStyle = '#6c757d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x - 6 * p.s, p.y);
        ctx.lineTo(p.x, p.y - 22 * p.s);
        ctx.lineTo(p.x + 6 * p.s, p.y);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = '#1a1026';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.s, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// Bumpers are short red cylinders.
export function drawBumper(ctx, hz, t) {
  const height = 55;
  const squish = hz.boing > 0 ? 1 + Math.sin(hz.boing * 40) * 0.15 : 1;
  const r = hz.r * 0.8 * squish;
  const p0 = toScreen(hz.x, hz.y, 0);
  const p1 = toScreen(hz.x, hz.y, height);
  if (p0.s <= 0) return;
  ctx.fillStyle = '#9b0d18';
  if (floorEllipse(ctx, hz.x, hz.y, r)) ctx.fill();
  ctx.fillRect(p1.x - r * p0.s, p1.y, r * 2 * p0.s, p0.y - p1.y);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(p1.x - r * p0.s, p1.y + (p0.y - p1.y) * 0.45 + Math.sin(t * 3) * p0.s, r * 2 * p0.s, 4 * p0.s);
  ctx.fillStyle = hz.boing > 0 ? '#ffffff' : '#ff4d6d';
  if (floorEllipse(ctx, hz.x, hz.y, r, 0, Math.PI * 2, height)) ctx.fill();
  ctx.fillStyle = '#ffd166';
  if (floorEllipse(ctx, hz.x, hz.y, r * 0.45, 0, Math.PI * 2, height)) ctx.fill();
}

export function drawTrap(ctx, trap, t) {
  const fading = trap.life !== undefined && trap.life < 2 ? Math.max(0, trap.life / 2) : 1;
  ctx.globalAlpha = fading;
  if (trap.type === 'goo') {
    ctx.fillStyle = 'rgba(112,224,0,0.45)';
    if (floorEllipse(ctx, trap.x, trap.y, trap.r)) ctx.fill();
    ctx.fillStyle = 'rgba(200,255,150,0.4)';
    if (floorEllipse(ctx, trap.x - 8, trap.y - 6, trap.r * 0.3)) ctx.fill();
  } else if (trap.type === 'tacks') {
    ctx.fillStyle = '#e0e6f0';
    for (let i = 0; i < 5; i++) {
      const p = toScreen(trap.x + Math.cos(trap.seed + i * 2.4) * 10, trap.y + Math.sin(trap.seed + i * 2.4) * 10);
      if (p.s <= 0) continue;
      ctx.beginPath();
      ctx.moveTo(p.x - 4 * p.s, p.y + 2 * p.s); ctx.lineTo(p.x, p.y - 8 * p.s); ctx.lineTo(p.x + 4 * p.s, p.y + 2 * p.s);
      ctx.fill();
    }
  } else {
    drawSpring(ctx, trap, t);
  }
  ctx.globalAlpha = 1;
}

function drawSpring(ctx, trap) {
  const p = toScreen(trap.x, trap.y);
  if (p.s <= 0) return;
  const tilt = squashAt(trap.x, trap.y);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(p.s, p.s);
  const pop = trap.pop > 0 ? 18 : 0;
  ctx.fillStyle = '#3c096c';
  ctx.beginPath();
  ctx.ellipse(0, 0, trap.r, trap.r * tilt, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#adb5bd';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) ctx.lineTo(i % 2 ? 8 : -8, -(i * (6 + pop)) / 6 - 2);
  ctx.stroke();
  ctx.fillStyle = trap.cd > 0 ? '#ffd166' : '#ff9f1c';
  ctx.beginPath();
  ctx.ellipse(0, -8 - pop, trap.r * 0.8, trap.r * 0.8 * tilt, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1026';
  for (let i = 0; i < trap.uses; i++) {
    ctx.beginPath();
    ctx.arc(-8 + i * 8, -8 - pop, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
