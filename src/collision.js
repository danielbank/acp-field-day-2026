// collision.js — "is this round thing touching the hero?"
// The hero's box is shrunk a little so near-misses feel fair.

const FORGIVENESS = 0.8; // 1 = exact box, smaller = more forgiving

export function circleHitsHero(cx, cy, radius, hero) {
  const halfW = (hero.w / 2) * FORGIVENESS;
  const halfH = (hero.h / 2) * FORGIVENESS;
  const nearestX = Math.max(hero.x - halfW, Math.min(cx, hero.x + halfW));
  const nearestY = Math.max(hero.y - halfH, Math.min(cy, hero.y + halfH));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < radius * radius;
}
