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
function tone(startHz, endHz, seconds, wave = 'square', delay = 0) {
  const t = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(startHz, t);
  osc.frequency.exponentialRampToValueAtTime(endHz, t + seconds);
  gain.gain.setValueAtTime(CONFIG.volume, t);
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
  flap:     () => { tone(500, 850, 0.08, 'triangle'); },                     // "whoosh" up
};

export function playSound(name) {
  if (muted || !audio || !SOUNDS[name]) return;
  SOUNDS[name]();
}
