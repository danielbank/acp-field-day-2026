// render.js — draws the 2.5D arena, everything in it (back-to-front so it looks layered), and the HUD.
// Characters draw themselves in src/entities/; this file just calls them in the right order.

import { CONFIG } from './config.js';
import { state } from './state.js';
import { isMuted } from './audio.js';
import { toScreen, drawShadow, angleTo, dist } from './view.js';
import { text, bar } from './ui.js';
import { drawArena, drawFrontWall } from './arena3d.js';
import { drawHero } from './entities/hero.js';
import { drawMob } from './entities/mobLooks.js';
import { drawDragonWarnings } from './entities/dragonLook.js';
import { drawProjectile } from './entities/projectiles.js';
import { drawPickup } from './entities/pickups.js';
import { drawFloorHazard, drawBumper, drawTrap } from './entities/trapLooks.js';
import { drawShopBuilding, shopDepth, shopDoor } from './entities/shop.js';
import { PROPS, drawProp } from './entities/props.js';
import { drawFloorEffects, drawSkyEffects } from './effects.js';

export function drawBackground(ctx) {
  ctx.fillStyle = CONFIG.backgroundColor;
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
}

export function drawWorld(ctx, t) {
  drawArena(ctx, t);
  for (const hz of state.hazards) drawFloorHazard(ctx, hz, t);
  for (const trap of state.traps) drawTrap(ctx, trap, t);
  drawDragonWarnings(ctx, t);
  drawFloorEffects(ctx);

  // shadows first, then everything standing up, sorted back-to-front
  const hero = state.hero;
  drawShadow(ctx, hero.x, hero.y, hero.r, hero.z);
  for (const m of state.mobs) drawShadow(ctx, m.x, m.y, m.r * (m.kind === 'dragon' ? 1.3 : 1), m.z);
  for (const p of state.pickups) drawShadow(ctx, p.x, p.y, p.kind === 'coin' ? 7 : 22, p.z);
  for (const p of state.projectiles) drawShadow(ctx, p.x, p.y, p.r * 0.7, p.z);

  const things = [
    { y: hero.y, draw: () => drawHero(ctx, hero, t) },
    { y: shopDepth, draw: () => drawShopBuilding(ctx, state.waveState === 'break', t) },
    ...PROPS.map((p) => ({ y: p.y + p.r, draw: () => drawProp(ctx, p) })),
    ...state.mobs.map((m) => ({ y: m.y, draw: () => drawMob(ctx, m, t) })),
    ...state.pickups.map((p) => ({ y: p.y, draw: () => drawPickup(ctx, p, t) })),
    ...state.projectiles.map((p) => ({ y: p.y, draw: () => drawProjectile(ctx, p) })),
    ...state.hazards.filter((h) => h.type === 'bumper').map((h) => ({ y: h.y, draw: () => drawBumper(ctx, h, t) })),
  ];
  things.sort((a, b) => a.y - b.y);
  for (const thing of things) thing.draw();
  drawSkyEffects(ctx);
  drawFrontWall(ctx);
}

export function drawHUD(ctx) {
  const h = state.hero;
  const role = CONFIG.roles[h.role];
  const C = CONFIG.colors;
  // left: health + ability
  text(ctx, `${h.look.name} the ${role.label}`, 20, 22, 18, C.text, 'left');
  bar(ctx, 20, 40, 240, 18, h.hp / h.maxHp, h.hp / h.maxHp > 0.35 ? C.good : C.bad);
  text(ctx, `${Math.ceil(h.hp)} / ${h.maxHp}`, 140, 49, 14);
  const ready = h.abilityTimer <= 0;
  bar(ctx, 20, 66, 116, 10, 1 - h.abilityTimer / role.abilityCooldown, ready ? C.gold : C.silver);
  text(ctx, `SPACE ${role.abilityName}`, 20, 88, 13, ready ? C.gold : C.silver, 'left');
  const heavyReady = h.heavyTimer <= 0;
  bar(ctx, 144, 66, 116, 10, 1 - h.heavyTimer / role.heavy.cooldown, heavyReady ? C.warning : C.silver);
  text(ctx, `R-CLICK/E ${role.heavy.name}`, 144, 104, 13, heavyReady ? C.warning : C.silver, 'left');

  // middle: wave
  const label = state.waveState === 'boss' || state.waveState === 'won' ? 'DRAGON!'
    : `WAVE ${Math.max(1, state.wave)} / ${CONFIG.waves.length}`;
  text(ctx, label, CONFIG.width / 2, 28, 30, C.accent);
  if (state.loop > 1) text(ctx, `NEW GAME+ ${state.loop - 1}`, CONFIG.width / 2, 58, 16, C.warning);

  // right: coins, score, gear
  text(ctx, `● ${state.coins}`, CONFIG.width - 20, 24, 26, C.gold, 'right');
  text(ctx, `SCORE ${Math.floor(state.score)}`, CONFIG.width - 20, 52, 18, C.text, 'right');
  const gear = [];
  if (h.flameSword) gear.push('FLAME SWORD');
  if (h.elementalSword) gear.push('ELEMENTAL SWORD');
  if (h.weaponEnchant) gear.push(`${CONFIG.enchants[h.weaponEnchant].label} weapon`);
  if (h.armorEnchant) gear.push(`${CONFIG.enchants[h.armorEnchant].label} armor`);
  if (h.trapCharges > 0) gear.push(`Q traps: ${h.trapCharges}`);
  text(ctx, gear.join('  ·  '), CONFIG.width - 20, 80, 14, C.silver, 'right');

  drawWaveMessage(ctx);
  drawBossBar(ctx);
  drawMinimap(ctx);
  if (state.waveState === 'break' && state.wave > 0) drawShopArrow(ctx);
  if (isMuted()) text(ctx, 'MUTED (M)', CONFIG.width - 20, 108, 14, C.silver, 'right');
  if (state.banner) text(ctx, state.banner.text, CONFIG.width / 2, CONFIG.height / 2 - 40, 52, C.warning);
}

