// alien.js — our very own made-up space alphabet: one line-and-circle shape per letter A–Z.
// drawAlienText() writes any word in alien letters (used on signs, the puzzle gate and boss lyrics).

// Each stroke connects two dots on a 3×3 grid (0–2 across, 0–2 down).
const STROKES = [
  [0, 0, 2, 0], [0, 1, 2, 1], [0, 2, 2, 2], [0, 0, 0, 2], [1, 0, 1, 2], [2, 0, 2, 2], [0, 0, 2, 2],
  [2, 0, 0, 2], [0, 0, 1, 1], [2, 0, 1, 1], [0, 2, 1, 1], [2, 2, 1, 1], [1, 0, 2, 1], [0, 1, 1, 2],
];

// Build the alphabet once with a fixed "random" seed, so every letter always looks the same
// and no two letters share a shape.
const GLYPHS = {};
let seed = 1977;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const used = new Set();
for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
  while (!GLYPHS[ch]) {
    const strokes = new Set();
    const count = 2 + Math.floor(rnd() * 2);
    while (strokes.size < count) strokes.add(Math.floor(rnd() * STROKES.length));
    const ring = rnd() < 0.3;
    const list = [...strokes].sort((a, b) => a - b);
    const key = list.join(',') + (ring ? 'o' : '');
    if (!used.has(key)) {
      used.add(key);
      GLYPHS[ch] = { strokes: list, ring };
    }
  }
}

// Draw one alien letter centered on (x, y).
export function drawGlyph(ctx, ch, x, y, size, color) {
  const g = GLYPHS[ch];
  if (!g) return;
  const half = size / 2;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size / 9);
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (const i of g.strokes) {
    const [x1, y1, x2, y2] = STROKES[i];
    ctx.moveTo(x + (x1 - 1) * half, y + (y1 - 1) * half);
    ctx.lineTo(x + (x2 - 1) * half, y + (y2 - 1) * half);
  }
  if (g.ring) {
    ctx.moveTo(x + size * 0.22, y);
    ctx.arc(x, y, size * 0.22, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.restore();
}

// Write a whole word or sentence in alien letters. Spaces stay as gaps.
export function drawAlienText(ctx, str, x, y, size, color, align = 'center') {
  const step = size * 1.35;
  const width = str.length * step - (step - size);
  let cx = align === 'center' ? x - width / 2 + size / 2 : align === 'right' ? x - width + size / 2 : x + size / 2;
  for (const ch of str) {
    drawGlyph(ctx, ch, cx, y, size, color);
    cx += step;
  }
}
