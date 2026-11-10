// dragonLook.js — draws Scorchy the cartoon dragon (feet at 0,0, facing right) and its warning circles.
// Colors live in CONFIG.dragon.

import { CONFIG } from '../config.js';
import { state } from '../state.js';
import { floorEllipse } from '../view.js';

const D = CONFIG.dragon;
const OUTLINE = 'rgba(10,4,20,0.55)';

function shape(ctx, fill, draw) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  draw();
  ctx.fill();
  ctx.stroke();
}

export function drawDragon(ctx, d) {
  const s = d.r / 70;
  ctx.scale(s, s);
  const flap = Math.sin(d.t * (d.z > 0 ? 14 : 4)) * 18;
  const breathe = Math.sin(d.t * 3) * 2;
  const dark = '#1f6f66';

  // tail with a spade tip
  shape(ctx, D.bodyColor, () => {
    ctx.moveTo(-40, -35); ctx.quadraticCurveTo(-110, -10, -125, -55 + Math.sin(d.t * 3) * 8);
    ctx.lineTo(-118, -60); ctx.quadraticCurveTo(-100, -30, -40, -60); ctx.closePath();
  });
  shape(ctx, D.wingColor, () => {
    const y = -55 + Math.sin(d.t * 3) * 8;
    ctx.moveTo(-122, y - 2); ctx.lineTo(-142, y - 14); ctx.lineTo(-136, y + 8); ctx.closePath();
  });
  // back wing
  shape(ctx, D.wingColor, () => {
    ctx.moveTo(-5, -95); ctx.lineTo(-30, -175 - flap); ctx.lineTo(-60, -125); ctx.lineTo(-45, -100); ctx.closePath();
  });
  // back legs
  shape(ctx, dark, () => ctx.roundRect(-42, -26, 24, 26, 8));
  shape(ctx, dark, () => ctx.roundRect(22, -26, 24, 26, 8));
  // body + belly
  shape(ctx, D.bodyColor, () => ctx.ellipse(0, -60 + breathe, 62, 46, 0, 0, Math.PI * 2));
  shape(ctx, D.bellyColor, () => ctx.ellipse(14, -48 + breathe, 38, 28, 0, 0, Math.PI * 2));
  // back spikes
  ctx.fillStyle = D.wingColor;
  for (let i = 0; i < 4; i++) {
    const x = -40 + i * 22;
    ctx.beginPath();
    ctx.moveTo(x - 8, -98 + Math.abs(i - 1.5) * 6); ctx.lineTo(x, -116 + Math.abs(i - 1.5) * 6); ctx.lineTo(x + 8, -98 + Math.abs(i - 1.5) * 6);
    ctx.fill();
  }
  // front legs
  shape(ctx, D.bodyColor, () => ctx.roundRect(-30, -24, 22, 24, 8));
  shape(ctx, D.bodyColor, () => ctx.roundRect(34, -24, 22, 24, 8));
  // front wing
  shape(ctx, D.wingColor, () => {
    ctx.moveTo(5, -90); ctx.lineTo(-10, -170 - flap); ctx.lineTo(-45, -120); ctx.lineTo(-25, -95); ctx.closePath();
  });
  // neck and head
  shape(ctx, D.bodyColor, () => ctx.ellipse(48, -100, 22, 36, 0.5, 0, Math.PI * 2));
  drawHead(ctx, d);
}

function drawHead(ctx, d) {
  const hero = state.hero;
  const look = hero ? Math.sign(hero.y - d.y) : 0;
  shape(ctx, '#fff1d0', () => { ctx.moveTo(56, -150); ctx.lineTo(48, -180); ctx.lineTo(68, -155); ctx.closePath(); });
  shape(ctx, '#fff1d0', () => { ctx.moveTo(74, -152); ctx.lineTo(72, -182); ctx.lineTo(88, -152); ctx.closePath(); });
  shape(ctx, D.bodyColor, () => ctx.ellipse(76, -132, 34, 26, 0, 0, Math.PI * 2));
  shape(ctx, D.bodyColor, () => ctx.ellipse(104, -122, 22, 16, 0, 0, Math.PI * 2));
  ctx.fillStyle = '#1a1026';
  ctx.beginPath();
  ctx.arc(116, -128, 3, 0, Math.PI * 2);
  ctx.fill();
  // big eye with a determined eyebrow
  shape(ctx, '#ffffff', () => ctx.arc(78, -140, 10, 0, Math.PI * 2));
  ctx.fillStyle = '#1a1026';
  ctx.beginPath();
  ctx.arc(81, -139 + look * 3, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1a1026';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(66, -156); ctx.lineTo(90, -150);
  ctx.stroke();
  // mouth (glows before fire breath)
  if (d.mouthGlow > 0) {
    ctx.fillStyle = 'rgba(255,160,0,0.5)';
    ctx.beginPath();
    ctx.arc(122, -114, 18 + Math.sin(d.t * 30) * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffee32';
    ctx.beginPath();
    ctx.arc(122, -114, 8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#1a1026';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(90, -112); ctx.quadraticCurveTo(108, -106, 124, -114);
    ctx.stroke();
  }
}

// Red warning circles on the floor: "the dragon is about to swipe / land here!"
export function drawDragonWarnings(ctx, t) {
  for (const m of state.mobs) {
    if (m.kind !== 'dragon' || !m.telegraph) continue;
    const pulse = 0.35 + Math.sin(t * 14) * 0.15;
    ctx.fillStyle = `rgba(255,77,109,${pulse * 0.5})`;
    ctx.strokeStyle = m.telegraph.color;
    ctx.lineWidth = 4;
    floorEllipse(ctx, m.x, m.y, m.telegraph.r);
    ctx.fill();
    ctx.stroke();
  }
}
