// shopScreen.js — draws the Car Shop screen: your coins, the upgrades for sale, and your car in its paint job.
// What the items do and cost lives in CONFIG.shop; buying happens in shop.js.

import { CONFIG } from './config.js';
import { text, dimScreen } from './render.js';
import { drawCarShape } from './entities/car.js';
import { garage, shopMenu, levelOf, paintColor } from './shop.js';

const W = CONFIG.width;

export function drawShop(ctx) {
  const c = CONFIG.colors;
  const t = CONFIG.text;
  dimScreen(ctx, 0.75);
  text(ctx, t.shopTitle, W / 2, 60, 64, c.accent);
  text(ctx, `COINS: ${garage.coins}`, W / 2, 118, 30, CONFIG.things.coin.color);

  CONFIG.shop.items.forEach((item, i) => {
    const y = 180 + i * 64;
    const selected = i === shopMenu.selected;
    const level = levelOf(item.id);
    const maxed = level >= item.prices.length;
    const price = maxed ? 'MAX' : `${item.prices[level]} coins`;
    const affordable = !maxed && garage.coins >= item.prices[level];
    ctx.fillStyle = selected ? 'rgba(199,125,255,0.35)' : 'rgba(255,255,255,0.06)';
    ctx.fillRect(60, y - 26, 560, 54);
    if (selected) {
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 3;
      ctx.strokeRect(60, y - 26, 560, 54);
    }
    text(ctx, item.name, 80, y - 7, 24, c.text, 'left');
    text(ctx, item.about, 80, y + 15, 15, c.silver, 'left');
    for (let l = 0; l < item.prices.length; l++) {   // one dot per upgrade level you own
      ctx.fillStyle = l < level ? c.good : 'rgba(255,255,255,0.2)';
      ctx.fillRect(330 + l * 18, y - 6, 12, 12);
    }
    text(ctx, price, 600, y, 22, maxed ? c.silver : affordable ? c.good : c.warning, 'right');
  });

  drawCarShape(ctx, 790, 380, 220, 120, paintColor(), CONFIG.car.stripeColor);
  text(ctx, 'YOUR RIDE', 790, 230, 24, c.silver);
  if (shopMenu.message) text(ctx, shopMenu.message, W / 2, 520, 28, shopMenu.good ? c.good : c.warning);
  text(ctx, t.shopHelp, W / 2, 590, 22, c.silver);
}
