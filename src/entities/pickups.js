// pickups.js — things you grab by walking near them: coins (from bonked mobs) and the flaming sword.
// Coins hop out, then get pulled toward you like a magnet.

import { state, winRound } from '../state.js';
import { playSound } from '../audio.js';
import { coinValue } from '../twists.js';
import { toScreen, dist, rand } from '../view.js';
import { drawStar } from '../effects.js';

const MAGNET_RANGE = 130;
const MAGNET_SPEED = 420;

export function spawnCoins(x, y, count) {
  for (let i = 0; i < count; i++) {
    const a = rand(0, Math.PI * 2);
    state.pickups.push({ kind: 'coin', x, y, z: 10, vx: Math.cos(a) * rand(40, 140), vy: Math.sin(a) * rand(40, 140),
      vz: rand(200, 320), r: 8, t: rand(0, 6) });
  }
}

export function spawnSword(x, y) {
  const sword = { kind: 'sword', x, y, z: 0, vx: 0, vy: 0, vz: 0, r: 30, t: 0 };
  for (const hz of state.hazards) {             // never drop it inside a bumper post
    const d = dist(sword, hz);
    if (hz.type === 'bumper' && d < hz.r + 70) {
      const a = d > 0 ? Math.atan2(sword.y - hz.y, sword.x - hz.x) : Math.PI / 2;
      sword.x = hz.x + Math.cos(a) * (hz.r + 70);
      sword.y = hz.y + Math.sin(a) * (hz.r + 70);
    }
  }
  state.pickups.push(sword);
}

export function updatePickups(dt) {
  const hero = state.hero;
  for (const p of state.pickups) {
    p.t += dt;
    p.vz -= 900 * dt;
    p.z = Math.max(0, p.z + p.vz * dt);
    if (p.z === 0) { p.vz = Math.abs(p.vz) > 60 ? -p.vz * 0.4 : 0; p.vx *= 0.9; p.vy *= 0.9; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const d = dist(p, hero);
    if (d > 1 && d < MAGNET_RANGE && p.t > 0.4) {
      p.x += ((hero.x - p.x) / d) * MAGNET_SPEED * dt;
      p.y += ((hero.y - p.y) / d) * MAGNET_SPEED * dt;
    }
    if (d < hero.r + p.r) collect(p);
  }
  state.pickups = state.pickups.filter((p) => !p.taken);
}

function collect(p) {
  p.taken = true;
  if (p.kind === 'coin') {
    state.coins += coinValue();
    playSound('coin');
  } else {
    state.hero.flameSword = true;
    winRound();
  }
}

export function drawPickup(ctx, p, t) {
  const s = toScreen(p.x, p.y, p.z);
  if (s.s <= 0) return;
  if (p.kind === 'coin') {
    const w = (Math.abs(Math.cos(p.t * 5)) * 8 + 1) * s.s;
    ctx.fillStyle = '#ffd166';
    ctx.strokeStyle = '#b5838d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y - 8 * s.s, w, 8 * s.s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    return;
  }
  drawFlameSwordPickup(ctx, s.x, s.y - (10 + Math.sin(t * 3) * 6) * s.s, t, s.s * 1.3);
}

// The prize! A flaming sword floating point-down, with a sparkly glow.
export function drawFlameSwordPickup(ctx, x, y, t, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(255,160,0,0.25)';
  ctx.beginPath();
  ctx.arc(0, -40, 46 + Math.sin(t * 5) * 4, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 4; i++) drawStar(ctx, Math.cos(t * 2 + i * 1.6) * 44, -40 + Math.sin(t * 2 + i * 1.6) * 30, 6, '#fff3b0', t * 4);
  ctx.fillStyle = '#ffb703';
  ctx.beginPath();
  ctx.moveTo(-5, -60); ctx.lineTo(5, -60); ctx.lineTo(5, -6); ctx.lineTo(0, 4); ctx.lineTo(-5, -6);
  ctx.fill();
  for (let i = 0; i < 6; i++) {
    const yy = -56 + i * 9;
    const h = 10 + Math.sin(t * 20 + i * 1.7) * 4;
    ctx.fillStyle = i % 2 ? 'rgba(255,80,0,0.85)' : 'rgba(255,220,0,0.85)';
    ctx.beginPath();
    ctx.moveTo(-5, yy - 4); ctx.lineTo(-5 - h, yy); ctx.lineTo(-5, yy + 4);
    ctx.moveTo(5, yy - 4); ctx.lineTo(5 + h, yy); ctx.lineTo(5, yy + 4);
    ctx.fill();
  }
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(-16, -66, 32, 6);
  ctx.fillStyle = '#6b4226';
  ctx.fillRect(-4, -84, 8, 18);
  ctx.fillStyle = '#ff4d6d';
  ctx.beginPath();
  ctx.arc(0, -87, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
