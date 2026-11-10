// trapLooks.js — draws booby traps: spike pads, oil slicks, goo puddles, tacks, spring traps (flat on the floor)
// and bumper posts (which stand up, so they get depth-sorted with everyone else).

import { CONFIG } from '../config.js';
import { toScreen, floorEllipse } from '../view.js';

const H = CONFIG.hazards;
const TILT = CONFIG.arena.tilt;

export function drawFloorHazard(ctx, hz) {
  if (hz.type === 'oil') {
    ctx.fillStyle = 'rgba(20,10,30,0.75)';
    floorEllipse(ctx, hz.x, hz.y, hz.r);
    ctx.fill();
    ctx.fillStyle = 'rgba(160,120,255,0.25)';
    floorEllipse(ctx, hz.x - hz.r * 0.3, hz.y - hz.r * 0.2, hz.r * 0.35);
    ctx.fill();
  } else if (hz.type === 'spikes') {
    drawSpikePad(ctx, hz);
  }
}

function drawSpikePad(ctx, hz) {
  const half = H.spikeSize / 2;
  const a = toScreen(hz.x - half, hz.y - half);
  const w = H.spikeSize;
  const h = H.spikeSize * TILT;
  ctx.fillStyle = hz.warn ? '#7a3b5c' : '#4a3b6b';
  ctx.strokeStyle = '#2b2d42';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(a.x, a.y, w, h, 6);
  ctx.fill();
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const x = a.x + w * (0.2 + i * 0.3);
      const y = a.y + h * (0.25 + j * 0.3);
      if (hz.up) {
        ctx.fillStyle = '#e0e6f0';
        ctx.beginPath();
        ctx.moveTo(x - 6, y + 4); ctx.lineTo(x, y - 14); ctx.lineTo(x + 6, y + 4);
        ctx.fill();
      } else {
        ctx.fillStyle = '#1a1026';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

export function drawBumper(ctx, hz, t) {
  const p = toScreen(hz.x, hz.y);
  const squish = hz.boing > 0 ? 1 + Math.sin(hz.boing * 40) * 0.15 : 1;
  const r = hz.r * squish;
  ctx.fillStyle = '#c1121f';
  ctx.fillRect(p.x - r, p.y - 30, r * 2, 30);
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, r, r * TILT, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = hz.boing > 0 ? '#ffffff' : '#ff4d6d';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 30, r, r * TILT, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 30, r * 0.45, r * 0.45 * TILT, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(p.x - r, p.y - 18 + Math.sin(t * 3) * 2, r * 2, 4);
}

export function drawTrap(ctx, trap, t) {
  const p = toScreen(trap.x, trap.y);
  const fading = trap.life !== undefined && trap.life < 2 ? trap.life / 2 : 1;
  ctx.globalAlpha = fading;
  if (trap.type === 'goo') {
    ctx.fillStyle = 'rgba(112,224,0,0.45)';
    floorEllipse(ctx, trap.x, trap.y, trap.r);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,255,150,0.4)';
    floorEllipse(ctx, trap.x - 8, trap.y - 6, trap.r * 0.3);
    ctx.fill();
  } else if (trap.type === 'tacks') {
    ctx.fillStyle = '#e0e6f0';
    for (let i = 0; i < 5; i++) {
      const x = p.x + Math.cos(trap.seed + i * 2.4) * 10;
      const y = p.y + Math.sin(trap.seed + i * 2.4) * 6;
      ctx.beginPath();
      ctx.moveTo(x - 4, y + 2); ctx.lineTo(x, y - 7); ctx.lineTo(x + 4, y + 2);
      ctx.fill();
    }
  } else {
    drawSpring(ctx, p, trap, t);
  }
  ctx.globalAlpha = 1;
}

function drawSpring(ctx, p, trap, t) {
  const pop = trap.pop > 0 ? 18 : 0;
  ctx.fillStyle = '#3c096c';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, trap.r, trap.r * TILT, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#adb5bd';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 6; i++) ctx.lineTo(p.x + (i % 2 ? 8 : -8), p.y - (i * (6 + pop)) / 6 - 2);
  ctx.stroke();
  ctx.fillStyle = trap.cd > 0 ? '#ffd166' : '#ff9f1c';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 8 - pop, trap.r * 0.8, trap.r * 0.8 * TILT, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1026';
  for (let i = 0; i < trap.uses; i++) {
    ctx.beginPath();
    ctx.arc(p.x - 8 + i * 8, p.y - 8 - pop, 2.5 + Math.sin(t * 4 + i) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}
