// customize.js — the "build your robot knight" screen: name, role, colors, helmet, wheels/treads/legs.
// Your choices are remembered in this browser for next time.

import { CONFIG } from './config.js';
import { state } from './state.js';
import { input, menuDir } from './input.js';
import { playSound } from './audio.js';
import { ROLE_IDS } from './roles.js';
import { drawKnight } from './entities/knightLook.js';
import { text, panel } from './ui.js';

const LOOK_KEY = 'robo-knights-look';
const C = CONFIG.customize;
const ROWS = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role', options: ROLE_IDS, show: (v) => CONFIG.roles[v].label },
  { key: 'body', label: 'Body color', options: C.bodyColors, color: true },
  { key: 'armor', label: 'Armor color', options: C.armorColors, color: true },
  { key: 'eyes', label: 'Eye color', options: C.eyeColors, color: true },
  { key: 'helmet', label: 'Helmet', options: C.helmets },
  { key: 'base', label: 'Moves on', options: C.bases },
  { key: 'start', label: 'START!' },
];
const ROW_X = 450;
const ROW_W = 470;
const ROW_TOP = 120;
const ROW_H = 54;
let row = 0;

const defaultLook = () => ({ name: CONFIG.hero.name, role: ROLE_IDS[0], body: 0, armor: 0, eyes: 0, helmet: 0, base: 0 });

export function loadLook() {
  const look = defaultLook();
  try {
    const saved = JSON.parse(localStorage.getItem(LOOK_KEY) || '{}');
    if (typeof saved.name === 'string') look.name = saved.name.slice(0, C.maxNameLength);
    if (ROLE_IDS.includes(saved.role)) look.role = saved.role;
    for (const r of ROWS) {
      if (r.color || r.key === 'helmet' || r.key === 'base') {
        const v = saved[r.key];
        if (Number.isInteger(v) && v >= 0 && v < r.options.length) look[r.key] = v;
      }
    }
  } catch { /* storage blocked or junk: use defaults */ }
  return look;
}

function saveLook() {
  try { localStorage.setItem(LOOK_KEY, JSON.stringify(state.look)); } catch { /* fine */ }
}

export function isTypingName() {
  return ROWS[row].key === 'name';
}

function change(r, step) {
  const look = state.look;
  if (r.key === 'role') {
    const i = (ROLE_IDS.indexOf(look.role) + step + ROLE_IDS.length) % ROLE_IDS.length;
    look.role = ROLE_IDS[i];
  } else if (r.options) {
    look[r.key] = (look[r.key] + step + r.options.length) % r.options.length;
  } else return;
  playSound('swing');
  saveLook();
}

// Returns true when it's time to start the game.
export function handleCustomizeAction(action) {
  const typing = isTypingName();
  const dir = menuDir(action, !typing);
  const look = state.look;
  if (dir === 'up') row = (row + ROWS.length - 1) % ROWS.length;
  else if (dir === 'down') row = (row + 1) % ROWS.length;
  else if (dir === 'left') change(ROWS[row], -1);
  else if (dir === 'right') change(ROWS[row], 1);
  else if (action === 'confirm') return finish();
  else if (action === 'space' && ROWS[row].key === 'start') return finish();
  else if (typing && action.startsWith('char:') && look.name.length < C.maxNameLength) {
    look.name += action.slice(5);
    saveLook();
  } else if (typing && action === 'backspace') {
    look.name = look.name.slice(0, -1);
    saveLook();
  } else if (action === 'click') return handleClick();
  return false;
}

function finish() {
  if (!state.look.name.trim()) state.look.name = CONFIG.hero.name;
  saveLook();
  input.mouseDown = false;
  return true;
}

function handleClick() {
  const i = Math.floor((input.mouseY - ROW_TOP) / ROW_H);
  if (input.mouseX < ROW_X || i < 0 || i >= ROWS.length) return false;
  row = i;
  if (ROWS[i].key === 'start') return finish();
  change(ROWS[i], input.mouseX < ROW_X + ROW_W / 2 ? -1 : 1);
  return false;
}

export function drawCustomize(ctx, t) {
  const look = state.look;
  const role = CONFIG.roles[look.role];
  text(ctx, CONFIG.text.customizeTitle, CONFIG.width / 2, 50, 44, CONFIG.colors.accent);

  // big preview of your knight on a little stage
  panel(ctx, 40, 100, 380, 470);
  ctx.fillStyle = 'rgba(199,125,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(230, 430, 110, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(230, 430);
  ctx.scale(2.6, 2.6);
  drawKnight(ctx, look, { facing: 1, aim: Math.sin(t) * 0.6 - 0.3, walk: t * 2, t, role: look.role });
  ctx.restore();
  text(ctx, look.name || '…', 230, 140, 30);
  text(ctx, role.label.toUpperCase(), 230, 482, 28, CONFIG.colors.gold);
  text(ctx, role.blurb, 230, 514, 16, CONFIG.colors.silver);
  text(ctx, `SPACE: ${role.abilityName}`, 230, 542, 16, CONFIG.colors.good);

  ROWS.forEach((r, i) => drawRow(ctx, r, i, look, t));
  text(ctx, CONFIG.text.customizeHint, CONFIG.width / 2, 606, 18, CONFIG.colors.silver);
}

function drawRow(ctx, r, i, look, t) {
  const y = ROW_TOP + i * ROW_H;
  const selected = i === row;
  ctx.fillStyle = selected ? 'rgba(199,125,255,0.35)' : 'rgba(255,255,255,0.06)';
  ctx.beginPath();
  ctx.roundRect(ROW_X, y + 4, ROW_W, ROW_H - 8, 10);
  ctx.fill();
  const cy = y + ROW_H / 2;
  if (r.key === 'start') {
    text(ctx, 'START!  (ENTER)', ROW_X + ROW_W / 2, cy, 26, selected ? CONFIG.colors.gold : CONFIG.colors.text);
    return;
  }
  text(ctx, r.label, ROW_X + 16, cy, 20, CONFIG.colors.silver, 'left');
  const vx = ROW_X + 320;
  if (r.key === 'name') {
    const caret = selected && Math.floor(t * 2) % 2 === 0 ? '|' : '';
    text(ctx, look.name + caret, vx, cy, 22);
    return;
  }
  if (r.color) {
    ctx.fillStyle = r.options[look[r.key]];
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(vx - 30, cy - 13, 60, 26, 8);
    ctx.fill();
    ctx.stroke();
  } else {
    const v = r.key === 'role' ? look.role : r.options[look[r.key]];
    text(ctx, r.show ? r.show(v) : v, vx, cy, 22);
  }
  text(ctx, '◀', vx - 70, cy, 20, selected ? CONFIG.colors.text : CONFIG.colors.silver);
  text(ctx, '▶', vx + 70, cy, 20, selected ? CONFIG.colors.text : CONFIG.colors.silver);
}
