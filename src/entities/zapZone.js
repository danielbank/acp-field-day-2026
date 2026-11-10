// zapZone.js — glowing laser walls that zoom at you at a random height. Flap over or under them!
// A wall blocks a band of heights (low → high). Be outside that band when it arrives.

import { CONFIG } from '../config.js';

const rand = (min, max) => min + Math.random() * (max - min);

export function spawnZapZone() {
  const z = CONFIG.zapZone;
  const thick = rand(z.minThickness, z.maxThickness);
  const low = rand(40, CONFIG.cockpit.maxHeight - thick - 40);
  return { low, high: low + thick, closeness: 0, t: 0 };
}

// Returns 'hit' or 'passed' when the wall reaches you, otherwise null.
export function updateZapZone(zone, dt, hero) {
  zone.t += dt;
  zone.closeness += dt / CONFIG.zapZone.arriveSeconds;
  if (zone.closeness < 1) return null;
  return hero.alt > zone.low && hero.alt < zone.high ? 'hit' : 'passed';
}

// Where a height shows up on screen for this wall: far walls squish toward the middle.
function screenY(height, zone, hero) {
  const scale = 0.15 + 0.85 * zone.closeness;
  return CONFIG.height / 2 - (height - hero.alt) * scale;
}

export function drawZapZone(ctx, zone, hero) {
  const c = CONFIG.zapZone;
  const top = screenY(zone.high, zone, hero);
  const bottom = screenY(zone.low, zone, hero);
  const inset = (1 - zone.closeness) * CONFIG.width * 0.3;   // far walls look narrower
  const left = inset, width = CONFIG.width - inset * 2;
  ctx.save();
  ctx.globalAlpha = 0.25 + 0.35 * zone.closeness;
  ctx.fillStyle = c.color;
  ctx.fillRect(left, top, width, bottom - top);
  // buzzing laser lines
  ctx.globalAlpha = 0.6 + 0.4 * Math.abs(Math.sin(zone.t * 20));
  ctx.strokeStyle = c.lineColor;
  ctx.lineWidth = 2 + 3 * zone.closeness;
  ctx.beginPath();
  for (let i = 0; i <= 4; i++) {
    const y = top + ((bottom - top) * i) / 4;
    ctx.moveTo(left, y);
    ctx.lineTo(left + width, y);
  }
  ctx.stroke();
  ctx.restore();
}
