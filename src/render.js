// render.js — draws the background, the score bar (HUD) and each screen's text.
// Characters draw themselves in src/entities/; this file just calls them.

import { CONFIG } from './config.js';
import { state } from './state.js';
import { isMuted } from './audio.js';
import { drawRobot, drawGround, drawCockpit, horizonY } from './entities/hero.js';
import { drawDino } from './entities/dino.js';
import { drawZapZone } from './entities/zapZone.js';
import { drawBoss, drawBossHealth } from './entities/boss.js';
import { drawLasers } from './lasers.js';

// Fills in {hero}, {things} and {level} in text from config.js
const fill = (str) => str.replace('{hero}', CONFIG.hero.name).replace('{things}', CONFIG.dino.name)
  .replace('{level}', state.level);

// Star positions are picked once so they don't jump around.
const stars = Array.from({ length: 70 }, () => ({
  x: Math.random() * CONFIG.width, y: Math.random() * CONFIG.height,
  size: 1 + Math.random() * 2, phase: Math.random() * 6,
}));

function text(ctx, str, x, y, size, color = CONFIG.colors.text, align = 'center') {
  ctx.font = `bold ${size}px ${CONFIG.font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

function dimScreen(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
}

export function drawBackground(ctx, seconds) {
  ctx.fillStyle = CONFIG.backgroundColor;
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
  if (!CONFIG.showStars) return;
  ctx.fillStyle = CONFIG.starColor;
  for (const s of stars) {
    ctx.globalAlpha = 0.4 + 0.4 * Math.sin(seconds * 2 + s.phase);
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }
  ctx.globalAlpha = 1;
}

export function drawWorld(ctx) {
  drawGround(ctx, state.hero, state.time);
  ctx.save();
  ctx.translate(0, horizonY(state.hero) - CONFIG.height / 2);   // the world bobs as you fly up and down
  if (state.boss) drawBoss(ctx, state.boss);   // boss behind its dinos
  // far-away dinos first, so close ones are drawn on top
  for (const d of [...state.dinos].sort((a, b) => a.closeness - b.closeness)) drawDino(ctx, d);
  ctx.restore();
  for (const z of state.zapZones) drawZapZone(ctx, z, state.hero);
  drawCockpit(ctx, state.hero);
  drawLasers(ctx);
}

export function drawHUD(ctx) {
  text(ctx, `SCORE ${Math.floor(state.score)}`, 24, 36, 32, CONFIG.colors.text, 'left');
  text(ctx, `LEVEL ${state.level}`, CONFIG.width / 2, 36, 32, CONFIG.colors.accent);
  drawHealthBar(ctx);
  if (state.boss) drawBossHealth(ctx, state.boss);
  if (isMuted()) text(ctx, 'MUTED (M)', CONFIG.width - 24, CONFIG.height - 20, 18, CONFIG.colors.silver, 'right');
  if (state.banner) text(ctx, state.banner.text, CONFIG.width / 2, CONFIG.height / 2, 64, CONFIG.colors.warning);
}

// Your health, 0 to 100: green when you're fine, red when you're almost out.
function drawHealthBar(ctx) {
  const w = 220, h = 28, x = CONFIG.width - 24 - w, y = 22;
  const amount = state.health / CONFIG.health;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = amount > 0.3 ? CONFIG.colors.healthGood : CONFIG.colors.healthLow;
  ctx.fillRect(x, y, w * amount, h);
  ctx.strokeStyle = CONFIG.colors.text;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  text(ctx, `HEALTH ${Math.ceil(state.health)}`, x + w / 2, y + h / 2 + 1, 18);
}

export function drawTitle(ctx) {
  const t = CONFIG.text;
  text(ctx, t.title, CONFIG.width / 2, 150, 96, CONFIG.colors.accent);
  text(ctx, fill(t.subtitle), CONFIG.width / 2, 230, 36);
  ctx.save();
  ctx.translate(CONFIG.width / 2, 340);
  drawRobot(ctx, 100, 100);
  ctx.restore();
  text(ctx, t.start, CONFIG.width / 2, 470, 44);
  text(ctx, t.controls, CONFIG.width / 2, 540, 24, CONFIG.colors.silver);
  if (state.best > 0) text(ctx, `BEST ${state.best}`, CONFIG.width / 2, 590, 24, CONFIG.colors.silver);
}

export function drawPaused(ctx) {
  dimScreen(ctx);
  text(ctx, CONFIG.text.paused, CONFIG.width / 2, CONFIG.height / 2 - 30, 88, CONFIG.colors.accent);
  text(ctx, CONFIG.text.resume, CONFIG.width / 2, CONFIG.height / 2 + 50, 36);
}

export function drawGameOver(ctx) {
  const t = CONFIG.text;
  dimScreen(ctx);
  text(ctx, t.gameOver, CONFIG.width / 2, 170, 96, CONFIG.colors.warning);
  text(ctx, `SCORE ${Math.floor(state.score)}`, CONFIG.width / 2, 280, 56);
  text(ctx, `BEST ${state.best}`, CONFIG.width / 2, 350, 36, CONFIG.colors.silver);
  if (state.isNewBest) text(ctx, t.newBest, CONFIG.width / 2, 410, 40, CONFIG.colors.accent);
  text(ctx, t.playAgain, CONFIG.width / 2, 500, 44);
}
