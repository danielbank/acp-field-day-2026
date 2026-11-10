// shading.js — little color helpers that make flat shapes look 3D (lighter tops, darker bottoms, shiny balls).
// shade('#ff0000', 0.3) = a bit lighter red, shade('#ff0000', -0.3) = a bit darker red.

export function shade(hex, amount) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  const target = amount < 0 ? 0 : 255;
  const mix = (c) => Math.round(c + (target - c) * Math.abs(amount));
  return `rgb(${mix((n >> 16) & 255)},${mix((n >> 8) & 255)},${mix(n & 255)})`;
}

// Light at the top, dark at the bottom — for car bodies, crates, the hood…
export function topLit(ctx, color, top, bottom) {
  const g = ctx.createLinearGradient(0, top, 0, bottom);
  g.addColorStop(0, shade(color, 0.35));
  g.addColorStop(0.5, color);
  g.addColorStop(1, shade(color, -0.45));
  return g;
}

// A shiny ball lit from the top-left — for rocks, blobs, planets, coins.
export function ballLit(ctx, color, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, Math.max(r, 1));
  g.addColorStop(0, shade(color, 0.45));
  g.addColorStop(0.6, color);
  g.addColorStop(1, shade(color, -0.55));
  return g;
}
