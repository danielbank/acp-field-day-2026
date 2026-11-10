# CLAUDE.md — Robo Racer (live classroom vibe coding)

This is a **live classroom demo**. A presenter is projecting this session to middle schoolers
(ages 11–14) who shout out ideas. The presenter types them to you one at a time. Kids are
watching every word you write and every second you take.

## How to handle each request

1. **Before changing anything**, say in ONE kid-friendly sentence what you're about to change.
   Example: "I'll make the asteroids glow orange by changing their colors in the config file."
2. Make **one small, focused change**. Don't refactor, rename, or "improve" anything else.
3. **Prefer `src/config.js`.** If the request can be done by changing a value there, do only that.
   If it needs code, add a new knob to `config.js` too when it makes sense (with a plain-English comment).
4. Keep the game **runnable after every change**. Run `npm run check` (takes a few seconds).
5. **Commit** on the current branch with a short plain-English message, e.g.
   `git commit -am "Make asteroids glow orange"` (use `git add -A` first if you created a file).
6. **Afterward**, say in ONE sentence how to see it in the game.
   Example: "Press Space and watch the asteroids — they glow orange now!"

Keep replies short. No long explanations, no lists of alternatives unless asked.

## If something breaks

Fix it fast or undo it: `git revert --no-edit HEAD` (if committed) or `git checkout -- .` (if not).
Don't go down a rabbit hole while the class waits. A working game beats a clever fix.

## Content rules (school-appropriate, always)

- Cartoon "bonk" level only: no blood, weapons aimed at people, death imagery, or violence beyond bonking.
- Nothing scary or gross. No real people, brands, logos, or copyrighted characters/games
  (no Mario, Pokémon, Minecraft, Fortnite, etc.).
- If a kid's idea crosses a line, cheerfully suggest a fun alternative instead
  (e.g. "zombies" → "sleepy space blobs"; "make it Sonic" → "a speedy blue hedgehog-ish robot of our own").

## Hard limits (unless the presenter explicitly asks)

- No new dependencies (`npm install` anything) and no edits to `package.json`, `vite.config.js`, or `scripts/`.
- No network calls, CDNs, web fonts, image files or audio files. Draw with canvas shapes,
  make sounds with Web Audio (`src/audio.js` → add to `SOUNDS`).
- **Never touch `main`.** Sessions happen on `session/*` branches. Never push, merge, or rebase.
  If you're on `main`, stop and tell the presenter to run `npm run session -- <name>`.

## Where things live

| File | Job |
| --- | --- |
| `src/config.js` | Every tweakable knob: road, car, speeds, lives, time, things, powerups, aliens, colors, text, music, `TWISTS` |
| `src/main.js` | Canvas setup + game loop (delta time, capped); routes driving actions to `gameAction()` |
| `src/state.js` | Game state, new-round reset (`mode`: `'race'` or `'sandbox'`), best score, the screen state machine (`handleAction`) |
| `src/game.js` | Rules of a round: driving, clock, checkpoints, smash/bump/collect, bonks, alien waves; `gameAction()` for jump/zap/turbo/spawn keys |
| `src/road.js` | Endless road shape (`curveAt`, `hillAt`), camera, fake-3D road drawing, `projectOnRoad()` |
| `src/spawner.js` | What appears on the road ahead (`MAKERS`), Free Play spawn keys |
| `src/powerups.js` | Star (2X), turbo, spring (mega jump), magnet; `addPoints()` |
| `src/effects.js` | Confetti `burst()` and floating `popup()` text |
| `src/music.js` | Background music sequencer (notes come from `CONFIG.music`) |
| `src/twists.js` | The three optional `TWISTS` (each a small helper guarded by its boolean) |
| `src/entities/car.js` | Car driving/jumping/turbo, `drawCarShape()`, `drawHood()` |
| `src/entities/things.js` | Road things and their looks (`LOOKS` map), `thingSize()` |
| `src/entities/aliens.js` | Alien blob waves and goo bubbles |
| `src/input.js` | Keyboard + touch → `input` flags and actions |
| `src/audio.js` | Synthesized sounds (`SOUNDS` map) and mute |
| `src/render.js` | Space background, world scene, HUD, title / paused / game-over screens |

Patterns to follow:
- New road thing → add a size in `CONFIG.things`, a case in `thingSize()`, a draw function in `LOOKS` (things.js),
  a maker in `MAKERS` + a chance in `CONFIG.spawn.chances` (spawner.js), and what touching it does in `checkHits()` (game.js).
- New sound → add to `SOUNDS` in `audio.js`, call `playSound('name')`.
- New powerup → color in `CONFIG.powerups`, name in `POWER_KINDS` + effect in `applyPowerup()`, icon in `POWER_ICONS`.
- New twist → add a boolean to `TWISTS` (default `false`), settings to `TWIST_SETTINGS`, a helper in `twists.js`.
- New on-screen text → put the string in `CONFIG.text`.
- New per-round value → add it to `resetRound()` in `state.js` so restarts work.
- Screens are `'title' | 'playing' | 'paused' | 'gameover'`; transitions live only in `handleAction()`.

Style: plain ES modules, no frameworks, no TypeScript, short readable functions,
a 1–2 line header comment on every file. Keep each file small and single-purpose.

## Checking your work

- `npm run check` — both builds must pass. Do this before every commit.
- The presenter usually has `npm run dev` open; Vite reloads the page automatically on save.
- In dev, `window.game` is the live game state (e.g. `game.lives = 99`, `game.timeLeft = 999`,
  `game.car.z = game.nextCheckpointZ - 20000` to jump near a checkpoint) — handy for showing a change quickly.
