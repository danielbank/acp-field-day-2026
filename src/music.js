// music.js — background music made from the note lists in CONFIG.music (no music files!).
// updateMusic() runs every frame and schedules the next few notes a tiny bit ahead of time.

import { CONFIG } from './config.js';
import { getAudio, isMuted } from './audio.js';

const NOTE_NUMBERS = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6,
                       G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };

let step = 0;
let nextTime = 0;
let noise = null;   // a short burst of static, used for snare and hi-hat

// 'A4' → 440 (how many times per second the speaker wiggles). Returns null for '-' or typos.
function noteToHz(note) {
  const match = /^([A-G][#b]?)(\d)$/.exec(String(note).trim());
  if (!match || NOTE_NUMBERS[match[1]] === undefined) return null;
  const midi = 12 * (Number(match[2]) + 1) + NOTE_NUMBERS[match[1]];
  return 440 * 2 ** ((midi - 69) / 12);
}

function playNote(audio, hz, t, seconds, wave, volume) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(hz, t);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + seconds);
  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + seconds);
}

function playNoise(audio, t, seconds, volume) {
  if (!noise) {
    noise = audio.createBuffer(1, audio.sampleRate * 0.3, audio.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = audio.createBufferSource();
  const gain = audio.createGain();
  src.buffer = noise;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + seconds);
  src.connect(gain).connect(audio.destination);
  src.start(t);
  src.stop(t + seconds);
}

function playDrum(audio, name, t, volume) {
  if (name === 'kick') {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    gain.gain.setValueAtTime(volume * 3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain).connect(audio.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }
  if (name === 'snare') playNoise(audio, t, 0.15, volume * 1.5);
  if (name === 'hat') playNoise(audio, t, 0.04, volume * 0.6);
}

function playStep(audio, t, stepSeconds) {
  const M = CONFIG.music;
  const pick = (list) => (list && list.length ? list[step % list.length] : '-');
  const melodyHz = noteToHz(pick(M.melody));
  const bassHz = noteToHz(pick(M.bass));
  if (melodyHz) playNote(audio, melodyHz, t, stepSeconds * 0.9, M.melodySound, M.volume);
  if (bassHz) playNote(audio, bassHz, t, stepSeconds * 1.6, M.bassSound, M.volume * 1.4);
  playDrum(audio, pick(M.drums), t, M.volume);
}

// playing = is the race on screen right now?  fast = alien wave happening?
export function updateMusic(playing, fast) {
  const audio = getAudio();
  const M = CONFIG.music;
  if (!audio || !M.on || isMuted() || !playing) { nextTime = 0; return; }
  const stepSeconds = 60 / (fast ? M.waveSpeed : M.speed) / 2;   // each step is half a beat
  if (nextTime < audio.currentTime) nextTime = audio.currentTime + 0.05;
  while (nextTime < audio.currentTime + 0.15) {
    playStep(audio, nextTime, stepSeconds);
    step += 1;
    nextTime += stepSeconds;
  }
}

// Start the song from the beginning (called when a new race starts).
export function restartMusic() {
  step = 0;
  nextTime = 0;
}
