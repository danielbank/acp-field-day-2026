// view.js — the 2.5D camera: a real 3D perspective camera that follows the knight.
// The world is 3D (x = left-right, y = back-to-front, z = height); characters are flat 2D drawings.

import { CONFIG } from './config.js';

const V = CONFIG.view;
const PITCH = (V.pitchDegrees * Math.PI) / 180;
const SIN = Math.sin(PITCH);
const COS = Math.cos(PITCH);
const F = V.focal;
const CX = CONFIG.width / 2;
const CY = CONFIG.height * V.centerY;
export const NEAR = 60;

// The spot on the floor the camera looks at (it glides after the knight).
export const camera = { x: CONFIG.arena.width / 2, y: CONFIG.arena.depth / 2, shakeX: 0, shakeY: 0 };

// Where the camera itself floats in the world.
export function camPos() {
  return { x: camera.x + camera.shakeX, y: camera.y + camera.shakeY + V.height / Math.tan(PITCH), z: V.height };
}

export function followCamera(target, dt, snap = false) {
  const A = CONFIG.arena;
  const tx = clamp(target.x, V.edgeMarginX, A.width - V.edgeMarginX);
  const ty = clamp(target.y, V.edgeMarginBack, A.depth - V.edgeMarginFront);
  const k = snap ? 1 : Math.min(1, V.followSpeed * dt);
  camera.x += (tx - camera.x) * k;
  camera.y += (ty - camera.y) * k;
}

function rel(x, y, z) {
  const c = camPos();
  const dx = x - c.x;
  const dy = y - c.y;
  const dz = z - c.z;
  return { dx, dy, dz, depth: -dy * COS - dz * SIN };
}

function toPixels(v) {
  const s = F / v.depth;
  return { x: CX + v.dx * s, y: CY - (-v.dy * SIN + v.dz * COS) * s, s, depth: v.depth };
}

// Screen position + size scale (s) of a 3D point. s <= 0 means "behind the camera".
export function toScreen(x, y, z = 0) {
  const v = rel(x, y, z);
  if (v.depth < NEAR) return { x: -9999, y: -9999, s: 0, depth: v.depth };
  return toPixels(v);
}

// Which floor spot is under this screen pixel? (used for mouse aiming)
export function toWorld(sx, sy) {
  const c = camPos();
  const a = (sx - CX) / F;
  const b = (CY - sy) / F;
  const dy = -COS - b * SIN;
  const dz = Math.min(-0.02, -SIN + b * COS);
  const t = -c.z / dz;
  return { x: c.x + a * t, y: c.y + dy * t };
}

// Projects a 3D polygon (cut off where it goes behind the camera). Returns screen points.
export function projectPoly(points) {
  const vs = points.map(([x, y, z]) => rel(x, y, z));
  const out = [];
  for (let i = 0; i < vs.length; i++) {
    const cur = vs[i];
    const prev = vs[(i + vs.length - 1) % vs.length];
    const curIn = cur.depth >= NEAR;
    if (curIn !== (prev.depth >= NEAR)) {
      const t = (NEAR - prev.depth) / (cur.depth - prev.depth);
      out.push(toPixels({ dx: prev.dx + (cur.dx - prev.dx) * t, dy: prev.dy + (cur.dy - prev.dy) * t,
        dz: prev.dz + (cur.dz - prev.dz) * t, depth: NEAR }));
    }
    if (curIn) out.push(toPixels(cur));
  }
  return out;
}

// Traces a 3D polygon as a canvas path (call fill/stroke after). Returns false if it's all behind us.
export function tracePoly(ctx, points) {
  const pts = projectPoly(points);
  ctx.beginPath();
  if (pts.length < 3) return false;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  return true;
}

// Traces a circle lying on the floor (or at height z), in true perspective.
export function floorEllipse(ctx, x, y, r, a0 = 0, a1 = Math.PI * 2, z = 0) {
  const n = 28;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r, z]);
  }
  return tracePoly(ctx, pts);
}

// A pie-slice on the floor (sword swing arcs).
export function floorWedge(ctx, x, y, r, a0, a1) {
  const pts = [[x, y, 0]];
  for (let i = 0; i <= 16; i++) {
    const a = a0 + ((a1 - a0) * i) / 16;
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r, 0]);
  }
  return tracePoly(ctx, pts);
}

// Soft shadow on the floor; it shrinks and fades as things fly higher.
export function drawShadow(ctx, x, y, r, z = 0) {
  const shrink = 1 - Math.min(z / 500, 0.6);
  ctx.fillStyle = `rgba(0,0,0,${0.38 * shrink})`;
  if (floorEllipse(ctx, x, y, r * shrink)) ctx.fill();
}

// The direction an arena angle points on screen, as seen from a spot (for drawing weapons).
export function screenAngleAt(x, y, a) {
  const p0 = toScreen(x, y, 30);
  const p1 = toScreen(x + Math.cos(a) * 40, y + Math.sin(a) * 40, 30);
  return Math.atan2(p1.y - p0.y, p1.x - p0.x);
}

// How far away a spot is, as 0 (near) … 1 (far, lost in the fog)
export function fogAt(depth) {
  return clamp((depth - V.fogStart) / (V.fogEnd - V.fogStart), 0, V.fogMax);
}

export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const rand = (min, max) => min + Math.random() * (max - min);
export const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Smallest difference between two angles (-PI..PI)
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function keepInArena(o, margin = o.r) {
  o.x = clamp(o.x, margin, CONFIG.arena.width - margin);
  o.y = clamp(o.y, margin, CONFIG.arena.depth - margin);
}
