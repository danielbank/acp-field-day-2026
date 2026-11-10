// render.js — draws space, the 3D road scene, the score bar (HUD) and each screen's text.
// Road math is in road.js and things draw themselves in entities/; this file puts it all together.

import { CONFIG } from './config.js';
import { state } from './state.js';
import { isMuted } from './audio.js';
import { cameraFor, drawRoad, projectOnRoad } from './road.js';
import { LOOKS, thingSize } from './entities/things.js';
import { waveThings } from './entities/aliens.js';
import { drawCarShape, drawHood } from './entities/car.js';
import { drawEffects } from './effects.js';
import { ballLit } from './shading.js';
import { garage, paintColor } from './shop.js';

const W = CONFIG.width;
const H = CONFIG.height;
const fill = (str) => str.replace('{car}', CONFIG.car.name);
const wrap = (v, size) => ((v % size) + size) % size;

// Star positions are picked once so they don't jump around.
const NEBULAS = [
  { x: 300, y: 200, r: 320, color: 'rgba(199,125,255,0.16)' },
  { x: 750, y: 260, r: 260, color: 'rgba(94,242,255,0.10)' },
  { x: 1050, y: 150, r: 300, color: 'rgba(255,79,216,0.12)' },
];

const stars = Array.from({ length: CONFIG.space.starCount }, () => ({
  x: Math.random() * W, y: Math.random() * H * 0.75,
  size: 1 + Math.random() * 2, phase: Math.random() * 6, depth: 0.5 + Math.random() * 0.5,
}));

