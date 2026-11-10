// faller.js — the things that fall: spawn, move and draw.
// To add a new look, write a drawSomething(ctx, f) function and add it to LOOKS.

import { CONFIG } from '../config.js';

const rand = (min, max) => min + Math.random() * (max - min);

export function spawnFaller(level, gravity) {
  const f = CONFIG.faller;
  const r = rand(f.minSize, f.maxSize);
  const speed = Math.min(f.maxSpeed, f.startSpeed + (level - 1) * CONFIG.speedUpPerLevel) * rand(0.8, 1.2);
  const spikes = Array.from({ length: 12 }, (_, i) => (i % 2 === 0 ? 1 : 0.72) * rand(0.92, 1.08));
  return {
    x: rand(r, CONFIG.width - r),
    y: gravity === 1 ? -r : CONFIG.height + r,   // start just off the top (or bottom if flipped)
    r,
    vy: speed * gravity,
    angle: rand(0, Math.PI * 2),
    spin: rand(-1, 1) * f.spin,
    spikes,
  };
}

export function updateFaller(f, dt) {
  f.y += f.vy * dt;
  f.angle += f.spin * dt;
}

export function isOffScreen(f) {
  return f.y - f.r > CONFIG.height || f.y + f.r < 0;
}

export function drawFaller(ctx, f) {
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.angle);
  const draw = LOOKS[CONFIG.faller.look] || drawAsteroid;
  draw(ctx, f);
  if (CONFIG.faller.hasFace) drawFace(ctx, f.r);
  ctx.restore();
}

// A spiky space rock.
function drawAsteroid(ctx, f) {
  ctx.fillStyle = CONFIG.faller.color;
  ctx.strokeStyle = CONFIG.faller.outlineColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  f.spikes.forEach((size, i) => {
    const a = (i / f.spikes.length) * Math.PI * 2;
    ctx.lineTo(Math.cos(a) * f.r * size, Math.sin(a) * f.r * size);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// A simple shiny ball.
function drawBall(ctx, f) {
  ctx.fillStyle = CONFIG.faller.color;
  ctx.strokeStyle = CONFIG.faller.outlineColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, f.r * 0.85, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(-f.r * 0.3, -f.r * 0.3, f.r * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

// Two little dot eyes so the falling things look friendly, not scary.
function drawFace(ctx, r) {
  ctx.fillStyle = '#1a1026';
  ctx.beginPath();
  ctx.arc(-r * 0.22, -r * 0.08, r * 0.1, 0, Math.PI * 2);
  ctx.arc(r * 0.22, -r * 0.08, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

const LOOKS = { asteroid: drawAsteroid, ball: drawBall };
