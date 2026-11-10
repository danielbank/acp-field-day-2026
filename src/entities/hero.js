// hero.js — the player's flying skateboard, seen from the cockpit: flaps up, sinks down, aims.
// We ride in first person, so we draw the board's nose and a crosshair instead of the hero.

import { CONFIG } from '../config.js';

export function createHero() {
  return { x: CONFIG.width / 2, y: CONFIG.height / 2, w: CONFIG.hero.width, h: CONFIG.hero.height,
           alt: CONFIG.cockpit.startHeight, vy: 0,
           aimX: CONFIG.width / 2, aimY: CONFIG.height / 2, hurtTimer: 0 };
}

// Space pressed: a quick boost upward (just like a flappy bird).
export function flap(hero) {
  hero.vy = CONFIG.cockpit.flapStrength;
}

// Moves the board and the crosshair. Returns true if the board scraped the ground.
export function updateHero(hero, dt, input) {
  const c = CONFIG.cockpit;
  hero.vy -= c.gravity * dt;
  hero.alt += hero.vy * dt;
  let scraped = false;
  if (hero.alt <= 0) { hero.alt = 0; hero.vy = c.flapStrength * 1.3; scraped = true; }
  if (hero.alt >= c.maxHeight) { hero.alt = c.maxHeight; hero.vy = Math.min(0, hero.vy); }

  // aim: arrow keys / WASD nudge the crosshair, the mouse jumps it right where you point
  hero.aimX += ((input.right ? 1 : 0) - (input.left ? 1 : 0)) * c.aimSpeed * dt;
  hero.aimY += ((input.down ? 1 : 0) - (input.up ? 1 : 0)) * c.aimSpeed * dt;
  if (input.aimX !== null) {
    hero.aimX = input.aimX;
    hero.aimY = input.aimY;
    input.aimX = input.aimY = null;
  }
  hero.aimX = Math.max(0, Math.min(CONFIG.width, hero.aimX));
  hero.aimY = Math.max(0, Math.min(CONFIG.height, hero.aimY));
  hero.hurtTimer = Math.max(0, hero.hurtTimer - dt);
  return scraped;
}

// Where the horizon sits on screen: fly higher and the ground drops away below you.
export function horizonY(hero) {
  return CONFIG.height * 0.5 + (hero.alt - CONFIG.cockpit.startHeight) * 0.5;
}

// The ground rushing toward you, with stripes that zoom past.
export function drawGround(ctx, hero, seconds) {
  const c = CONFIG.cockpit;
  const top = horizonY(hero);
  ctx.fillStyle = c.groundColor;
  ctx.fillRect(0, top, CONFIG.width, CONFIG.height - top);
  ctx.fillStyle = c.groundStripeColor;
  const count = 10;
  for (let i = 0; i < count; i++) {
    const z = ((i + seconds * c.groundSpeed) % count) / count;   // 0 = far away, 1 = right under you
    ctx.fillRect(0, top + (CONFIG.height - top) * z * z, CONFIG.width, 1 + z * 8);
  }
}

// The nose of the skateboard at the bottom, plus the crosshair.
export function drawCockpit(ctx, hero) {
  const c = CONFIG.cockpit;
  const W = CONFIG.width, H = CONFIG.height;
  // board nose (wobbles a little when you flap)
  ctx.save();
  ctx.translate(W / 2, H);
  ctx.rotate(Math.max(-0.08, Math.min(0.08, hero.vy * 0.0002)));
  ctx.fillStyle = c.boardColor;
  ctx.beginPath();
  ctx.moveTo(-260, 10);
  ctx.lineTo(-90, -120);
  ctx.quadraticCurveTo(0, -150, 90, -120);
  ctx.lineTo(260, 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = c.boardStripeColor;
  ctx.beginPath();
  ctx.moveTo(-40, 10);
  ctx.lineTo(-12, -135);
  ctx.lineTo(12, -135);
  ctx.lineTo(40, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // red flash after a bonk
  if (hero.hurtTimer > 0) {
    ctx.fillStyle = `rgba(255,60,90,${0.25 * hero.hurtTimer / CONFIG.invincibleSeconds})`;
    ctx.fillRect(0, 0, W, H);
  }

  // crosshair
  ctx.strokeStyle = c.crosshairColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(hero.aimX, hero.aimY, 18, 0, Math.PI * 2);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    ctx.moveTo(hero.aimX + dx * 10, hero.aimY + dy * 10);
    ctx.lineTo(hero.aimX + dx * 28, hero.aimY + dy * 28);
  }
  ctx.stroke();
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
