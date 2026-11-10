// race.js — Stage 1: race down the dusty road to the destination, grabbing coins and dodging junk.
// The destination planet rises over the horizon and alien road signs whiz past.

import { CONFIG } from '../config.js';
import { state } from '../state.js';
import { drawAlienText } from '../alien.js';
import { ROAD_LEFT, ROAD_RIGHT } from '../track.js';
import { HORIZON } from '../view3d.js';

const progress = () => Math.min(1, state.stageTime / CONFIG.race.seconds);

function spawnSign() {
  const words = CONFIG.race.signWords;
  const left = Math.random() < 0.5;
  state.signs.push({ x: left ? ROAD_LEFT - 110 : ROAD_RIGHT + 110, y: -60, r: 60,
                     word: words[Math.floor(Math.random() * words.length)] });
}

// A roadside post with a rusty board and alien writing.
function drawSign(ctx, s) {
  ctx.fillStyle = '#3a2416';
  ctx.fillRect(s.x - 5, s.y - 10, 10, 70);
  const w = s.word.length * 27 + 30;
  ctx.fillStyle = '#5c3a22';
  ctx.fillRect(s.x - w / 2, s.y - 60, w, 52);
  ctx.strokeStyle = CONFIG.colors.alien;
  ctx.lineWidth = 3;
  ctx.strokeRect(s.x - w / 2, s.y - 60, w, 52);
  drawAlienText(ctx, s.word, s.x, s.y - 34, 18, CONFIG.colors.alien);
}

export const race = {
  coins: true,
  title: () => CONFIG.text.raceStage.replace('{place}', CONFIG.race.destination),
  junkEvery: () => Math.max(CONFIG.fastestSpawnSeconds,
    CONFIG.spawnEverySeconds - (state.lap - 1) * CONFIG.spawnFasterPerLap),
  start() {
    state.signTimer = 0;
  },
  update(dt) {
    state.signTimer -= dt;
    if (state.signTimer <= 0) {
      spawnSign();
      state.signTimer = CONFIG.race.signEverySeconds;
    }
    for (const s of state.signs) s.y += CONFIG.roadScrollSpeed * dt;
    state.signs = state.signs.filter((s) => s.y < CONFIG.height + 100);
    return state.stageTime >= CONFIG.race.seconds;
  },
  // destination planet rising over the horizon, growing as we get close
  drawSky(ctx) {
    const r = 40 + progress() * 140;
    const cx = CONFIG.width / 2 - (state.hero.x - CONFIG.width / 2) * 0.15;
    const cy = HORIZON + 20 - r * (0.4 + progress() * 0.4);
    const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
    g.addColorStop(0, '#a8d08d');
    g.addColorStop(0.7, '#5f8a45');
    g.addColorStop(1, '#2f4a22');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  },
  sprites(list) {
    for (const s of state.signs) list.push({ obj: s, alt: 60, draw: drawSign });
  },
  drawOverlay(ctx) {
    const barH = 300;
    const barX = CONFIG.width - 26;
    const barY = 120;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(barX, barY, 10, barH);
    ctx.fillStyle = CONFIG.colors.accent;
    ctx.fillRect(barX, barY + barH * (1 - progress()), 10, barH * progress());
  },
};
