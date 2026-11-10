// audio.js — tiny synthesized sound effects made with the Web Audio API (no sound files!).
// To add a sound: add an entry to SOUNDS, then call playSound('yourName') anywhere.

import { CONFIG } from './config.js';

let audio = null;              // created on the first key press (browsers require a click/key first)
let muted = !CONFIG.soundOn;
const lastPlayed = {};         // so 20 bonks in one frame don't make one giant noise

export function unlockAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!audio && AudioCtx) audio = new AudioCtx();
  if (audio && audio.state === 'suspended') audio.resume();
}

export function toggleMute() { muted = !muted; }
export function isMuted() { return muted; }

// One beep that slides from startHz to endHz. wave: 'sine', 'square', 'triangle' or 'sawtooth'.
function tone(startHz, endHz, seconds, wave = 'square', delay = 0, loud = 1) {
  const t = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(startHz, t);
  osc.frequency.exponentialRampToValueAtTime(endHz, t + seconds);
  gain.gain.setValueAtTime(CONFIG.volume * loud, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + seconds);
  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + seconds);
}

const SOUNDS = {
  start:    () => { tone(330, 660, 0.12); tone(660, 990, 0.12, 'square', 0.1); },
  swing:    () => { tone(700, 250, 0.08, 'triangle', 0, 0.6); },
  heavySwing: () => { tone(420, 90, 0.22, 'sawtooth', 0, 0.7); },
  zap:      () => { tone(1400, 500, 0.07, 'square', 0, 0.4); },
  bonk:     () => { tone(260, 120, 0.07, 'square', 0, 0.6); },
  poof:     () => { tone(700, 120, 0.15, 'triangle'); },
  hurt:     () => { tone(300, 80, 0.25, 'sawtooth'); },
  coin:     () => { tone(988, 988, 0.05, 'square', 0, 0.5); tone(1319, 1319, 0.1, 'square', 0.05, 0.5); },
  buy:      () => { tone(660, 660, 0.06); tone(880, 880, 0.06, 'square', 0.06); tone(1320, 1320, 0.12, 'square', 0.12); },
  nope:     () => { tone(160, 120, 0.2, 'sawtooth', 0, 0.7); },
  boing:    () => { tone(180, 700, 0.15, 'sine'); },
  trap:     () => { tone(400, 900, 0.1, 'triangle'); },
  spin:     () => { tone(300, 900, 0.25, 'sawtooth', 0, 0.6); },
  heal:     () => { tone(523, 523, 0.08, 'sine'); tone(659, 659, 0.08, 'sine', 0.08); tone(1046, 1046, 0.2, 'sine', 0.16); },
  shield:   () => { tone(400, 1200, 0.3, 'sine', 0, 0.5); },
  spit:     () => { tone(900, 300, 0.1, 'triangle', 0, 0.4); },
  roar:     () => { tone(110, 60, 0.9, 'sawtooth'); tone(140, 70, 0.9, 'square', 0.1, 0.6); },
  fire:     () => { tone(220, 70, 0.7, 'sawtooth', 0, 0.6); },
  stomp:    () => { tone(120, 35, 0.4, 'square'); },
  wave:     () => { tone(523, 523, 0.1); tone(659, 659, 0.1, 'square', 0.1); tone(784, 1046, 0.2, 'square', 0.2); },
  door:     () => { tone(500, 700, 0.08, 'triangle'); tone(700, 1000, 0.1, 'triangle', 0.08); },
  victory:  () => { [523, 659, 784, 1046, 784, 1046].forEach((hz, i) => tone(hz, hz, 0.16, 'square', i * 0.13)); },
  gameOver: () => { tone(392, 370, 0.25, 'triangle'); tone(330, 311, 0.25, 'triangle', 0.25); tone(262, 130, 0.6, 'triangle', 0.5); },
};

export function playSound(name) {
  if (muted || !audio || !SOUNDS[name]) return;
  const now = audio.currentTime;
  if (now - (lastPlayed[name] ?? -1) < 0.05) return;
  lastPlayed[name] = now;
  SOUNDS[name]();
}
