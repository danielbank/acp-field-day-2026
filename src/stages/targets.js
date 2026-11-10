// targets.js — Stage 2: target practice! Hold SPACE to fire tater tots at floating bullseyes.
// Hit enough targets (or run out of time) to move on.

import { CONFIG } from '../config.js';
import { state } from '../state.js';
import { input } from '../input.js';
import { playSound } from '../audio.js';
import { gainXp, chargeFry, totSize, fireCooldown } from '../rpg.js';
import { spawnTot } from '../entities/tot.js';
import { spawnTarget, updateTarget, drawTarget } from '../entities/target.js';
import { text } from '../text.js';
import { airAlt } from '../view3d.js';

const S = CONFIG.targets;
const goal = () => S.toHit + (state.lap - 1) * S.extraPerLap;

function hitTarget(tg) {
  state.hits += 1;
  gainXp(S.xp, tg.x, tg.y);
  chargeFry(2);
  playSound('pop');
}

export const targets = {
  coins: false,
  title: () => CONFIG.text.targetsStage,
  hint: CONFIG.text.targetsHint,
  junkEvery: () => S.junkEverySeconds,
  start() {
    state.hits = 0;
  },
  update(dt) {
    // fire tots while SPACE is held
    state.fireTimer -= dt;
    if ((input.fire || state.presses > 0) && state.fireTimer <= 0) {
      const hero = state.hero;
      state.tots.push(spawnTot(hero.x, hero.y - hero.h / 2, totSize()));
      state.fireTimer = fireCooldown();
      playSound('shoot');
    }
    // keep a few targets floating around
    while (state.targets.length < S.onScreen && state.hits + state.targets.length < goal()) {
      state.targets.push(spawnTarget());
    }
    for (const tg of state.targets) updateTarget(tg, dt);
    // tot hits target
    state.targets = state.targets.filter((tg) => {
      const tot = state.tots.find((t) => Math.hypot(t.x - tg.x, t.y - tg.y) < t.r + tg.r);
      if (!tot) return true;
      tot.y = -9999;                       // used-up tot flies away
      hitTarget(tg);
      return false;
    });
    return state.hits >= goal() || state.stageTime >= S.maxSeconds;
  },
  onFry() {
    for (const tg of state.targets) hitTarget(tg);
    state.targets = [];
  },
  missileTargets: () => state.targets,
  onMissileHit(tg) {
    hitTarget(tg);
    state.targets = state.targets.filter((t) => t !== tg);
  },
  sprites(list) {
    for (const tg of state.targets) list.push({ obj: tg, alt: airAlt(tg.y), draw: drawTarget });
  },
  drawOverlay(ctx) {
    text(ctx, `TARGETS ${state.hits} / ${goal()}`, CONFIG.width / 2, 92, 24, CONFIG.colors.silver);
  },
};
