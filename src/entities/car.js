// car.js — your stunt car: gas, brakes, steering, jumping and turbo, plus how cars are drawn.
// To restyle cars, edit drawCarShape() (or the colors in config.js).

import { CONFIG } from '../config.js';
import { curveAt, SEG } from '../road.js';
import { gravityScale } from '../twists.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function createCar() {
  return { z: 0, x: 0, y: 0, vy: 0, speed: 0, hurt: 0, spin: 0, turbo: 0,
           turboCharges: CONFIG.car.turboStartCharges };
}

export function updateCar(car, dt, input) {
  const C = CONFIG.car;
  const gas = input.up || CONFIG.autoGas || input.pointerX !== null;
  if (car.turbo > 0) {
    car.turbo -= dt;
    car.speed += C.acceleration * 2 * dt;
  } else if (input.down) car.speed -= C.brakes * dt;
  else if (gas) car.speed += C.acceleration * dt;
  else car.speed -= C.coastSlowdown * dt;

  const topSpeed = C.maxSpeed * (car.turbo > 0 ? C.turboSpeed : 1);
  if (car.speed > topSpeed) car.speed -= C.coastSlowdown * 2 * dt;          // ease down after turbo
  if (Math.abs(car.x) > 1 && car.speed > C.offRoadMaxSpeed) car.speed -= C.brakes * 0.6 * dt; // space dust!
  car.speed = clamp(car.speed, 0, C.maxSpeed * C.turboSpeed);

  // steering (keys, or finger position on touch screens) and the push from curves
  const pct = car.speed / C.maxSpeed;
  let steer = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (input.pointerX !== null) steer = clamp((input.pointerX - CONFIG.width / 2) / 200, -1, 1);
  car.x += steer * C.steering * (0.3 + 0.7 * Math.min(pct, 1)) * dt;
  car.x -= 2 * dt * pct * pct * curveAt(Math.floor(car.z / SEG)) * C.curvePull;
  car.x = clamp(car.x, -2.2, 2.2);

  // jumping: up, then gravity pulls you back down
  if (car.y > 0 || car.vy > 0) {
    car.vy -= C.gravity * gravityScale() * dt;
    car.y += car.vy * dt;
    if (car.y <= 0) { car.y = 0; car.vy = 0; }
  }

  car.z += car.speed * dt;
  car.hurt = Math.max(0, car.hurt - dt);
  car.spin = Math.max(0, car.spin - dt);
}

// Returns true if the car actually jumped (you can't jump in mid-air).
export function jumpCar(car, boost = 1) {
  if (car.y > 0) return false;
  car.vy = CONFIG.car.jumpPower * boost;
  car.y = 0.01;
  return true;
}

// Returns true if a turbo was used.
export function useTurbo(car) {
  if (car.turboCharges <= 0 || car.turbo > 0) return false;
  car.turboCharges -= 1;
  car.turbo = CONFIG.car.turboSeconds;
  return true;
}

// A car seen from behind. (x, y) = bottom middle, w/h = size in pixels.
export function drawCarShape(ctx, x, y, w, h, bodyColor, stripeColor, flame = false) {
  const C = CONFIG.car;
  ctx.fillStyle = '#111018';                                   // wheels
  ctx.fillRect(x - w * 0.47, y - h * 0.3, w * 0.2, h * 0.3);
  ctx.fillRect(x + w * 0.27, y - h * 0.3, w * 0.2, h * 0.3);
  ctx.fillStyle = bodyColor;                                   // cabin
  ctx.beginPath();
  ctx.moveTo(x - w * 0.38, y - h * 0.7);
  ctx.lineTo(x - w * 0.27, y - h);
  ctx.lineTo(x + w * 0.27, y - h);
  ctx.lineTo(x + w * 0.38, y - h * 0.7);
  ctx.fill();
  ctx.fillRect(x - w / 2, y - h * 0.72, w, h * 0.5);           // body
  ctx.fillStyle = C.windowColor;                               // back window
  ctx.beginPath();
  ctx.moveTo(x - w * 0.31, y - h * 0.74);
  ctx.lineTo(x - w * 0.23, y - h * 0.94);
  ctx.lineTo(x + w * 0.23, y - h * 0.94);
  ctx.lineTo(x + w * 0.31, y - h * 0.74);
  ctx.fill();
  ctx.fillStyle = stripeColor;                                 // racing stripe
  ctx.fillRect(x - w / 2, y - h * 0.5, w, h * 0.07);
  ctx.fillStyle = C.lightColor;                                // tail lights
  ctx.fillRect(x - w * 0.46, y - h * 0.66, w * 0.15, h * 0.1);
  ctx.fillRect(x + w * 0.31, y - h * 0.66, w * 0.15, h * 0.1);
  if (!flame) return;
  ctx.fillStyle = C.flameColor;                                // turbo flames
  for (const side of [-0.2, 0.2]) {
    const len = h * (0.35 + Math.random() * 0.25);
    ctx.beginPath();
    ctx.moveTo(x + w * side - w * 0.07, y - h * 0.3);
    ctx.lineTo(x + w * side + w * 0.07, y - h * 0.3);
    ctx.lineTo(x + w * side, y - h * 0.3 + len);
    ctx.fill();
  }
}

// Driver-seat view: the front of your car at the bottom of the screen.
export function drawHood(ctx, car, seconds) {
  const C = CONFIG.car;
  const W = CONFIG.width;
  const H = CONFIG.height;
  const rumble = car.y > 0 ? 0 : Math.sin(seconds * 40) * Math.min(car.speed / C.maxSpeed, 1.5) * 1.5;
  const top = H - 95 + rumble;
  if (car.hurt > 0 && Math.floor(car.hurt * 10) % 2 === 0) ctx.globalAlpha = 0.5;
  ctx.fillStyle = C.bodyColor;
  ctx.beginPath();
  ctx.moveTo(40, H);
  ctx.lineTo(250, top);
  ctx.lineTo(W - 250, top);
  ctx.lineTo(W - 40, H);
  ctx.fill();
  ctx.fillStyle = C.stripeColor;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 22, top);
  ctx.lineTo(W / 2 + 22, top);
  ctx.lineTo(W / 2 + 60, H);
  ctx.lineTo(W / 2 - 60, H);
  ctx.fill();
  ctx.fillStyle = C.windowColor;                               // goo blaster on the hood
  ctx.fillRect(W / 2 - 14, top - 16, 28, 20);
  ctx.fillStyle = CONFIG.aliens.bubbleColor;
  ctx.beginPath();
  ctx.arc(W / 2, top - 16, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}
