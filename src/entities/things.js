// things.js — stuff on the road: rocks, space holes, crates, cones, barrels, traffic, coins, ramps, powerups, slime, gates.
// Each kind has a draw function in LOOKS. Sizes, colors and points live in CONFIG.things.

import { CONFIG } from '../config.js';
import { projectOnRoad } from '../road.js';
import { drawCarShape } from './car.js';
import { shade, topLit, ballLit } from '../shading.js';

const T = CONFIG.things;

export function makeThing(kind, z, x, extra = {}) {
  return { kind, z, x, h: 0, ...extra };
}

// How wide and tall each kind is (world units), for bumping into things.
export function thingSize(o) {
  switch (o.kind) {
    case 'rock': return { w: T.rock.size, tall: T.rock.height };
    case 'crate': return { w: T.crate.size, tall: T.crate.size };
    case 'cone': return { w: T.cone.size, tall: T.cone.size * 1.3 };
    case 'barrel': return { w: T.barrel.size, tall: T.barrel.size * 1.25 };
    case 'traffic': return { w: T.traffic.size, tall: T.traffic.size * 0.6 };
    case 'coin': return { w: T.coin.size, tall: T.coin.size };
    case 'powerup': return { w: CONFIG.powerups.size, tall: CONFIG.powerups.size };
    case 'slime': return { w: T.slime.size, tall: 80 };
    case 'ramp': return { w: T.ramp.size, tall: 300 };
    default: return { w: 0, tall: 0 };
  }
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(r, 0.5), 0, Math.PI * 2);
  ctx.fill();
}

function friendlyEyes(ctx, x, y, r) {   // two little eyes (r = size of the face)
  circle(ctx, x - r * 0.35, y, r * 0.16, '#ffffff');
  circle(ctx, x + r * 0.35, y, r * 0.16, '#ffffff');
  circle(ctx, x - r * 0.33, y + r * 0.03, r * 0.08, '#1a1026');
  circle(ctx, x + r * 0.37, y + r * 0.03, r * 0.08, '#1a1026');
}

function drawRock(ctx, p, o) {
  const r = (T.rock.size / 2) * p.k;
  const ry = T.rock.height * p.k * 0.55;
  ctx.fillStyle = ballLit(ctx, T.rock.color, p.x, p.y - ry, r);
  ctx.strokeStyle = T.rock.outlineColor;
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - ry, r, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  circle(ctx, p.x - r * 0.5, p.y - ry * 1.4, r * 0.12, 'rgba(0,0,0,0.2)');   // craters
  circle(ctx, p.x + r * 0.55, p.y - ry * 0.6, r * 0.09, 'rgba(0,0,0,0.2)');
  friendlyEyes(ctx, p.x, p.y - ry * 1.05, r * 0.6);
}

