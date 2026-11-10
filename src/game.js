// game.js — the rules of a round: driving, the clock, checkpoints, smashing, bonks, powerups and alien waves.
// updateGame() runs every frame while playing; gameAction() handles jump / zap / turbo / spawn presses.

import { CONFIG } from './config.js';
import { state, showBanner, endRound } from './state.js';
import { input } from './input.js';
import { playSound } from './audio.js';
import { SEG, curveAt } from './road.js';
import { updateCar, jumpCar, useTurbo } from './entities/car.js';
import { thingSize, makeThing } from './entities/things.js';
import { startWave, updateWave } from './entities/aliens.js';
import { spawnAhead, spawnNearby } from './spawner.js';
import { applyPowerup, tickPowerups, addPoints, pullCoins } from './powerups.js';
import { burst, popup, updateEffects } from './effects.js';

const T = CONFIG.things;
const DEBRIS = {
  rock: ['#8d84a8', '#e0aaff'], crate: ['#c98a3c', '#6b4219'], cone: ['#ff8c42', '#ffffff'],
  barrel: ['#3ddc97', '#f2ecff'], coin: ['#ffd23f', '#fff4b8'],
};

// One-time button presses while driving. Returns true if the press was used here.
export function gameAction(action) {
  const car = state.car;
  if ((action === 'start' || action === 'tap') && !state.wave) {
    const mega = state.powers.spring;
    if (jumpCar(car, mega ? CONFIG.powerups.spring.jumpBoost : 1)) {
      state.powers.spring = false;
      playSound(mega ? 'megaJump' : 'jump');
    }
    return true;
  }
  if (action === 'start' || action === 'tap') return true;   // in a wave: holding SPACE fires
  if (action === 'turbo') {
    if (useTurbo(car)) { playSound('turbo'); showBanner('TURBO!', 0.8, CONFIG.colors.good); }
    return true;
  }
  if (action.startsWith('spawn') && state.mode === 'sandbox') {
    const key = Number(action.slice(5));
    if (key === 5 && !state.wave) beginWave();
    else spawnNearby(key);
    return true;
  }
  return false;
}

export function updateGame(dt) {
  const car = state.car;
  const lastCarZ = car.z;
  for (const o of state.things) o.before = o.z - lastCarZ;   // to tell when we drive past something

  updateCar(car, dt, input);
  tickPowerups(dt);
  pullCoins(dt);
  moveThings(dt);
  spawnAhead();
  checkHits();
  updateClockAndCheckpoints(dt);
  if (state.waveIn > 0 && (state.waveIn -= dt) <= 0 && !state.wave) beginWave();
  if (state.wave) updateAliens(dt);

  // score for driving, and stars sliding sideways on curves
  const pct = car.speed / CONFIG.car.maxSpeed;
  state.score += CONFIG.scorePerSecond * pct * dt * (state.powers.star > 0 ? CONFIG.powerups.star.multiplier : 1);
  state.skyX += curveAt(Math.floor(car.z / SEG)) * pct * dt * 25;

  state.things = state.things.filter((o) => !o.gone && o.z > car.z - 3000);
  updateEffects(dt);
  if (state.banner && (state.banner.timeLeft -= dt) <= 0) state.banner = null;
}

function moveThings(dt) {
  for (const o of state.things) {
    if (o.kind === 'traffic' && !o.flying) o.z += T.traffic.speed * dt;
    if (o.flying) {                       // bumped traffic tumbling off the road
      o.x += o.flying.vx * dt;
      o.h = Math.max(0, o.h + o.flying.vy * dt);
      o.flying.vy -= 6000 * dt;
      o.flying.angle += o.flying.spin * dt;
      o.flying.time -= dt;
      if (o.flying.time <= 0) o.gone = true;
    }
    if (o.kind === 'slime' && o.h > 0) {  // slime drop falling (and flying forward) onto the road
      o.h = Math.max(0, o.h - 1600 * dt);
      o.z += o.vz * dt;
    }
  }
}

// Did the car touch this thing? (sideways and up/down)
function touching(o) {
  const s = thingSize(o);
  const car = state.car;
  const sideways = Math.abs(o.x - car.x) * CONFIG.road.width;
  if (sideways > ((s.w + CONFIG.car.width) / 2) * 0.8) return false;
  return car.y < o.h + s.tall * 0.85 && car.y + CONFIG.car.height > o.h;
}

function checkHits() {
  const car = state.car;
  for (const o of state.things) {
    if (o.gone || o.flying) continue;
    const ahead = o.z - car.z;
    const length = o.kind === 'hole' ? T.hole.length : 0;
    if (!(o.before > -length / 2 && ahead + length / 2 <= 0)) continue;   // didn't pass it this frame
    if (o.kind === 'hole') {
      if (car.y < 60) bonk(o);
      continue;
    }
    if (o.kind === 'ramp') {
      const onIt = Math.abs(o.x - car.x) * CONFIG.road.width < T.ramp.size / 2 + 100;
      if (onIt && jumpCar(car, T.ramp.jumpBoost)) { playSound('megaJump'); popup('WHEEE!', 480, 380, CONFIG.colors.good); }
      continue;
    }
    if (!touching(o)) continue;
    if (o.kind === 'rock' || (o.kind === 'slime' && o.h === 0)) bonk(o);
    else if (o.kind === 'crate' || o.kind === 'cone' || o.kind === 'barrel') smash(o);
    else if (o.kind === 'traffic') bumpTraffic(o);
    else if (o.kind === 'coin') collect(o, T.coin.points, 'coin');
    else if (o.kind === 'powerup') { o.gone = true; applyPowerup(o.power); burst(o.screen?.x ?? 480, o.screen?.y ?? 450, 24); }
  }
}

