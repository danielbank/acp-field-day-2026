// traps.js — booby traps! Arena hazards (spikes, bumpers, oil), spring traps you place,
// and tacks / goo puddles that sneaky mobs leave behind. Looks live in trapLooks.js.

import { CONFIG } from '../config.js';
import { state } from '../state.js';
import { hurtHero, damageMob } from '../combat.js';
import { dist, angleTo, rand } from '../view.js';
import { playSound } from '../audio.js';

const H = CONFIG.hazards;
const T = CONFIG.traps;
const MAX_MOB_TRAPS = 24;

export function createHazards() {
  return H.layout.map((h) => ({ ...h, timer: h.offset ?? 0, up: false, warn: false, boing: 0,
    r: h.type === 'bumper' ? H.bumperSize : h.r }));
}

function onPad(o, pad) {
  const half = H.spikeSize / 2;
  return Math.abs(o.x - pad.x) < half && Math.abs(o.y - pad.y) < half;
}

export function updateHazards(dt) {
  const hero = state.hero;
  const walkers = state.mobs.filter((m) => m.kind !== 'dragon' && m.z < 30);
  hero.onOil = false;
  for (const m of state.mobs) { m.onOil = false; m.spikeCd -= dt; }

  for (const hz of state.hazards) {
    if (hz.type === 'spikes') {
      hz.timer += dt;
      const phase = hz.timer % (H.spikeUpSeconds + H.spikeDownSeconds);
      hz.up = phase > H.spikeDownSeconds;
      hz.warn = !hz.up && phase > H.spikeDownSeconds - 0.6;
      if (!hz.up) continue;
      if (onPad(hero, hz)) hurtHero(H.spikeDamage);
      for (const m of walkers) {
        if (m.spikeCd <= 0 && onPad(m, hz)) { m.spikeCd = 0.6; damageMob(m, H.spikeMobDamage); }
      }
    } else if (hz.type === 'bumper') {
      hz.boing -= dt;
      for (const o of [hero, ...walkers]) bump(hz, o);
    } else if (hz.type === 'oil') {
      if (dist(hero, hz) < hz.r) hero.onOil = true;
      for (const m of walkers) if (dist(m, hz) < hz.r) m.onOil = true;
    }
  }
}

// Bumpers bounce anyone who touches them.
function bump(hz, o) {
  const d = dist(hz, o);
  if (d >= hz.r + o.r) return;
  const a = angleTo(hz, o);
  o.x = hz.x + Math.cos(a) * (hz.r + o.r);
  o.y = hz.y + Math.sin(a) * (hz.r + o.r);
  o.vx = Math.cos(a) * H.bumperForce;
  o.vy = Math.sin(a) * H.bumperForce;
  hz.boing = 0.25;
  if (o === state.hero) playSound('boing');
}

// A spring trap (Builder ability or a Trap Pack from the shop).
export function placeTrap(x, y) {
  const springs = state.traps.filter((t) => t.type === 'spring');
  if (springs.length >= CONFIG.roles.builder.maxTraps) state.traps.splice(state.traps.indexOf(springs[0]), 1);
  state.traps.push({ type: 'spring', x, y, r: T.springSize, uses: T.springUses, cd: 0.3, pop: 0 });
  playSound('trap');
}

// Sneaky mob traps: 'tacks' (ouch) or 'goo' (sticky and slow)
export function dropMobTrap(type, x, y) {
  if (state.traps.filter((t) => t.type !== 'spring').length >= MAX_MOB_TRAPS) return;
  const tacks = type === 'tacks';
  state.traps.push({ type, x, y, r: tacks ? T.tackSize : T.gooSize, life: tacks ? T.tackSeconds : T.gooSeconds,
    seed: rand(0, 10) });
}

export function updateTraps(dt) {
  const hero = state.hero;
  for (const t of state.traps) {
    if (t.life !== undefined) t.life -= dt;
    if (t.type === 'spring') {
      t.cd -= dt;
      t.pop -= dt;
      if (t.cd > 0) continue;
      const m = state.mobs.find((mob) => mob.z < 30 && !mob.dead && dist(mob, t) < t.r + mob.r);
      if (!m) continue;
      damageMob(m, T.springDamage + hero.upgrades.damage, [], angleTo(t, m), 450);
      t.uses -= 1;
      t.cd = 0.4;
      t.pop = 0.25;
      playSound('boing');
    } else if (t.type === 'tacks') {
      if (dist(hero, t) < t.r + hero.r * 0.6 && hurtHero(T.tackDamage)) t.life = 0;
    } else if (t.type === 'goo') {
      if (dist(hero, t) < t.r) hero.slowTimer = 0.15;
    }
  }
  state.traps = state.traps.filter((t) => (t.uses ?? 1) > 0 && (t.life === undefined || t.life > 0));
}
