// cockpit.js — what you see from the driver's seat: the rocket car's hood, dashboard,
// and the steering wheel held by little potato hands (it turns when you steer).

import { CONFIG } from '../config.js';

export function drawCockpit(ctx, steer, speedFrac) {
  const W = CONFIG.width;
  const H = CONFIG.height;
  const c = CONFIG.hero;
  // hood
  const hood = ctx.createLinearGradient(0, H - 170, 0, H);
  hood.addColorStop(0, c.carColor);
  hood.addColorStop(1, '#4a1804');
  ctx.fillStyle = hood;
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, H - 60);
  ctx.quadraticCurveTo(W / 2, H - 175, W, H - 60);
  ctx.lineTo(W, H);
  ctx.fill();
  // racing stripe and shine
  ctx.fillStyle = c.stripeColor;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 14, H - 117);
  ctx.lineTo(W / 2 + 14, H - 117);
  ctx.lineTo(W / 2 + 60, H);
  ctx.lineTo(W / 2 - 60, H);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(120, H - 80);
  ctx.quadraticCurveTo(W / 2, H - 160, W - 120, H - 80);
  ctx.stroke();
  // dashboard
  const dash = ctx.createLinearGradient(0, H - 60, 0, H);
  dash.addColorStop(0, '#3a3440');
  dash.addColorStop(1, '#16121a');
  ctx.fillStyle = dash;
  ctx.fillRect(0, H - 56, W, 56);
  drawDial(ctx, 110, H - 28, speedFrac);
  drawDial(ctx, W - 110, H - 28, 0.5 + Math.sin(performance.now() / 300) * 0.1);
  drawWheel(ctx, W / 2, H + 40, steer);
}

function drawDial(ctx, x, y, frac) {
  ctx.fillStyle = '#0d0a10';
  ctx.beginPath();
  ctx.arc(x, y, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = CONFIG.colors.accent;
  ctx.lineWidth = 3;
  const a = Math.PI * (0.8 + 1.4 * frac);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18);
  ctx.stroke();
}

function drawWheel(ctx, x, y, steer) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(steer * 0.6);
  ctx.strokeStyle = '#1d1a20';
  ctx.lineWidth = 24;
  ctx.beginPath();
  ctx.arc(0, 0, 130, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(-110, -60);
  ctx.moveTo(0, 0); ctx.lineTo(110, -60);
  ctx.stroke();
  // potato hands
  for (const side of [-1, 1]) {
    const g = ctx.createRadialGradient(side * 112 - 6, -78, 4, side * 112, -70, 28);
    g.addColorStop(0, '#e6c48f');
    g.addColorStop(1, CONFIG.hero.potatoColor);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(side * 112, -70, 26, 20, side * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
