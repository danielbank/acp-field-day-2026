// road.js — the shape of the space highway (bends + hills) and the fake-3D math that draws it.
// The road goes on forever: its bends and hills come from smooth wavy math, not a stored map.

import { CONFIG } from './config.js';
import { rainbowColor } from './twists.js';

const R = CONFIG.road;
const W = CONFIG.width;
const H = CONFIG.height;
export const SEG = R.segmentLength;
export const DEPTH = 1 / Math.tan((R.fieldOfView / 2) * Math.PI / 180); // camera "zoom"

// Where the camera sits for each view: height above the road, and distance behind the car.
// follow = how much the camera rises when the car jumps (1 = all the way).
const VIEWS = {
  hood: { height: 1400, back: 1700, follow: 1 },
  chase: { height: 1000, back: DEPTH * 1000, follow: 0.3 },
};

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// How much road chunk n bends (negative = left, positive = right).
export function curveAt(n) {
  return R.curviness * Math.sin(n * 0.004) * clamp(Math.sin(n * 0.011 + 2) * 2, -1, 1);
}

// How high road chunk n is.
export function hillAt(n) {
  return R.hilliness * (0.6 * Math.sin(n * 0.02) + 0.4 * Math.sin(n * 0.0067 + 1));
}

// Height of the road at any distance z (smoothly between chunks).
export function hillAtZ(z) {
  const n = Math.floor(z / SEG);
  return lerp(hillAt(n), hillAt(n + 1), z / SEG - n);
}

// Camera position for the car (it rises when the car jumps).
export function cameraFor(car) {
  const view = VIEWS[CONFIG.car.view] || VIEWS.hood;
  return { z: car.z - view.back, x: car.x * R.width, y: hillAtZ(car.z) + view.height + car.y * view.follow };
}

function project(cx, cy, cz) {
  const scale = DEPTH / cz;
  return { x: W / 2 + scale * cx * W / 2, y: H / 2 - scale * cy * H / 2, w: scale * R.width * W / 2, scale };
}

// A 4-cornered shape between two road widths (used for road, edges and lane lines).
function quad(ctx, x1, y1, w1, x2, y2, w2, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1 - w1, y1);
  ctx.lineTo(x2 - w2, y2);
  ctx.lineTo(x2 + w2, y2);
  ctx.lineTo(x1 + w1, y1);
  ctx.closePath();
  ctx.fill();
}

function drawSegment(ctx, n, a, b, seconds) {
  const alt = ((Math.floor(n / R.stripeEvery) % 2) + 2) % 2 === 1;
  quad(ctx, a.x, a.y, a.w * 1.1, b.x, b.y, b.w * 1.1, alt ? R.edgeColorAlt : R.edgeColor);
  quad(ctx, a.x, a.y, a.w, b.x, b.y, b.w, rainbowColor(n, seconds) || (alt ? R.colorAlt : R.color));
  if (!alt) return;
  for (let lane = 1; lane < R.lanes; lane++) {   // dashed lane lines
    const f = -1 + (2 * lane) / R.lanes;
    quad(ctx, a.x + a.w * f, a.y, a.w * 0.02, b.x + b.w * f, b.y, b.w * 0.02, R.laneColor);
  }
}

// Draws the road from near to far and returns a "view" used to place things on it.
export function drawRoad(ctx, cam, seconds) {
  const base = Math.floor(cam.z / SEG);
  let x = 0;
  let dx = -curveAt(base) * (cam.z / SEG - base);
  let maxy = H;   // everything below this line is hidden behind nearer road (hills!)
  const segs = [];
  for (let i = 0; i < R.drawDistance; i++) {
    const n = base + i;
    const z1 = n * SEG - cam.z;
    const p1 = project(x - cam.x, hillAt(n) - cam.y, Math.max(z1, 1));
    const p2 = project(x + dx - cam.x, hillAt(n + 1) - cam.y, z1 + SEG);
    x += dx;
    dx += curveAt(n);
    const fade = clamp((R.drawDistance - i) / (R.drawDistance * 0.35), 0, 1);
    segs.push({ p1, p2, clip: maxy, fade });
    if (z1 < 10 || p2.y >= p1.y || p2.y >= maxy) continue;
    let a = p1;
    if (a.y > maxy) {   // trim the part hidden behind a nearer hill
      const t = (a.y - maxy) / (a.y - p2.y);
      a = { x: lerp(a.x, p2.x, t), y: maxy, w: lerp(a.w, p2.w, t) };
    }
    ctx.globalAlpha = fade;
    drawSegment(ctx, n, a, p2, seconds);
    maxy = p2.y;
  }
  ctx.globalAlpha = 1;
  return { segs, base, cam };
}

// Screen position of a spot on the road: z = distance, x = -1 (left edge) … 1 (right edge), h = height.
// Returns null if it's behind the camera or too far away.
export function projectOnRoad(view, z, x, h = 0) {
  const n = Math.floor(z / SEG);
  const i = n - view.base;
  const dz = z - view.cam.z;
  if (i < 1 || i >= view.segs.length || dz < 50) return null;
  const seg = view.segs[i];
  const t = z / SEG - n;
  const scale = DEPTH / dz;
  const k = scale * W / 2;   // pixels per world unit at this distance
  return {
    x: lerp(seg.p1.x, seg.p2.x, t) + x * R.width * k,
    y: lerp(seg.p1.y, seg.p2.y, t) - h * scale * H / 2,
    k, clip: seg.clip, fade: seg.fade,
  };
}
