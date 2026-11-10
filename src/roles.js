// roles.js — what each role does: its normal attack (click) and its special ability (SPACE).
// Role numbers (health, damage, cooldowns) live in CONFIG.roles.

import { CONFIG } from './config.js';
import { heroDamage, heroEnchants, meleeHit } from './combat.js';
import { fireHeroBolt } from './entities/projectiles.js';
import { placeTrap } from './entities/traps.js';
import { addArc, addRing, spawnSparkles } from './effects.js';
import { playSound } from './audio.js';

export const ROLE_IDS = Object.keys(CONFIG.roles);

function swingReach(hero, reach) {
  return reach + (hero.flameSword ? CONFIG.flameSword.reachBonus : 0);
}

// Normal attack (hold the mouse button)
export function heroAttack(hero) {
  const role = CONFIG.roles[hero.role];
  hero.attackTimer = role.cooldown;
  if (role.attack === 'bolt') {
    fireHeroBolt(hero, hero.aim, false);
    playSound('zap');
    return;
  }
  const reach = swingReach(hero, role.reach);
  hero.swingTimer = 0.2;
  addArc(hero.x, hero.y, hero.aim, reach, role.arc, hero.flameSword ? '#ff9f1c' : '#ffffff');
  meleeHit(hero, reach, role.arc / 2, heroDamage(hero), heroEnchants(hero));
  playSound('swing');
}

const ABILITIES = {
  bonker(hero, role) {
    hero.spinTimer = 0.4;
    const reach = swingReach(hero, role.spinReach);
    addRing(hero.x, hero.y, reach, hero.flameSword ? '#ff9f1c' : '#ffffff', 0.35);
    meleeHit(hero, reach, Math.PI, heroDamage(hero) * role.spinMultiplier, heroEnchants(hero));
    playSound('spin');
  },
  zapper(hero, role) {
    for (let i = 0; i < role.burstBolts; i++) fireHeroBolt(hero, hero.aim + (i / role.burstBolts) * Math.PI * 2, true);
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