export function text(ctx, str, x, y, size, color = CONFIG.colors.text, align = 'center') {
  ctx.font = `bold ${size}px ${CONFIG.font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(3, size / 8);
  ctx.strokeStyle = 'rgba(10,4,24,0.8)';   // dark outline so text is readable on anything
  ctx.strokeText(str, x, y);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

export function dimScreen(ctx, amount = 0.6) {
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
  for (const n of NEBULAS) {   // soft glowing space clouds
    const x = wrap(n.x - state.skyX * 0.15, W + 600) - 300;
    const g = ctx.createRadialGradient(x, n.y, 0, x, n.y, n.r);
    g.addColorStop(0, n.color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - n.r, n.y - n.r, n.r * 2, n.r * 2);
  }
  for (const p of S.planets) {
    const x = wrap(p.x - state.skyX * 0.3, W + 300) - 150;
    if (p.ring) {
      ctx.strokeStyle = p.ringColor;
      ctx.lineWidth = p.size * 0.12;
      ctx.beginPath();
      ctx.ellipse(x, p.y, p.size * 1.7, p.size * 0.45, -0.3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = ballLit(ctx, p.color, x, p.y, p.size);
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
  drawCarShape(ctx, 0, w * 0.25, w, w * 0.55, car.color, C.stripeColor, car.turbo > 0);
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
  const list = [...state.things, ...waveThings(state.wave), ...state.shots];
  if (!hoodView && !car.falling) list.push({ kind: 'player', z: car.z });
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
    if (HAS_SHADOW.includes(o.kind)) drawShadow(ctx, view, o);
    LOOKS[o.kind](ctx, p, o, seconds, view);
    ctx.restore();
  }
  ctx.restore();
  if (car.turbo > 0) drawSpeedLines(ctx, seconds);
  const driving = ['playing', 'paused', 'gameover'].includes(state.screen);
  if (hoodView && driving) drawHood(ctx, car, seconds, state.gun);
  drawVignette(ctx);
  if (state.flash > 0) {   // red "ouch" flash
    ctx.fillStyle = `rgba(255,40,60,${state.flash})`;
    ctx.fillRect(0, 0, W, H);
  }
  drawEffects(ctx);
}

const HAS_SHADOW = ['rock', 'crate', 'cone', 'barrel', 'traffic', 'coin', 'powerup', 'blob'];

// A soft dark oval on the road under a thing (it stays on the road when the thing floats or jumps).
function drawShadow(ctx, view, o) {
  const g = projectOnRoad(view, o.z, o.x, 0);
  if (!g) return;
  const w = (o.kind === 'blob' ? CONFIG.aliens.size : thingSize(o).w) * g.k;
  const fade = Math.max(0.15, 1 - o.h / 3000);
  ctx.fillStyle = `rgba(0,0,0,${0.4 * fade})`;
  ctx.beginPath();
  ctx.ellipse(g.x, g.y, w * 0.55 * fade, Math.max(1, w * 0.1 * fade), 0, 0, Math.PI * 2);
  ctx.fill();
}

// Darker corners, like a real camera lens.
function drawVignette(ctx) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
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
  if (state.mode === 'race') text(ctx, `COINS ${state.coinsThisRace}`, 24, 70, 20, CONFIG.things.coin.color, 'left');
  if (state.mode === 'race') {
    const t = Math.ceil(state.timeLeft);
    text(ctx, `${t}`, W / 2, 40, 52, t <= 10 ? c.warning : c.text);
    text(ctx, state.wave ? 'CLOCK PAUSED' : `CHECKPOINTS ${state.checkpoints}`, W / 2, 80, 18, c.silver);
    drawHealthBar(ctx);
  } else {
    text(ctx, CONFIG.text.freePlay, W / 2, 36, 36, c.good);
    text(ctx, CONFIG.text.freePlayHelp, W / 2, 72, 18, c.silver);
  }

  // bottom left: speed and turbos
  text(ctx, `${Math.round((car.speed / CONFIG.car.maxSpeed) * 200)} km/h`, 24, H - 66, 26, c.text, 'left');
  text(ctx, 'TURBO', 24, H - 32, 18, c.silver, 'left');
  for (let i = 0; i < car.turboMax; i++) {
    ctx.fillStyle = i < car.turboCharges ? CONFIG.powerups.turbo.color : 'rgba(255,255,255,0.2)';
    ctx.fillRect(90 + i * 22, H - 42, 16, 20);
  }
  drawGunHeat(ctx);

  // bottom right: active powerups
  const badges = [];
  if (state.powers.star > 0) badges.push([`2X ${Math.ceil(state.powers.star)}`, CONFIG.powerups.star.color]);
  if (state.powers.magnet > 0) badges.push([`MAGNET ${Math.ceil(state.powers.magnet)}`, CONFIG.powerups.magnet.color]);
  if (state.powers.spring) badges.push(['MEGA JUMP', CONFIG.powerups.spring.color]);
  badges.forEach(([label, color], i) => text(ctx, label, W - 24, H - 32 - i * 32, 22, color, 'right'));

  if (isMuted()) text(ctx, 'MUTED (M)', W - 24, 100, 16, c.silver, 'right');
  if (state.banner) text(ctx, state.banner.text, W / 2, H / 2 - 60, 52, state.banner.color);
}

// HEALTH bar in the top right: green when full, red when low.
function drawHealthBar(ctx) {
  const pct = state.health / state.maxHealth;
  const x = W - 244;
  const y = 22;
  text(ctx, 'HEALTH', x + 220, y + 44, 16, CONFIG.colors.silver, 'right');
  ctx.fillStyle = 'rgba(10,4,24,0.7)';
  ctx.fillRect(x - 3, y - 3, 226, 26);
  ctx.fillStyle = `hsl(${Math.round(120 * pct)}, 85%, 50%)`;
  ctx.fillRect(x, y, 220 * pct, 20);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';   // shine on top
  ctx.fillRect(x, y, 220 * pct, 6);
  text(ctx, `${Math.ceil(state.health)}`, x + 110, y + 10, 16);
}

// GUN heat bar: fills up while you fire; at the top it overheats.
function drawGunHeat(ctx) {
  const gun = state.gun;
  text(ctx, gun.overheated ? 'TOO HOT!' : 'GUN (X)', 24, H - 100, 16,
    gun.overheated ? CONFIG.colors.warning : CONFIG.colors.silver, 'left');
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(110, H - 108, 90, 14);
  ctx.fillStyle = gun.overheated ? CONFIG.colors.warning : `hsl(${Math.round(190 - 190 * gun.heat)}, 90%, 55%)`;
  ctx.fillRect(110, H - 108, 90 * gun.heat, 14);
}

export function drawTitle(ctx) {
  const t = CONFIG.text;
  const c = CONFIG.colors;
  dimScreen(ctx, 0.4);
  text(ctx, t.title, W / 2, 130, 100, c.accent);
  text(ctx, fill(t.subtitle), W / 2, 210, 34);
  drawCarShape(ctx, W / 2, 380, 220, 120, paintColor(), CONFIG.car.stripeColor, true);
  text(ctx, t.start, W / 2, 470, 40);
  text(ctx, t.controls, W / 2, 540, 18, c.silver);
  const best = state.best > 0 ? `BEST ${state.best}   ·   ` : '';
  text(ctx, `${best}SHOP COINS ${garage.coins}`, W / 2, 590, 24, c.silver);
}

export function drawPaused(ctx) {
  dimScreen(ctx);
  text(ctx, CONFIG.text.paused, W / 2, H / 2 - 30, 88, CONFIG.colors.accent);
  text(ctx, CONFIG.text.resume, W / 2, H / 2 + 50, 36);
}

export function drawGameOver(ctx, seconds) {
  const t = CONFIG.text;
  dimScreen(ctx);
  const sinceEnd = seconds - state.endedAt;
  if (sinceEnd < 2.4 && Math.floor(sinceEnd * 5) % 2 === 0) {   // flashing red alarm lights
    const g = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.8);
    g.addColorStop(0, 'rgba(255,30,50,0.55)');
    g.addColorStop(1, 'rgba(255,30,50,0.1)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  text(ctx, t.gameOver, W / 2, 140, 96, CONFIG.colors.warning);
  text(ctx, state.endReason, W / 2, 215, 32, CONFIG.colors.silver);
  text(ctx, `SCORE ${Math.floor(state.score)}`, W / 2, 290, 56);
  text(ctx, `BEST ${state.best}`, W / 2, 355, 36, CONFIG.colors.silver);
  if (state.isNewBest) text(ctx, t.newBest, W / 2, 410, 40, CONFIG.colors.accent);
  if (state.mode === 'race') {
    text(ctx, t.coinsEarned.replace('{coins}', state.endCoins), W / 2, 450, 26, CONFIG.things.coin.color);
  }
  text(ctx, t.playAgain, W / 2, 500, 36);
}
