// twists.js — the three optional TWISTS from config.js.
// Each block only runs when its switch in TWISTS is true.

import { TWISTS, TWIST_SETTINGS as S } from './config.js';
import { state, showBanner } from './state.js';
import { playSound } from './audio.js';
import { createBoss, isBossGone } from './entities/boss.js';

export function updateTwists(dt) {
  // speedUpOverTime: everything (including the hero) runs a little faster every second
  if (TWISTS.speedUpOverTime) {
    state.gameSpeed = Math.min(S.maxGameSpeed, 1 + state.time * S.speedUpPerSecond);
  }

  // gravityFlips: every few seconds the hero jumps to the other side and things fall the other way
  if (TWISTS.gravityFlips) {
    state.flipTimer += dt;
    if (state.flipTimer >= S.flipEverySeconds) {
      state.flipTimer = 0;
      state.gravity *= -1;
      state.fallers = [];          // clear the screen so the flip is fair
      showBanner('GRAVITY FLIP!');
      playSound('flip');
    }
  }

  // bossAppears: one giant slow UFO per game, starting at a certain score
  if (TWISTS.bossAppears) {
    if (!state.boss && !state.bossDone && state.score >= S.bossAtScore) {
      state.boss = createBoss(state.gravity);
      showBanner('BOSS INCOMING!');
      playSound('boss');
    }
    if (state.boss && isBossGone(state.boss)) {
      state.boss = null;
      state.bossDone = true;
      state.score += S.bossBonus;
      showBanner(`BOSS DODGED! +${S.bossBonus}`);
      playSound('bonus');
    }
  }
}
