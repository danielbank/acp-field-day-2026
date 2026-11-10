// render.js — draws space, the 3D road scene, the score bar (HUD) and each screen's text.
// Road math is in road.js and things draw themselves in entities/; this file puts it all together.

import { CONFIG } from './config.js';
import { state } from './state.js';
import { isMuted } from './audio.js';
import { cameraFor, drawRoad, projectOnRoad } from './road.js';
import { LOOKS } from './entities/things.js';
import { waveThings } from './entities/aliens.js';
import { drawCarShape, drawHood } from './entities/car.js';
import { drawEffects } from './effects.js';

const W = CONFIG.width;
const H = CONFIG.height;
const fill = (str) => str.replace('{car}', CONFIG.car.name);
const wrap = (v, size) => ((v % size) + size) % size;

// Star positions are picked once so they don't jump around.
const stars = Array.from({ length: CONFIG.space.starCount }, () => ({
  x: Math.random() * W, y: Math.random() * H * 0.75,
  size: 1 + Math.random() * 2, phase: Math.random() * 6, depth: 0.5 + Math.random() * 0.5,
}));

function text(ctx, str, x, y, size, color = CONFIG.colors.text, align = 'center') {
  ctx.font = `bold ${size}px ${CONFIG.font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(3, size / 8);
  ctx.strokeStyle = 'rgba(10,4,24,0.8)';   // dark outline so text is readable on anything
  ctx.strokeText(str, x, y);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

function dimScreen(ctx, amount = 0.6) {
  ctx.fillStyle = `rgba(0,0,0,${amount})`;
  ctx.fillRect(0, 0, W, H);
}

export function drawBackground(ctx, seconds) {
  const S = CONFIG.space;
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, S.topColor);
  sky.addColorStop(1, S.bottomColor);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  for (const p of S.planets) {
    const x = wrap(p.x - state.skyX * 0.3, W + 300) - 150;
    if (p.ring) {
      ctx.strokeStyle = p.ringColor;
      ctx.lineWidth = p.size * 0.12;
      ctx.beginPath();
      ctx.ellipse(x, p.y, p.size * 1.7, p.size * 0.45, -0.3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!S.showStars) return;
  ctx.fillStyle = S.starColor;
  for (const s of stars) {
    ctx.globalAlpha = 0.4 + 0.4 * Math.sin(seconds * 2 + s.phase);
    ctx.fillRect(wrap(s.x - state.skyX * s.depth, W), s.y, s.size, s.size);
  }
  ctx.globalAlpha = 1;
}

// Your car seen from behind (only in 'chase' view).
function drawPlayerCar(ctx, view) {
  const car = state.car;
  const C = CONFIG.car;
  const p = projectOnRoad(view, car.z, car.x, car.y);
  if (!p || (car.hurt > 0 && Math.floor(car.hurt * 10) % 2 === 0)) return;
  const w = C.width * p.k;
  ctx.save();
  ctx.translate(p.x, p.y - w * 0.25);
  ctx.rotate(car.spin * Math.sin(car.spin * 30) * 0.5);
  drawCarShape(ctx, 0, w * 0.25, w, w * 0.55, C.bodyColor, C.stripeColor, car.turbo > 0);
  ctx.restore();
}

export function drawWorld(ctx, seconds) {
  const car = state.car;
  const hoodView = CONFIG.car.view !== 'chase';
  ctx.save();
  if (hoodView && car.spin > 0) {   // spin-out wobble
    ctx.translate(W / 2, H / 2);
    ctx.rotate(Math.sin(car.spin * 25) * 0.08 * car.spin);
    ctx.translate(-W / 2, -H / 2);
  }
  const view = drawRoad(ctx, cameraFor(car), seconds);
  const list = [...state.things, ...waveThings(state.wave)];
  if (!hoodView) list.push({ kind: 'player', z: car.z });
  list.sort((a, b) => b.z - a.z);   // far things first, near things on top
  for (const o of list) {
    if (o.kind === 'player') { drawPlayerCar(ctx, view); continue; }
    const p = projectOnRoad(view, o.z, o.x, o.h);
    o.screen = p && { x: p.x, y: p.y };
    if (!p || !LOOKS[o.kind]) continue;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, p.clip);   // hide the parts behind hills
    ctx.clip();
    ctx.globalAlpha = p.fade;
    LOOKS[o.kind](ctx, p, o, seconds, view);
    ctx.restore();
  }
  ctx.restore();
  if (car.turbo > 0) drawSpeedLines(ctx, seconds);
  if (hoodView && state.screen !== 'title') drawHood(ctx, car, seconds);
  drawEffects(ctx);
}

function drawSpeedLines(ctx, seconds) {
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 14; i++) {
    const a = i * 0.45 + seconds * 0.3;
    const t = (seconds * 3 + i * 0.37) % 1;
    const r1 = 250 + t * 400;
    ctx.beginPath();
    ctx.moveTo(W / 2 + Math.cos(a) * r1, H / 2 + Math.sin(a) * r1 * 0.6);
    ctx.lineTo(W / 2 + Math.cos(a) * (r1 + 90), H / 2 + Math.sin(a) * (r1 + 90) * 0.6);
    ctx.stroke();
  }
}

export function drawHUD(ctx) {
  const c = CONFIG.colors;
  const car = state.car;
  text(ctx, `SCORE ${Math.floor(state.score)}`, 24, 36, 30, c.text, 'left');
  if (state.mode === 'race') {
    const t = Math.ceil(state.timeLeft);
    text(ctx, `${t}`, W / 2, 40, 52, t <= 10 ? c.warning : c.text);
    text(ctx, state.wave ? 'CLOCK PAUSED' : `CHECKPOINTS ${state.checkpoints}`, W / 2, 80, 18, c.silver);
    for (let i = 0; i < Math.min(state.lives, 5); i++) {   // one mini car per life
      drawCarShape(ctx, W - 44 - i * 52, 54, 40, 24, CONFIG.car.bodyColor, CONFIG.car.stripeColor);
    }
    if (state.lives > 5) text(ctx, `x${state.lives}`, W - 24, 84, 18, c.silver, 'right');
  } else {
    text(ctx, CONFIG.text.freePlay, W / 2, 36, 36, c.good);
    text(ctx, CONFIG.text.freePlayHelp, W / 2, 72, 18, c.silver);
  }

  // bottom left: speed and turbos
  text(ctx, `${Math.round((car.speed / CONFIG.car.maxSpeed) * 200)} km/h`, 24, H - 66, 26, c.text, 'left');
  text(ctx, 'TURBO', 24, H - 32, 18, c.silver, 'left');
  for (let i = 0; i < CONFIG.car.turboMaxCharges; i++) {
    ctx.fillStyle = i < car.turboCharges ? CONFIG.powerups.turbo.color : 'rgba(255,255,255,0.2)';
    ctx.fillRect(90 + i * 22, H - 42, 16, 20);
  }

  // bottom right: active powerups
  const badges = [];
  if (state.powers.star > 0) badges.push([`2X ${Math.ceil(state.powers.star)}`, CONFIG.powerups.star.color]);
  if (state.powers.magnet > 0) badges.push([`MAGNET ${Math.ceil(state.powers.magnet)}`, CONFIG.powerups.magnet.color]);
  if (state.powers.spring) badges.push(['MEGA JUMP', CONFIG.powerups.spring.color]);
  badges.forEach(([label, color], i) => text(ctx, label, W - 24, H - 32 - i * 32, 22, color, 'right'));

  if (isMuted()) text(ctx, 'MUTED (M)', W - 24, 100, 16, c.silver, 'right');
  if (state.banner) text(ctx, state.banner.text, W / 2, H / 2 - 60, 52, state.banner.color);
}

export function drawTitle(ctx) {
  const t = CONFIG.text;
  const c = CONFIG.colors;
  dimScreen(ctx, 0.4);
  text(ctx, t.title, W / 2, 130, 100, c.accent);
  text(ctx, fill(t.subtitle), W / 2, 210, 34);
  drawCarShape(ctx, W / 2, 380, 220, 120, CONFIG.car.bodyColor, CONFIG.car.stripeColor, true);
  text(ctx, t.start, W / 2, 470, 40);
  text(ctx, t.controls, W / 2, 540, 18, c.silver);
  if (state.best > 0) text(ctx, `BEST ${state.best}`, W / 2, 590, 24, c.silver);
}

export function drawPaused(ctx) {
  dimScreen(ctx);
  text(ctx, CONFIG.text.paused, W / 2, H / 2 - 30, 88, CONFIG.colors.accent);
  text(ctx, CONFIG.text.resume, W / 2, H / 2 + 50, 36);
}

export function drawGameOver(ctx) {
  const t = CONFIG.text;
  dimScreen(ctx);
  text(ctx, t.gameOver, W / 2, 140, 96, CONFIG.colors.warning);
  text(ctx, state.endReason, W / 2, 215, 32, CONFIG.colors.silver);
  text(ctx, `SCORE ${Math.floor(state.score)}`, W / 2, 290, 56);
  text(ctx, `BEST ${state.best}`, W / 2, 355, 36, CONFIG.colors.silver);
  if (state.isNewBest) text(ctx, t.newBest, W / 2, 415, 40, CONFIG.colors.accent);
  text(ctx, t.playAgain, W / 2, 500, 36);
}
