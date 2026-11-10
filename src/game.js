// game.js — the rules of one round, run every frame while the screen is 'playing'.
// Order: traps on the floor → you → waves → mobs → flying things → pickups → effects.

import { CONFIG } from './config.js';
import { state, endRound } from './state.js';
import { updateHero } from './entities/hero.js';
import { updateMob, separateMobs } from './entities/mobs.js';
import { updateProjectiles } from './entities/projectiles.js';
import { updateHazards, updateTraps } from './entities/traps.js';
import { updatePickups } from './entities/pickups.js';
import { heroAtDoor, shopDoor } from './entities/shop.js';
import { updateWaves } from './waves.js';
import { updateEffects } from './effects.js';
import { openShop } from './shopMenu.js';
import { dist } from './view.js';

export function updateGame(dt) {
  state.time += dt;
  updateHazards(dt);
  updateHero(state.hero, dt);
  updateWaves(dt);
  for (const m of [...state.mobs]) if (!m.dead) updateMob(m, dt);
  separateMobs();
  updateProjectiles(dt);
  updateTraps(dt);
  updatePickups(dt);
  updateEffects(dt);
  state.mobs = state.mobs.filter((m) => !m.dead);
  if (state.banner && (state.banner.timeLeft -= dt) <= 0) state.banner = null;
  state.shake = Math.max(0, state.shake - dt);
  if (state.hero.hp <= 0 && state.screen === 'playing') return endRound();
  checkShopDoor();
}

// Walk into the door between waves to go shopping.
function checkShopDoor() {
  if (state.screen !== 'playing') return;
  if (dist(state.hero, shopDoor) > CONFIG.shop.doorRadius + 30) state.shopArmed = true;
  if (state.waveState === 'break' && state.shopArmed && heroAtDoor(state.hero)) {
    state.shopArmed = false;
    openShop();
  }
}
