// mobs.js — the hordes: junk-bots, goo blobs, baby dragons and bomb beetles (the dragon boss is a mob too).
// Each kind has a BEHAVIOR (how it moves and attacks). Looks live in mobLooks.js.

import { CONFIG } from '../config.js';
import { state } from '../state.js';
import { updateStatus, speedFactor, hurtHero, blast, killMob } from '../combat.js';
import { dist, angleTo, keepInArena, rand } from '../view.js';
import { mobSpeedBoost } from '../twists.js';
import { playSound } from '../audio.js';
import { fireMobShot } from './projectiles.js';
import { dropMobTrap } from './traps.js';
import { blockShop } from './shop.js';
import { updateDragon } from './dragon.js';

export function createMob(kind, x, y, loop = 1, small = false) {
  const c = CONFIG.mobs[kind];
  const ng = CONFIG.newGamePlus;
  const hp = (small ? c.hp / 2 : c.hp) * (1 + (loop - 1) * ng.hpBoostPerLoop);
  return {
    kind, x, y, z: c.flyHeight ?? 0, r: small ? c.size * 0.65 : c.size, small,
    hp, maxHp: hp, damage: c.damage, coins: small ? 1 : c.coins, points: c.points,
    speed: c.speed * (1 + (loop - 1) * ng.speedBoostPerLoop) * mobSpeedBoost(),
    t: rand(0, 10), vx: 0, vy: 0, burn: 0, chill: 0, flash: 0, spikeCd: 0,
    timer: rand(1, c.actionEvery ?? 3), sneaky: Math.random() < (c.trapChance ?? 0),
    fuse: -1, facing: 1, onOil: false, dead: false, orbit: Math.random() < 0.5 ? 1 : -1,
  };
}

export function updateMob(m, dt) {
  updateStatus(m, dt);
  if (m.dead) return;
  m.t += dt;
  const slow = speedFactor(m) * (m.onOil ? CONFIG.hazards.oilMobSlow : 1);
  BEHAVIOR[m.kind](m, dt, slow);
  // knockback slide
  m.x += m.vx * dt;
  m.y += m.vy * dt;
  const fade = Math.exp(-7 * dt);
  m.vx *= fade;
  m.vy *= fade;
  if (m.kind === 'dragon') return;
  keepInArena(m);
  blockShop(m);
  if (m.z < 30 && dist(m, state.hero) < m.r + state.hero.r) hurtHero(m.damage, m);
}

function chase(m, dt, speed) {
  const a = angleTo(m, state.hero);
  m.x += Math.cos(a) * speed * dt;
  m.y += Math.sin(a) * speed * dt;
  m.facing = Math.cos(a) >= 0 ? 1 : -1;
  return a;
}

const BEHAVIOR = {
  junkbot(m, dt, slow) {
    chase(m, dt, m.speed * slow);
    if (m.sneaky && (m.timer -= dt) <= 0) {          // sneaky junk-bots leave tacks behind
      m.timer = CONFIG.mobs.junkbot.actionEvery;
      dropMobTrap('tacks', m.x, m.y);
    }
  },
  goo(m, dt, slow) {
    m.z = Math.abs(Math.sin(m.t * 5)) * 16;
    chase(m, dt, m.speed * slow);
    if (!m.small && (m.timer -= dt) <= 0) {          // big goo blobs leave sticky puddles
      m.timer = CONFIG.mobs.goo.actionEvery;
      dropMobTrap('goo', m.x, m.y);
    }
  },
  babyDragon(m, dt, slow) {
    const c = CONFIG.mobs.babyDragon;
    m.z = c.flyHeight + Math.sin(m.t * 4) * 6;
    const d = dist(m, state.hero);
    const a = angleTo(m, state.hero);
    const toward = d > 280 ? 1 : d < 180 ? -1 : 0;   // keep a safe distance, then circle around
    const sp = m.speed * slow;
    m.x += (Math.cos(a) * toward + Math.cos(a + Math.PI / 2) * 0.6 * m.orbit) * sp * dt;
    m.y += (Math.sin(a) * toward + Math.sin(a + Math.PI / 2) * 0.6 * m.orbit) * sp * dt;
    m.facing = Math.cos(a) >= 0 ? 1 : -1;
    if ((m.timer -= dt) <= 0) {
      m.timer = c.actionEvery;
      fireMobShot(m, a, { kind: 'spark', speed: c.sparkSpeed, damage: 1, r: 9, life: 2.5 });
      playSound('spit');
    }
  },
  beetle(m, dt, slow) {
    const c = CONFIG.mobs.beetle;
    if (m.fuse >= 0) {                                // fuse is lit… POOF!
      m.fuse -= dt;
      if (m.fuse < 0) {
        m.coins = 0;
        m.points = 0;
        killMob(m);
        blast(m.x, m.y, c.poofRadius, c.poofDamage, c.poofDamage, '#ffd166');
      }
      return;
    }
    chase(m, dt, m.speed * slow);
    if (dist(m, state.hero) < m.r + state.hero.r + 25) m.fuse = c.fuseSeconds;
  },
  dragon: updateDragon,
};

// Mobs gently push each other apart so a horde doesn't stack into one blob.
export function separateMobs() {
  const list = state.mobs.filter((m) => m.kind !== 'dragon' && m.z < 30);
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      const d = dist(a, b) || 0.01;
      const overlap = a.r + b.r - d;
      if (overlap <= 0) continue;
      const nx = (b.x - a.x) / d;
      const ny = (b.y - a.y) / d;
      a.x -= nx * overlap / 2; a.y -= ny * overlap / 2;
      b.x += nx * overlap / 2; b.y += ny * overlap / 2;
    }
  }
}
