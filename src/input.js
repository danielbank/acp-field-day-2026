// input.js — keyboard and mouse. Held keys and the mouse set `input`; single presses become "actions".
// Actions: 'confirm' 'space' 'back' 'pause' 'mute' 'trap' 'backspace' 'click' 'blur' 'nav-up' … 'char:a' …

import { CONFIG } from './config.js';

export const input = {
  up: false, down: false, left: false, right: false,
  mouseX: CONFIG.width / 2, mouseY: CONFIG.height / 2, mouseDown: false,
};

const actions = [];
const MOVE_KEYS = { KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right' };
const ARROWS = { ArrowUp: 'nav-up', ArrowDown: 'nav-down', ArrowLeft: 'nav-left', ArrowRight: 'nav-right' };
const ACTION_KEYS = { Space: 'space', Enter: 'confirm', Escape: 'back', KeyP: 'pause', KeyM: 'mute',
  KeyQ: 'trap', Backspace: 'backspace' };
const NO_SCROLL = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Tab'];

// Menus: arrow keys (and WASD when we're not typing) move the cursor.
export function menuDir(action, lettersToo = true) {
  const map = { 'nav-up': 'up', 'nav-down': 'down', 'nav-left': 'left', 'nav-right': 'right' };
  if (map[action]) return map[action];
  if (!lettersToo) return null;
  return { 'char:w': 'up', 'char:s': 'down', 'char:a': 'left', 'char:d': 'right' }[action.toLowerCase()] ?? null;
}

export function setupInput(canvas) {
  window.addEventListener('keydown', (e) => {
    if (MOVE_KEYS[e.code]) input[MOVE_KEYS[e.code]] = true;
    if (!e.repeat) {
      if (ARROWS[e.code]) actions.push(ARROWS[e.code]);
      if (ACTION_KEYS[e.code]) actions.push(ACTION_KEYS[e.code]);
      if (e.key.length === 1 && /[a-zA-Z0-9 !?\-]/.test(e.key)) actions.push(`char:${e.key}`);
    }
    if (NO_SCROLL.includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    if (MOVE_KEYS[e.code]) input[MOVE_KEYS[e.code]] = false;
  });
  window.addEventListener('blur', () => {   // switched to another window: let go of everything and pause
    input.up = input.down = input.left = input.right = input.mouseDown = false;
    actions.push('blur');
  });

  const toGame = (e) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = ((e.clientX - rect.left) / rect.width) * CONFIG.width;
    input.mouseY = ((e.clientY - rect.top) / rect.height) * CONFIG.height;
  };
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    toGame(e);
    input.mouseDown = true;
    actions.push('click');
  });
  canvas.addEventListener('pointermove', toGame);
  const release = () => { input.mouseDown = false; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Returns the actions since last frame and clears the list.
export function takeActions() {
  return actions.splice(0);
}