function drawHole(ctx, p, o, seconds, view) {
  const far = projectOnRoad(view, o.z + T.hole.length, 0);
  if (!far) return;
  const near = projectOnRoad(view, o.z, 0);
  const wn = CONFIG.road.width * near.k * 1.12;
  const wf = CONFIG.road.width * far.k * 1.12;
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = T.hole.glowColor;
  ctx.lineWidth = Math.max(1, 60 * near.k);
  ctx.beginPath();
  ctx.moveTo(near.x - wn, near.y);
  ctx.lineTo(far.x - wf, far.y);
  ctx.lineTo(far.x + wf, far.y);
  ctx.lineTo(near.x + wn, near.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';                                   // stars down in the hole
  for (let i = 0; i < 6; i++) {
    const t = (i * 0.37 + seconds * 0.2) % 1;
    const sx = near.x + (((i * 0.61) % 1) * 2 - 1) * wn * 0.8;
    ctx.fillRect(sx, near.y + (far.y - near.y) * t, 2, 2);
  }
}

function drawCrate(ctx, p) {
  const s = T.crate.size * p.k;
  ctx.fillStyle = topLit(ctx, T.crate.color, p.y - s, p.y);
  ctx.fillRect(p.x - s / 2, p.y - s, s, s);
  ctx.strokeStyle = '#6b4219';
  ctx.lineWidth = Math.max(1, s * 0.07);
  ctx.strokeRect(p.x - s / 2, p.y - s, s, s);
  ctx.beginPath();
  ctx.moveTo(p.x - s / 2, p.y - s);
  ctx.lineTo(p.x + s / 2, p.y);
  ctx.moveTo(p.x + s / 2, p.y - s);
  ctx.lineTo(p.x - s / 2, p.y);
  ctx.stroke();
}

function drawCone(ctx, p) {
  const s = T.cone.size * p.k;
  const coneShade = ctx.createLinearGradient(p.x - s * 0.4, 0, p.x + s * 0.4, 0);
  coneShade.addColorStop(0, shade(T.cone.color, 0.3));
  coneShade.addColorStop(1, shade(T.cone.color, -0.4));
  ctx.fillStyle = coneShade;
  ctx.beginPath();
  ctx.moveTo(p.x - s * 0.4, p.y - s * 0.12);
  ctx.lineTo(p.x, p.y - s * 1.3);
  ctx.lineTo(p.x + s * 0.4, p.y - s * 0.12);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(p.x - s * 0.22, p.y - s * 0.65, s * 0.44, s * 0.14);
  ctx.fillStyle = T.cone.color;
  ctx.fillRect(p.x - s / 2, p.y - s * 0.14, s, s * 0.14);
}

function drawBarrel(ctx, p) {
  const s = T.barrel.size * p.k;
  const h = s * 1.25;
  const round = ctx.createLinearGradient(p.x - s / 2, 0, p.x + s / 2, 0);
  round.addColorStop(0, shade(T.barrel.color, -0.4));
  round.addColorStop(0.35, shade(T.barrel.color, 0.35));
  round.addColorStop(1, shade(T.barrel.color, -0.55));
  ctx.fillStyle = round;
  ctx.fillRect(p.x - s / 2, p.y - h, s, h);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(p.x - s / 2, p.y - h * 0.75, s, h * 0.08);
  ctx.fillRect(p.x - s / 2, p.y - h * 0.3, s, h * 0.08);
  circle(ctx, p.x, p.y - h * 0.52, s * 0.15, '#f2ecff');
}

function drawTraffic(ctx, p, o) {
  const w = T.traffic.size * p.k;
  ctx.save();
  if (o.flying) {
    ctx.translate(p.x, p.y - w * 0.3);
    ctx.rotate(o.flying.angle);
    ctx.translate(-p.x, -(p.y - w * 0.3));
  }
  drawCarShape(ctx, p.x, p.y, w, w * 0.6, o.color, '#f2ecff');
  ctx.restore();
}

function drawCoin(ctx, p, o, seconds) {
  const r = (T.coin.size / 2) * p.k;
  const squish = Math.abs(Math.cos(seconds * 4 + o.z * 0.001));
  ctx.fillStyle = ballLit(ctx, T.coin.color, p.x, p.y - r, r);
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = Math.max(1, r * 0.15);
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - r, Math.max(r * squish, 1), r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawStar(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.fill();
}

const POWER_ICONS = {
  star: (ctx, x, y, r) => drawStar(ctx, x, y, r),
  turbo: (ctx, x, y, r) => {               // lightning bolt
    ctx.beginPath();
    ctx.moveTo(x + r * 0.2, y - r);
    ctx.lineTo(x - r * 0.5, y + r * 0.1);
    ctx.lineTo(x, y + r * 0.1);
    ctx.lineTo(x - r * 0.2, y + r);
    ctx.lineTo(x + r * 0.5, y - r * 0.1);
    ctx.lineTo(x, y - r * 0.1);
    ctx.fill();
  },
  spring: (ctx, x, y, r) => {              // zig-zag spring
    ctx.lineWidth = Math.max(1, r * 0.22);
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) ctx.lineTo(x + (i % 2 ? r * 0.6 : -r * 0.6), y + r - (i * 2 * r) / 6);
    ctx.stroke();
  },
  magnet: (ctx, x, y, r) => {              // U-shaped magnet
    ctx.lineWidth = Math.max(1, r * 0.4);
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, Math.PI);
    ctx.moveTo(x - r * 0.6, y);
    ctx.lineTo(x - r * 0.6, y - r * 0.8);
    ctx.moveTo(x + r * 0.6, y);
    ctx.lineTo(x + r * 0.6, y - r * 0.8);
    ctx.stroke();
  },
};

function drawPowerup(ctx, p, o, seconds) {
  const s = CONFIG.powerups.size * p.k;
  const bob = Math.sin(seconds * 4 + o.z) * s * 0.1;
  const y = p.y - s * 0.6 + bob;
  const color = CONFIG.powerups[o.power].color;
  ctx.globalAlpha *= 0.35;
  circle(ctx, p.x, y, s * 0.75, color);                  // glow
  ctx.globalAlpha /= 0.35;
  ctx.fillStyle = '#1a1026';
  ctx.fillRect(p.x - s / 2, y - s / 2, s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, s * 0.08);
  ctx.strokeRect(p.x - s / 2, y - s / 2, s, s);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  POWER_ICONS[o.power](ctx, p.x, y, s * 0.32);
}

