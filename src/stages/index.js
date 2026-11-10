// stages/index.js — the quest loop: race → targets → puzzle → boss → (next lap, harder) → race …
// Each stage has start(), update(dt) (returns true when finished) and draw functions.

import { state, showBanner } from '../state.js';
import { race } from './race.js';
import { targets } from './targets.js';
import { puzzle } from './puzzle.js';
import { bossfight } from './bossfight.js';

const STAGES = [race, targets, puzzle, bossfight];

export const currentStage = () => STAGES[state.stageIndex];

export function startStage() {
  const stage = currentStage();
  Object.assign(state, { stageStarted: true, stageTime: 0, stageDoneTimer: 0, fallers: [], coins: [],
                         tots: [], missiles: [], targets: [], minions: [], signs: [], spudz: null,
                         megaTot: null, puzzle: null, bossMusic: false });
  stage.start();
  showBanner(stage.title(), 2);
}

export function nextStage() {
  state.stageIndex = (state.stageIndex + 1) % STAGES.length;
  if (state.stageIndex === 0) {
    state.lap += 1;
  }
  startStage();
}
