// dragon.js — the boss! Scorchy walks, breathes fire, swipes its tail, and dives from the sky.
// Bonk it out and it drops the flaming sword. Numbers live in CONFIG.dragon; looks in dragonLook.js.

import { CONFIG } from '../config.js';
import { state, showBanner } from '../state.js';
import { hurtHero, pushHero, blast, killMob } from '../combat.js';
import { dist, angleTo, angleDiff, clamp } from '../view.js';
import { playSound } from '../audio.js';
import { fireMobShot } from './projectiles.js';
import { createMob } from './mobs.js';
import { spawnSword } from './pickups.js';
import { addRing } from '../effects.js';
import { blockProps } from './props.js';

const D = CONFIG.dragon;

export function createDragon(loop) {
  const hp = D.hp * (1 + (loop - 1) * CONFIG.newGamePlus.hpBoostPerLoop);
  return {
    kind: 'dragon', z: D.diveHeight, r: D.size,
    x: clamp(state.hero.x, D.size, CONFIG.arena.width - D.size), y: clamp(state.hero.y - 380, 200, CONFIG.arena.depth - 100),
    hp, maxHp: hp, damage: D.touchDamage, coins: D.coins, points: D.points,
    t: 0, vx: 0, vy: 0, burn: 0, chill: 0, flash: 0, spikeCd: 0, facing: 1, dead: false,
    // it starts by crashing down from the sky
    phase: 'dive', step: 'drop', phaseTime: 0, attackCount: 0, summoned: false,
    breathAngle: 0, flameTimer: 0, mouthGlow: 0, telegraph: null,
  };
}

function startPhase(d, phase) {
  d.phase = phase;
  d.step = 'windup';
  d.phaseTime = 0;
  d.telegraph = null;
}

function nextAttack(d) {
  d.attackCount += 1;
  if (dist(d, state.hero) < D.swipeRadius + 40) return startPhase(d, 'swipe');
  startPhase(d, d.attackCount % 2 ? 'breath' : 'dive');
}

export function updateDragon(d, dt, slow) {
  const hero = state.hero;
  d.phaseTime += dt;
  d.mouthGlow = Math.max(0, d.mouthGlow - dt);
  if (d.z < D.untouchableHeight) d.facing = hero.x >= d.x ? 1 : -1;

  if (!d.summoned && d.hp < d.maxHp * D.summonAtHealth) {
    d.summoned = true;
    for (let i = 0; i < D.summonCount; i++) {
      state.mobs.push(createMob('babyDragon', d.x + (i - 1) * 80, d.y - 40, state.loop));
    }
    showBanner(CONFIG.text.dragonSummons);
    playSound('roar');
  }

  PHASES[d.phase](d, dt, slow, hero);
  d.x = clamp(d.x, d.r, CONFIG.arena.width - d.r);
  d.y = clamp(d.y, 140, CONFIG.arena.depth - 60);
  if (d.z < 30) blockProps(d);
  if (d.z < 30 && dist(d, hero) < d.r * 0.8 + hero.r) hurtHero(D.touchDamage, d);
}

const PHASES = {
  walk(d, dt, slow, hero) {
    if (dist(d, hero) > 230) {
      const a = angleTo(d, hero);
      d.x += Math.cos(a) * D.speed * slow * dt;
      d.y += Math.sin(a) * D.speed * slow * dt;
    }
    if (d.phaseTime > D.walkSeconds) nextAttack(d);
  },

  breath(d, dt, slow, hero) {
    const want = angleTo(d, hero);
    if (d.step === 'windup') {
      d.mouthGlow = 0.2;
      d.breathAngle = want;
      if (d.phaseTime > D.breathWindup) { d.step = 'blow'; d.phaseTime = 0; playSound('fire'); }
      return;
    }
    d.breathAngle += clamp(angleDiff(want, d.breathAngle), -1.2 * dt, 1.2 * dt);   // slowly follows you
    d.mouthGlow = 0.2;
    d.flameTimer -= dt;
    while (d.flameTimer <= 0) {
      d.flameTimer += D.flameEvery;
      const wobble = Math.sin(d.t * 9 + d.phaseTime * 30) * 0.18;
      fireMobShot({ x: d.x + d.facing * d.r * 0.9, y: d.y, z: 0, r: 10 }, d.breathAngle + wobble,
        { kind: 'flame', speed: D.flameSpeed, damage: D.flameDamage, r: 14, life: 0.9, z: 60 });
    }
    if (d.phaseTime > D.breathSeconds) startPhase(d, 'walk');
  },

  swipe(d, dt, slow, hero) {
    d.telegraph = { r: D.swipeRadius, color: '#ff4d6d' };
    if (d.phaseTime < D.swipeWindup) return;
    blast(d.x, d.y, D.swipeRadius, D.swipeDamage, 0, '#ff4d6d');
    if (dist(d, hero) < D.swipeRadius + hero.r) pushHero(angleTo(d, hero), 700);
    state.shake = 0.25;
    playSound('stomp');
    startPhase(d, 'walk');
  },

  dive(d, dt, slow, hero) {
    if (d.step === 'windup') {                  // fly up out of sight
      d.z += 900 * dt;
      if (d.z >= D.diveHeight) { d.step = 'aim'; d.phaseTime = 0; }
    } else if (d.step === 'aim') {              // its shadow chases you…
      d.telegraph = { r: D.diveRadius, color: '#ff4d6d' };
      const a = angleTo(d, hero);
      const sp = Math.min(320 * slow, dist(d, hero) / dt);
      d.x += Math.cos(a) * sp * dt;
      d.y += Math.sin(a) * sp * dt;
      if (d.phaseTime > D.diveAimSeconds) { d.step = 'drop'; d.phaseTime = 0; }
    } else {                                    // …then KA-THUD!
      d.telegraph = { r: D.diveRadius, color: '#ff4d6d' };
      d.z -= 1500 * dt;
      if (d.z <= 0) {
        d.z = 0;
        blast(d.x, d.y, D.diveRadius, D.diveDamage, 2, '#ffd166');
        state.shake = 0.35;
        playSound('stomp');
        startPhase(d, 'walk');
      }
    }
  },
};

// The dragon is bonked out: everybody else poofs, and the flaming sword drops.
export function dragonBonked(d) {
  for (const m of state.mobs) if (m !== d) killMob(m);
  state.projectiles = state.projectiles.filter((p) => p.owner === 'hero');
  spawnSword(d.x, d.y);
  addRing(d.x, d.y, 200, '#ffd166', 0.8);
  state.waveState = 'won';
  state.shake = 0.5;
  showBanner(CONFIG.text.dragonBonked, 3);
  playSound('roar');
}
