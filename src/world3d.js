// world3d.js — tools for drawing the 3D world: lit + foggy colors, 3D boxes, and lines in space.
// Every box face gets its own brightness, so things look solid (top = brightest, sides = darker).

import { CONFIG } from './config.js';
import { toScreen, tracePoly, projectPoly, fogAt, camPos, NEAR } from './view.js';

const rgbCache = new Map();
function rgb(hex) {
  if (!rgbCache.has(hex)) {
    const n = parseInt(hex.slice(1), 16);
    rgbCache.set(hex, [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
  }
  return rgbCache.get(hex);
}

// A color made lighter/darker (light 1 = normal) and faded into the fog (fog 0 = clear).
export function shade(hex, light = 1, fog = 0) {
  const [r, g, b] = rgb(hex);
  const [fr, fg, fb] = rgb(CONFIG.view.fogColor);
  const mix = (c, f) => Math.round(Math.min(255, c * light) * (1 - fog) + f * fog);
  return `rgb(${mix(r, fr)},${mix(g, fg)},${mix(b, fb)})`;
}

export function fogFor(x, y, z = 0) {
  return fogAt(toScreen(x, y, z).depth);
}

function face(ctx, points, fill, stroke) {
  if (!tracePoly(ctx, points)) return;
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

// A solid 3D box from (x0,y0,z0) to (x1,y1,z1). Only the faces the camera can see get drawn.
export function drawBox(ctx, x0, y0, x1, y1, z0, z1, color, outline = 'rgba(10,6,20,0.35)') {
  const fog = fogFor((x0 + x1) / 2, (y0 + y1) / 2, z0);
  const eye = camPos();
  if (eye.x < x0) face(ctx, [[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], shade(color, 0.7, fog), outline);
  if (eye.x > x1) face(ctx, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], shade(color, 0.7, fog), outline);
  if (eye.y < y0) face(ctx, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], shade(color, 0.55, fog), outline);
  if (eye.y > y1) face(ctx, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], shade(color, 0.85, fog), outline);
  if (eye.z > z1) face(ctx, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], shade(color, 1.1, fog), outline);
}

// A straight line in 3D space (cut off where it goes behind the camera).
export function line3d(ctx, a, b) {
  const pa = toScreen(...a);
  const pb = toScreen(...b);
  if (pa.depth < NEAR && pb.depth < NEAR) return;
  if (pa.depth >= NEAR && pb.depth >= NEAR) {
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    return;
  }
  const pts = projectPoly([a, b, b]);   // clipped
  if (pts.length >= 2) { ctx.moveTo(pts[0].x, pts[0].y); ctx.lineTo(pts[1].x, pts[1].y); }
}
