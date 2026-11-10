// puzzle.js — Stage 3: the alien gate. A secret word is written in alien letters.
// Use the decoder chart, drive under the matching English letter and press SPACE.

import { CONFIG } from '../config.js';
import { state, showBanner, addPopup } from '../state.js';
import { playSound } from '../audio.js';
import { gainXp, chargeFry } from '../rpg.js';
import { drawGlyph } from '../alien.js';
import { text } from '../text.js';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
const choiceX = (i) => (CONFIG.width * (i + 1)) / 4;
const CHOICE_Y = 440;

function makeChoices(p) {
  const correct = p.word[p.index];
  const others = shuffle(p.chart.filter((c) => c !== correct)).slice(0, 2);
  p.choices = shuffle([correct, ...others]);
}

// The choice box closest to the car is the one you'd pick.
function selectedChoice() {
  let best = 0;
  for (let i = 1; i < 3; i++) {
    if (Math.abs(choiceX(i) - state.hero.x) < Math.abs(choiceX(best) - state.hero.x)) best = i;
  }
  return best;
}

function choose(p, letter) {
  if (letter !== p.word[p.index]) {
    p.shake = 0.4;
    playSound('wrong');
    addPopup(CONFIG.text.wrong, state.hero.x, state.hero.y - 70, CONFIG.colors.warning);
    return;
  }
  playSound('correct');
  gainXp(CONFIG.puzzle.xp, choiceX(p.choices.indexOf(letter)), CHOICE_Y - 60);
  chargeFry(3);
  p.index += 1;
  if (p.index < p.word.length) return makeChoices(p);
  showBanner('GATE OPEN!');
  playSound('bonus');
}

export const puzzle = {
  road: false,
  coins: false,
  title: () => CONFIG.text.puzzleStage,
  junkEvery: () => 0,
  start() {
    const words = CONFIG.puzzle.words;
    const word = words[Math.floor(Math.random() * words.length)];
    const unique = [...new Set(word)];
    const decoys = shuffle(LETTERS.filter((c) => !unique.includes(c))).slice(0, CONFIG.puzzle.decoys);
    state.puzzle = { word, index: 0, chart: shuffle([...unique, ...decoys]), choices: [], shake: 0, openTimer: 0 };
    makeChoices(state.puzzle);
  },
  update(dt) {
    const p = state.puzzle;
    p.shake = Math.max(0, p.shake - dt);
    if (p.index >= p.word.length) {
      p.openTimer += dt;
      return p.openTimer > 1.6;
    }
    if (state.presses > 0) choose(p, p.choices[selectedChoice()]);
    return false;
  },
  onFry() {                                   // the fry move solves one letter for you!
    const p = state.puzzle;
    if (p.index < p.word.length) choose(p, p.word[p.index]);
  },
  draw(ctx) {
    const p = state.puzzle;
    drawGate(ctx, p);
    drawChart(ctx, p);
    if (p.index < p.word.length) drawChoices(ctx, p);
  },
};

// The rusty gate with the secret word in alien letters.
function drawGate(ctx, p) {
  const step = 90;
  const left = CONFIG.width / 2 - ((p.word.length - 1) * step) / 2;
  const open = p.index >= p.word.length;
  ctx.fillStyle = open ? 'rgba(127,255,212,0.2)' : '#5c3a22';
  ctx.fillRect(100, 82, CONFIG.width - 200, 130);
  ctx.strokeStyle = '#d98c4a';
  ctx.lineWidth = 4;
  ctx.strokeRect(100, 82, CONFIG.width - 200, 130);
  [...p.word].forEach((ch, i) => {
    const x = left + i * step;
    if (i === p.index) {
      ctx.strokeStyle = CONFIG.colors.accent;
      ctx.lineWidth = 4;
      ctx.strokeRect(x - 34, 100, 68, 68);
    }
    drawGlyph(ctx, ch, x, 134, 44, CONFIG.colors.alien);
    if (i < p.index) text(ctx, ch, x, 192, 28, CONFIG.colors.accent);
  });
}

// The decoder chart: alien letter on top, English letter underneath.
function drawChart(ctx, p) {
  const step = 84;
  const left = CONFIG.width / 2 - ((p.chart.length - 1) * step) / 2;
  text(ctx, 'DECODER', CONFIG.width / 2, 238, 18, CONFIG.colors.silver);
  p.chart.forEach((ch, i) => {
    const x = left + i * step;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x - 32, 254, 64, 92);
    drawGlyph(ctx, ch, x, 285, 30, CONFIG.colors.alien);
    text(ctx, ch, x, 328, 24);
  });
  text(ctx, CONFIG.text.puzzleHint, CONFIG.width / 2, 372, 20, CONFIG.colors.silver);
}

// Three English letters to pick from. The one above the car glows.
function drawChoices(ctx, p) {
  const sel = selectedChoice();
  const shake = Math.sin(p.shake * 60) * 10 * (p.shake > 0 ? 1 : 0);
  p.choices.forEach((ch, i) => {
    const x = choiceX(i) + (i === sel ? shake : 0);
    ctx.fillStyle = i === sel ? 'rgba(255,183,3,0.3)' : 'rgba(0,0,0,0.45)';
    ctx.fillRect(x - 60, CHOICE_Y - 42, 120, 84);
    ctx.strokeStyle = i === sel ? CONFIG.colors.accent : CONFIG.colors.silver;
    ctx.lineWidth = i === sel ? 5 : 2;
    ctx.strokeRect(x - 60, CHOICE_Y - 42, 120, 84);
    text(ctx, ch, x, CHOICE_Y, 56, i === sel ? CONFIG.colors.accent : CONFIG.colors.text);
  });
}
