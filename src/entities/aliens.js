// aliens.js — alien blob waves: rows of wobbly blobs fly ahead of you, and you zap them with goo bubbles.
// Steer to aim, hold SPACE to fire. Settings live in CONFIG.aliens.

import { CONFIG } from '../config.js';

const A = CONFIG.aliens;

export function startWave(level) {
  const rows = Math.min(A.rows + Math.floor((level - 1) / 3), 4);   // more rows later on
  const blobs = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < A.perRow; col++) {
      blobs.push({
        kind: 'blob', row, alive: true, z: 0, x: 0, h: 0, phase: Math.random() * 6,
        baseX: A.perRow === 1 ? 0 : -0.75 + (1.5 * col) / (A.perRow - 1),
        ahead: A.distanceAhead + row * A.rowGap,
        color: A.colors[(row + col) % A.colors.length],
      });
    }
  }
  return { blobs, bubbles: [], time: 0, timeLeft: A.waveSeconds, slimeTimer: A.slimeEverySeconds,
           fireTimer: 0, leaving: 0 };
}

// Shoots one goo bubble straight ahead from the car.
function fire(wave, car) {
  wave.bubbles.push({ kind: 'bubble', x: car.x, ahead: 0, z: car.z, h: car.y + 250 });
  wave.fireTimer = A.fireEverySeconds;
}

// Moves blobs and bubbles. Returns what happened this frame so game.js can react.
export function updateWave(wave, car, dt, firing) {
  const events = { fired: false, popped: [], slimes: [], cleared: false, gone: false };
  wave.time += dt;
  wave.fireTimer -= dt;
  if (firing && wave.fireTimer <= 0 && !wave.leaving) { fire(wave, car); events.fired = true; }

  for (const b of wave.blobs) {
    const entering = Math.max(0, 1 - wave.time / 1.2) * 3000;   // swoop down at the start
    b.x = b.baseX + Math.sin(wave.time * A.swaySpeed + b.row) * A.sway;
    b.h = A.hoverHeight + entering + wave.leaving * 4000 + Math.sin(wave.time * 3 + b.phase) * 80;
    b.z = car.z + b.ahead;
  }

  const hitW = (A.size / 2 + 120) / CONFIG.road.width;
  wave.bubbles = wave.bubbles.filter((bub) => {
    bub.ahead += A.bubbleSpeed * dt;
    bub.z = car.z + bub.ahead;
    bub.h = car.y + 250 + (A.hoverHeight + A.size * 0.3 - 250) * Math.min(1, bub.ahead / A.distanceAhead);
    const target = wave.blobs.find((b) => b.alive && Math.abs(b.ahead - bub.ahead) < 500
      && Math.abs(b.x - bub.x) < hitW);
    if (target) { target.alive = false; events.popped.push(target); return false; }
    return bub.ahead < A.distanceAhead + 4 * A.rowGap + 2000;
  });

  const alive = wave.blobs.filter((b) => b.alive);
  wave.slimeTimer -= dt;
  if (!wave.leaving && alive.length && wave.slimeTimer <= 0 && wave.time > 1.5) {
    const b = alive[Math.floor(Math.random() * alive.length)];
    events.slimes.push({ z: b.z, x: b.x, h: b.h });
    wave.slimeTimer = A.slimeEverySeconds;
  }

  wave.timeLeft -= dt;
  if (alive.length === 0 && !wave.leaving) events.cleared = true;
  else if (wave.timeLeft <= 0 && !wave.leaving) wave.leaving = 0.0001;
  if (wave.leaving) {
    wave.leaving += dt;
    if (wave.leaving > 1.5) events.gone = true;
  }
  return events;
}

// Everything in the wave that should be drawn on the road.
export function waveThings(wave) {
  return wave ? [...wave.blobs.filter((b) => b.alive), ...wave.bubbles] : [];
}
