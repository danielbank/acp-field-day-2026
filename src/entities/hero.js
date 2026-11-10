// hero.js — the player's robot: slides left/right and draws itself.
// To restyle the hero, edit drawRobot() (or the colors in config.js).

import { CONFIG } from '../config.js';

const EDGE_GAP = 24;   // space between the hero and the bottom (or top) edge
const TOP_GAP = 80;    // when gravity flips, stay below the score/lives text

export function createHero() {
  return { x: CONFIG.width / 2, y: CONFIG.height - EDGE_GAP - CONFIG.hero.height / 2,
           w: CONFIG.hero.width, h: CONFIG.hero.height, hurtTimer: 0 };
}

export function updateHero(hero, dt, input, gravity) {
  let move = 0;
  if (input.left) move -= 1;
  if (input.right) move += 1;
  if (move === 0 && input.pointerX !== null) {
    move = Math.max(-1, Math.min(1, (input.pointerX - hero.x) / 30)); // ease in near the finger
  }
  hero.x += move * CONFIG.hero.speed * dt;
  hero.x = Math.max(hero.w / 2, Math.min(CONFIG.width - hero.w / 2, hero.x));
  hero.y = gravity === 1 ? CONFIG.height - EDGE_GAP - hero.h / 2 : TOP_GAP + hero.h / 2;
  hero.hurtTimer = Math.max(0, hero.hurtTimer - dt);
}

export function drawHero(ctx, hero, gravity) {
  const blinkOff = hero.hurtTimer > 0 && Math.floor(hero.hurtTimer * 10) % 2 === 0;
  if (blinkOff) return;
  ctx.save();
  ctx.translate(hero.x, hero.y);
  if (gravity === -1) ctx.scale(1, -1);   // upside down when gravity flips
  drawRobot(ctx, hero.w, hero.h);
  ctx.restore();
}

// A friendly rounded-square robot, centered on (0, 0).
export function drawRobot(ctx, w, h) {
  const c = CONFIG.hero;
  // antenna
  ctx.strokeStyle = c.antennaColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(0, -h / 2 - 14);
  ctx.stroke();
  ctx.fillStyle = c.antennaColor;
  ctx.beginPath();
  ctx.arc(0, -h / 2 - 16, 6, 0, Math.PI * 2);
  ctx.fill();
  // body
  ctx.fillStyle = c.bodyColor;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, w * 0.25);
  ctx.fill();
  // face screen
  ctx.fillStyle = c.faceColor;
  ctx.beginPath();
  ctx.roundRect(-w * 0.35, -h * 0.3, w * 0.7, h * 0.45, w * 0.12);
  ctx.fill();
  // eyes
  ctx.fillStyle = c.eyeColor;
  ctx.beginPath();
  ctx.arc(-w * 0.15, -h * 0.1, w * 0.07, 0, Math.PI * 2);
  ctx.arc(w * 0.15, -h * 0.1, w * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // smile
  ctx.strokeStyle = c.eyeColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, h * 0.0, w * 0.12, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}
