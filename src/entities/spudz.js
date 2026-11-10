// spudz.js — DJ SPUDZ, the rapping potato boss: sways side to side behind his turntable.
// His rap lyrics float in a speech bubble, written in alien letters.

import { CONFIG } from '../config.js';
import { drawAlienText } from '../alien.js';

export function createSpudz(lap, extraHp = 0) {
  const b = CONFIG.boss;
  const hp = Math.max(1, b.hp + (lap - 1) * b.extraHpPerLap + extraHp);
  return { x: CONFIG.width / 2, y: 175, r: b.size, hp, maxHp: hp, t: 0, hurtTimer: 0, bombTimer: 1.5,
           minionTimer: 1, mergeTimer: b.mergeEverySeconds, laserTimer: b.laserSeconds, laserPhase: null, laserTime: 0, laserX: 0 };
}

export function updateSpudz(s, dt) {
  s.t += dt;
  s.hurtTimer = Math.max(0, s.hurtTimer - dt);
  s.x = CONFIG.width / 2 + Math.sin(s.t * 0.7) * (CONFIG.road.width / 2 - 60);
}

export function drawSpudz(ctx, s) {
  const b = CONFIG.boss;
  const r = s.r;
  const bob = Math.sin(s.t * 6) * 4;                  // bobbing to the beat
  ctx.save();
  ctx.translate(s.x, s.y + bob);
  if (s.hurtTimer > 0) ctx.rotate(Math.sin(s.hurtTimer * 40) * 0.15);   // wobble when bonked
  // potato body
  ctx.fillStyle = s.hurtTimer > 0 ? '#ffe4b5' : b.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.85, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a6136';
  ctx.beginPath();
  ctx.arc(-r * 0.45, r * 0.3, r * 0.07, 0, Math.PI * 2);
  ctx.arc(r * 0.4, -r * 0.55, r * 0.06, 0, Math.PI * 2);
  ctx.arc(r * 0.5, r * 0.45, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // headphones
  ctx.strokeStyle = b.headphoneColor;
  ctx.lineWidth = r * 0.12;
  ctx.beginPath();
  ctx.arc(0, -r * 0.2, r * 0.9, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();
  ctx.fillStyle = b.headphoneColor;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.roundRect(side * r * 0.85 - r * 0.15, -r * 0.4, r * 0.3, r * 0.45, r * 0.1);
    ctx.fill();
  }
  // cool shades
  ctx.fillStyle = '#1a1026';
  ctx.beginPath();
  ctx.roundRect(-r * 0.55, -r * 0.35, r * 0.48, r * 0.26, r * 0.1);
  ctx.roundRect(r * 0.07, -r * 0.35, r * 0.48, r * 0.26, r * 0.1);
  ctx.fill();
  ctx.fillRect(-r * 0.1, -r * 0.3, r * 0.2, r * 0.06);
  // big grin
  ctx.strokeStyle = '#1a1026';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, r * 0.05, r * 0.35, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // turntable in front
  ctx.fillStyle = '#4a4a58';
  ctx.beginPath();
  ctx.roundRect(-r * 1.1, r * 0.65, r * 2.2, r * 0.5, 8);
  ctx.fill();
  ctx.fillStyle = '#1a1026';
  ctx.beginPath();
  ctx.ellipse(-r * 0.5, r * 0.9, r * 0.35, r * 0.15, 0, 0, Math.PI * 2);
  ctx.ellipse(r * 0.5, r * 0.9, r * 0.35, r * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  drawLyrics(ctx, s);
  drawHpBar(ctx, s);
}

// Speech bubble with the current rap line in alien letters.
function drawLyrics(ctx, s) {
  const lines = CONFIG.boss.lyrics;
  const line = lines[Math.floor(s.t / 2) % lines.length];
  const onRight = s.x < CONFIG.width / 2;
  const w = line.length * 22 + 30;
  const bx = onRight ? s.x + s.r + 20 : s.x - s.r - 20 - w;
  const by = s.y - s.r - 10;
  ctx.fillStyle = 'rgba(255,241,220,0.92)';
  ctx.beginPath();
  ctx.roundRect(bx, by, w, 48, 14);
  ctx.fill();
  drawAlienText(ctx, line, bx + w / 2, by + 24, 16, '#2b1a3a');
}

function drawHpBar(ctx, s) {
  const w = 220;
  const x = s.x - w / 2;
  const y = s.y - s.r - 34;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(x, y, w, 12);
  ctx.fillStyle = '#ff7b54';
  ctx.fillRect(x, y, w * (s.hp / s.maxHp), 12);
}
