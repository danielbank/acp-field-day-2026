// car.js — your stunt car: gas, brakes, steering, jumping, turbo and falling off the road, plus how cars are drawn.
// To restyle cars, edit drawCarShape() / drawHood() (or the colors in config.js).

import { CONFIG } from '../config.js';
import { curveAt, SEG } from '../road.js';
import { gravityScale } from '../twists.js';
import { topSpeed, paintColor, extraTurbos } from '../shop.js';
import { shade, topLit } from '../shading.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function createCar() {
  const C = CONFIG.car;
  return {
    z: 0, x: 0, y: 0, vy: 0, speed: 0, hurt: 0, spin: 0, turbo: 0,
    falling: 0,                                   // seconds left tumbling through space (0 = on the road)
    topSpeed: topSpeed(),                         // Car Shop engine upgrades make this bigger
    color: paintColor(),                          // Car Shop paint job
    turboCharges: C.turboStartCharges + extraTurbos(),
    turboMax: C.turboMaxCharges + extraTurbos(),
  };
}

export function updateCar(car, dt, input) {
  const C = CONFIG.car;
  if (car.falling > 0) {   // tumbling through space: no steering, just fall
    car.vy -= C.gravity * dt;
    car.y += car.vy * dt;
    car.z += car.speed * dt;
    car.speed *= 1 - dt;
    car.spin = 0.6;
    return;
  }
  const gas = input.up || CONFIG.autoGas || input.pointerX !== null;
  if (car.turbo > 0) {
    car.turbo -= dt;
    car.speed += C.acceleration * 2 * dt;
  } else if (input.down) car.speed -= C.brakes * dt;
  else if (gas) car.speed += C.acceleration * dt;
  else car.speed -= C.coastSlowdown * dt;

  const top = car.topSpeed * (car.turbo > 0 ? C.turboSpeed : 1);
  if (car.speed > top) car.speed -= C.coastSlowdown * 2 * dt;          // ease down after turbo
  car.speed = clamp(car.speed, 0, car.topSpeed * C.turboSpeed);

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

// Returns true if the car actually jumped (you can't jump in mid-air or while falling).
export function jumpCar(car, boost = 1) {
  if (car.y > 0 || car.falling > 0) return false;
  car.vy = CONFIG.car.jumpPower * boost;
  car.y = 0.01;
  return true;
}

// Returns true if a turbo was used.
export function useTurbo(car) {
  if (car.turboCharges <= 0 || car.turbo > 0 || car.falling > 0) return false;
  car.turboCharges -= 1;
  car.turbo = CONFIG.car.turboSeconds;
  return true;
}

// A car seen from behind. (x, y) = bottom middle, w/h = size in pixels.
export function drawCarShape(ctx, x, y, w, h, bodyColor, stripeColor, flame = false) {
  const C = CONFIG.car;
  for (const wx of [x - w * 0.37, x + w * 0.37]) {             // tires with shiny rims
    ctx.fillStyle = '#0c0b12';
    ctx.fillRect(wx - w * 0.1, y - h * 0.3, w * 0.2, h * 0.3);
    ctx.fillStyle = '#55526a';
    ctx.fillRect(wx - w * 0.05, y - h * 0.22, w * 0.1, h * 0.12);
  }
  ctx.fillStyle = topLit(ctx, bodyColor, y - h, y - h * 0.7);   // cabin
  ctx.beginPath();
  ctx.moveTo(x - w * 0.38, y - h * 0.7);
  ctx.lineTo(x - w * 0.27, y - h);
  ctx.lineTo(x + w * 0.27, y - h);
  ctx.lineTo(x + w * 0.38, y - h * 0.7);
  ctx.fill();
  ctx.fillStyle = topLit(ctx, bodyColor, y - h * 0.72, y - h * 0.22);   // body
  ctx.fillRect(x - w / 2, y - h * 0.72, w, h * 0.5);
  ctx.fillStyle = shade(bodyColor, -0.6);                      // bumper
  ctx.fillRect(x - w * 0.48, y - h * 0.3, w * 0.96, h * 0.08);
  const glass = ctx.createLinearGradient(0, y - h * 0.94, 0, y - h * 0.74);   // back window
  glass.addColorStop(0, '#3b3560');
  glass.addColorStop(1, C.windowColor);
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.31, y - h * 0.74);
  ctx.lineTo(x - w * 0.23, y - h * 0.94);
  ctx.lineTo(x + w * 0.23, y - h * 0.94);
  ctx.lineTo(x + w * 0.31, y - h * 0.74);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';                    // window reflection
  ctx.beginPath();
  ctx.moveTo(x - w * 0.12, y - h * 0.92);
  ctx.lineTo(x - w * 0.02, y - h * 0.92);
  ctx.lineTo(x - w * 0.1, y - h * 0.76);
  ctx.lineTo(x - w * 0.2, y - h * 0.76);
  ctx.fill();
  ctx.fillStyle = stripeColor;                                 // racing stripe
  ctx.fillRect(x - w / 2, y - h * 0.5, w, h * 0.07);
  ctx.fillStyle = C.lightColor;                                // glowing tail lights
  ctx.shadowColor = C.lightColor;
  ctx.shadowBlur = Math.min(20, w * 0.08);
  ctx.fillRect(x - w * 0.46, y - h * 0.66, w * 0.15, h * 0.1);
  ctx.fillRect(x + w * 0.31, y - h * 0.66, w * 0.15, h * 0.1);
  ctx.shadowBlur = 0;
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

// Spinning goo gatling barrels on the hood. gun.heat 0…1 makes them glow red.
function drawGatling(ctx, cx, top, gun) {
  const heat = gun ? gun.heat : 0;
  const spin = gun ? gun.spin : 0;
  ctx.fillStyle = '#1a1726';
  ctx.fillRect(cx - 34, top - 14, 68, 22);
  const barrels = [0, 1, 2].map((i) => spin + (i * Math.PI * 2) / 3)
    .sort((a, b) => Math.sin(a) - Math.sin(b));                 // back barrels first
  for (const a of barrels) {
    const bx = cx + Math.cos(a) * 14;
    const light = 0.5 + Math.sin(a) * 0.3;
    ctx.fillStyle = `rgb(${Math.round((90 + 165 * heat) * light + 40)},${Math.round(100 * light + 30 - 40 * heat)},${Math.round(120 * light + 30 - 50 * heat)})`;
    ctx.fillRect(bx - 5, top - 58, 10, 48);
  }
  ctx.fillStyle = '#2c2840';
  ctx.fillRect(cx - 24, top - 60, 48, 8);
  if (gun && gun.flash > 0) {                                   // muzzle flash
    ctx.fillStyle = CONFIG.gatling.shotColor;
    ctx.beginPath();
    ctx.arc(cx, top - 66, 16, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Driver-seat view: the front of your car at the bottom of the screen.
export function drawHood(ctx, car, seconds, gun) {
  const C = CONFIG.car;
  const W = CONFIG.width;
  const H = CONFIG.height;
  const rumble = car.y > 0 ? 0 : Math.sin(seconds * 40) * Math.min(car.speed / C.maxSpeed, 1.5) * 1.5;
  const top = H - 95 + rumble;

  ctx.save();                                                  // headlight beams on the road
  ctx.globalCompositeOperation = 'lighter';
  const beam = ctx.createLinearGradient(0, top, 0, H * 0.55);
  beam.addColorStop(0, 'rgba(255,240,200,0.16)');
  beam.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = beam;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(W / 2 + side * 200, top);
    ctx.lineTo(W / 2 + side * 40, H * 0.55);
    ctx.lineTo(W / 2 + side * 170, H * 0.55);
    ctx.lineTo(W / 2 + side * 330, top);
    ctx.fill();
  }
  ctx.restore();

  if (car.hurt > 0 && Math.floor(car.hurt * 10) % 2 === 0) ctx.globalAlpha = 0.5;
  ctx.fillStyle = topLit(ctx, car.color, top, H);
  ctx.beginPath();
  ctx.moveTo(40, H);
  ctx.lineTo(250, top);
  ctx.lineTo(W - 250, top);
  ctx.lineTo(W - 40, H);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';                    // shiny reflection
  ctx.beginPath();
  ctx.moveTo(300, top + 4);
  ctx.lineTo(380, top + 4);
  ctx.lineTo(250, H);
  ctx.lineTo(150, H);
  ctx.fill();
  ctx.fillStyle = C.stripeColor;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 22, top);
  ctx.lineTo(W / 2 + 22, top);
  ctx.lineTo(W / 2 + 60, H);
  ctx.lineTo(W / 2 - 60, H);
  ctx.fill();
  drawGatling(ctx, W / 2, top, gun);
  ctx.globalAlpha = 1;
}
