// render.js — draws the wasteland background, the HUD (level, XP, fry meter) and each screen's text.
// Characters draw themselves in src/entities/ and stages draw their own parts; this file calls them.

import { CONFIG } from './config.js';
import { state } from './state.js';
import { isMuted } from './audio.js';
import { text } from './text.js';
import { xpNeeded, fryUnlocked } from './rpg.js';
import { drawHero, drawCar } from './entities/hero.js';
import { drawFaller } from './entities/faller.js';
import { drawCoin } from './entities/coin.js';
import { drawTot } from './entities/tot.js';
import { drawBoss } from './entities/boss.js';
import { currentStage } from './stages/index.js';

const W = CONFIG.width;
const H = CONFIG.height;

// Fills in {hero}, {things} and {level} in text from config.js
const fill = (str) => str.replace('{hero}', CONFIG.hero.name).replace('{things}', CONFIG.faller.name)
  .replace('{level}', state.level);

// Star, dust and broken-satellite positions are picked once so they don't jump around.
const stars = Array.from({ length: 50 }, () => ({
  x: Math.random() * W, y: Math.random() * H * 0.6, size: 1 + Math.random() * 2, phase: Math.random() * 6,
}));
const dust = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, speed: 20 + Math.random() * 60 }));
const wrecks = [{ x: 120, y: 200, s: 1, a: 0.4 }, { x: 830, y: 330, s: 0.7, a: -0.6 }, { x: 700, y: 120, s: 0.5, a: 1.2 }];

function dimScreen(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, W, H);
}

export function drawBackground(ctx, seconds) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, CONFIG.skyTopColor);
  sky.addColorStop(1, CONFIG.skyBottomColor);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  if (CONFIG.showStars) {
    ctx.fillStyle = CONFIG.starColor;
    for (const s of stars) {
      ctx.globalAlpha = 0.25 + 0.25 * Math.sin(seconds * 2 + s.phase);
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1;
  }
  for (const w of wrecks) drawWreck(ctx, w, seconds);
  const stage = state.screen === 'title' ? null : currentStage();
  if (CONFIG.showRoad && stage && stage.road) drawRoad(ctx, seconds);
  ctx.fillStyle = 'rgba(240,200,154,0.35)';            // drifting dust
  for (const d of dust) {
    ctx.fillRect(d.x, (d.y + seconds * d.speed) % H, 3, 3);
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

function drawRoad(ctx, seconds) {
  const roadW = 560;
  const left = (W - roadW) / 2;
  ctx.fillStyle = CONFIG.roadColor;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(left, 0, roadW, H);
  ctx.globalAlpha = 1;
  ctx.fillStyle = CONFIG.roadLineColor;
  const offset = (seconds * CONFIG.roadScrollSpeed) % 80;
  for (let y = -80 + offset; y < H; y += 80) ctx.fillRect(W / 2 - 4, y, 8, 44);
  ctx.fillRect(left, 0, 4, H);
  ctx.fillRect(left + roadW - 4, 0, 4, H);
}

export function drawWorld(ctx) {
  const stage = currentStage();
  if (stage.drawBehind) stage.drawBehind(ctx);
  for (const c of state.coins) drawCoin(ctx, c);
  for (const f of state.fallers) drawFaller(ctx, f);
  for (const t of state.tots) drawTot(ctx, t);
  if (stage.draw) stage.draw(ctx);
  if (state.boss) drawBoss(ctx, state.boss);
  drawHero(ctx, state.hero, state.gravity);
  if (state.fryTimer > 0) drawFryBlast(ctx);
}

// A fan of giant golden french fries blasting out of the car.
function drawFryBlast(ctx) {
  const t = 1 - state.fryTimer / CONFIG.fry.seconds;
  const hero = state.hero;
  ctx.fillStyle = `rgba(255,210,63,${0.25 * (1 - t)})`;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(hero.x, hero.y - hero.h / 2);
  for (let i = -4; i <= 4; i++) {
    ctx.save();
    ctx.rotate(i * 0.16);
    const len = 120 + t * 700;
    ctx.fillStyle = CONFIG.fry.color;
    ctx.fillRect(-9, -len, 18, len * 0.35);
    ctx.strokeStyle = '#c98a12';
    ctx.lineWidth = 2;
    ctx.strokeRect(-9, -len, 18, len * 0.35);
    ctx.restore();
  }
  ctx.restore();
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
  // stage + lap (top middle)
  text(ctx, `LAP ${state.lap}`, W / 2, 30, 26, CONFIG.colors.text);
  // fry meter (top right)
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
  if (isMuted()) text(ctx, 'MUTED (M)', W - 24, H - 20, 18, CONFIG.colors.silver, 'right');
  for (const p of state.popups) {
    ctx.globalAlpha = Math.min(1, p.timeLeft * 2);
    text(ctx, p.text, p.x, p.y, 22, p.color);
  }
  ctx.globalAlpha = 1;
  const hint = currentStage().hint;
  if (hint && state.stageTime < 3.5) text(ctx, hint, W / 2, H / 2 + 56, 28, CONFIG.colors.text);
  if (state.banner) text(ctx, state.banner.text, W / 2, H / 2, 60, CONFIG.colors.warning);
}

export function drawTitle(ctx) {
  const t = CONFIG.text;
  text(ctx, t.title, W / 2, 140, 80, CONFIG.colors.accent);
  text(ctx, fill(t.subtitle), W / 2, 215, 34);
  ctx.save();
  ctx.translate(W / 2, 330);
  drawCar(ctx, 90, 130);
  ctx.restore();
  text(ctx, t.start, W / 2, 470, 44);
  text(ctx, t.controls, W / 2, 540, 20, CONFIG.colors.silver);
  if (state.best > 0) text(ctx, `BEST: LEVEL ${state.best}`, W / 2, 590, 24, CONFIG.colors.silver);
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
