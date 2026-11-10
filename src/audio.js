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
export function getAudio() { return audio; }   // music.js uses this to play notes
export function isMuted() { return muted; }

// One beep that slides from startHz to endHz. wave: 'sine', 'square', 'triangle' or 'sawtooth'.
// loud: how many times louder than normal (the game-over alarm uses this).
function tone(startHz, endHz, seconds, wave = 'square', delay = 0, loud = 1) {
  const t = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(startHz, t);
  osc.frequency.exponentialRampToValueAtTime(endHz, t + seconds);
  gain.gain.setValueAtTime(Math.min(1, CONFIG.volume * loud), t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + seconds);
  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + seconds);
}

const SOUNDS = {
  start:      () => { tone(330, 660, 0.12); tone(660, 990, 0.12, 'square', 0.1); },
  hit:        () => { tone(300, 80, 0.25, 'sawtooth'); },                       // "bonk!"
  gameOver:   () => { tone(392, 370, 0.25, 'triangle'); tone(330, 311, 0.25, 'triangle', 0.25); tone(262, 130, 0.6, 'triangle', 0.5); },
  jump:       () => { tone(300, 700, 0.18, 'square'); },
  megaJump:   () => { tone(200, 1400, 0.45, 'square'); },
  smash:      () => { tone(900, 120, 0.15, 'sawtooth'); tone(500, 90, 0.2, 'square', 0.03); },
  bump:       () => { tone(180, 60, 0.2, 'square'); tone(700, 1200, 0.15, 'triangle', 0.08); },
  coin:       () => { tone(988, 988, 0.06, 'square'); tone(1319, 1319, 0.12, 'square', 0.06); },
  powerup:    () => { tone(523, 1046, 0.12); tone(659, 1318, 0.12, 'square', 0.1); tone(784, 1568, 0.2, 'square', 0.2); },
  turbo:      () => { tone(100, 900, 0.5, 'sawtooth'); },
  checkpoint: () => { tone(523, 523, 0.1); tone(659, 659, 0.1, 'square', 0.1); tone(784, 1046, 0.25, 'square', 0.2); },
  zap:        () => { tone(1200, 400, 0.08, 'triangle'); },
  pop:        () => { tone(600, 1800, 0.12, 'sine'); },
  wave:       () => { tone(90, 60, 0.8, 'sawtooth'); tone(120, 80, 0.8, 'square', 0.1); },
  bonus:      () => { tone(784, 1568, 0.3, 'triangle'); tone(1046, 2093, 0.3, 'triangle', 0.15); },
  splat:      () => { tone(250, 90, 0.2, 'sine'); },
  gun:        () => { tone(260, 90, 0.05, 'square', 0, 0.5); },
  fall:       () => { tone(900, 80, 1.3, 'sine'); },
  tow:        () => { tone(200, 900, 0.5, 'triangle'); tone(400, 1800, 0.5, 'sine', 0.1); },
  alarm:      () => {                                                      // WEE-OO WEE-OO!
    for (let i = 0; i < 4; i++) {
      tone(650, 1300, 0.3, 'sawtooth', i * 0.6, CONFIG.alarmLoudness);
      tone(1300, 650, 0.3, 'sawtooth', i * 0.6 + 0.3, CONFIG.alarmLoudness);
    }
  },
};

export function playSound(name) {
  if (muted || !audio || !SOUNDS[name]) return;
  SOUNDS[name]();
}
