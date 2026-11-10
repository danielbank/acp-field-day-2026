// ui.js — small drawing helpers shared by every screen: outlined text, panels and bars.

import { CONFIG } from './config.js';

export function text(ctx, str, x, y, size, color = CONFIG.colors.text, align = 'center') {
  ctx.font = `bold ${size}px ${CONFIG.font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(3, size / 7);
  ctx.strokeStyle = 'rgba(10,4,20,0.85)';
  ctx.strokeText(str, x, y);
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

export function panel(ctx, x, y, w, h, border = CONFIG.colors.accent) {
  ctx.fillStyle = 'rgba(22,10,42,0.94)';
  ctx.strokeStyle = border;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.fill();
  ctx.stroke();
}

export function bar(ctx, x, y, w, h, fraction, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
  const f = Math.max(0, Math.min(1, fraction));
  if (f > 0) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, Math.max(h, w * f), h, h / 2);
    ctx.fill();
  }
}

export function dimScreen(ctx, alpha = 0.6) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
}
