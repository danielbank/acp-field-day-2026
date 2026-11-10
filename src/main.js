// main.js — sets up the canvas and runs the game loop (about 60 frames per second).
// Each frame: handle key presses → update the game → draw the current screen.

import { CONFIG } from './config.js';
import { state, handleAction } from './state.js';
import { setupInput, takeActions } from './input.js';
import { updateGame } from './game.js';
import { drawBackground, drawWorld, drawHUD } from './render.js';
import { drawTitle, drawPaused, drawGameOver, drawVictory } from './screens.js';
import { drawCustomize } from './customize.js';
import { drawShopMenu } from './shopMenu.js';

const MAX_DT = 1 / 20;   // if the computer hiccups, don't let things teleport

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Scale the game to fit the window, keeping its shape, and stay sharp on big screens.
function fitCanvas() {
  const scale = Math.min(window.innerWidth / CONFIG.width, window.innerHeight / CONFIG.height);
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${CONFIG.width * scale}px`;
  canvas.style.height = `${CONFIG.height * scale}px`;
  canvas.width = Math.round(CONFIG.width * scale * dpr);
  canvas.height = Math.round(CONFIG.height * scale * dpr);
  ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
}

const OVERLAYS = { paused: drawPaused, gameover: drawGameOver, victory: drawVictory, shop: drawShopMenu };

function draw(t) {
  drawBackground(ctx);
  if (state.screen === 'title') return drawTitle(ctx, t);
  if (state.screen === 'customize') return drawCustomize(ctx, t);
  ctx.save();
  if (state.shake > 0) ctx.translate((Math.random() - 0.5) * 16 * state.shake, (Math.random() - 0.5) * 16 * state.shake);
  drawWorld(ctx, t);
  ctx.restore();
  drawHUD(ctx);
  OVERLAYS[state.screen]?.(ctx, t);
}

let lastTime = performance.now();
function frame(now) {
  const dt = Math.min((now - lastTime) / 1000, MAX_DT);
  lastTime = now;
  for (const action of takeActions()) handleAction(action);
  if (state.screen === 'playing') updateGame(dt);
  draw(now / 1000);
  requestAnimationFrame(frame);
}

if (import.meta.env.DEV) window.game = state;   // dev-only: inspect/tweak state from the browser console

fitCanvas();
window.addEventListener('resize', fitCanvas);
setupInput(canvas);
requestAnimationFrame(frame);
