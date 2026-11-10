// screens.js — the title, paused, game-over and victory screens.
// (The customize screen is in customize.js and the shop menu is in shopMenu.js.)

import { CONFIG } from './config.js';
import { state } from './state.js';
import { text, dimScreen } from './ui.js';
import { drawKnight } from './entities/knightLook.js';
import { drawDragon } from './entities/dragonLook.js';
import { drawFlameSwordPickup } from './entities/pickups.js';
import { drawArena } from './render.js';

const W = CONFIG.width;
const T = CONFIG.text;
const C = CONFIG.colors;

// A pretend dragon for the title screen.
const titleDragon = { r: 70, t: 0, z: 0, mouthGlow: 0, x: 0, y: 0 };

export function drawTitle(ctx, t) {
  drawArena(ctx);
  dimScreen(ctx, 0.35);
  text(ctx, T.title, W / 2, 110, 92, C.accent);
  text(ctx, T.subtitle, W / 2, 180, 26);

  ctx.save();
  ctx.translate(300, 470);
  ctx.scale(2.2, 2.2);
  drawKnight(ctx, state.look, { facing: 1, aim: -0.4 + Math.sin(t * 2) * 0.3, walk: t * 2, t, flame: true, role: 'bonker' });
  ctx.restore();

  titleDragon.t = t;
  titleDragon.mouthGlow = Math.sin(t * 1.5) > 0.6 ? 1 : 0;
  ctx.save();
  ctx.translate(700, 470);
  ctx.scale(-1.1, 1.1);
  drawDragon(ctx, titleDragon);
  ctx.restore();

  text(ctx, T.start, W / 2, 530, 36);
  text(ctx, T.controls, W / 2, 580, 16, C.silver);
  if (state.best > 0) text(ctx, `BEST ${state.best}`, W / 2, 612, 20, C.silver);
}

export function drawPaused(ctx) {
  dimScreen(ctx);
  text(ctx, T.paused, W / 2, CONFIG.height / 2 - 30, 88, C.accent);
  text(ctx, T.resume, W / 2, CONFIG.height / 2 + 50, 32);
}

export function drawGameOver(ctx) {
  dimScreen(ctx);
  text(ctx, T.gameOver, W / 2, 170, 84, C.warning);
  text(ctx, `SCORE ${Math.floor(state.score)}`, W / 2, 280, 52);
  text(ctx, `BEST ${state.best}`, W / 2, 345, 32, C.silver);
  if (state.isNewBest) text(ctx, T.newBest, W / 2, 400, 36, C.accent);
  text(ctx, T.playAgain, W / 2, 490, 40);
}

export function drawVictory(ctx, t) {
  dimScreen(ctx, 0.7);
  text(ctx, T.victory, W / 2, 110, 52, C.gold);
  drawFlameSwordPickup(ctx, W / 2, 360, t, 2.2);
  text(ctx, `SCORE ${Math.floor(state.score)}   ·   BEST ${state.best}`, W / 2, 440, 30);
  text(ctx, 'Flaming sword: double damage, longer reach, and every hit burns!', W / 2, 490, 20, C.silver);
  text(ctx, T.victoryHint.replace('{loop}', state.loop), W / 2, 550, 24, C.accent);
}