function drawWaveMessage(ctx) {
  if (state.waveState !== 'break') return;
  const secs = Math.ceil(state.breakTimer);
  const next = state.wave >= CONFIG.waves.length ? 'THE DRAGON' : `wave ${state.wave + 1}`;
  const msg = state.wave === 0 ? `Get ready! Wave 1 in ${secs}…`
    : `Shop is OPEN — walk into its door!  ·  ${next} in ${secs}s (ENTER = go now)`;
  text(ctx, msg, CONFIG.width / 2, CONFIG.height - 16, 18, CONFIG.colors.gold);
}

function drawBossBar(ctx) {
  const d = state.mobs.find((m) => m.kind === 'dragon');
  if (!d) return;
  const w = 520;
  const x = (CONFIG.width - w) / 2;
  bar(ctx, x, CONFIG.height - 26, w, 18, d.hp / d.maxHp, CONFIG.dragon.wingColor);
  text(ctx, CONFIG.dragon.name, CONFIG.width / 2, CONFIG.height - 17, 14);
}

// A little map of the whole courtyard in the corner.
function drawMinimap(ctx) {
  const A = CONFIG.arena;
  const w = 150;
  const h = (w * A.depth) / A.width;
  const x0 = CONFIG.width - w - 14;
  const y0 = CONFIG.height - h - 40;
  const k = w / A.width;
  ctx.fillStyle = 'rgba(20,10,40,0.7)';
  ctx.strokeStyle = CONFIG.colors.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x0, y0, w, h, 6);
  ctx.fill();
  ctx.stroke();
  const S = CONFIG.shop;
  ctx.fillStyle = CONFIG.colors.gold;
  ctx.fillRect(x0 + S.x * k, y0 + S.y * k, S.w * k, S.h * k);
  ctx.fillStyle = '#8a829c';
  for (const p of PROPS) ctx.fillRect(x0 + (p.x - p.r) * k, y0 + (p.y - p.r) * k, Math.max(2, p.r * 2 * k), Math.max(2, p.r * 2 * k));
  for (const m of state.mobs) {
    ctx.fillStyle = m.kind === 'dragon' ? CONFIG.dragon.wingColor : CONFIG.colors.bad;
    ctx.beginPath();
    ctx.arc(x0 + m.x * k, y0 + m.y * k, m.kind === 'dragon' ? 5 : 2, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const p of state.pickups) {
    if (p.kind !== 'sword') continue;
    ctx.fillStyle = '#ffb703';
    ctx.fillRect(x0 + p.x * k - 3, y0 + p.y * k - 3, 6, 6);
  }
  ctx.fillStyle = CONFIG.colors.good;
  ctx.beginPath();
  ctx.arc(x0 + state.hero.x * k, y0 + state.hero.y * k, 4, 0, Math.PI * 2);
  ctx.fill();
}

// During shop time, an arrow at your feet points the way to the shop.
function drawShopArrow(ctx) {
  const h = state.hero;
  if (dist(h, shopDoor) < 200) return;
  const a = angleTo(h, shopDoor);
  const base = toScreen(h.x + Math.cos(a) * 60, h.y + Math.sin(a) * 60, 2);
  const tip = toScreen(h.x + Math.cos(a) * 95, h.y + Math.sin(a) * 95, 2);
  if (base.s <= 0 || tip.s <= 0) return;
  const sa = Math.atan2(tip.y - base.y, tip.x - base.x);
  ctx.fillStyle = CONFIG.colors.gold;
  ctx.strokeStyle = 'rgba(10,4,20,0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(base.x + Math.cos(sa + 1.9) * 14, base.y + Math.sin(sa + 1.9) * 14);
  ctx.lineTo(base.x + Math.cos(sa - 1.9) * 14, base.y + Math.sin(sa - 1.9) * 14);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}
