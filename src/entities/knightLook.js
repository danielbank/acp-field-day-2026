// knightLook.js — draws a robot knight from a "look" (colors, helmet, wheels/legs) plus its weapon.
// Feet are at (0, 0) and it's about 90 pixels tall. Used in the arena AND on the customize screen.

import { CONFIG } from '../config.js';

const DARK = '#2b2d42';
const OUTLINE = 'rgba(10,4,20,0.45)';

// pose: { facing, aim (screen angle), swing (-1 or 0..1), spin (0..1), walk, flame, t, role }
export function drawKnight(ctx, look, pose = {}) {
  const C = CONFIG.customize;
  const body = C.bodyColors[look.body];
  const armor = C.armorColors[look.armor];
  const eyes = C.eyeColors[look.eyes];
  const { facing = 1, aim = 0, swing = -1, spin = 0, walk = 0, flame = false, t = 0, role = look.role } = pose;

  let weaponAngle = aim;
  if (swing >= 0) weaponAngle = aim - 1.2 + 2.4 * swing;
  if (spin > 0) weaponAngle = aim + spin * Math.PI * 2;
  const weaponBehind = Math.sin(weaponAngle) < -0.35;   // pointing away from us, so it's behind the body

  drawBase(ctx, C.bases[look.base], body, armor, walk);
  ctx.save();
  ctx.translate(0, Math.sin(walk * 2) * 1.5);
  if (weaponBehind) drawWeapon(ctx, role, weaponAngle, flame, t);
  drawTorso(ctx, body, armor, eyes);
  drawHead(ctx, armor, eyes, facing, C.helmets[look.helmet], t);
  if (!weaponBehind) drawWeapon(ctx, role, weaponAngle, flame, t);
  ctx.restore();
}

function shape(ctx, fill, draw) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  draw();
  ctx.fill();
  ctx.stroke();
}

function drawBase(ctx, base, body, armor, walk) {
  shape(ctx, DARK, () => ctx.rect(-10, -22, 20, 6));               // hips
  if (base === 'wheels') {
    for (const x of [-11, 11]) {
      shape(ctx, DARK, () => ctx.arc(x, -8, 8, 0, Math.PI * 2));
      ctx.strokeStyle = body;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const a = walk * 3;
      ctx.moveTo(x + Math.cos(a) * 6, -8 + Math.sin(a) * 6);
      ctx.lineTo(x - Math.cos(a) * 6, -8 - Math.sin(a) * 6);
      ctx.stroke();
    }
  } else if (base === 'treads') {
    shape(ctx, DARK, () => ctx.roundRect(-20, -17, 40, 17, 8));
    ctx.fillStyle = '#8d99ae';
    for (let i = 0; i < 5; i++) {
      const x = (((i * 9 + walk * 20) % 45) + 45) % 45 - 22;
      if (x > -18 && x < 16) ctx.fillRect(x, -15, 3, 13);
    }
  } else {   // legs
    const step = Math.sin(walk * 2) * 4;
    shape(ctx, DARK, () => ctx.roundRect(-11, -18 + Math.max(0, step), 8, 16, 3));
    shape(ctx, DARK, () => ctx.roundRect(3, -18 + Math.max(0, -step), 8, 16, 3));
    shape(ctx, armor, () => ctx.ellipse(-7, -3 + Math.max(0, step) * 0.3, 7, 4, 0, 0, Math.PI * 2));
    shape(ctx, armor, () => ctx.ellipse(7, -3 + Math.max(0, -step) * 0.3, 7, 4, 0, 0, Math.PI * 2));
  }
}

