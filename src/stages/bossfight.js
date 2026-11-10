// bossfight.js — Stage 4: DJ SPUDZ! Mash SPACE to shoot tots AND charge the MEGA-TOT.
// His tater-tot helpers shoot back and can combine into big potatoes with heat-seeking missiles.
// Beat him within 30 seconds or he fires his BIG LASER down one lane, so steer out of the way!

import { CONFIG } from '../config.js';
import { state, showBanner, addPopup } from '../state.js';
import { playSound } from '../audio.js';
import { gainXp, mashPower, bonkHero, difficulty, totSize } from '../rpg.js';
import { spawnTot, drawTot } from '../entities/tot.js';
import { createSpudz, updateSpudz, drawSpudz } from '../entities/spudz.js';
import { createMinion, updateMinion, drawMinion } from '../entities/minion.js';
import { fans, drawFan } from '../entities/crowd.js';
import { text } from '../text.js';
import { project, airAlt } from '../view3d.js';

const B = CONFIG.boss;
const MEGA_SIZE = 34;

// A shot flying from the boss side toward the car (it uses the faller list, so bonks just work).
function shoot(x, y, r, look, speed, homing = false) {
  state.fallers.push({ x, y, r, vy: speed, angle: 0, spin: 0, spikes: [], look, air: true, homing });
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
  state.minions = [];
  s.laserPhase = null;
  gainXp(B.defeatXp, s.x, s.y + 40);
  showBanner(CONFIG.text.bossBonked.replace('{boss}', B.name), 2.5);
  playSound('bonus');
}

function hurtMinion(m, damage) {
  m.hp -= damage;
  m.hurtTimer = 0.2;
  playSound('pop');
  if (m.hp <= 0) {
    m.dead = true;
    gainXp(m.big ? 4 : 1, m.x, m.y);
  }
}

// Helpers appear, circle, shoot, and every so often two small ones combine into a BIG potato.
function updateMinions(s, dt, rate) {
  s.minionTimer -= dt;
  if (s.minionTimer <= 0 && state.minions.length < B.maxMinions) {
    state.minions.push(createMinion(s));
    s.minionTimer = B.minionEverySeconds;
  }
  s.mergeTimer -= dt;
  if (s.mergeTimer <= 0) {
    s.mergeTimer = B.mergeEverySeconds;
    const smalls = state.minions.filter((m) => !m.big);
    if (smalls.length >= 2) {
      state.minions = state.minions.filter((m) => m !== smalls[0] && m !== smalls[1]);
      state.minions.push(createMinion(s, true));
      addPopup(CONFIG.text.merged, s.x, s.y + 200, CONFIG.colors.warning);
      playSound('merge');
    }
  }
  for (const m of state.minions) {
    updateMinion(m, s, dt);
    m.shootTimer -= dt * rate;
    if (m.shootTimer > 0) continue;
    if (m.big) {
      shoot(m.x, m.y, 26, 'potatoMissile', B.potatoMissileSpeed, true);
      m.shootTimer = B.bigPotatoMissileSeconds;
      playSound('missile');
    } else {
      shoot(m.x, m.y, 16, 'pellet', B.minionShotSpeed);
      m.shootTimer = B.minionShootSeconds;
      playSound('pew');
    }
  }
  // your tots pop the helpers
  for (const m of state.minions) {
    const tot = state.tots.find((t) => Math.hypot(t.x - m.x, t.y - m.y) < t.r + m.r);
    if (tot) {
      tot.y = -9999;
      hurtMinion(m, 1);
    }
  }
  state.minions = state.minions.filter((m) => !m.dead);
}

// The 30-second laser: warning stripe, then a big beam down one lane.
function updateLaser(s, dt) {
  const hero = state.hero;
  if (!s.laserPhase) {
    s.laserTimer -= dt;
    if (s.laserTimer > 0) return;
    Object.assign(s, { laserPhase: 'warn', laserTime: 0, laserX: hero.x });
    showBanner(CONFIG.text.laserWarning, 1.5);
    return playSound('laserCharge');
  }
  s.laserTime += dt;
  if (s.laserPhase === 'warn' && s.laserTime >= B.laserWarnSeconds) {
    Object.assign(s, { laserPhase: 'fire', laserTime: 0 });
    playSound('laser');
  } else if (s.laserPhase === 'fire') {
    if (Math.abs(hero.x - s.laserX) < B.laserWidth / 2 + hero.w * 0.35) bonkHero(B.laserXpLoss);
    if (s.laserTime >= B.laserFireSeconds) Object.assign(s, { laserPhase: null, laserTimer: B.laserSeconds });
  }
}

