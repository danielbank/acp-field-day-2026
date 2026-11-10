// main.js — sets up the canvas and runs the game loop (about 60 frames per second).
// Each frame: handle key presses → update the game → draw everything.

import { CONFIG } from './config.js';
import { state, handleAction } from './state.js';
import { setupInput, takeActions } from './input.js';
import { setMusic } from './audio.js';
import { updateGame } from './game.js';
import { drawBackground, drawWorld, drawHUD, drawTitle, drawPaused, drawGameOver } from './render.js';

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

function draw(seconds) {
  drawBackground(ctx, seconds);
  if (state.screen === 'title') return drawTitle(ctx);
  drawWorld(ctx);
  drawHUD(ctx);
  if (state.screen === 'paused') drawPaused(ctx);
  if (state.screen === 'gameover') drawGameOver(ctx);
}

let lastTime = performance.now();
function frame(now) {
  const dt = Math.min((now - lastTime) / 1000, MAX_DT);
  lastTime = now;
  for (const action of takeActions()) handleAction(action);
  if (state.screen === 'playing') updateGame(dt);
  setMusic(state.screen === 'playing' && state.bossMusic);
  draw(now / 1000);
  requestAnimationFrame(frame);
}

if (import.meta.env.DEV) window.game = state;   // dev-only: inspect/tweak state from the browser console

fitCanvas();
window.addEventListener('resize', fitCanvas);
setupInput(canvas);
requestAnimationFrame(frame);
