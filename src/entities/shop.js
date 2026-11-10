// shop.js — the shop building that stands in the arena. Walk into its door between waves to go shopping.
// (The shopping menu itself lives in shopMenu.js.)

import { CONFIG } from '../config.js';
import { toScreen, dist } from '../view.js';
import { text } from '../ui.js';

const S = CONFIG.shop;
const WALL_HEIGHT = 70;

export const shopDoor = { x: S.x + S.w / 2, y: S.y + S.h + 14 };
export const shopDepth = S.y + S.h;   // for depth sorting

export function heroAtDoor(hero) {
  return dist(hero, shopDoor) < S.doorRadius;
}

// Nobody can walk through the building.
export function blockShop(o) {
  const left = S.x - o.r;
  const right = S.x + S.w + o.r;
  const bottom = S.y + S.h + o.r * 0.5;
  if (o.x <= left || o.x >= right || o.y >= bottom) return;
  const pushes = [[o.x - left, () => { o.x = left; }], [right - o.x, () => { o.x = right; }],
    [bottom - o.y, () => { o.y = bottom; }]];
  pushes.sort((a, b) => a[0] - b[0])[0][1]();
}

export function drawShopBuilding(ctx, isOpen, t) {
  const fl = toScreen(S.x, S.y + S.h);          // front-left corner on the floor
  const w = S.w;
  const depthPx = S.h * CONFIG.arena.tilt;
  const top = fl.y - WALL_HEIGHT;
  // top of the walls (seen from above) and front wall
  ctx.fillStyle = '#e9c46a';
  ctx.fillRect(fl.x, top - depthPx, w, depthPx);
  ctx.fillStyle = '#ffe8b0';
  ctx.strokeStyle = '#6d4c41';
  ctx.lineWidth = 3;
  ctx.fillRect(fl.x, top, w, WALL_HEIGHT);
  ctx.strokeRect(fl.x, top, w, WALL_HEIGHT);
  // striped awning roof
  const roofTop = top - depthPx - 26;
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = i % 2 ? '#ffffff' : '#e63946';
    ctx.beginPath();
    ctx.moveTo(fl.x - 10 + (i * (w + 20)) / 7, top + 6);
    ctx.lineTo(fl.x - 10 + ((i + 1) * (w + 20)) / 7, top + 6);
    ctx.lineTo(fl.x + ((i + 1) * w) / 7, roofTop);
    ctx.lineTo(fl.x + (i * w) / 7, roofTop);
    ctx.fill();
  }
  // door
  const dx = fl.x + w / 2 - 18;
  ctx.fillStyle = isOpen ? '#fff3b0' : '#7f5539';
  ctx.beginPath();
  ctx.roundRect(dx, fl.y - 48, 36, 48, [14, 14, 0, 0]);
  ctx.fill();
  ctx.stroke();
  if (isOpen) {
    ctx.fillStyle = `rgba(255,243,176,${0.25 + Math.sin(t * 5) * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(fl.x + w / 2, fl.y + 8, 40, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // window with a coin in it
  ctx.fillStyle = '#90e0ef';
  ctx.fillRect(fl.x + 12, top + 16, 28, 22);
  ctx.strokeRect(fl.x + 12, top + 16, 28, 22);
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(fl.x + 26, top + 27, 7, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'SHOP', fl.x + w / 2, roofTop - 14, 22, CONFIG.colors.gold);
  text(ctx, isOpen ? 'OPEN' : 'CLOSED', fl.x + w - 30, top + 26, 12, isOpen ? CONFIG.colors.good : CONFIG.colors.bad);
}
