// gatling.js — the rapid-fire goo gatling on your hood: hold X (or SPACE during alien waves) to fire.
// Goo smashes crates, cones, barrels and rocks, bonks traffic and pops alien blobs. Fire too long and it overheats!

import { CONFIG } from './config.js';
import { thingSize } from './entities/things.js';
import { gatlingBoost } from './shop.js';

const G = CONFIG.gatling;
const SHOOTABLE = ['rock', 'crate', 'cone', 'barrel', 'traffic'];

export function createGun() {
  return { heat: 0, cooldown: 0, overheated: false, spin: 0, flash: 0 };
}

// Everything goo can hit right now, with its size.
function targets(state) {
  const list = state.things
    .filter((o) => SHOOTABLE.includes(o.kind) && !o.gone && !o.hit && !o.flying)
    .map((o) => ({ o, ...thingSize(o) }));
  if (state.wave) {
    for (const b of state.wave.blobs) {
      if (b.alive) list.push({ o: b, w: CONFIG.aliens.size, tall: CONFIG.aliens.size });
    }
  }
  return list;
}

// Fires (if the trigger is held) and moves the goo. Returns { fired, hits: [things or blobs that got hit] }.
export function updateGatling(state, dt, firing) {
  const gun = state.gun;
  const car = state.car;
  const boost = gatlingBoost();
  const events = { fired: false, hits: [] };
  gun.cooldown -= dt;
  gun.flash = Math.max(0, gun.flash - dt);
  gun.heat = Math.max(0, gun.heat - G.coolPerSecond * boost * dt);
  if (gun.overheated && gun.heat <= 0.3) gun.overheated = false;

  if (firing && !gun.overheated && gun.cooldown <= 0) {
    state.shots.push({ kind: 'shot', x: car.x + (Math.random() * 2 - 1) * G.spread, z: car.z + 200,
                       startH: car.y + 250, h: car.y + 250, traveled: 0, life: 1.2 });
    gun.cooldown = G.fireEverySeconds / boost;
    gun.heat += G.heatPerShot / boost;
    gun.flash = 0.04;
    if (gun.heat >= 1) { gun.heat = 1; gun.overheated = true; }
    events.fired = true;
  }
  if (firing && !gun.overheated) gun.spin += 30 * dt;

  const rise = state.wave ? 0.15 : 0;   // during alien waves the goo arcs up toward the blobs
  const list = targets(state);
  state.shots = state.shots.filter((shot) => {
    const from = shot.z;
    const move = (car.speed + G.shotSpeed) * dt;
    shot.z += move;
    shot.traveled += G.shotSpeed * dt;
    shot.h = shot.startH + shot.traveled * rise;
    shot.life -= dt;
    const hit = list.find(({ o, w, tall }) => !o.hit && o.alive !== false
      && o.z >= from - 200 && o.z <= shot.z + 200
      && Math.abs(o.x - shot.x) * CONFIG.road.width < w / 2 + 60
      && shot.h > o.h - 150 && shot.h < o.h + tall + 150);
    if (hit) {
      hit.o.hit = true;
      events.hits.push(hit.o);
      return false;
    }
    return shot.life > 0;
  });
  return events;
}
