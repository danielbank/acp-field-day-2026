// hero.js — the player's potato-driven rocket car: slides left/right and draws itself.
// To restyle the hero, edit drawCar() (or the colors in config.js).

import { CONFIG } from '../config.js';
import { clampToRoad } from '../track.js';

const EDGE_GAP = 24;   // space between the hero and the bottom (or top) edge
const TOP_GAP = 80;    // when gravity flips, stay below the score text

export function createHero() {
  return { x: CONFIG.width / 2, y: CONFIG.height - EDGE_GAP - CONFIG.hero.height / 2,
           w: CONFIG.hero.width, h: CONFIG.hero.height, hurtTimer: 0, slowTimer: 0 };
}

// speed comes from the RPG level (faster car at higher levels).
export function updateHero(hero, dt, input, gravity, speed) {
  let move = 0;
  if (input.left) move -= 1;
  if (input.right) move += 1;
  if (move === 0 && input.pointerX !== null) {
    move = Math.max(-1, Math.min(1, (input.pointerX - CONFIG.width / 2) / 120)); // finger left/right of center steers
  }
  hero.x += move * speed * dt;
  hero.x = clampToRoad(hero.x, hero.w / 2);   // the boundary lines stop you going off track
  hero.y = gravity === 1 ? CONFIG.height - EDGE_GAP - hero.h / 2 : TOP_GAP + hero.h / 2;
  hero.hurtTimer = Math.max(0, hero.hurtTimer - dt);
  hero.slowTimer = Math.max(0, hero.slowTimer - dt);
}

export function drawHero(ctx, hero, gravity) {
  const blinkOff = hero.hurtTimer > 0 && Math.floor(hero.hurtTimer * 10) % 2 === 0;
  if (blinkOff) return;
  ctx.save();
  ctx.translate(hero.x, hero.y);
  if (gravity === -1) ctx.scale(1, -1);   // upside down when gravity flips
  drawCar(ctx, hero.w, hero.h);
  ctx.restore();
}

// A rocket race car seen from above, with a potato in the driver's seat. Centered on (0, 0).
export function drawCar(ctx, w, h) {
  const c = CONFIG.hero;
  const flicker = 0.8 + 0.3 * Math.sin(performance.now() / 40);
  // rocket flame out the back
  ctx.fillStyle = c.flameColor;
  ctx.beginPath();
  ctx.moveTo(-w * 0.2, h * 0.45);
  ctx.lineTo(0, h * 0.45 + h * 0.4 * flicker);
  ctx.lineTo(w * 0.2, h * 0.45);
  ctx.fill();
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath();
  ctx.moveTo(-w * 0.1, h * 0.45);
  ctx.lineTo(0, h * 0.45 + h * 0.2 * flicker);
  ctx.lineTo(w * 0.1, h * 0.45);
  ctx.fill();
  // wheels
  ctx.fillStyle = '#2b2118';
  for (const wy of [-h * 0.34, h * 0.14]) {
    for (const wx of [-w / 2, w / 2 - w * 0.2]) {
      ctx.beginPath();
      ctx.roundRect(wx, wy, w * 0.2, h * 0.22, 4);
      ctx.fill();
    }
  }
  // body
  ctx.fillStyle = c.carColor;
  ctx.beginPath();
  ctx.roundRect(-w * 0.38, -h / 2, w * 0.76, h * 0.95, w * 0.3);
  ctx.fill();
  // racing stripe
  ctx.fillStyle = c.stripeColor;
  ctx.fillRect(-w * 0.07, -h / 2 + 6, w * 0.14, h * 0.85);
  // rocket booster
  ctx.fillStyle = '#7a7a88';
  ctx.beginPath();
  ctx.roundRect(-w * 0.24, h * 0.3, w * 0.48, h * 0.16, 4);
  ctx.fill();
  // potato driver
  ctx.fillStyle = c.potatoColor;
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.04, w * 0.27, h * 0.19, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.potatoSpotColor;
  ctx.beginPath();
  ctx.arc(-w * 0.15, -h * 0.13, w * 0.03, 0, Math.PI * 2);
  ctx.arc(w * 0.17, h * 0.06, w * 0.035, 0, Math.PI * 2);
  ctx.arc(w * 0.12, -h * 0.17, w * 0.025, 0, Math.PI * 2);
  ctx.fill();
  // eyes and smile
  ctx.fillStyle = c.eyeColor;
  ctx.beginPath();
  ctx.arc(-w * 0.09, -h * 0.07, w * 0.045, 0, Math.PI * 2);
  ctx.arc(w * 0.09, -h * 0.07, w * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = c.eyeColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, -h * 0.02, w * 0.1, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}
