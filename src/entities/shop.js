// shop.js — the 3D shop building in the courtyard. Walk into its door between waves to go shopping.
// (The shopping menu itself lives in shopMenu.js.)

import { CONFIG } from '../config.js';
import { toScreen, tracePoly, floorEllipse, camPos, dist } from '../view.js';
import { drawBox, shade, fogFor } from '../world3d.js';
import { text } from '../ui.js';

const S = CONFIG.shop;
const WALL_H = 90;
const ROOF_H = 70;
const EAVE = 16;

export const shopDoor = { x: S.x + S.w / 2, y: S.y + S.h + 16 };
export const shopDepth = S.y + S.h;   // for depth sorting

export function heroAtDoor(hero) {
  return dist(hero, shopDoor) < S.doorRadius;
}

// Nobody can walk through the building.
export function blockShop(o) {
  const left = S.x - o.r;
  const right = S.x + S.w + o.r;
  const back = S.y - o.r;
  const front = S.y + S.h + o.r * 0.5;
  if (o.x <= left || o.x >= right || o.y <= back || o.y >= front) return;
  const pushes = [[o.x - left, () => { o.x = left; }], [right - o.x, () => { o.x = right; }],
    [o.y - back, () => { o.y = back; }], [front - o.y, () => { o.y = front; }]];
  pushes.sort((a, b) => a[0] - b[0])[0][1]();
}

function quad(ctx, pts, fill) {
  if (!tracePoly(ctx, pts)) return;
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,20,10,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

export function drawShopBuilding(ctx, isOpen, t) {
  const { x, y, w, h } = S;
  const fog = fogFor(x + w / 2, y + h);
  const front = y + h;
  if (isOpen) {                                   // warm light spilling out of the door
    ctx.fillStyle = `rgba(255,220,120,${0.25 + Math.sin(t * 5) * 0.08})`;
    if (floorEllipse(ctx, shopDoor.x, front + 30, 60)) ctx.fill();
  }
  drawBox(ctx, x, y, x + w, y + h, 0, WALL_H, '#efe0b9');
  // door + window on the front wall
  const dx = x + w / 2;
  quad(ctx, [[dx - 24, front + 0.5, 0], [dx + 24, front + 0.5, 0], [dx + 24, front + 0.5, 64], [dx - 24, front + 0.5, 64]],
    isOpen ? shade('#fff3b0', 1, fog) : shade('#7f5539', 1, fog));
  for (const wx of [x + 22, x + w - 62]) {
    quad(ctx, [[wx, front + 0.5, 34], [wx + 40, front + 0.5, 34], [wx + 40, front + 0.5, 70], [wx, front + 0.5, 70]], shade('#90e0ef', 1, fog));
  }
  drawRoof(ctx, fog);
  const sign = toScreen(dx, front + EAVE, WALL_H + ROOF_H * 0.55);
  if (sign.s > 0) {
    text(ctx, 'SHOP', sign.x, sign.y, Math.max(12, 30 * sign.s), CONFIG.colors.gold);
    const tag = toScreen(dx, front, 80);
    text(ctx, isOpen ? 'OPEN' : 'CLOSED', tag.x, tag.y, Math.max(9, 14 * tag.s), isOpen ? CONFIG.colors.good : CONFIG.colors.bad);
  }
}

// A striped red-and-white roof (a triangle prism), with the gable end showing on the side.
function drawRoof(ctx, fog) {
  const { x, y, w, h } = S;
  const x0 = x - EAVE;
  const x1 = x + w + EAVE;
  const mid = y + h / 2;
  const top = WALL_H + ROOF_H;
  const eye = camPos();
  const gable = eye.x < x ? x0 : eye.x > x + w ? x1 : null;
  if (gable !== null) quad(ctx, [[gable, y - EAVE, WALL_H], [gable, y + h + EAVE, WALL_H], [gable, mid, top]], shade('#efe0b9', 0.75, fog));
  const stripes = 8;
  for (let i = 0; i < stripes; i++) {
    const a = x0 + ((x1 - x0) * i) / stripes;
    const b = x0 + ((x1 - x0) * (i + 1)) / stripes;
    const color = i % 2 ? '#ffffff' : '#e63946';
    quad(ctx, [[a, y + h + EAVE, WALL_H], [b, y + h + EAVE, WALL_H], [b, mid, top], [a, mid, top]], shade(color, 0.95, fog));
  }
}
