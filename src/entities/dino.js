// dino.js — friendly dinos on mini flying skateboards that zoom toward you. Bonk them first!
// Each type in CONFIG.dinoTypes moves its own way (see MOVES). They grow bigger as they get closer.

import { CONFIG } from '../config.js';

const rand = (min, max) => min + Math.random() * (max - min);

// How each dino type wiggles around while it flies at you (t = seconds alive).
const MOVES = {
  zigzag: (d) => { d.x = d.baseX + Math.sin(d.t * 4) * 120; },
  swoop:  (d) => { d.y = d.baseY + Math.sin(d.t * 2.5) * 130; },
  speedy: () => {},                                                   // straight at you, fast!
  tank:   (d) => { d.x = d.baseX + Math.sin(d.t * 0.8) * 40; },       // big, slow and tough
  sneaky: (d) => { d.x = d.baseX + Math.sin(d.t * 1.3) * 200;         // fades in and out
                   d.alpha = 0.2 + 0.8 * Math.abs(Math.sin(d.t * 1.5)); },
};

// Makes a new dino. Pass x, y to launch it from a spot (the boss does this).
export function spawnDino(level, x = rand(150, CONFIG.width - 150), y = rand(120, 360)) {
  const kinds = Object.keys(CONFIG.dinoTypes);
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  const type = CONFIG.dinoTypes[kind];
  return { kind, type, x, y, baseX: x, baseY: y, t: 0, closeness: 0, alpha: 1,
           hp: type.hp, flash: 0, facing: Math.random() < 0.5 ? 1 : -1,
           speed: type.speed * (1 + (level - 1) * CONFIG.dino.fasterPerLevel) / CONFIG.dino.arriveSeconds };
}

// Returns true when the dino reaches you (and bonks you).
export function updateDino(d, dt) {
  d.t += dt;
  d.closeness += d.speed * dt;          // 0 = far away, 1 = right in your face
  d.flash = Math.max(0, d.flash - dt);
  (MOVES[d.kind] || MOVES.speedy)(d);
  return d.closeness >= 1;
}

// How big the dino looks right now: tiny when far, full size when close.
export function dinoRadius(d) {
  return d.type.size * (0.2 + 0.8 * d.closeness);
}

// A cartoon dinosaur (side view) standing on a mini skateboard, centered on (0, 0).
export function drawDino(ctx, d) {
  const r = dinoRadius(d);
  const color = d.flash > 0 ? '#ffffff' : d.type.color;
  const ink = '#1a1026';
  ctx.save();
  ctx.globalAlpha = d.alpha;
  ctx.translate(d.x, d.y);
  // mini flying skateboard (drawn before flipping so the hp dots stay readable)
  ctx.fillStyle = CONFIG.dino.skateboardColor;
  ctx.beginPath();
  ctx.roundRect(-r * 0.95, r * 0.72, r * 1.9, r * 0.2, r * 0.1);
  ctx.fill();
  ctx.save();
  ctx.scale(d.facing, 1);   // some dinos face left, some face right

  // back spikes, from tail to head
  ctx.fillStyle = CONFIG.dino.spikeColor;
  for (const [sx, sy] of [[-0.55, -0.02], [-0.25, -0.2], [0.05, -0.22], [0.3, -0.45]]) {
    ctx.beginPath();
    ctx.moveTo(r * (sx - 0.12), r * (sy + 0.08));
    ctx.lineTo(r * sx, r * (sy - 0.18));
    ctx.lineTo(r * (sx + 0.12), r * (sy + 0.08));
    ctx.fill();
  }
  ctx.fillStyle = color;
  // long tail
  ctx.beginPath();
  ctx.moveTo(-r * 0.3, -r * 0.05);
  ctx.quadraticCurveTo(-r * 0.9, r * 0.05, -r * 1.15, -r * 0.1 + Math.sin(d.t * 5) * r * 0.08);
  ctx.quadraticCurveTo(-r * 0.8, r * 0.35, -r * 0.2, r * 0.4);
  ctx.fill();
  // legs
  ctx.fillRect(-r * 0.3, r * 0.3, r * 0.2, r * 0.42);
  ctx.fillRect(r * 0.1, r * 0.3, r * 0.2, r * 0.42);
  // body
  ctx.beginPath();
  ctx.ellipse(0, r * 0.15, r * 0.5, r * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  // neck and head with a long snout
  ctx.beginPath();
  ctx.ellipse(r * 0.32, -r * 0.15, r * 0.2, r * 0.3, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(r * 0.55, -r * 0.42, r * 0.42, r * 0.24, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // tiny arms waving
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.09;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(r * 0.38, r * 0.1);
  ctx.lineTo(r * 0.6, r * (0.12 + Math.sin(d.t * 8) * 0.1));
  ctx.stroke();
  // big friendly eye, nostril, and a smile
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(r * 0.5, -r * 0.52, r * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(r * 0.53, -r * 0.52, r * 0.055, 0, Math.PI * 2);
  ctx.arc(r * 0.88, -r * 0.47, r * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(2, r * 0.04);
  ctx.beginPath();
  ctx.moveTo(r * 0.45, -r * 0.33);
  ctx.quadraticCurveTo(r * 0.7, -r * 0.22, r * 0.9, -r * 0.36);
  ctx.stroke();
  ctx.restore();

  // tough dinos show how many zaps they have left
  if (d.type.hp > 1) {
    ctx.fillStyle = '#ffe066';
    for (let i = 0; i < d.hp; i++) {
      ctx.beginPath();
      ctx.arc((i - (d.hp - 1) / 2) * r * 0.3, r * 1.1, r * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
