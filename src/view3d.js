// view3d.js — turns the flat top-down game world into a first-person 3D view (old-school arcade "pseudo-3D").
// Game y = distance ahead of the car, game x = left/right. Things get bigger as they get closer.

import { CONFIG } from './config.js';
import { state } from './state.js';
import { ROAD_LEFT, ROAD_RIGHT } from './track.js';

const V = CONFIG.view;
const W = CONFIG.width;
const H = CONFIG.height;
export const HORIZON = V.horizon;
const farZ = V.camBack + V.depthScale * (H + 60);

export const depthOf = (y) => V.camBack + V.depthScale * (state.hero.y - y);

// Height above the road for flying things: tots, shots, targets and the boss all live on this "sky ramp",
// so a tot flying away rises up to meet what it's aimed at.
export const airAlt = (y) => 100 + (state.hero.y - y) * 0.9;

// Where does world point (x, y) at height alt land on the screen? null = behind the camera.
export function project(x, y, alt) {
  const z = depthOf(y);
  if (z < V.nearZ) return null;
  const s = V.focal / z;
  return { x: W / 2 + (x - state.hero.x) * s, y: HORIZON + (V.camHeight - alt) * s,
           groundY: HORIZON + V.camHeight * s, s, z };
}

// Draw any 2D entity as a billboard in 3D, with a soft shadow on the ground, fading in from the dust.
export function drawSprite(ctx, obj, alt, mul, draw) {
  const p = project(obj.x, obj.y, alt);
  if (!p) return;
  const fade = Math.max(0, Math.min(1, (farZ - p.z) / V.farFade));
  if (fade <= 0) return;
  const k = p.s * mul;
  ctx.save();
  ctx.globalAlpha = 0.3 * fade;
  ctx.fillStyle = '#1a0c05';
  ctx.beginPath();
  ctx.ellipse(p.x, p.groundY, (obj.r || 20) * k, (obj.r || 20) * k * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = fade;
  ctx.translate(p.x, p.y);
  ctx.scale(k, k);
  ctx.translate(-obj.x, -obj.y);
  draw(ctx, obj);
  ctx.restore();
}

// The ground: sand, the road, the striped boundary lines and the center dashes, drawn row by row.
export function drawGround(ctx, seconds) {
  const R = CONFIG.road;
  const scroll = seconds * CONFIG.roadScrollSpeed * V.depthScale;
  const heroX = state.hero.x;
  for (let sy = HORIZON; sy < H; sy += 2) {
    const s = (sy + 1 - HORIZON) / V.camHeight;
    const z = V.focal / s;
    const band = Math.floor((z + scroll) / 70) % 2 === 0;
    ctx.fillStyle = band ? R.sandColorA : R.sandColorB;
    ctx.fillRect(0, sy, W, 2);
    if (!CONFIG.showRoad) continue;
    const lx = W / 2 + (ROAD_LEFT - heroX) * s;
    const rx = W / 2 + (ROAD_RIGHT - heroX) * s;
    const rumble = R.rumbleWidth * s;
    ctx.fillStyle = CONFIG.roadColor;
    ctx.fillRect(lx, sy, rx - lx, 2);
    ctx.fillStyle = band ? R.rumbleColorA : R.rumbleColorB;
    ctx.fillRect(lx - rumble, sy, rumble, 2);
    ctx.fillRect(rx, sy, rumble, 2);
    if (band) {
      ctx.fillStyle = CONFIG.roadLineColor;
      const cx = W / 2 + (W / 2 - heroX) * s;
      ctx.fillRect(cx - 4 * s, sy, 8 * s, 2);
    }
  }
  // dusty haze where the ground meets the sky
  const haze = ctx.createLinearGradient(0, HORIZON - 30, 0, HORIZON + 70);
  haze.addColorStop(0, 'rgba(154,74,28,0)');
  haze.addColorStop(0.35, 'rgba(190,110,60,0.75)');
  haze.addColorStop(1, 'rgba(154,74,28,0)');
  ctx.fillStyle = haze;
  ctx.fillRect(0, HORIZON - 30, W, 100);
}
