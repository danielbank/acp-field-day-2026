// input.js — keyboard and touch/mouse. Other files read `input` and call takeActions().
// Holding keys sets input.left / input.right; one-time presses become "actions".

import { CONFIG } from './config.js';

export const input = { left: false, right: false, fire: false, pointerX: null };

const actions = [];
const MOVE_KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
const ACTION_KEYS = { Space: 'start', Enter: 'start', KeyF: 'fry', KeyP: 'pause', KeyM: 'mute' };

export function setupInput(canvas) {
  window.addEventListener('keydown', (e) => {
    if (MOVE_KEYS[e.code]) input[MOVE_KEYS[e.code]] = true;
    if (e.code === 'Space') input.fire = true;               // held down = keep firing tots
    if (ACTION_KEYS[e.code] && !e.repeat) actions.push(ACTION_KEYS[e.code]);
    if (MOVE_KEYS[e.code] || e.code === 'Space') e.preventDefault(); // stop the page scrolling
  });
  window.addEventListener('keyup', (e) => {
    if (MOVE_KEYS[e.code]) input[MOVE_KEYS[e.code]] = false;
    if (e.code === 'Space') input.fire = false;
  });
  window.addEventListener('blur', () => {   // switched to another window: let go of keys and pause
    input.left = input.right = input.fire = false;
    actions.push('blur');
  });

  // Touch or mouse: press and drag, and the hero follows your finger.
  const toGameX = (e) => {
    const rect = canvas.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * CONFIG.width;
  };
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    input.pointerX = toGameX(e);
    input.fire = true;                                       // touching = firing too
    actions.push('tap');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (input.pointerX !== null) input.pointerX = toGameX(e);
  });
  const release = () => { input.pointerX = null; input.fire = false; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
}

// Returns the actions since last frame and clears the list.
export function takeActions() {
  return actions.splice(0);
}
