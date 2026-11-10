# CLAUDE.md — Robo Dodge (live classroom vibe coding)

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
| `src/config.js` | Every tweakable knob: hero, fallers, speeds, lives, colors, text, sound, `TWISTS` |
| `src/main.js` | Canvas setup + game loop (delta time, capped) |
| `src/state.js` | Game state, new-round reset, best score, the screen state machine (`handleAction`) |
| `src/game.js` | Rules of a round: score, levels, spawning, moving, bonks |
| `src/twists.js` | The three optional `TWISTS` (each guarded by its boolean) |
| `src/entities/hero.js` | Hero movement + `drawRobot()` |
| `src/entities/faller.js` | Falling things + their looks (`LOOKS` map: `asteroid`, `ball`) |
| `src/entities/boss.js` | Boss UFO (bossAppears twist) |
| `src/input.js` | Keyboard + touch → `input` flags and actions |
| `src/audio.js` | Synthesized sounds (`SOUNDS` map) and mute |
| `src/render.js` | Background, HUD, title / paused / game-over screens |
| `src/collision.js` | Circle-vs-hero hit test |

Patterns to follow:
- New falling look → write `drawSomething(ctx, f)` in `faller.js`, add to `LOOKS`, set `faller.look` in config.
- New sound → add to `SOUNDS` in `audio.js`, call `playSound('name')`.
- New twist → add a boolean to `TWISTS` (default `false`), settings to `TWIST_SETTINGS`, logic in `twists.js`.
- New on-screen text → put the string in `CONFIG.text`.
- New per-round value → add it to `resetRound()` in `state.js` so restarts work.
- Screens are `'title' | 'playing' | 'paused' | 'gameover'`; transitions live only in `handleAction()`.

Style: plain ES modules, no frameworks, no TypeScript, short readable functions,
a 1–2 line header comment on every file. Keep each file small and single-purpose.

## Checking your work

- `npm run check` — both builds must pass. Do this before every commit.
- The presenter usually has `npm run dev` open; Vite reloads the page automatically on save.
- In dev, `window.game` is the live game state (e.g. `game.lives = 99` in the browser console)
  — handy for showing a change quickly without having to survive a minute.
