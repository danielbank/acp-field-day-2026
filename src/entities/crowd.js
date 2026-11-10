// crowd.js — a cheering crowd of potato fans along the bottom corners during the boss fight.
// They bounce and wave their little arms (extra hard when DJ Spudz gets bonked).

import { CONFIG } from '../config.js';

const SKINS = ['#c8a165', '#b5834a', '#d9b98a', '#a8743f'];

// Spots are picked once so the crowd doesn't jump around.
const fans = Array.from({ length: CONFIG.crowd.count }, (_, i) => {
  const half = CONFIG.crowd.count / 2;
  const left = i < half;
  const k = left ? i : i - half;
  return {
    x: left ? 30 + k * 26 : CONFIG.width - 30 - k * 26,
    y: CONFIG.height - 20 - (k % 2) * 26,
    skin: SKINS[i % SKINS.length],
    phase: Math.random() * 6,
  };
});

export function drawCrowd(ctx, seconds, cheering) {
  const jump = cheering ? 14 : 5;
  for (const f of fans) {
    const y = f.y - Math.abs(Math.sin(seconds * 6 + f.phase)) * jump;
    // waving arms
    ctx.strokeStyle = f.skin;
    ctx.lineWidth = 4;
    const wave = Math.sin(seconds * 8 + f.phase) * 0.5;
    ctx.beginPath();
    ctx.moveTo(f.x - 12, y);
    ctx.lineTo(f.x - 20, y - 18 + wave * 8);
    ctx.moveTo(f.x + 12, y);
    ctx.lineTo(f.x + 20, y - 18 - wave * 8);
    ctx.stroke();
    // potato head
    ctx.fillStyle = f.skin;
    ctx.beginPath();
    ctx.ellipse(f.x, y, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1026';
    ctx.beginPath();
    ctx.arc(f.x - 5, y - 4, 2.5, 0, Math.PI * 2);
    ctx.arc(f.x + 5, y - 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(f.x, y + 4, 5, 0, Math.PI);   // happy open mouth
    ctx.fill();
  }
}
