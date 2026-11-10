// arena3d.js — the 3D castle courtyard: grass outside, stone-tile floor, castle walls with
// battlements and torches. (Moving stuff is drawn in render.js.)

import { CONFIG } from './config.js';
import { toScreen, tracePoly, floorEllipse, camPos, NEAR } from './view.js';
import { shade, fogFor, drawBox, line3d } from './world3d.js';

const A = CONFIG.arena;
const V = CONFIG.view;
const WALL = 60;              // wall thickness
const TORCH_EVERY = 400;

// Each tile gets its own slightly different stone color (picked once, so it doesn't flicker).
const tiles = [];
for (let y = 0; y < A.depth; y += A.tileSize) {
  for (let x = 0; x < A.width; x += A.tileSize) {
    const mossy = Math.random() < A.mossyTiles;
    tiles.push({ x, y, base: mossy ? A.mossColor : A.floorColor, light: 0.88 + Math.random() * 0.24,
      crack: Math.random() < 0.15 ? Math.random() : -1 });
  }
}

export function drawSky(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, CONFIG.height);
  g.addColorStop(0, V.fogColor);
  g.addColorStop(1, shade(A.outsideColor, 0.9));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
}

function drawFloor(ctx) {
  const n = A.tileSize;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = A.groutColor;
  for (const tile of tiles) {
    const c = toScreen(tile.x + n / 2, tile.y + n / 2);
    if (c.depth < NEAR - n * 1.5 || c.depth > V.fogEnd + 800) continue;
    if (c.s > 0 && (c.x < -n * c.s * 1.5 || c.x > CONFIG.width + n * c.s * 1.5 || c.y < -n || c.y > CONFIG.height + n)) continue;
    if (!tracePoly(ctx, [[tile.x, tile.y, 0], [tile.x + n, tile.y, 0], [tile.x + n, tile.y + n, 0], [tile.x, tile.y + n, 0]])) continue;
    ctx.fillStyle = shade(tile.base, tile.light, fogFor(tile.x + n / 2, tile.y + n / 2));
    ctx.fill();
    ctx.stroke();
    if (tile.crack >= 0) {
      ctx.beginPath();
      line3d(ctx, [tile.x + n * 0.2, tile.y + n * tile.crack, 0], [tile.x + n * 0.55, tile.y + n * 0.5, 0]);
      line3d(ctx, [tile.x + n * 0.55, tile.y + n * 0.5, 0], [tile.x + n * 0.8, tile.y + n * (1 - tile.crack), 0]);
      ctx.stroke();
    }
  }
}

function drawOutsideGrass(ctx) {
  if (!tracePoly(ctx, [[-5000, -5000, -1], [A.width + 5000, -5000, -1], [A.width + 5000, A.depth + 4000, -1], [-5000, A.depth + 4000, -1]])) return;
  ctx.fillStyle = shade(A.outsideColor, 1, 0.35);
  ctx.fill();
}

// Mortar lines on a wall face so it looks like stacked stone blocks.
function wallBricks(ctx, along, fixed, from, to, isBackWall) {
  ctx.strokeStyle = 'rgba(20,14,34,0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  const course = 30;
  for (let z = course; z < A.wallHeight; z += course) {
    const p = (a) => (isBackWall ? [a, fixed, z] : [fixed, a, z]);
    line3d(ctx, p(from), p(to));
  }
  for (let z = 0, row = 0; z < A.wallHeight; z += course, row++) {
    for (let a = from + (row % 2 ? 40 : 0); a < to; a += 80) {
      const p = (zz) => (isBackWall ? [a, fixed, zz] : [fixed, a, zz]);
      line3d(ctx, p(z), p(Math.min(A.wallHeight, z + course)));
    }
  }
  ctx.stroke();
}

function drawWalls(ctx, t) {
  const H = A.wallHeight;
  const eye = camPos();
  // back wall + battlements
  drawBox(ctx, -WALL, -WALL, A.width + WALL, 0, 0, H, A.wallColor);
  wallBricks(ctx, 'x', 0, -WALL, A.width + WALL, true);
  for (let x = -WALL; x < A.width + WALL; x += 120) drawBox(ctx, x, -WALL, x + 60, 0, H, H + 30, A.wallColor);
  // side walls (draw the far parts first)
  for (const [x0, x1, inner] of [[-WALL, 0, 0], [A.width, A.width + WALL, A.width]]) {
    for (let y = 0; y < A.depth; y += 300) drawBox(ctx, x0, y, x1, Math.min(A.depth, y + 300), 0, H, A.wallColor, null);
    if ((inner === 0 && eye.x > 0) || (inner === A.width && eye.x < A.width)) wallBricks(ctx, 'y', inner, 0, A.depth, false);
    for (let y = 0; y < A.depth; y += 120) drawBox(ctx, x0, y, x1, y + 60, H, H + 30, A.wallColor);
  }
  for (let x = TORCH_EVERY / 2; x < A.width; x += TORCH_EVERY) drawTorch(ctx, x, t);
}

// A torch on the back wall: a little bracket, a flickering flame, and warm light on the floor.
function drawTorch(ctx, x, t) {
  const flick = Math.sin(t * 13 + x) * 0.15 + Math.sin(t * 7.3 + x * 2) * 0.1;
  const glow = toScreen(x, 60, 0);
  if (glow.depth > NEAR && floorEllipse(ctx, x, 60, 170)) {
    const g = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, 170 * glow.s);
    g.addColorStop(0, `rgba(255,150,50,${0.22 + flick * 0.06})`);
    g.addColorStop(1, 'rgba(255,150,50,0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }
  const p = toScreen(x, 8, 85);
  if (p.depth < NEAR) return;
  ctx.fillStyle = '#3b2a1a';
  ctx.fillRect(p.x - 3 * p.s, p.y, 6 * p.s, 22 * p.s);
  const h = (24 + flick * 10) * p.s;
  ctx.fillStyle = 'rgba(255,170,40,0.35)';
  ctx.beginPath();
  ctx.arc(p.x, p.y - h * 0.4, h * 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff8c1a';
  ctx.beginPath();
  ctx.moveTo(p.x - 7 * p.s, p.y);
  ctx.quadraticCurveTo(p.x, p.y - h * 1.6, p.x + 7 * p.s, p.y);
  ctx.fill();
  ctx.fillStyle = '#ffe066';
  ctx.beginPath();
  ctx.moveTo(p.x - 3.5 * p.s, p.y);
  ctx.quadraticCurveTo(p.x, p.y - h, p.x + 3.5 * p.s, p.y);
  ctx.fill();
}

// Everything that never moves and sits "behind" the action.
export function drawArena(ctx, t) {
  drawSky(ctx);
  drawOutsideGrass(ctx);
  drawFloor(ctx);
  drawWalls(ctx, t);
}

// The low front wall is drawn last, over the action (so it never hides anybody behind it).
export function drawFrontWall(ctx) {
  drawBox(ctx, -WALL, A.depth, A.width + WALL, A.depth + WALL, 0, 36, A.wallColor);
}