function drawRamp(ctx, p, o, seconds, view) {
  const half = T.ramp.size / 2 / CONFIG.road.width;
  const nl = projectOnRoad(view, o.z, o.x - half);
  const nr = projectOnRoad(view, o.z, o.x + half);
  const fl = projectOnRoad(view, o.z + T.ramp.length, o.x - half, 300);
  const fr = projectOnRoad(view, o.z + T.ramp.length, o.x + half, 300);
  if (!nl || !fl) return;
  ctx.fillStyle = T.ramp.color;
  ctx.beginPath();
  ctx.moveTo(nl.x, nl.y);
  ctx.lineTo(fl.x, fl.y);
  ctx.lineTo(fr.x, fr.y);
  ctx.lineTo(nr.x, nr.y);
  ctx.fill();
  ctx.fillStyle = '#1a1026';                              // arrow pointing up the ramp
  const mx = (nl.x + nr.x) / 2;
  const w = (nr.x - nl.x) * 0.2;
  ctx.beginPath();
  ctx.moveTo(mx - w, nl.y - (nl.y - fl.y) * 0.25);
  ctx.lineTo((fl.x + fr.x) / 2, fl.y + (nl.y - fl.y) * 0.2);
  ctx.lineTo(mx + w, nl.y - (nl.y - fl.y) * 0.25);
  ctx.fill();
}

function drawSlime(ctx, p, o) {
  const s = T.slime.size * p.k;
  ctx.fillStyle = T.slime.color;
  if (o.h > 0) {                                           // still falling: a gooey drop
    circle(ctx, p.x, p.y - s * 0.2, s * 0.2, T.slime.color);
    return;
  }
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, s / 2, Math.max(s * 0.08, 1), 0, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, p.x - s * 0.2, p.y - s * 0.03, s * 0.05, 'rgba(255,255,255,0.6)');
}

function drawGate(ctx, p, o, seconds, view) {
  const left = projectOnRoad(view, o.z, -1.15);
  const right = projectOnRoad(view, o.z, 1.15);
  if (!left || !right) return;
  const top = T.gate.height * left.k;
  const pillar = Math.max(2, 140 * left.k);
  const flash = Math.floor(seconds * 6) % 2 === 0;
  ctx.fillStyle = flash ? T.gate.color : T.gate.colorAlt;
  ctx.fillRect(left.x - pillar / 2, left.y - top, pillar, top);
  ctx.fillRect(right.x - pillar / 2, right.y - top, pillar, top);
  ctx.fillRect(left.x - pillar / 2, left.y - top - pillar * 2, right.x - left.x + pillar, pillar * 2.5);
  ctx.fillStyle = '#1a1026';
  ctx.font = `bold ${Math.max(6, pillar * 1.6)}px ${CONFIG.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CHECKPOINT', (left.x + right.x) / 2, left.y - top - pillar * 0.75);
}

function drawBlob(ctx, p, o, seconds) {
  const r = (CONFIG.aliens.size / 2) * p.k;
  const wob = Math.sin(seconds * 6 + o.phase) * 0.08;
  ctx.fillStyle = ballLit(ctx, o.color, p.x, p.y - r, r);
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - r, r * (1 + wob), r * (1 - wob), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = o.color;                                // antenna
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - r * 1.9);
  ctx.lineTo(p.x, p.y - r * 2.4);
  ctx.stroke();
  circle(ctx, p.x, p.y - r * 2.45, r * 0.14, '#ffffff');
  friendlyEyes(ctx, p.x, p.y - r * 1.1, r);
  ctx.strokeStyle = '#1a1026';                              // smile
  ctx.beginPath();
  ctx.arc(p.x, p.y - r * 0.85, r * 0.3, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function drawShot(ctx, p) {   // one glob of goo from the gatling
  const r = Math.max(2, 70 * p.k);
  ctx.shadowColor = CONFIG.gatling.shotColor;
  ctx.shadowBlur = 10;
  circle(ctx, p.x, p.y - r, r, CONFIG.gatling.shotColor);
  ctx.shadowBlur = 0;
  circle(ctx, p.x - r * 0.3, p.y - r * 1.3, r * 0.35, '#ffffff');
}

// How each kind is drawn. (p = where it is on screen; p.k = pixels per world unit)
export const LOOKS = {
  rock: drawRock, hole: drawHole, crate: drawCrate, cone: drawCone, barrel: drawBarrel,
  traffic: drawTraffic, coin: drawCoin, powerup: drawPowerup, ramp: drawRamp,
  slime: drawSlime, gate: drawGate, blob: drawBlob, shot: drawShot,
};