function collect(o, points, sound) {
  o.gone = true;
  const gained = addPoints(points);
  playSound(sound);
  if (o.screen) {
    burst(o.screen.x, o.screen.y, 8, DEBRIS[o.kind] || DEBRIS.coin);
    popup(`+${gained}`, o.screen.x, o.screen.y - 30, CONFIG.colors.text);
  }
}

function smash(o) {
  const turbo = state.car.turbo > 0 ? CONFIG.turboSmashBonus : 1;
  collect(o, T[o.kind].points * turbo, 'smash');
  if (o.screen) burst(o.screen.x, o.screen.y - 20, 22, DEBRIS[o.kind]);
  state.car.speed *= 0.92;
}

function bumpTraffic(o) {
  const side = o.x >= state.car.x ? 1 : -1;
  o.flying = { vx: side * 3, vy: 2500, angle: 0, spin: side * 8, time: 1.2 };
  const turbo = state.car.turbo > 0 ? CONFIG.turboSmashBonus : 1;
  const gained = addPoints(T.traffic.points * turbo);
  playSound('bump');
  if (o.screen) popup(`BONK! +${gained}`, o.screen.x, o.screen.y - 60, CONFIG.colors.good);
  state.car.speed *= 0.85;
}

// Ouch! Lose a life (not in Free Play), spin out and slow down.
function bonk(o) {
  const car = state.car;
  if (car.hurt > 0) return;
  car.hurt = CONFIG.invincibleSeconds;
  car.spin = 0.8;
  car.speed *= 0.35;
  if (o.kind === 'hole') { car.vy = 1500; car.y = 0.01; }   // bounce back out of the space hole
  if (o.kind === 'rock' || o.kind === 'slime') {
    o.gone = true;
    if (o.screen) burst(o.screen.x, o.screen.y - 20, 16, DEBRIS.rock);
  }
  playSound('hit');
  if (state.mode === 'sandbox') return;
  state.lives -= 1;
  if (state.lives <= 0) endRound(CONFIG.text.outOfLives);
}

function updateClockAndCheckpoints(dt) {
  if (state.mode !== 'race') return;
  if (!state.wave) state.timeLeft -= dt;   // the clock pauses while you fight alien blobs
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    endRound(CONFIG.text.timeUp);
    return;
  }
  if (state.car.z < state.nextCheckpointZ) return;
  state.checkpoints += 1;
  state.level += 1;
  state.timeLeft += CONFIG.checkpointBonusTime;
  state.nextCheckpointZ += CONFIG.checkpointEverySegments * SEG;
  state.gateSpawned = false;
  playSound('checkpoint');
  burst(480, 260, 40);
  showBanner(CONFIG.text.checkpoint.replace('{time}', CONFIG.checkpointBonusTime), 1.8, CONFIG.colors.good);
  if (CONFIG.aliens.on && state.checkpoints % CONFIG.aliens.everyCheckpoints === 0 && !state.wave) {
    state.waveIn = 1.8;   // blobs arrive right after the checkpoint banner
  }
}

function beginWave() {
  state.wave = startWave(state.level);
  state.things = state.things.filter((o) => o.z - state.car.z < 3000 || (o.kind !== 'rock' && o.kind !== 'hole'));
  showBanner(CONFIG.text.waveStart, 2.2);
  playSound('wave');
}

function updateAliens(dt) {
  const A = CONFIG.aliens;
  const firing = input.fire || input.pointerX !== null;
  const events = updateWave(state.wave, state.car, dt, firing);
  if (events.fired) playSound('zap');
  for (const b of events.popped) {
    const gained = addPoints(A.points);
    playSound('pop');
    if (b.screen) {
      burst(b.screen.x, b.screen.y, 26, [b.color, '#ffffff']);
      popup(`+${gained}`, b.screen.x, b.screen.y - 40, b.color);
    }
  }
  for (const s of events.slimes) {
    state.things.push(makeThing('slime', s.z, s.x, { h: s.h, vz: state.car.speed + 4500 }));
    playSound('splat');
  }
  if (events.cleared) {
    const gained = addPoints(A.clearBonus);
    showBanner(CONFIG.text.waveCleared.replace('{points}', gained), 2, CONFIG.colors.good);
    playSound('bonus');
    burst(480, 250, 60);
    state.wave = null;
  } else if (events.gone) {
    showBanner(CONFIG.text.waveEscaped, 1.6);
    state.wave = null;
  }
}
