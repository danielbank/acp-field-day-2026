// race.js — Stage 1: race down the dusty road to the destination, grabbing coins and dodging junk.
// The destination planet grows bigger as you get closer.

import { CONFIG } from '../config.js';
import { state } from '../state.js';
import { drawAlienText } from '../alien.js';

export const race = {
  road: true,
  coins: true,
  title: () => CONFIG.text.raceStage.replace('{place}', CONFIG.race.destination),
  junkEvery: () => Math.max(CONFIG.fastestSpawnSeconds,
    CONFIG.spawnEverySeconds - (state.lap - 1) * CONFIG.spawnFasterPerLap),
  start() {},
  update() {
    return state.stageTime >= CONFIG.race.seconds;
  },
  drawBehind(ctx) {
    const progress = Math.min(1, state.stageTime / CONFIG.race.seconds);
    // destination planet peeking over the top, growing as we get close
    const r = 40 + progress * 110;
    const cx = CONFIG.width / 2;
    const cy = 20 - r * 0.3 + progress * 30;
    ctx.fillStyle = '#6a8f4e';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4e6e38';
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy + r * 0.2, r * 0.25, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.4, cy - r * 0.1, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    // alien road sign with the destination name
    const signY = cy + r + 26;
    const w = CONFIG.race.destination.length * 24 + 30;
    ctx.fillStyle = '#5c3a22';
    ctx.fillRect(cx - w / 2, signY - 20, w, 40);
    ctx.strokeStyle = CONFIG.colors.alien;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - w / 2, signY - 20, w, 40);
    drawAlienText(ctx, CONFIG.race.destination, cx, signY, 16, CONFIG.colors.alien);
    // progress bar along the right edge
    const barH = 300;
    const barX = CONFIG.width - 26;
    const barY = 120;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(barX, barY, 10, barH);
    ctx.fillStyle = CONFIG.colors.accent;
    ctx.fillRect(barX, barY + barH * (1 - progress), 10, barH * progress);
  },
};
