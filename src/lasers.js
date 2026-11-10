// lasers.js — zap! Click (or F) fires twin lasers from the skateboard at the crosshair.
// Lasers hit instantly where you aim; whatever is there gets bonked into a puff of stars.

import { CONFIG } from './config.js';
import { state, showBanner } from './state.js';
import { playSound } from './audio.js';
import { horizonY } from './entities/hero.js';
import { dinoRadius } from './entities/dino.js';
import { bossIsAt } from './entities/boss.js';

export function fireLaser() {
  const L = CONFIG.laser;
  const hero = state.hero;
  if (state.laserCooldown > 0) return;
  state.laserCooldown = L.cooldown;
  state.lasers.push({ x: hero.aimX, y: hero.aimY, timeLeft: L.beamSeconds });
  playSound('laser');

  // did we hit a dino? (the world bobs with the horizon, so shift them the same way)
  // If two overlap, the closest one gets zapped.
  const shift = horizonY(hero) - CONFIG.height / 2;
  const hits = state.dinos.filter((d) =>
    Math.hypot(d.x - hero.aimX, d.y + shift - hero.aimY) < dinoRadius(d) + L.aimForgiveness);
  if (hits.length === 0) return zapBoss(shift);
  const target = hits.reduce((a, b) => (b.closeness > a.closeness ? b : a));
  target.hp -= 1;
  target.flash = 0.1;
  if (target.hp > 0) return playSound('hit');
  state.dinos = state.dinos.filter((d) => d !== target);
  state.score += target.type.points;
  state.dinosBonked += 1;
  state.pops.push({ x: target.x, y: target.y + shift, timeLeft: 0.5 });
  playSound('zapBonk');
}

// No dino in the way? Maybe we hit the boss!
function zapBoss(shift) {
  const boss = state.boss;
  if (!boss || !bossIsAt(boss, state.hero.aimX, state.hero.aimY - shift)) return;
  boss.hp -= 1;
  boss.flash = 0.1;
  if (boss.hp > 0) return playSound('hit');
  // boss beaten: big star burst, bonus points, and it'll come back tougher later
  for (const dx of [-80, 0, 80]) state.pops.push({ x: boss.x + dx, y: boss.y + shift, timeLeft: 0.5 });
  state.score += CONFIG.boss.bonus;
  state.bossesBeaten += 1;
  state.nextBossAt = state.dinosBonked + CONFIG.boss.dinosToSummon;
  state.boss = null;
  showBanner(CONFIG.text.bossBeaten.replace('{bonus}', CONFIG.boss.bonus));
  playSound('bonus');
}

export function updateLasers(dt) {
  state.laserCooldown = Math.max(0, state.laserCooldown - dt);
  for (const b of state.lasers) b.timeLeft -= dt;
  for (const p of state.pops) p.timeLeft -= dt;
  state.lasers = state.lasers.filter((b) => b.timeLeft > 0);
  state.pops = state.pops.filter((p) => p.timeLeft > 0);
}

export function drawLasers(ctx) {
  const L = CONFIG.laser;
  const W = CONFIG.width, H = CONFIG.height;
  // twin beams from the board's nose to where you aimed
  ctx.strokeStyle = L.color;
  ctx.lineCap = 'round';
  for (const b of state.lasers) {
    ctx.lineWidth = 10 * (b.timeLeft / L.beamSeconds);
    ctx.beginPath();
    ctx.moveTo(W / 2 - 70, H - 90);
    ctx.lineTo(b.x, b.y);
    ctx.moveTo(W / 2 + 70, H - 90);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  // "bonk!" puffs of stars that spread out and fade
  ctx.fillStyle = L.popColor;
  for (const p of state.pops) {
    const grow = 1 - p.timeLeft / 0.5;
    ctx.globalAlpha = p.timeLeft / 0.5;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      drawStar(ctx, p.x + Math.cos(a) * grow * 60, p.y + Math.sin(a) * grow * 60, 9);
    }
  }
  ctx.globalAlpha = 1;
}

function drawStar(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const len = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
  }
  ctx.closePath();
  ctx.fill();
}
