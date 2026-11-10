// input.js — keyboard and touch/mouse. Other files read `input` and call takeActions().
// Holding keys sets input.left/right/up/down; one-time presses become "actions".

import { CONFIG } from './config.js';

export const input = { left: false, right: false, up: false, down: false, aimX: null, aimY: null };

const actions = [];
const MOVE_KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
                    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down' };
const ACTION_KEYS = { Space: 'start', Enter: 'start', KeyP: 'pause', KeyM: 'mute' };

export function setupInput(canvas) {
  window.addEventListener('keydown', (e) => {
    if (MOVE_KEYS[e.code]) input[MOVE_KEYS[e.code]] = true;
    if (ACTION_KEYS[e.code] && !e.repeat) actions.push(ACTION_KEYS[e.code]);
    if (MOVE_KEYS[e.code] || e.code === 'Space') e.preventDefault(); // stop the page scrolling
  });
  window.addEventListener('keyup', (e) => {
    if (MOVE_KEYS[e.code]) input[MOVE_KEYS[e.code]] = false;
  });
  window.addEventListener('blur', () => {   // switched to another window: let go of keys and pause
    input.left = input.right = input.up = input.down = false;
    actions.push('blur');
  });

  // Touch or mouse: the crosshair goes wherever you point.
  const aimAt = (e) => {
    const rect = canvas.getBoundingClientRect();
    input.aimX = ((e.clientX - rect.left) / rect.width) * CONFIG.width;
    input.aimY = ((e.clientY - rect.top) / rect.height) * CONFIG.height;
  };
  canvas.addEventListener('pointerdown', (e) => {
    aimAt(e);
    actions.push('tap');
  });
  canvas.addEventListener('pointermove', aimAt);
}

// Returns the actions since last frame and clears the list.
export function takeActions() {
  return actions.splice(0);
}
