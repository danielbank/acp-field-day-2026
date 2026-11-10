// render.js — draws the background, the score bar (HUD) and each screen's text.
// Characters draw themselves in src/entities/; this file just calls them.

import { CONFIG } from './config.js';
import { state } from './state.js';
import { isMuted } from './audio.js';
import { drawHero, drawRobot } from './entities/hero.js';
import { drawFaller } from './entities/faller.js';
import { drawBoss } from './entities/boss.js';

// Fills in {hero}, {things} and {level} in text from config.js
const fill = (str) => str.replace('{hero}', CONFIG.hero.name).replace('{things}', CONFIG.faller.name)
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
  for (const f of state.fallers) drawFaller(ctx, f);
  if (state.boss) drawBoss(ctx, state.boss);
  drawHero(ctx, state.hero, state.gravity);
}

export function drawHUD(ctx) {
  text(ctx, `SCORE ${Math.floor(state.score)}`, 24, 36, 32, CONFIG.colors.text, 'left');
  text(ctx, `LEVEL ${state.level}`, CONFIG.width / 2, 36, 32, CONFIG.colors.accent);
  for (let i = 0; i < state.lives; i++) {   // one mini robot per life
    ctx.save();
    ctx.translate(CONFIG.width - 36 - i * 44, 40);
    drawRobot(ctx, 30, 30);
    ctx.restore();
  }
  if (isMuted()) text(ctx, 'MUTED (M)', CONFIG.width - 24, CONFIG.height - 20, 18, CONFIG.colors.silver, 'right');
  if (state.banner) text(ctx, state.banner.text, CONFIG.width / 2, CONFIG.height / 2, 64, CONFIG.colors.warning);
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
