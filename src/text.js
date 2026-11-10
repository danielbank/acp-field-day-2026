// text.js — one helper for drawing bold, centered on-screen text.
// Used by render.js and the stages.

import { CONFIG } from './config.js';

export function text(ctx, str, x, y, size, color = CONFIG.colors.text, align = 'center') {
  ctx.font = `bold ${size}px ${CONFIG.font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}
