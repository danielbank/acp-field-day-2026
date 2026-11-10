// twists.js — the optional TWISTS from config.js. Each helper only changes things when its switch is true.
// Other files ask these helpers instead of checking TWISTS themselves.

import { TWISTS, TWIST_SETTINGS } from './config.js';

// rainbowRoad: a color for road chunk n, or null to use the normal road color.
export function rainbowColor(n, seconds) {
  if (!TWISTS.rainbowRoad) return null;
  const hue = (n * 4 + seconds * 90 * TWIST_SETTINGS.rainbowSpeed) % 360;
  return `hsl(${hue}, 70%, 32%)`;
}

// moonGravity: multiply the car's gravity by this.
export function gravityScale() {
  return TWISTS.moonGravity ? TWIST_SETTINGS.moonGravity : 1;
}

// coinRain: extra chance for coin rows to appear.
export function extraCoinChance() {
  return TWISTS.coinRain ? TWIST_SETTINGS.coinRainChance : 0;
}
