// spawner.js — decides what appears on the road ahead of you (and the Free Play spawn keys 1–5).
// Chances live in CONFIG.spawn; bigger numbers show up more often.

import { CONFIG } from './config.js';
import { state } from './state.js';
import { SEG } from './road.js';
import { makeThing } from './entities/things.js';
import { POWER_KINDS } from './powerups.js';
import { extraCoinChance } from './twists.js';

const pickOne = (list) => list[Math.floor(Math.random() * list.length)];
const randomLane = () => {
  const lanes = CONFIG.road.lanes;
  const lane = Math.floor(Math.random() * lanes);
  return -1 + (2 * lane + 1) / lanes;
};

// Things that can be placed. Each pushes one or more things starting at distance z.
const MAKERS = {
  rock: (z) => [makeThing('rock', z, randomLane())],
  hole: (z) => [makeThing('hole', z, 0)],
  crate: (z) => [makeThing('crate', z, randomLane())],
  cone: (z) => [makeThing('cone', z, randomLane())],
  barrel: (z) => [makeThing('barrel', z, randomLane())],
  traffic: (z) => [makeThing('traffic', z, randomLane(), { color: pickOne(CONFIG.things.traffic.colors) })],
  ramp: (z) => [makeThing('ramp', z, randomLane())],
  powerup: (z) => [makeThing('powerup', z, randomLane(), { h: 150, power: pickOne(POWER_KINDS) })],
  coins: (z) => {
    const x = randomLane();
    return Array.from({ length: CONFIG.things.coin.rowLength }, (_, i) => makeThing('coin', z + i * 500, x, { h: 100 }));
  },
  highCoins: (z) => {   // a high arc — you need a MEGA jump (or a ramp) to grab these
    const x = randomLane();
    const n = CONFIG.things.coin.rowLength;
    return Array.from({ length: n }, (_, i) => makeThing('coin', z + i * 500, x,
      { h: CONFIG.things.coin.highHeight + Math.sin((i / (n - 1)) * Math.PI) * 300 }));
  },
};

function chooseKind() {
  const base = state.mode === 'sandbox' ? CONFIG.spawn.freePlayChances : CONFIG.spawn.chances;
  const chances = { ...base, coins: (base.coins || 0) + extraCoinChance() };
  if (state.wave) { chances.rock = 0; chances.hole = 0; }   // blobs drop slime instead
  const total = Object.values(chances).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [kind, chance] of Object.entries(chances)) {
    roll -= chance;
    if (roll < 0) return kind;
  }
  return 'coins';
}

// Keeps the road filled with stuff up to the edge of what we can see.
export function spawnAhead() {
  const S = CONFIG.spawn;
  const horizon = state.car.z + SEG * (CONFIG.road.drawDistance - 10);
  if (state.mode === 'race' && !state.gateSpawned && state.nextCheckpointZ < horizon) {
    state.things.push(makeThing('gate', state.nextCheckpointZ, 0));
    state.gateSpawned = true;
  }
  const gap = Math.max(S.fewestSegments, S.everySegments - (state.level - 1) * S.closerPerCheckpoint);
  while (state.nextSpawnZ < horizon) {
    const z = state.nextSpawnZ;
    const nearGate = state.mode === 'race' && Math.abs(z - state.nextCheckpointZ) < 2500;
    const kind = chooseKind();
    if (!nearGate) state.things.push(...MAKERS[kind](z));
    state.nextSpawnZ += gap * SEG * (0.6 + Math.random() * 0.8) + (kind === 'hole' ? 3000 : 0);
  }
}

// Free Play keys: drop things right in front of you.
export function spawnNearby(key) {
  const z = state.car.z + 9000;
  const car = state.car;
  if (key === 1) for (const x of [-0.66, 0, 0.66]) state.things.push(makeThing('crate', z, x));
  if (key === 2) state.things.push(makeThing('traffic', z, car.x, { color: pickOne(CONFIG.things.traffic.colors) }));
  if (key === 3) state.things.push(makeThing('ramp', z, car.x));
  if (key === 4) state.things.push(...MAKERS.coins(z).map((c) => ({ ...c, x: car.x })));
}
