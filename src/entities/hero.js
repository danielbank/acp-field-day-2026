// hero.js — the player's robot knight: walking, aiming, attacking and drawing.
// The knight's looks live in knightLook.js; attacks and abilities live in roles.js.

import { CONFIG } from '../config.js';
import { input } from '../input.js';
import { toScreen, toWorld, keepInArena, screenAngle } from '../view.js';
import { heroAttack } from '../roles.js';
import { blockShop } from './shop.js';
import { drawKnight } from './knightLook.js';
import { knightScale } from '../twists.js';
import { text } from '../ui.js';

export function createHero(look, carry) {
  const role = CONFIG.roles[look.role];
  const upgrades = carry?.upgrades ?? { damage: 0, speed: 0, maxHp: 0 };
  const maxHp = role.maxHp + upgrades.maxHp;
  return {
    x: CONFIG.arena.width / 2, y: CONFIG.arena.depth * 0.62, z: 0, vx: 0, vy: 0,
    r: CONFIG.hero.size * knightScale(),
    hp: maxHp, maxHp, role: look.role, look, upgrades,
    bought: carry?.bought ?? {},
    weaponEnchant: carry?.weaponEnchant ?? null,
    armorEnchant: carry?.armorEnchant ?? null,
    flameSword: carry?.flameSword ?? false,
    trapCharges: carry?.trapCharges ?? 0,
    aim: -Math.PI / 2, walk: 0, onOil: false,
    attackTimer: 0, abilityTimer: 0, swingTimer: 0, spinTimer: 0,
    hurtTimer: 0, shieldTimer: 0, slowTimer: 0,
  };
}

export function heroSpeed(hero) {
  const base = CONFIG.roles[hero.role].speed * (1 + hero.upgrades.speed);
  return hero.slowTimer > 0 ? base * CONFIG.traps.gooSlow : base;
}

export function updateHero(hero, dt) {
  // walk (with a little slide — a lot of slide on oil!)
  let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const len = Math.hypot(dx, dy) || 1;
  dx /= len; dy /= len;
  const speed = heroSpeed(hero);
  const k = Math.min(1, (hero.onOil ? CONFIG.hero.oilGrip : CONFIG.hero.grip) * dt);
  hero.vx += (dx * speed - hero.vx) * k;
  hero.vy += (dy * speed - hero.vy) * k;
  hero.x += hero.vx * dt;
  hero.y += hero.vy * dt;
  keepInArena(hero);
  blockShop(hero);
  hero.walk += Math.hypot(hero.vx, hero.vy) * dt * 0.05;

  // aim at the mouse
  const m = toWorld(input.mouseX, input.mouseY);
  hero.aim = Math.atan2(m.y - hero.y, m.x - hero.x);

  // timers
  for (const t of ['attackTimer', 'abilityTimer', 'swingTimer', 'spinTimer', 'hurtTimer', 'shieldTimer', 'slowTimer']) {
    hero[t] = Math.max(0, hero[t] - dt);
  }
  const regen = CONFIG.roles[hero.role].regenPerSecond;
  if (regen && hero.hp > 0) hero.hp = Math.min(hero.maxHp, hero.hp + regen * dt);

  if (input.mouseDown && hero.attackTimer <= 0) heroAttack(hero);
}

export function drawHero(ctx, hero, t) {
  const blinkOff = hero.hurtTimer > 0 && Math.floor(hero.hurtTimer * 12) % 2 === 0;
  const p = toScreen(hero.x, hero.y, hero.z);
  const scale = CONFIG.hero.drawScale * knightScale();
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(scale, scale);
  if (!blinkOff) {
    const aim = screenAngle(hero.aim);
    const swing = hero.swingTimer > 0 ? 1 - hero.swingTimer / 0.2 : -1;
    const spin = hero.spinTimer > 0 ? 1 - hero.spinTimer / 0.4 : 0;
    drawKnight(ctx, hero.look, { facing: Math.cos(aim) >= 0 ? 1 : -1, aim, swing, spin,
      walk: hero.walk, flame: hero.flameSword, t, role: hero.role });
  }
  if (hero.shieldTimer > 0) {
    ctx.fillStyle = 'rgba(128,255,219,0.18)';
    ctx.strokeStyle = 'rgba(128,255,219,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -40, 50 + Math.sin(t * 12) * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
  text(ctx, hero.look.name, p.x, p.y - 104 * scale, 16, CONFIG.colors.text);
}