export const bossfight = {
  coins: false,
  title: () => CONFIG.text.bossStage.replace('{boss}', B.name),
  hint: CONFIG.text.bossHint,
  junkEvery: () => 0,
  start() {
    state.spudz = createSpudz(state.lap, difficulty().bossHp);
    state.charge = 0;
    playSound('boss');
  },
  update(dt) {
    const s = state.spudz;
    updateSpudz(s, dt);
    state.bossMusic = s.hp > 0;
    if (s.hp <= 0) {
      state.stageDoneTimer += dt;
      return state.stageDoneTimer > 2.5;
    }
    const rate = difficulty().enemyFireRate;
    s.bombTimer -= dt * rate;
    if (s.bombTimer <= 0) {
      s.bombTimer = Math.max(0.45, B.beatBombEverySeconds - (state.lap - 1) * 0.1);
      shoot(s.x + (Math.random() - 0.5) * s.r * 2, s.y + s.r, 24, 'beatBomb', B.beatBombSpeed + (state.lap - 1) * 20);
      playSound('beat');
    }
    updateMinions(s, dt, rate);
    updateLaser(s, dt);
    const mt = state.megaTot;
    if (!mt) {
      if (state.presses > 0) {                       // every mash shoots a tot AND charges the mega-tot
        const hero = state.hero;
        state.tots.push(spawnTot(hero.x, hero.y - hero.h / 2, totSize()));
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
  onFry() {                                        // the fry move pops every helper and fully charges the mega-tot
    for (const m of state.minions) hurtMinion(m, 99);
    state.minions = [];
    if (!state.megaTot && state.spudz.hp > 0) state.charge = 100;
  },
  missileTargets: () => (state.spudz.hp > 0 ? [...state.minions, state.spudz] : []),
  onMissileHit(obj) {
    if (obj !== state.spudz) return hurtMinion(obj, 2);
    if (!state.megaTot) state.charge += B.missileCharge;
    addPopup(`+${B.missileCharge} CHARGE`, obj.x, obj.y, CONFIG.colors.accent);
  },
  sprites(list) {
    const s = state.spudz;
    const cheering = s.hurtTimer > 0 || s.hp <= 0;
    for (const f of fans) list.push({ obj: f, alt: 18, draw: (ctx, o) => drawFan(ctx, o, state.time, cheering) });
    list.push({ obj: s, alt: airAlt(s.y), mul: 4, draw: drawSpudz });
    for (const m of state.minions) list.push({ obj: m, alt: airAlt(m.y), draw: drawMinion });
    if (state.megaTot) list.push({ obj: state.megaTot, alt: airAlt(state.megaTot.y), draw: drawTot });
  },
  drawEffects(ctx) {
    drawLaser(ctx, state.spudz);
  },
  drawOverlay(ctx) {
    const s = state.spudz;
    if (s.hp <= 0) return;
    if (!state.megaTot) drawChargeMeter(ctx);
    if (!s.laserPhase) {
      const secs = Math.ceil(s.laserTimer);
      text(ctx, CONFIG.text.laserIn.replace('{s}', secs), CONFIG.width / 2, 62, 22,
        secs <= 5 ? CONFIG.colors.warning : CONFIG.colors.silver);
    }
  },
};

// The laser lane on the road (flashing while it warns, blazing when it fires) and the beam from the boss.
function drawLaser(ctx, s) {
  if (!s.laserPhase) return;
  const hw = B.laserWidth / 2;
  const nearY = state.hero.y + 25;
  const corners = [project(s.laserX - hw, s.y, 0), project(s.laserX + hw, s.y, 0),
                   project(s.laserX + hw, nearY, 0), project(s.laserX - hw, nearY, 0)];
  if (corners.some((c) => !c)) return;
  const fire = s.laserPhase === 'fire';
  ctx.save();
  ctx.globalAlpha = fire ? 0.85 : 0.25 + 0.25 * Math.sin(s.laserTime * 20);
  ctx.fillStyle = B.laserColor;
  ctx.beginPath();
  corners.forEach((c) => ctx.lineTo(c.x, c.y));
  ctx.fill();
  if (fire) {
    const mouth = project(s.x, s.y, airAlt(s.y));
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin(s.laserTime * 40);
    for (const [color, shrink] of [[B.laserColor, 1], ['#fff3f6', 0.4]]) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(mouth.x - 14 * shrink, mouth.y);
      ctx.lineTo(mouth.x + 14 * shrink, mouth.y);
      ctx.lineTo(corners[2].x - (corners[2].x - corners[3].x) * (1 - shrink) / 2, corners[2].y);
      ctx.lineTo(corners[3].x + (corners[2].x - corners[3].x) * (1 - shrink) / 2, corners[3].y);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawChargeMeter(ctx) {
  const w = 320;
  const x = CONFIG.width / 2 - w / 2;
  const y = CONFIG.height - 130;
  const pulse = 0.7 + 0.3 * Math.sin(state.time * 12);
  text(ctx, 'MASH SPACE!', CONFIG.width / 2, y - 22, 26, CONFIG.colors.accent);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(x, y, w, 22);
  ctx.globalAlpha = 1;
  ctx.fillStyle = CONFIG.tots.color;
  ctx.fillRect(x, y, w * Math.min(1, state.charge / 100), 22);
  ctx.strokeStyle = CONFIG.colors.text;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, 22);
}
