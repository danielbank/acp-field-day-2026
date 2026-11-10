// faller.js — the things that fall: spawn, move and draw.
// To add a new look, write a drawSomething(ctx, f) function and add it to LOOKS.

import { CONFIG } from '../config.js';

const rand = (min, max) => min + Math.random() * (max - min);

export function spawnFaller(lap, gravity) {
  const f = CONFIG.faller;
  const r = rand(f.minSize, f.maxSize);
  const speed = Math.min(f.maxSpeed, f.startSpeed + (lap - 1) * CONFIG.speedUpPerLap) * rand(0.8, 1.2);
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
  const draw = LOOKS[f.look || CONFIG.faller.look] || drawAsteroid;   // f.look lets one faller look different
  draw(ctx, f);
  if (CONFIG.faller.hasFace && !f.look) drawFace(ctx, f.r);
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

// A rusty gear-shaped chunk of space junk with a bolt hole.
function drawJunk(ctx, f) {
  ctx.fillStyle = CONFIG.faller.color;
  ctx.strokeStyle = CONFIG.faller.outlineColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  f.spikes.forEach((size, i) => {
    const a = (i / f.spikes.length) * Math.PI * 2;
    const r = (i % 2 === 0 ? 1 : 0.8) * f.r;
    ctx.lineTo(Math.cos(a - 0.12) * r, Math.sin(a - 0.12) * r);
    ctx.lineTo(Math.cos(a + 0.12) * r, Math.sin(a + 0.12) * r);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#5c3a22';                           // rust patches
  ctx.beginPath();
  ctx.arc(f.r * 0.35, f.r * 0.3, f.r * 0.18, 0, Math.PI * 2);
  ctx.arc(-f.r * 0.4, f.r * 0.25, f.r * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

// DJ Spudz's beat-bomb: a bouncy black music note.
function drawBeatBomb(ctx, f) {
  ctx.rotate(-f.angle);                                // notes stay upright
  ctx.fillStyle = '#2b1a3a';
  ctx.strokeStyle = '#c77dff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(-f.r * 0.2, f.r * 0.35, f.r * 0.5, f.r * 0.38, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillRect(f.r * 0.22, -f.r * 0.9, f.r * 0.14, f.r * 1.25);
  ctx.beginPath();
  ctx.moveTo(f.r * 0.36, -f.r * 0.9);
  ctx.quadraticCurveTo(f.r * 0.9, -f.r * 0.6, f.r * 0.7, -f.r * 0.15);
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#2b1a3a';
  ctx.stroke();
}

// Two little dot eyes so the falling things look friendly, not scary.
function drawFace(ctx, r) {
  ctx.fillStyle = '#1a1026';
  ctx.beginPath();
  ctx.arc(-r * 0.22, -r * 0.08, r * 0.1, 0, Math.PI * 2);
  ctx.arc(r * 0.22, -r * 0.08, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

const LOOKS = { asteroid: drawAsteroid, ball: drawBall, junk: drawJunk, beatBomb: drawBeatBomb };
