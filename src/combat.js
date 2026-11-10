// combat.js — bonking! Damage to mobs and to you, enchantment effects, and what happens when a mob is bonked out.
// Mobs never "die" here: they poof into stars and drop coins.

import { CONFIG } from './config.js';
import { state } from './state.js';
import { playSound } from './audio.js';
import { dist, angleTo, angleDiff } from './view.js';
import { spawnStars, spawnEmbers, floatText, addZap, addRing } from './effects.js';
import { spawnCoins } from './entities/pickups.js';
import { createMob } from './entities/mobs.js';
import { dragonBonked } from './entities/dragon.js';

const E = CONFIG.enchants;

export function heroDamage(hero) {
  const d = CONFIG.roles[hero.role].damage + hero.upgrades.damage;
  return hero.flameSword ? d * CONFIG.flameSword.damageMultiplier : d;
}

export function heroEnchants(hero) {
  const list = hero.weaponEnchant ? [hero.weaponEnchant] : [];
  if (hero.flameSword && !list.includes('fire')) list.push('fire');
  return list;
}

// A dragon high in the sky can't be bonked.
export function canBeHit(mob) {
  return !mob.dead && mob.z < CONFIG.dragon.untouchableHeight;
}

export function damageMob(mob, amount, enchants = [], knockAngle = null, knockForce = 260) {
  if (!canBeHit(mob)) return false;
  mob.hp -= amount;
  mob.flash = 0.12;
  if (knockAngle !== null && mob.kind !== 'dragon') {
    mob.vx += Math.cos(knockAngle) * knockForce;
    mob.vy += Math.sin(knockAngle) * knockForce;
  }
  for (const e of enchants) applyEnchant(mob, e, amount);
  if (mob.hp <= 0) killMob(mob);
  else playSound('bonk');
  return true;
}

function applyEnchant(mob, element, amount) {
  if (element === 'fire') mob.burn = E.fire.burnSeconds;
  if (element === 'ice') mob.chill = E.ice.chillSeconds;
  if (element === 'zap') {
    const others = state.mobs
      .filter((m) => m !== mob && canBeHit(m) && dist(m, mob) < E.zap.chainRange)
      .sort((a, b) => dist(a, mob) - dist(b, mob))
      .slice(0, E.zap.chainCount);
    for (const m of others) {
      addZap(mob, m);
      damageMob(m, amount * E.zap.chainDamage);   // no enchant here, so zaps don't zap forever
    }
  }
}

// Burning and freezing wear off over time.
export function updateStatus(mob, dt) {
  mob.flash -= dt;
  if (mob.chill > 0) mob.chill -= dt;
  if (mob.burn > 0) {
    mob.burn -= dt;
    mob.hp -= E.fire.burnDamagePerSecond * dt;
    if (Math.random() < dt * 8) spawnEmbers(mob.x, mob.y, mob.z + mob.r);
    if (mob.hp <= 0) killMob(mob);
  }
}

export function speedFactor(mob) {
  return mob.chill > 0 ? E.ice.slow : 1;
}

export function killMob(mob) {
  if (mob.dead) return;
  mob.dead = true;
  state.score += mob.points;
  spawnCoins(mob.x, mob.y, mob.coins);
  spawnStars(mob.x, mob.y, mob.z + mob.r, mob.kind === 'dragon' ? 40 : 10);
  playSound('poof');
  if (mob.kind === 'goo' && !mob.small) {
    for (const s of [-1, 1]) state.mobs.push(createMob('goo', mob.x + s * 18, mob.y, state.loop, true));
  }
  if (mob.kind === 'dragon') dragonBonked(mob);
}

// Ouch! Returns true if the bonk counted (not blinking, no shield).
export function hurtHero(amount, source = null) {
  const h = state.hero;
  if (h.hurtTimer > 0 || h.hp <= 0 || state.screen !== 'playing') return false;
  if (h.shieldTimer > 0) {
    if (source) addZap(h, source);
    return false;
  }
  h.hp -= amount;
  h.hurtTimer = CONFIG.hero.hurtSeconds;
  state.shake = Math.max(state.shake, 0.15);
  floatText(h.x, h.y, 100, `-${amount}`, CONFIG.colors.bad);
  playSound('hurt');
  if (source && h.armorEnchant && !source.dead) {     // enchanted armor bonks back!
    damageMob(source, E.armorDamage, [h.armorEnchant], angleTo(h, source), 300);
  }
  return true;
}

export function pushHero(angle, force) {
  state.hero.vx += Math.cos(angle) * force;
  state.hero.vy += Math.sin(angle) * force;
}

// Bonk every mob within `reach` that's inside the swing (arcHalf = half the swing width).
export function meleeHit(hero, reach, arcHalf, damage, enchants) {
  for (const m of [...state.mobs]) {
    if (dist(hero, m) - m.r > reach) continue;
    const a = angleTo(hero, m);
    if (Math.abs(angleDiff(a, hero.aim)) > arcHalf) continue;
    damageMob(m, damage, enchants, a);
  }
}

// A cartoon "poof" that bonks everyone nearby (bomb beetles, dragon landings).
export function blast(x, y, radius, heroDamage, mobDamage, color = '#ffffff') {
  addRing(x, y, radius, color, 0.4);
  const h = state.hero;
  if (Math.hypot(h.x - x, h.y - y) < radius + h.r && hurtHero(heroDamage)) {
    pushHero(Math.atan2(h.y - y, h.x - x), 500);
  }
  if (mobDamage > 0) {
    for (const m of [...state.mobs]) {
      if (m.kind !== 'dragon' && Math.hypot(m.x - x, m.y - y) < radius + m.r) damageMob(m, mobDamage, [], Math.atan2(m.y - y, m.x - x));
    }
  }
}
