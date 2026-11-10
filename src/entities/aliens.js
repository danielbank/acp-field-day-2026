// aliens.js — alien blob waves: rows of wobbly blobs fly ahead of you and drop slime on the road.
// Blast them with the goo gatling (gatling.js). Settings live in CONFIG.aliens.

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
  return { blobs, time: 0, timeLeft: A.waveSeconds, slimeTimer: A.slimeEverySeconds, leaving: 0 };
}

// Moves the blobs. Returns what happened this frame so game.js can react.
export function updateWave(wave, car, dt) {
  const events = { slimes: [], cleared: false, gone: false };
  wave.time += dt;
  for (const b of wave.blobs) {
    const entering = Math.max(0, 1 - wave.time / 1.2) * 3000;   // swoop down at the start
    b.x = b.baseX + Math.sin(wave.time * A.swaySpeed + b.row) * A.sway;
    b.h = A.hoverHeight + entering + wave.leaving * 4000 + Math.sin(wave.time * 3 + b.phase) * 80;
    b.z = car.z + b.ahead;
  }

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

// The blobs that should be drawn on the road.
export function waveThings(wave) {
  return wave ? wave.blobs.filter((b) => b.alive) : [];
}
