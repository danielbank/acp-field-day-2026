// render.js — draws the 2.5D arena, everything in it (back-to-front so it looks layered), and the HUD.
// Characters draw themselves in src/entities/; this file just calls them in the right order.

import { CONFIG } from './config.js';
import { state } from './state.js';
import { isMuted } from './audio.js';
import { toScreen, drawShadow } from './view.js';
import { text, bar } from './ui.js';
import { drawHero } from './entities/hero.js';
import { drawMob } from './entities/mobLooks.js';
import { drawDragonWarnings } from './entities/dragonLook.js';
import { drawProjectile } from './entities/projectiles.js';
import { drawPickup } from './entities/pickups.js';
import { drawFloorHazard, drawBumper, drawTrap } from './entities/trapLooks.js';
import { drawShopBuilding, shopDepth } from './entities/shop.js';
import { drawFloorEffects, drawSkyEffects } from './effects.js';

const A = CONFIG.arena;

export function drawBackground(ctx) {
  ctx.fillStyle = CONFIG.backgroundColor;
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
}

export function drawArena(ctx) {
  const tl = toScreen(0, 0);
  const br = toScreen(A.width, A.depth);
  // back wall
  ctx.fillStyle = A.wallColor;
  ctx.fillRect(tl.x, tl.y - 46, br.x - tl.x, 46);
  ctx.fillStyle = A.wallTopColor;
  ctx.fillRect(tl.x, tl.y - 52, br.x - tl.x, 8);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let x = tl.x; x < br.x; x += 60) ctx.fillRect(x, tl.y - 44, 2, 44);
  // checkerboard floor
  const n = A.tileSize;
  for (let y = 0; y < A.depth; y += n) {
    for (let x = 0; x < A.width; x += n) {
      const p = toScreen(x, y);
      ctx.fillStyle = ((x + y) / n) % 2 === 0 ? A.floorColor : A.floorColor2;
      ctx.fillRect(p.x, p.y, Math.min(n, A.width - x), Math.min(n, A.depth - y) * A.tilt + 1);
    }
  }
  // front wall lip
  ctx.fillStyle = A.wallColor;
  ctx.fillRect(tl.x - 8, br.y, br.x - tl.x + 16, 20);
  ctx.fillStyle = A.wallTopColor;
  ctx.fillRect(tl.x - 8, br.y, br.x - tl.x + 16, 5);
}

export function drawWorld(ctx, t) {
  drawArena(ctx);
  for (const hz of state.hazards) drawFloorHazard(ctx, hz);
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
    ...state.mobs.map((m) => ({ y: m.y, draw: () => drawMob(ctx, m, t) })),
    ...state.pickups.map((p) => ({ y: p.y, draw: () => drawPickup(ctx, p, t) })),
    ...state.projectiles.map((p) => ({ y: p.y, draw: () => drawProjectile(ctx, p) })),
    ...state.hazards.filter((h) => h.type === 'bumper').map((h) => ({ y: h.y, draw: () => drawBumper(ctx, h, t) })),
  ];
  things.sort((a, b) => a.y - b.y);
  for (const thing of things) thing.draw();
  drawSkyEffects(ctx);
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
  bar(ctx, 20, 66, 240, 10, 1 - h.abilityTimer / role.abilityCooldown, ready ? C.gold : C.silver);
  text(ctx, `SPACE ${role.abilityName}${ready ? ' — READY!' : ''}`, 20, 88, 14, ready ? C.gold : C.silver, 'left');

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
  if (h.weaponEnchant) gear.push(`${CONFIG.enchants[h.weaponEnchant].label} weapon`);
  if (h.armorEnchant) gear.push(`${CONFIG.enchants[h.armorEnchant].label} armor`);
  if (h.trapCharges > 0) gear.push(`Q traps: ${h.trapCharges}`);
  text(ctx, gear.join('  ·  '), CONFIG.width - 20, 80, 14, C.silver, 'right');

  drawWaveMessage(ctx);
  drawBossBar(ctx);
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
