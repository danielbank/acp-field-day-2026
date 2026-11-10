// crowd.js — potato fans lining both sides of the track during the boss fight.
// They bounce and wave their little arms (extra hard when DJ Spudz gets bonked).

import { CONFIG } from '../config.js';
import { ROAD_LEFT, ROAD_RIGHT } from '../track.js';

const SKINS = ['#c8a165', '#b5834a', '#d9b98a', '#a8743f'];

// Spots are picked once so the crowd doesn't jump around.
export const fans = Array.from({ length: CONFIG.crowd.count }, (_, i) => {
  const left = i % 2 === 0;
  const k = Math.floor(i / 2);
  return {
    x: left ? ROAD_LEFT - 50 - (k % 2) * 45 : ROAD_RIGHT + 50 + (k % 2) * 45,
    y: 540 - k * 45, r: 18,
    skin: SKINS[i % SKINS.length],
    phase: Math.random() * 6,
  };
});

export function drawFan(ctx, f, seconds, cheering) {
  const y = f.y - Math.abs(Math.sin(seconds * 6 + f.phase)) * (cheering ? 16 : 6);
  ctx.strokeStyle = f.skin;
  ctx.lineWidth = 4;
  const wave = Math.sin(seconds * 8 + f.phase) * 0.5;
  ctx.beginPath();
  ctx.moveTo(f.x - 12, y);
  ctx.lineTo(f.x - 20, y - 18 + wave * 8);
  ctx.moveTo(f.x + 12, y);
  ctx.lineTo(f.x + 20, y - 18 - wave * 8);
  ctx.stroke();
  const g = ctx.createRadialGradient(f.x - 5, y - 7, 2, f.x, y, 20);
  g.addColorStop(0, '#f0d9b0');
  g.addColorStop(1, f.skin);
  ctx.fillStyle = g;
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
