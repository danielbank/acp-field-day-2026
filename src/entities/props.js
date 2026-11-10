// props.js — stone pillars, broken pillars and wooden crates. They're solid 3D blocks:
// nobody can walk through them and bolts/sparks/fire smash into them.

import { CONFIG } from '../config.js';
import { drawBox, line3d } from '../world3d.js';
import { state } from '../state.js';

export const PROPS = CONFIG.props.map((p) => ({ ...p, r: CONFIG.propSizes[p.type], h: CONFIG.propHeights[p.type] }));

// Push anything round (hero, mobs) out of every prop.
export function blockProps(o) {
  for (const p of PROPS) {
    const dx = o.x - p.x;
    const dy = o.y - p.y;
    const d = Math.hypot(dx, dy) || 0.01;
    const min = p.r * 1.25 + o.r;
    if (d < min) {
      o.x = p.x + (dx / d) * min;
      o.y = p.y + (dy / d) * min;
    }
  }
}

// Is this flying thing inside a prop (and low enough to hit it)?
export function hitsProp(x, y, z) {
  return PROPS.some((p) => z < p.h && Math.abs(x - p.x) < p.r && Math.abs(y - p.y) < p.r);
}

// A prop between the camera and you turns see-through, so it never hides your knight.
function blocksView(p) {
  const hero = state.hero;
  return hero && p.y > hero.y && p.y - hero.y < 500 && Math.abs(p.x - hero.x) < p.r + 90;
}

export function drawProp(ctx, p) {
  ctx.globalAlpha = blocksView(p) ? 0.4 : 1;
  drawPropShape(ctx, p);
  ctx.globalAlpha = 1;
}

function drawPropShape(ctx, p) {
  const { x, y, r, h } = p;
  if (p.type === 'crate') {
    drawBox(ctx, x - r, y - r, x + r, y + r, 0, h, '#a0703f', 'rgba(50,30,10,0.8)');
    ctx.strokeStyle = 'rgba(60,35,12,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    line3d(ctx, [x - r, y + r, 0], [x + r, y + r, h]);
    line3d(ctx, [x + r, y + r, 0], [x - r, y + r, h]);
    ctx.stroke();
    return;
  }
  const stone = '#8a829c';
  drawBox(ctx, x - r - 8, y - r - 8, x + r + 8, y + r + 8, 0, 18, stone);
  drawBox(ctx, x - r, y - r, x + r, y + r, 18, h - (p.type === 'pillar' ? 18 : 0), stone);
  if (p.type === 'pillar') drawBox(ctx, x - r - 10, y - r - 10, x + r + 10, y + r + 10, h - 18, h, stone);
}
