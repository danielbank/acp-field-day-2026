// roles.js — what each role does: a quick light attack (click), a big heavy attack (right-click or E)
// and its special ability (SPACE). Role numbers (health, damage, cooldowns) live in CONFIG.roles.

import { CONFIG } from './config.js';
import { heroDamage, heroEnchants, meleeHit } from './combat.js';
import { fireHeroBolt } from './entities/projectiles.js';
import { placeTrap } from './entities/traps.js';
import { addArc, addRing, spawnSparkles } from './effects.js';
import { playSound } from './audio.js';

export const ROLE_IDS = Object.keys(CONFIG.roles);
export const SWING_SECONDS = { light: 0.12, heavy: 0.28 };

function swingReach(hero, reach) {
  return reach + (hero.flameSword ? CONFIG.flameSword.reachBonus : 0);
}

function weaponColor(hero) {
  if (hero.flameSword) return '#ff9f1c';
  if (hero.elementalSword) return '#ffee32';
  return '#ffffff';
}

// kind: 'light' (click: quick, low damage) or 'heavy' (right-click / E: big and slow)
export function heroAttack(hero, kind = 'light') {
  const role = CONFIG.roles[hero.role];
  const move = role[kind];
  if (kind === 'light') hero.attackTimer = move.cooldown;
  else hero.heavyTimer = move.cooldown;
  if (role.attack === 'bolt') {
    fireHeroBolt(hero, hero.aim, kind === 'heavy', heroDamage(hero, kind));
    playSound(kind === 'heavy' ? 'spin' : 'zap');
    return;
  }
  const reach = swingReach(hero, move.reach);
  hero.swingTimer = SWING_SECONDS[kind];
  hero.swingKind = kind;
  addArc(hero.x, hero.y, hero.aim, reach, move.arc, weaponColor(hero));
  meleeHit(hero, reach, move.arc / 2, heroDamage(hero, kind), heroEnchants(hero), kind === 'heavy' ? 300 : 120);
  playSound(kind === 'heavy' ? 'heavySwing' : 'swing');
}

const ABILITIES = {
  bonker(hero, role) {
    hero.spinTimer = 0.4;
    const reach = swingReach(hero, role.spinReach);
    addRing(hero.x, hero.y, reach, weaponColor(hero), 0.35);
    meleeHit(hero, reach, Math.PI, heroDamage(hero, 'heavy') * role.spinMultiplier, heroEnchants(hero));
    playSound('spin');
  },
  zapper(hero, role) {
    for (let i = 0; i < role.burstBolts; i++) {
      fireHeroBolt(hero, hero.aim + (i / role.burstBolts) * Math.PI * 2, true, heroDamage(hero, 'light') * 1.5);
    }
    playSound('spin');
  },
  builder(hero) {
    placeTrap(hero.x, hero.y);
  },
  fixer(hero, role) {
    hero.hp = Math.min(hero.maxHp, hero.hp + role.heal);
    hero.shieldTimer = role.shieldSeconds;
    spawnSparkles(hero.x, hero.y, CONFIG.colors.good);
    playSound('heal');
    playSound('shield');
  },
};

// Special ability (SPACE)
export function useAbility(hero) {
  if (hero.abilityTimer > 0) return;
  const role = CONFIG.roles[hero.role];
  hero.abilityTimer = role.abilityCooldown;
  ABILITIES[hero.role](hero, role);
}

// Q: place a spring trap bought from the shop (any role)
export function placeBoughtTrap(hero) {
  if (hero.trapCharges <= 0) return playSound('nope');
  hero.trapCharges -= 1;
  placeTrap(hero.x, hero.y);
}
