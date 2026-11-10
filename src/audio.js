// audio.js — tiny synthesized sound effects made with the Web Audio API (no sound files!).
// To add a sound: add an entry to SOUNDS, then call playSound('yourName') anywhere.

import { CONFIG } from './config.js';

let audio = null;              // created on the first key press (browsers require a click/key first)
let muted = !CONFIG.soundOn;

export function unlockAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!audio && AudioCtx) audio = new AudioCtx();
  if (audio && audio.state === 'suspended') audio.resume();
}

export function toggleMute() { muted = !muted; }
export function isMuted() { return muted; }

// One beep that slides from startHz to endHz. wave: 'sine', 'square', 'triangle' or 'sawtooth'.
function tone(startHz, endHz, seconds, wave = 'square', delay = 0, vol = CONFIG.volume) {
  const t = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(startHz, t);
  osc.frequency.exponentialRampToValueAtTime(endHz, t + seconds);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + seconds);
  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + seconds);
}

const SOUNDS = {
  start:    () => { tone(330, 660, 0.12); tone(660, 990, 0.12, 'square', 0.1); },
  hit:      () => { tone(300, 80, 0.25, 'sawtooth'); },                       // "bonk!"
  levelUp:  () => { tone(523, 523, 0.1); tone(659, 659, 0.1, 'square', 0.1); tone(784, 1046, 0.2, 'square', 0.2); },
  gameOver: () => { tone(392, 370, 0.25, 'triangle'); tone(330, 311, 0.25, 'triangle', 0.25); tone(262, 130, 0.6, 'triangle', 0.5); },
  flip:     () => { tone(200, 1200, 0.35, 'sine'); },
  boss:     () => { tone(90, 60, 0.8, 'sawtooth'); tone(120, 80, 0.8, 'square', 0.1); },
  bonus:    () => { tone(784, 1568, 0.3, 'triangle'); },
  coin:     () => { tone(988, 988, 0.05, 'square'); tone(1319, 1319, 0.12, 'square', 0.05); },
  shoot:    () => { tone(600, 300, 0.07, 'triangle'); },
  pop:      () => { tone(500, 1400, 0.12, 'square'); },
  correct:  () => { tone(660, 660, 0.08, 'triangle'); tone(990, 990, 0.15, 'triangle', 0.08); },
  wrong:    () => { tone(200, 150, 0.2, 'sawtooth'); },
  mash:     () => { tone(220, 330, 0.04, 'square'); },
  beat:     () => { tone(80, 50, 0.15, 'sine'); },
  megaBonk: () => { tone(150, 40, 0.5, 'sawtooth'); tone(900, 200, 0.3, 'square', 0.05); },
  missile:  () => { tone(200, 900, 0.3, 'sawtooth'); },
  pew:      () => { tone(900, 400, 0.08, 'triangle', 0, CONFIG.volume * 0.5); },
  merge:    () => { tone(300, 600, 0.15, 'triangle'); tone(450, 900, 0.2, 'triangle', 0.12); },
  laserCharge: () => { tone(150, 1200, 1.9, 'sawtooth', 0, CONFIG.volume * 0.6); },
  laser:    () => { tone(1500, 300, 1.5, 'sawtooth'); tone(800, 100, 1.5, 'square', 0.05); },
  fry:      () => { tone(300, 1800, 0.5, 'sawtooth'); tone(450, 2400, 0.5, 'square', 0.1); },
};

// ---- Boss music: a little beat made of kick, snare, hi-hat and a bass line ----
const BASS = [55, 0, 55, 0, 65, 0, 55, 73, 55, 0, 55, 0, 82, 73, 65, 0];   // notes (Hz), 0 = rest
let musicOn = false;
let musicStep = 0;
let musicTimer = null;

export function setMusic(on) {
  musicOn = on && CONFIG.boss.musicOn;
  if (musicOn && !musicTimer && audio) musicTimer = setInterval(musicTick, 60000 / CONFIG.boss.musicTempo / 4);
  if (!musicOn && musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
}

function musicTick() {
  if (muted || !audio) return;
  const i = musicStep++ % 16;
  const v = CONFIG.boss.musicVolume;
  if (i % 4 === 0) tone(140, 45, 0.18, 'sine', 0, v * 2.5);            // kick
  if (i % 8 === 4) tone(400, 180, 0.1, 'triangle', 0, v * 1.2);        // snare-ish
  if (i % 2 === 1) tone(7000, 6000, 0.03, 'square', 0, v * 0.2);       // hi-hat
  if (BASS[i]) tone(BASS[i] * 2, BASS[i] * 2, 0.12, 'sawtooth', 0, v); // bass
}

export function playSound(name) {
  if (muted || !audio || !SOUNDS[name]) return;
  SOUNDS[name]();
}
