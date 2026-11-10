// input.js — keyboard and touch/mouse. Other files read `input` and call takeActions().
// Holding keys sets input.left/right/up/down/fire; one-time presses become "actions".

import { CONFIG } from './config.js';

export const input = { left: false, right: false, up: false, down: false, fire: false, pointerX: null };

const actions = [];
const HOLD_KEYS = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'fire',
};
const ACTION_KEYS = {
  Space: 'start', Enter: 'start', KeyP: 'pause', KeyM: 'mute', KeyF: 'freeplay', Escape: 'quit',
  ShiftLeft: 'turbo', ShiftRight: 'turbo',
  Digit1: 'spawn1', Digit2: 'spawn2', Digit3: 'spawn3', Digit4: 'spawn4', Digit5: 'spawn5',
};

export function setupInput(canvas) {
  window.addEventListener('keydown', (e) => {
    if (HOLD_KEYS[e.code]) input[HOLD_KEYS[e.code]] = true;
    if (ACTION_KEYS[e.code] && !e.repeat) actions.push(ACTION_KEYS[e.code]);
    if (HOLD_KEYS[e.code]) e.preventDefault();   // stop the page scrolling
  });
  window.addEventListener('keyup', (e) => {
    if (HOLD_KEYS[e.code]) input[HOLD_KEYS[e.code]] = false;
  });
  window.addEventListener('blur', () => {   // switched to another window: let go of keys and pause
    for (const key of Object.values(HOLD_KEYS)) input[key] = false;
    actions.push('blur');
  });

  // Touch or mouse: hold to drive, slide left/right to steer, tap to jump (or zap aliens).
  const toGameX = (e) => {
    const rect = canvas.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * CONFIG.width;
  };
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    input.pointerX = toGameX(e);
    actions.push('tap');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (input.pointerX !== null) input.pointerX = toGameX(e);
  });
  const release = () => { input.pointerX = null; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
}

// Returns the actions since last frame and clears the list.
export function takeActions() {
  return actions.splice(0);
}
