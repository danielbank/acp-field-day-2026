// mobLooks.js — how each mob is drawn (feet at 0,0), plus fire/ice/bonk-flash overlays and little health bars.
// To restyle a mob, edit its draw function or its color in CONFIG.mobs.

import { CONFIG } from '../config.js';
import { toScreen } from '../view.js';
import { bar } from '../ui.js';
import { drawDragon } from './dragonLook.js';

const INK = '#1a1026';
const OUTLINE = 'rgba(10,4,20,0.5)';

export function drawMob(ctx, m, t) {
  const p = toScreen(m.x, m.y, m.z);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.save();
  if (m.facing < 0) ctx.scale(-1, 1);
  LOOKS[m.kind](ctx, m, t);
  ctx.restore();
  drawStatus(ctx, m, t);
  if (m.kind !== 'dragon' && m.hp < m.maxHp) bar(ctx, -m.r, -m.r * 2.5 - 8, m.r * 2, 6, m.hp / m.maxHp, CONFIG.colors.bad);
  ctx.restore();
}

function drawStatus(ctx, m, t) {
  const h = m.kind === 'dragon' ? m.r * 1.2 : m.r;
  if (m.chill > 0) {
    ctx.fillStyle = 'rgba(142,202,230,0.4)';
    ctx.beginPath();
    ctx.ellipse(0, -h, m.r * 1.1, h * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (m.burn > 0) {
    for (let i = -1; i <= 1; i++) {
      const fh = m.r * 0.6 + Math.sin(t * 20 + i * 2) * 5;
      ctx.fillStyle = i === 0 ? 'rgba(255,200,0,0.9)' : 'rgba(255,90,0,0.85)';
      ctx.beginPath();
      ctx.moveTo(i * m.r * 0.5 - 6, -h * 1.8);
      ctx.lineTo(i * m.r * 0.5, -h * 1.8 - fh);
      ctx.lineTo(i * m.r * 0.5 + 6, -h * 1.8);
      ctx.fill();
    }
  }
  if (m.flash > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(0, -h, m.r, h, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function shape(ctx, fill, draw) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  draw();
  ctx.fill();
  ctx.stroke();
}

function eye(ctx, x, y, r, look = 1) {
  shape(ctx, '#ffffff', () => ctx.arc(x, y, r, 0, Math.PI * 2));
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(x + r * 0.3 * look, y, r * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

// A wobbly scrap robot on little treads. Sneaky ones wear a bandit bandana.
function drawJunkbot(ctx, m) {
  const r = m.r;
  ctx.rotate(Math.sin(m.t * 8) * 0.08);
  shape(ctx, '#3d405b', () => ctx.roundRect(-r * 0.8, -r * 0.45, r * 1.6, r * 0.45, r * 0.2));
  shape(ctx, CONFIG.mobs.junkbot.color, () => ctx.roundRect(-r * 0.75, -r * 1.75, r * 1.5, r * 1.35, r * 0.2));
  ctx.fillStyle = 'rgba(181,101,29,0.7)';
  ctx.beginPath();
  ctx.arc(-r * 0.4, -r * 0.7, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#adb5bd';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.75); ctx.lineTo(-r * 0.2, -r * 2.1); ctx.lineTo(r * 0.15, -r * 2.3);
  ctx.stroke();
  ctx.fillStyle = '#ff4d6d';
  ctx.beginPath();
  ctx.arc(r * 0.15, -r * 2.3, 4, 0, Math.PI * 2);
  ctx.fill();
  if (m.sneaky) {
    ctx.fillStyle = 'rgba(43,45,66,0.9)';
    ctx.fillRect(-r * 0.75, -r * 1.42, r * 1.5, r * 0.36);
  }
  eye(ctx, r * 0.15, -r * 1.25, r * 0.3);
}

// A bouncy, squishy slime blob with a happy face.
function drawGoo(ctx, m) {
  const r = m.r;
  const squash = 1 + Math.sin(m.t * 10) * 0.08;
  shape(ctx, CONFIG.mobs.goo.color, () => ctx.ellipse(0, -r * 0.7, r * squash, (r * 0.75) / squash, 0, 0, Math.PI * 2));
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.35, -r * 1.0, r * 0.22, r * 0.12, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(r * 0.05, -r * 0.8, r * 0.1, 0, Math.PI * 2);
  ctx.arc(r * 0.45, -r * 0.8, r * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(r * 0.25, -r * 0.6, r * 0.15, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

// A little flying dragon with flappy wings (a warm-up for the big one).
function drawBabyDragon(ctx, m) {
  const r = m.r;
  const flap = Math.sin(m.t * 14) * r * 0.7;
  const c = CONFIG.mobs.babyDragon.color;
  shape(ctx, '#ff595e', () => { ctx.moveTo(-r * 0.2, -r); ctx.lineTo(-r * 1.2, -r * 1.6 - flap); ctx.lineTo(-r * 0.7, -r * 0.8); ctx.closePath(); });
  shape(ctx, c, () => { ctx.moveTo(-r * 0.7, -r * 0.8); ctx.quadraticCurveTo(-r * 1.6, -r * 0.6, -r * 1.5, -r * 1.2); ctx.lineTo(-r * 0.6, -r * 1.0); ctx.closePath(); });
  shape(ctx, c, () => ctx.ellipse(0, -r * 0.9, r * 0.8, r * 0.6, 0, 0, Math.PI * 2));
  shape(ctx, '#ffd166', () => ctx.ellipse(r * 0.15, -r * 0.75, r * 0.45, r * 0.35, 0, 0, Math.PI * 2));
  shape(ctx, c, () => ctx.arc(r * 0.8, -r * 1.35, r * 0.5, 0, Math.PI * 2));
  shape(ctx, '#fff1d0', () => { ctx.moveTo(r * 0.6, -r * 1.75); ctx.lineTo(r * 0.5, -r * 2.2); ctx.lineTo(r * 0.85, -r * 1.8); ctx.closePath(); });
  shape(ctx, '#ff595e', () => { ctx.moveTo(r * 0.3, -r * 1.0); ctx.lineTo(r * 0.5, -r * 1.6 + flap); ctx.lineTo(r * 0.9, -r * 0.9); ctx.closePath(); });
  eye(ctx, r * 0.95, -r * 1.45, r * 0.18);
}

// A round bug with a fuse on its back. When the fuse is lit it puffs up and blinks.
function drawBeetle(ctx, m, t) {
  const r = m.r;
  const lit = m.fuse >= 0;
  const swell = lit ? 1 + (1 - m.fuse / CONFIG.mobs.beetle.fuseSeconds) * 0.35 : 1;
  ctx.scale(swell, swell);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i++) {
    const step = Math.sin(m.t * 20 + i) * 3;
    ctx.beginPath();
    ctx.moveTo(i * r * 0.5, -r * 0.3); ctx.lineTo(i * r * 0.6 + step, 0);
    ctx.stroke();
  }
  const blink = lit && Math.floor(t * 12) % 2 === 0;
  shape(ctx, blink ? '#ffffff' : CONFIG.mobs.beetle.color, () => ctx.ellipse(0, -r * 0.6, r, r * 0.7, 0, Math.PI, 0));
  ctx.fillStyle = INK;
  for (const [x, y] of [[-0.45, -0.75], [0.1, -1.0], [0.45, -0.6]]) {
    ctx.beginPath();
    ctx.arc(x * r, y * r, r * 0.13, 0, Math.PI * 2);
    ctx.fill();
  }
  shape(ctx, INK, () => ctx.arc(r * 0.95, -r * 0.5, r * 0.35, 0, Math.PI * 2));
  eye(ctx, r * 1.05, -r * 0.6, r * 0.13);
  ctx.strokeStyle = '#d4a373';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-r * 0.3, -r * 1.25); ctx.quadraticCurveTo(-r * 0.6, -r * 1.7, -r * 0.2, -r * 1.8);
  ctx.stroke();
  if (lit || Math.sin(t * 9 + m.t) > 0) {
    ctx.fillStyle = lit ? '#ffee32' : '#ff9f1c';
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 1.85, lit ? 6 : 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

const LOOKS = { junkbot: drawJunkbot, goo: drawGoo, babyDragon: drawBabyDragon, beetle: drawBeetle, dragon: drawDragon };
