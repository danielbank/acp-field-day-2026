// render.js — draws the first-person 3D view: dusty sky, ground, every object (far to near), the cockpit,
// then the HUD (level, XP, fry + missile meters) and each screen's text.

import { CONFIG } from './config.js';
import { state } from './state.js';
import { input } from './input.js';
import { isMuted } from './audio.js';
import { text } from './text.js';
import { xpNeeded, fryUnlocked, missilesUnlocked, carSpeed } from './rpg.js';
import { drawCar } from './entities/hero.js';
import { drawFaller } from './entities/faller.js';
import { drawCoin } from './entities/coin.js';
import { drawTot } from './entities/tot.js';
import { drawPotatoMissile } from './entities/missile.js';
import { drawBoss } from './entities/boss.js';
import { drawCockpit } from './entities/cockpit.js';
import { currentStage } from './stages/index.js';
import { HORIZON, project, airAlt, drawSprite, drawGround } from './view3d.js';

const W = CONFIG.width;
const H = CONFIG.height;

// Fills in {hero}, {things} and {level} in text from config.js
const fill = (str) => str.replace('{hero}', CONFIG.hero.name).replace('{things}', CONFIG.faller.name)
  .replace('{level}', state.level);

// Stars, distant mesas and broken satellites are picked once so they don't jump around.
const stars = Array.from({ length: 60 }, () => ({
  x: Math.random() * W, y: Math.random() * HORIZON * 0.8, size: 1 + Math.random() * 2, phase: Math.random() * 6,
}));
const mesas = Array.from({ length: 9 }, (_, i) => ({ x: i * 150 - 100 + Math.random() * 60,
  w: 120 + Math.random() * 140, h: 25 + Math.random() * 45 }));
const wrecks = [{ x: 150, y: 90, s: 1, a: 0.4 }, { x: 820, y: 150, s: 0.7, a: -0.6 }, { x: 640, y: 60, s: 0.5, a: 1.2 }];

function dimScreen(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
}

export function drawBackground(ctx, seconds) {
  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
  sky.addColorStop(0, CONFIG.skyTopColor);
  sky.addColorStop(1, CONFIG.skyBottomColor);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, HORIZON + 2);
  if (CONFIG.showStars) {
    ctx.fillStyle = CONFIG.starColor;
    for (const s of stars) {
      ctx.globalAlpha = 0.2 + 0.2 * Math.sin(seconds * 2 + s.phase);
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1;
  }
  drawSun(ctx);
  for (const w of wrecks) drawWreck(ctx, w, seconds);
  if (state.screen !== 'title' && currentStage().drawSky) currentStage().drawSky(ctx);
  drawMesas(ctx);
  drawGround(ctx, seconds);
}

// A huge hazy sun glowing through the dust.
function drawSun(ctx) {
  const x = W * 0.7 - (state.hero.x - W / 2) * 0.05;
  const g = ctx.createRadialGradient(x, HORIZON - 40, 10, x, HORIZON - 40, 220);
  g.addColorStop(0, 'rgba(255,220,150,0.9)');
  g.addColorStop(0.25, 'rgba(255,170,80,0.45)');
  g.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 220, HORIZON - 260, 440, 260);
}

// Far-away flat-topped rock mountains, sliding slightly as you steer (parallax).
function drawMesas(ctx) {
  const shift = -(state.hero.x - W / 2) * 0.1;
  ctx.fillStyle = '#5a2c14';
  for (const m of mesas) {
    const x = m.x + shift;
    ctx.beginPath();
    ctx.moveTo(x, HORIZON + 2);
    ctx.lineTo(x + m.w * 0.15, HORIZON - m.h);
    ctx.lineTo(x + m.w * 0.85, HORIZON - m.h);
    ctx.lineTo(x + m.w, HORIZON + 2);
    ctx.fill();
  }
}

