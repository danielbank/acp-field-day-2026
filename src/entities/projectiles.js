// projectiles.js — things that fly: your zappy bolts, baby-dragon sparks and dragon fire breath.
// owner 'hero' hits mobs; owner 'mob' hits you.

import { CONFIG } from '../config.js';
import { state } from '../state.js';
import { heroDamage, heroEnchants, damageMob, hurtHero, canBeHit } from '../combat.js';
import { toScreen, dist } from '../view.js';

export function fireHeroBolt(hero, angle, big) {
  const speed = CONFIG.roles.zapper.boltSpeed;
  state.projectiles.push({
    owner: 'hero', kind: hero.flameSword ? 'fireball' : 'bolt',
    x: hero.x + Math.cos(angle) * 24, y: hero.y + Math.sin(angle) * 24, z: 38,
    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
    r: big ? 15 : 9, damage: heroDamage(hero) * (big ? 1.5 : 1), enchants: heroEnchants(hero),
    pierce: big, life: big ? 0.8 : 1.2, hit: new Set(),
  });
}

// opts: { kind, speed, damage, r, life }
export function fireMobShot(from, angle, opts) {
  state.projectiles.push({
    owner: 'mob', x: from.x + Math.cos(angle) * from.r, y: from.y + Math.sin(angle) * from.r,
    z: opts.z ?? from.z + 10, vx: Math.cos(angle) * opts.speed, vy: Math.sin(angle) * opts.speed,
    born: opts.life, ...opts,
  });
}

export function updateProjectiles(dt) {
  const A = CONFIG.arena;
  for (const p of state.projectiles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.x < 0 || p.x > A.width || p.y < 0 || p.y > A.depth) p.life = 0;
    if (p.life <= 0) continue;
    if (p.owner === 'hero') hitMobs(p);
    else if (dist(p, state.hero) < p.r + state.hero.r) {
      hurtHero(p.damage);
      if (p.kind !== 'flame') p.life = 0;
    }
  }
  state.projectiles = state.projectiles.filter((p) => p.life > 0);
}

function hitMobs(p) {
  for (const m of state.mobs) {
    if (p.hit.has(m) || !canBeHit(m) || dist(p, m) > p.r + m.r) continue;
    p.hit.add(m);
    damageMob(m, p.damage, p.enchants, Math.atan2(p.vy, p.vx), 140);
    if (!p.pierce) { p.life = 0; return; }
  }
}

const COLORS = {
  bolt: ['#4cc9f0', '#ffffff'],
  fireball: ['#ff7b00', '#ffee32'],
  spark: ['#ff9f1c', '#fff3b0'],
  flame: ['#ff5400', '#ffd000'],
};

export function drawProjectile(ctx, p) {
  const s = toScreen(p.x, p.y, p.z);
  const [outer, inner] = COLORS[p.kind];
  let r = p.r;
  if (p.kind === 'flame') {
    const age = 1 - p.life / p.born;
    r = p.r * (0.6 + age * 1.4);
    ctx.globalAlpha = 1 - age * 0.7;
  }
  ctx.fillStyle = outer;
  ctx.beginPath();
  ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = inner;
  ctx.beginPath();
  ctx.arc(s.x, s.y, r * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}
