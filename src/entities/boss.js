// boss.js — the Raccoon Mastermind in a giant flying ship. It sways around and sends dinos at you.
// Shows up after you bonk enough dinos (CONFIG.boss). Zap it until its health bar is empty!

import { CONFIG } from '../config.js';

export function createBoss(bossesBeaten) {
  const b = CONFIG.boss;
  const hp = b.health + bossesBeaten * b.healthGrowth;   // each comeback is tougher
  return { x: CONFIG.width / 2, y: 190, r: b.size, hp, maxHp: hp, t: 0, flash: 0,
           summonTimer: b.summonEverySeconds };
}

// Returns true when it's time for the boss to send out a dino.
export function updateBoss(boss, dt) {
  const b = CONFIG.boss;
  boss.t += dt;
  boss.flash = Math.max(0, boss.flash - dt);
  boss.x = CONFIG.width / 2 + Math.sin(boss.t * b.sway) * (CONFIG.width / 2 - boss.r - 20);
  boss.y = 190 + Math.sin(boss.t * b.sway * 2.3) * 40;
  boss.summonTimer -= dt;
  if (boss.summonTimer > 0) return false;
  boss.summonTimer = b.summonEverySeconds;
  return true;
}

export function bossIsAt(boss, x, y) {
  return Math.hypot(boss.x - x, (boss.y - y) * 1.6) < boss.r;   // the ship is wide and flat
}

export function drawBoss(ctx, boss) {
  const b = CONFIG.boss;
  const r = boss.r;
  const fur = boss.flash > 0 ? '#ffffff' : b.furColor;
  ctx.save();
  ctx.translate(boss.x, boss.y);
  // striped tail hanging over the side
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 === 0 ? fur : b.maskColor;
    ctx.beginPath();
    ctx.arc(r * 0.75 + i * r * 0.12, -r * 0.05 + i * r * 0.12 + Math.sin(boss.t * 3 + i) * 4,
            r * (0.16 - i * 0.015), 0, Math.PI * 2);
    ctx.fill();
  }
  // raccoon head: ears, face, mask, eyes, nose, sneaky grin
  ctx.fillStyle = fur;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * r * 0.15, -r * 0.55);
    ctx.lineTo(s * r * 0.35, -r * 0.85);
    ctx.lineTo(s * r * 0.42, -r * 0.45);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.4, r * 0.38, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = b.maskColor;
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.45, r * 0.34, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-r * 0.14, -r * 0.46, r * 0.06, 0, Math.PI * 2);
  ctx.arc(r * 0.14, -r * 0.46, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1026';
  ctx.beginPath();
  ctx.arc(-r * 0.13, -r * 0.45, r * 0.03, 0, Math.PI * 2);
  ctx.arc(r * 0.15, -r * 0.45, r * 0.03, 0, Math.PI * 2);
  ctx.arc(0, -r * 0.33, r * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a1026';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-r * 0.12, -r * 0.24);
  ctx.quadraticCurveTo(0, -r * 0.18, r * 0.14, -r * 0.27);
  ctx.stroke();
  // glass dome over the raccoon
  ctx.fillStyle = 'rgba(180,220,255,0.25)';
  ctx.strokeStyle = 'rgba(220,240,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.15, r * 0.55, r * 0.75, 0, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
  // the big ship
  ctx.fillStyle = b.shipColor;
  ctx.strokeStyle = CONFIG.colors.silver;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // blinking lights
  for (let i = -2; i <= 2; i++) {
    ctx.fillStyle = (Math.floor(boss.t * 4) + i) % 2 === 0 ? '#fff3b0' : '#2b2233';
    ctx.beginPath();
    ctx.arc(i * r * 0.35, r * 0.05, r * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Health bar across the top of the screen.
export function drawBossHealth(ctx, boss) {
  const w = 400, x = (CONFIG.width - w) / 2, y = 64;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(x, y, w, 18);
  ctx.fillStyle = CONFIG.boss.healthColor;
  ctx.fillRect(x, y, w * (boss.hp / boss.maxHp), 18);
  ctx.strokeStyle = CONFIG.colors.text;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, 18);
}
