// bossfight.js — Stage 4: DJ SPUDZ! Dodge his beat-bombs and MASH SPACE to charge a MEGA-TOT.
// A full charge launches it at him. Bonk him enough times to finish the lap.

import { CONFIG } from '../config.js';
import { state, showBanner, addPopup } from '../state.js';
import { playSound } from '../audio.js';
import { gainXp, mashPower } from '../rpg.js';
import { spawnFaller } from '../entities/faller.js';
import { spawnTot, drawTot } from '../entities/tot.js';
import { createSpudz, updateSpudz, drawSpudz } from '../entities/spudz.js';
import { drawCrowd } from '../entities/crowd.js';
import { text } from '../text.js';

const B = CONFIG.boss;
const MEGA_SIZE = 34;

function dropBeatBomb(s) {
  const f = spawnFaller(state.lap, 1);
  Object.assign(f, { look: 'beatBomb', r: 24, spin: 0, x: s.x + (Math.random() - 0.5) * s.r * 2, y: s.y + s.r,
                     vy: B.beatBombSpeed + (state.lap - 1) * 20 });
  state.fallers.push(f);
  playSound('beat');
}

function launchMegaTot() {
  const hero = state.hero;
  state.megaTot = spawnTot(hero.x, hero.y - hero.h / 2, MEGA_SIZE);
  state.megaTot.vy = -520;
  state.charge = 0;
  playSound('shoot');
  addPopup('MEGA-TOT!', hero.x, hero.y - 80, CONFIG.colors.accent);
}

function bonkSpudz(s) {
  s.hp -= 1;
  s.hurtTimer = 0.7;
  state.megaTot = null;
  playSound('megaBonk');
  gainXp(B.bonkXp, s.x, s.y);
  if (s.hp > 0) return showBanner('BONK!', 0.8);
  state.fallers = [];
  gainXp(B.defeatXp, s.x, s.y + 40);
  showBanner(CONFIG.text.bossBonked.replace('{boss}', B.name), 2.5);
  playSound('bonus');
}

export const bossfight = {
  road: true,
  coins: false,
  title: () => CONFIG.text.bossStage.replace('{boss}', B.name),
  junkEvery: () => 0,
  start() {
    state.spudz = createSpudz(state.lap);
    state.charge = 0;
    playSound('boss');
  },
  update(dt) {
    const s = state.spudz;
    updateSpudz(s, dt);
    if (s.hp <= 0) {
      state.stageDoneTimer += dt;
      return state.stageDoneTimer > 2.5;
    }
    s.bombTimer -= dt;
    if (s.bombTimer <= 0) {
      s.bombTimer = Math.max(0.45, B.beatBombEverySeconds - (state.lap - 1) * 0.1);
      dropBeatBomb(s);
    }
    const mt = state.megaTot;
    if (!mt) {
      if (state.presses > 0) {
        state.charge += state.presses * mashPower();
        playSound('mash');
      }
      state.charge = Math.max(0, state.charge - B.chargeDrainPerSecond * dt);
      if (state.charge >= 100) launchMegaTot();
    } else {
      mt.y += mt.vy * dt;
      mt.x += (s.x - mt.x) * Math.min(1, dt * 3);   // the mega-tot homes in on him
      if (Math.hypot(mt.x - s.x, mt.y - s.y) < mt.r + s.r * 0.8) bonkSpudz(s);
    }
    return false;
  },
  onFry() {                                        // the fry move fully charges the mega-tot
    if (!state.megaTot && state.spudz.hp > 0) state.charge = 100;
  },
  drawBehind(ctx) {
    const s = state.spudz;
    drawCrowd(ctx, state.time, s.hurtTimer > 0 || s.hp <= 0);
  },
  draw(ctx) {
    drawSpudz(ctx, state.spudz);
    if (state.megaTot) drawTot(ctx, state.megaTot);
    if (state.spudz.hp > 0 && !state.megaTot) drawChargeMeter(ctx);
  },
};

function drawChargeMeter(ctx) {
  const w = 320;
  const x = CONFIG.width / 2 - w / 2;
  const y = 470;
  const pulse = 0.7 + 0.3 * Math.sin(state.time * 12);
  text(ctx, 'MASH SPACE!', CONFIG.width / 2, y - 24, 28, CONFIG.colors.accent);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(x, y, w, 22);
  ctx.globalAlpha = 1;
  ctx.fillStyle = CONFIG.tots.color;
  ctx.fillRect(x, y, w * Math.min(1, state.charge / 100), 22);
  ctx.strokeStyle = CONFIG.colors.text;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, 22);
}