function drawTorso(ctx, body, armor, eyes) {
  shape(ctx, body, () => ctx.roundRect(-16, -50, 32, 31, 8));
  shape(ctx, armor, () => { ctx.arc(-16, -46, 7, 0, Math.PI * 2); });
  shape(ctx, armor, () => { ctx.arc(16, -46, 7, 0, Math.PI * 2); });
  shape(ctx, armor, () => {                                        // chest shield plate
    ctx.moveTo(-10, -46); ctx.lineTo(10, -46); ctx.lineTo(10, -34);
    ctx.quadraticCurveTo(0, -22, -10, -34); ctx.closePath();
  });
  ctx.fillStyle = eyes;
  ctx.beginPath();
  ctx.arc(0, -38, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawHead(ctx, armor, eyes, facing, helmet, t) {
  if (helmet === 'plume') {
    shape(ctx, CONFIG.customize.plumeColor, () => {
      ctx.moveTo(-2, -76);
      ctx.bezierCurveTo(-6 * facing, -100, -26 * facing, -96, -30 * facing, -78);
      ctx.bezierCurveTo(-20 * facing, -88, -10 * facing, -86, 4, -76);
      ctx.closePath();
    });
  }
  if (helmet === 'horns') {
    for (const s of [-1, 1]) {
      shape(ctx, '#fff1d0', () => {
        ctx.moveTo(s * 10, -72); ctx.quadraticCurveTo(s * 24, -78, s * 22, -94);
        ctx.quadraticCurveTo(s * 16, -82, s * 4, -76); ctx.closePath();
      });
    }
  }
  if (helmet === 'antenna') {
    ctx.strokeStyle = '#c0c0d0';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -76); ctx.lineTo(0, -92); ctx.stroke();
    ctx.fillStyle = eyes;
    ctx.beginPath(); ctx.arc(0, -94, 4 + Math.sin(t * 6), 0, Math.PI * 2); ctx.fill();
  }
  shape(ctx, armor, () => ctx.roundRect(-15, -77, 30, 28, 10));     // helmet
  const f = facing * 2;
  if (helmet === 'visor') {
    shape(ctx, 'rgba(0,0,0,0.35)', () => ctx.roundRect(-13, -70, 26, 15, 5));
    ctx.fillStyle = eyes;
    ctx.fillRect(-10 + f, -64, 20, 4);
  } else {
    shape(ctx, '#1a1026', () => ctx.roundRect(-11 + f / 2, -69, 22, 12, 4));
    ctx.fillStyle = eyes;
    ctx.beginPath();
    ctx.arc(-5 + f, -63, 2.6, 0, Math.PI * 2);
    ctx.arc(5 + f, -63, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---- Weapons (drawn pointing along +x, then rotated to the aim) ----
function drawWeapon(ctx, role, angle, flame, t) {
  const weapon = CONFIG.roles[role].weapon;
  ctx.save();
  ctx.translate(Math.cos(angle) * 14, -34 + Math.sin(angle) * 6);
  ctx.rotate(angle);
  if (weapon === 'blaster') drawBlaster(ctx, flame, t);
  else if (flame || weapon === 'sword') drawSword(ctx, flame, t);
  else if (weapon === 'hammer') drawHammer(ctx);
  else drawWrench(ctx);
  ctx.restore();
}

function drawSword(ctx, flame, t) {
  shape(ctx, '#6b4226', () => ctx.rect(-6, -3, 12, 6));
  shape(ctx, '#ffd166', () => ctx.rect(5, -9, 5, 18));
  shape(ctx, flame ? '#ffb703' : '#e0e6f0', () => {
    ctx.moveTo(10, -4); ctx.lineTo(46, -4); ctx.lineTo(55, 0); ctx.lineTo(46, 4); ctx.lineTo(10, 4); ctx.closePath();
  });
  if (!flame) return;
  for (let i = 0; i < 6; i++) {
    const x = 14 + i * 7;
    const h = 9 + Math.sin(t * 22 + i * 1.7) * 4;
    ctx.fillStyle = i % 2 ? 'rgba(255,80,0,0.85)' : 'rgba(255,200,0,0.85)';
    ctx.beginPath();
    ctx.moveTo(x - 4, -3); ctx.lineTo(x, -3 - h); ctx.lineTo(x + 4, -3);
    ctx.moveTo(x - 4, 3); ctx.lineTo(x, 3 + h * 0.6); ctx.lineTo(x + 4, 3);
    ctx.fill();
  }
}

function drawHammer(ctx) {
  shape(ctx, '#8d5a2b', () => ctx.rect(-4, -3, 36, 6));
  shape(ctx, '#adb5bd', () => ctx.roundRect(28, -11, 14, 22, 3));
}

function drawWrench(ctx) {
  shape(ctx, '#adb5bd', () => ctx.roundRect(-4, -3, 34, 6, 3));
  shape(ctx, '#adb5bd', () => ctx.arc(34, 0, 8, 0, Math.PI * 2));
  ctx.fillStyle = '#1a1026';
  ctx.fillRect(36, -3, 8, 6);
}

function drawBlaster(ctx, flame, t) {
  shape(ctx, '#3c096c', () => ctx.roundRect(-4, -6, 26, 12, 4));
  shape(ctx, '#adb5bd', () => ctx.rect(20, -3, 10, 6));
  ctx.fillStyle = flame ? '#ff9f1c' : '#4cc9f0';
  ctx.beginPath();
  ctx.arc(32, 0, 4 + Math.sin(t * 15) * 1.2, 0, Math.PI * 2);
  ctx.fill();
}
