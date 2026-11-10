// game.js — the rules of a round: driving, the clock, checkpoints, smashing, health, falling, the gatling and alien waves.
// updateGame() runs every frame while playing; gameAction() handles jump / turbo / spawn presses.

import { CONFIG } from './config.js';
import { state, showBanner, endRound } from './state.js';
import { input } from './input.js';
import { playSound } from './audio.js';
import { SEG, curveAt } from './road.js';
import { updateCar, jumpCar, useTurbo } from './entities/car.js';
import { thingSize, makeThing } from './entities/things.js';
import { startWave, updateWave } from './entities/aliens.js';
import { updateGatling } from './gatling.js';
import { spawnAhead, spawnNearby } from './spawner.js';
import { applyPowerup, tickPowerups, addPoints, pullCoins } from './powerups.js';
import { addCoins } from './shop.js';
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
  if (action === 'start' || action === 'tap') return true;   // in a wave: holding SPACE fires the gatling
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
  updateFalling(dt);
  tickPowerups(dt);
  pullCoins(dt);
  moveThings(dt);
  spawnAhead();
  if (!car.falling) checkHits();
  updateClockAndCheckpoints(dt);
  if (state.waveIn > 0 && (state.waveIn -= dt) <= 0 && !state.wave) beginWave();
  if (state.wave) updateAliens(dt);
  updateGun(dt);

  // score for driving, and stars sliding sideways on curves
  const pct = car.speed / CONFIG.car.maxSpeed;
  state.score += CONFIG.scorePerSecond * pct * dt * (state.powers.star > 0 ? CONFIG.powerups.star.multiplier : 1);
  state.skyX += curveAt(Math.floor(car.z / SEG)) * pct * dt * 25;

  state.things = state.things.filter((o) => !o.gone && o.z > car.z - 3000);
  state.flash = Math.max(0, state.flash - dt);
  updateEffects(dt);
  if (state.banner && (state.banner.timeLeft -= dt) <= 0) state.banner = null;
}

// Drive off the edge of the road and you tumble into space… until the tow beam drops you back on.
function updateFalling(dt) {
  const car = state.car;
  if (car.falling > 0) {
    car.falling -= dt;
    if (car.falling <= 0) towBack(car);
  } else if (car.y <= 0 && Math.abs(car.x) > CONFIG.car.edge) {
    car.falling = CONFIG.car.fallSeconds;
    car.y = -1;
    car.vy = 0;
    playSound('fall');
    popup('WHOOOOAAA!', CONFIG.width / 2, 260, CONFIG.colors.warning);
  }
}

function towBack(car) {
  Object.assign(car, { falling: 0, x: 0, y: 900, vy: 0, spin: 0, hurt: CONFIG.invincibleSeconds });
  car.speed = Math.max(car.speed, 3000);
  playSound('tow');
  showBanner(CONFIG.text.towBeam, 1.4);
  takeDamage(CONFIG.health.fallDamage);
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
    else if (o.kind === 'crate' || o.kind === 'cone' || o.kind === 'barrel') smash(o, false);
    else if (o.kind === 'traffic') bumpTraffic(o, false);
    else if (o.kind === 'coin') collectCoin(o);
    else if (o.kind === 'powerup') { o.gone = true; applyPowerup(o.power); burst(o.screen?.x ?? 480, o.screen?.y ?? 450, 24); }
  }
}

function pointsPopup(o, points, colors, label = '+') {
  const gained = addPoints(points);
  if (o.screen) {
    burst(o.screen.x, o.screen.y - 20, 18, colors);
    popup(`${label}${gained}`, o.screen.x, o.screen.y - 40, CONFIG.colors.text);
  }
}

function collectCoin(o) {
  o.gone = true;
  playSound('coin');
  pointsPopup(o, T.coin.points, DEBRIS.coin);
  if (state.mode === 'race') {
    state.coinsThisRace += CONFIG.shop.coinValue;
    addCoins(CONFIG.shop.coinValue);
  }
}

// Crates, cones and barrels burst into confetti. (byGoo = blasted by the gatling, so you don't slow down)
function smash(o, byGoo) {
  o.gone = true;
  playSound('smash');
  pointsPopup(o, T[o.kind].points * (state.car.turbo > 0 ? CONFIG.turboSmashBonus : 1), DEBRIS[o.kind]);
  if (!byGoo) state.car.speed *= 0.92;
}

function bumpTraffic(o, byGoo) {
  const side = o.x >= state.car.x ? 1 : -1;
  o.flying = { vx: side * 3, vy: 2500, angle: 0, spin: side * 8, time: 1.2 };
  playSound('bump');
  pointsPopup(o, T.traffic.points * (state.car.turbo > 0 ? CONFIG.turboSmashBonus : 1), [o.color, '#ffffff'], 'BONK! +');
  if (!byGoo) state.car.speed *= 0.85;
}

// Ouch! Lose some health, spin out and slow down.
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
  takeDamage(CONFIG.health[`${o.kind}Damage`] ?? 20);
}

// Free Play never hurts. In a race, empty health = game over.
function takeDamage(amount) {
  if (state.mode === 'sandbox' || state.screen !== 'playing') return;
  state.health = Math.max(0, state.health - amount);
  state.flash = 0.35;   // red flash on the screen
  if (state.health <= 0) endRound(CONFIG.text.outOfHealth);
}

function updateClockAndCheckpoints(dt) {
  if (state.mode !== 'race' || state.screen !== 'playing') return;
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
  const events = updateWave(state.wave, state.car, dt);
  for (const s of events.slimes) {
    state.things.push(makeThing('slime', s.z, s.x, { h: s.h, vz: state.car.speed + 4500 }));
    playSound('splat');
  }
  if (events.cleared) {
    const gained = addPoints(A.clearBonus);
    showBanner(CONFIG.text.waveCleared.replace('{points}', gained), 2, CONFIG.colors.good);
    playSound('bonus');
    burst(480, 250, 60);
    if (state.mode === 'race') {
      state.coinsThisRace += CONFIG.shop.waveBonusCoins;
      addCoins(CONFIG.shop.waveBonusCoins);
    }
    state.wave = null;
  } else if (events.gone) {
    showBanner(CONFIG.text.waveEscaped, 1.6);
    state.wave = null;
  }
}

// Hold X (or SPACE / touch during alien waves) to fire the goo gatling.
function updateGun(dt) {
  const firing = input.gun || (state.wave && (input.fire || input.pointerX !== null));
  const events = updateGatling(state, dt, firing && !state.car.falling);
  if (events.fired) playSound('gun');
  for (const o of events.hits) {
    if (o.kind === 'blob') popBlob(o);
    else if (o.kind === 'traffic') bumpTraffic(o, true);
    else if (o.kind === 'rock') {
      o.gone = true;
      playSound('smash');
      pointsPopup(o, CONFIG.gatling.rockPoints, DEBRIS.rock);
    } else smash(o, true);
  }
}

function popBlob(b) {
  b.alive = false;
  playSound('pop');
  pointsPopup(b, CONFIG.aliens.points, [b.color, '#ffffff']);
}