// A broken old satellite floating in the dusty sky.
function drawWreck(ctx, w, seconds) {
  ctx.save();
  ctx.translate(w.x, w.y + Math.sin(seconds * 0.5 + w.a) * 8);
  ctx.rotate(w.a + seconds * 0.05);
  ctx.scale(w.s, w.s);
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#3a2416';
  ctx.fillRect(-18, -14, 36, 28);
  ctx.fillRect(-70, -8, 46, 16);
  ctx.fillRect(24, -8, 30, 16);                        // one panel snapped off
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawWorld(ctx) {
  const stage = currentStage();
  const hero = state.hero;
  ctx.save();
  if (hero.hurtTimer > CONFIG.invincibleSeconds - 0.3) {          // camera shake on a bonk
    ctx.translate((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16);
  }
  // collect everything in the world, then draw from far away to close up
  const list = [];
  for (const c of state.coins) list.push({ obj: c, alt: c.r + 8, draw: drawCoin });
  for (const f of state.fallers) list.push({ obj: f, alt: f.air ? airAlt(f.y) : f.r, draw: drawFaller });
  for (const t of state.tots) list.push({ obj: t, alt: airAlt(t.y), mul: 1.5, draw: drawTot });
  for (const m of state.missiles) list.push({ obj: m, alt: airAlt(m.y), draw: drawPotatoMissile });
  if (state.boss) list.push({ obj: state.boss, alt: airAlt(state.boss.y), draw: drawBoss });
  if (stage.sprites) stage.sprites(list);
  list.sort((a, b) => a.obj.y - b.obj.y);
  for (const s of list) drawSprite(ctx, s.obj, s.alt, s.mul || 1, s.draw);
  if (stage.drawEffects) stage.drawEffects(ctx);
  if (state.fryTimer > 0) drawFryBlast(ctx);
  const steer = (input.right ? 1 : 0) - (input.left ? 1 : 0)
    || (input.pointerX !== null ? Math.max(-1, Math.min(1, (input.pointerX - W / 2) / 120)) : 0);
  drawCockpit(ctx, steer, Math.min(1, carSpeed() / 800) * (hero.slowTimer > 0 ? 0.5 : 1));
  ctx.restore();
  if (stage.drawOverlay) stage.drawOverlay(ctx);
  if (hero.hurtTimer > 0) drawHurtGlow(ctx, hero.hurtTimer / CONFIG.invincibleSeconds);
}

// Orange glow around the screen edges after a bonk.
function drawHurtGlow(ctx, amount) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.7);
  g.addColorStop(0, 'rgba(255,123,84,0)');
  g.addColorStop(1, `rgba(255,123,84,${0.55 * amount})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Giant golden french fries blasting from the hood toward the horizon.
function drawFryBlast(ctx) {
  const t = 1 - state.fryTimer / CONFIG.fry.seconds;
  ctx.fillStyle = `rgba(255,210,63,${0.3 * (1 - t)})`;
  ctx.fillRect(0, 0, W, H);
  for (let lane = -4; lane <= 4; lane++) {
    for (let k = 0; k < 3; k++) {
      const f = (t * 2 + k / 3 + Math.abs(lane) * 0.07) % 1;
      const x = W / 2 + lane * 90 * (1 - f) + lane * 12 * f;
      const y = H - 150 + (HORIZON - (H - 150)) * f;
      const size = 1 - f * 0.85;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(lane * 0.12);
      ctx.fillStyle = CONFIG.fry.color;
      ctx.strokeStyle = '#c98a12';
      ctx.lineWidth = 2;
      ctx.fillRect(-10 * size, -55 * size, 20 * size, 110 * size);
      ctx.strokeRect(-10 * size, -55 * size, 20 * size, 110 * size);
      ctx.restore();
    }
  }
}

export function drawHUD(ctx) {
  // level + XP bar (top left)
  text(ctx, `LEVEL ${state.level}`, 24, 30, 30, CONFIG.colors.accent, 'left');
  const need = xpNeeded(state.level);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(24, 52, 200, 12);
  ctx.fillStyle = CONFIG.colors.alien;
  ctx.fillRect(24, 52, 200 * (state.xp / need), 12);
  text(ctx, `XP ${state.xp}/${need}`, 232, 58, 14, CONFIG.colors.silver, 'left');
  text(ctx, CONFIG.difficulties[state.difficulty].name, 24, 82, 14, CONFIG.colors.silver, 'left');
  // lap (top middle)
  text(ctx, `LAP ${state.lap}`, W / 2, 30, 26, CONFIG.colors.text);
  // fry meter + missiles (top right)
  if (fryUnlocked()) {
    const full = state.fryCharge >= CONFIG.fry.chargeNeeded;
    text(ctx, full ? 'FRY READY! (F)' : 'FRY', W - 24, 30, 22, full ? CONFIG.fry.color : CONFIG.colors.silver, 'right');
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(W - 184, 52, 160, 12);
    ctx.fillStyle = CONFIG.fry.color;
    ctx.fillRect(W - 184, 52, 160 * (state.fryCharge / CONFIG.fry.chargeNeeded), 12);
  } else {
    text(ctx, `Fry move at LV ${CONFIG.fry.unlockLevel}`, W - 24, 30, 18, CONFIG.colors.silver, 'right');
  }
  if (missilesUnlocked()) {
    const ready = state.missileTimer <= 0;
    text(ctx, ready ? 'MISSILE READY (E)' : 'MISSILE...', W - 24, 82, 16, ready ? CONFIG.colors.alien : CONFIG.colors.silver, 'right');
  } else {
    text(ctx, `Missiles at LV ${CONFIG.missiles.unlockLevel}`, W - 24, 82, 16, CONFIG.colors.silver, 'right');
  }
  if (isMuted()) text(ctx, 'MUTED (M)', W - 24, H - 75, 18, CONFIG.colors.silver, 'right');
  drawPopups(ctx);
  const hint = currentStage().hint;
  if (hint && state.stageTime < 3.5) text(ctx, hint, W / 2, H / 2 + 56, 28, CONFIG.colors.text);
  if (state.banner) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 12;
    text(ctx, state.banner.text, W / 2, H / 2 - 20, 60, CONFIG.colors.warning);
    ctx.restore();
  }
}

// "+1 XP" style texts: world popups float at their spot in 3D, screen popups stay put.
function drawPopups(ctx) {
  for (const p of state.popups) {
    const at = p.onScreen ? { x: p.x, y: p.y } : project(p.x, p.y, airAlt(p.y)) || { x: W / 2, y: H / 2 };
    ctx.globalAlpha = Math.min(1, p.timeLeft * 2);
    text(ctx, p.text, at.x, at.y - p.rise, 22, p.color);
  }
  ctx.globalAlpha = 1;
}

export function drawTitle(ctx) {
  const t = CONFIG.text;
  dimScreen(ctx);
  text(ctx, t.title, W / 2, 120, 80, CONFIG.colors.accent);
  text(ctx, fill(t.subtitle), W / 2, 195, 34);
  ctx.save();
  ctx.translate(W / 2, 300);
  drawCar(ctx, 80, 115);
  ctx.restore();
  text(ctx, t.difficulty.replace('{d}', CONFIG.difficulties[state.difficulty].name), W / 2, 425, 30, CONFIG.colors.alien);
  text(ctx, t.start, W / 2, 485, 44);
  text(ctx, t.controls, W / 2, 545, 19, CONFIG.colors.silver);
  if (state.best > 0) text(ctx, `BEST: LEVEL ${state.best}`, W / 2, 595, 24, CONFIG.colors.silver);
}

export function drawPaused(ctx) {
  dimScreen(ctx);
  text(ctx, CONFIG.text.paused, W / 2, H / 2 - 30, 88, CONFIG.colors.accent);
  text(ctx, CONFIG.text.resume, W / 2, H / 2 + 50, 36);
}

export function drawGameOver(ctx) {
  const t = CONFIG.text;
  dimScreen(ctx);
  text(ctx, t.gameOver, W / 2, 170, 96, CONFIG.colors.warning);
  text(ctx, `LEVEL ${state.level}`, W / 2, 280, 56);
  text(ctx, `BEST: LEVEL ${state.best}`, W / 2, 350, 36, CONFIG.colors.silver);
  if (state.isNewBest) text(ctx, t.newBest, W / 2, 410, 40, CONFIG.colors.accent);
  text(ctx, t.playAgain, W / 2, 500, 44);
}
