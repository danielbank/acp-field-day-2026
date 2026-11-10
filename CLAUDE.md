# CLAUDE.md — Robo Knights (live classroom vibe coding)

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
| `src/config.js` | Every tweakable knob: arena, roles, mobs, waves, dragon, traps, enchants, shop items, customization, colors, text, sound, `TWISTS` |
| `src/main.js` | Canvas setup + game loop (delta time, capped) + which screen to draw |
| `src/state.js` | Game state, `resetRound()`, best score, New Game+, the screen state machine (`handleAction`) |
| `src/game.js` | One frame of a round: update order for everything, shop door check, knocked-out check |
| `src/waves.js` | Wave spawning, wave cleared → shop break, dragon after the last wave |
| `src/combat.js` | Damage to mobs/you, enchant effects (fire/ice/zap), melee hits, blasts, mob poof + coins |
| `src/roles.js` | Each role's click attack and SPACE ability (`ABILITIES` map) |
| `src/shopMenu.js` | Shop menu UI + buying (`ITEM_EFFECTS` map) |
| `src/customize.js` | Build-your-knight screen (name, role, colors, helmet, base); saved in localStorage |
| `src/screens.js` | Title, paused, game-over, victory screens |
| `src/render.js` | 2.5D arena floor/walls, depth-sorted drawing, HUD, boss bar |
| `src/view.js` | 2.5D camera (`toScreen`/`toWorld`), shadows, math helpers |
| `src/effects.js` | Bonk stars, puffs, embers, floating text, swing arcs, rings, zaps |
| `src/ui.js` | Text/panel/bar drawing helpers |
| `src/twists.js` | The three optional `TWISTS` (each guarded by its boolean) |
| `src/input.js` | Keyboard + mouse → `input` flags and actions |
| `src/audio.js` | Synthesized sounds (`SOUNDS` map) and mute |
| `src/entities/hero.js` | Knight movement, aiming, timers, `drawHero()` |
| `src/entities/knightLook.js` | `drawKnight()` — body, helmets, bases, weapons (incl. flaming sword) |
| `src/entities/mobs.js` | Mob stats + `BEHAVIOR` map (junkbot, goo, babyDragon, beetle, dragon) |
| `src/entities/mobLooks.js` | Mob drawings (`LOOKS` map) + burn/ice/flash overlays |
| `src/entities/dragon.js` / `dragonLook.js` | Dragon boss attack phases / dragon drawing + warning circles |
| `src/entities/projectiles.js` | Bolts, sparks, dragon fire |
| `src/entities/traps.js` / `trapLooks.js` | Hazards (spikes, bumpers, oil), spring traps, mob tacks/goo / their drawings |
| `src/entities/pickups.js` | Coins + the flaming sword prize |
| `src/entities/shop.js` | Shop building in the arena (door, blocking, drawing) |

Patterns to follow:
- New mob → stats in `CONFIG.mobs`, behavior in `BEHAVIOR` (`mobs.js`), drawing in `LOOKS` (`mobLooks.js`), add it to `CONFIG.waves`.
- New shop item → add to `CONFIG.shop.items`; new kind of effect → add to `ITEM_EFFECTS` in `shopMenu.js`.
- New role → add to `CONFIG.roles` + an entry in `ABILITIES` (`roles.js`).
- New helmet/base look → add the name in `CONFIG.customize` and draw it in `knightLook.js`.
- New sound → add to `SOUNDS` in `audio.js`, call `playSound('name')`.
- New twist → add a boolean to `TWISTS` (default `false`), settings to `TWIST_SETTINGS`, logic in `twists.js`.
- New on-screen text → put the string in `CONFIG.text`.
- New per-round value → add it to `resetRound()` in `state.js` so restarts work.
- Screens are `'title' | 'customize' | 'playing' | 'shop' | 'paused' | 'gameover' | 'victory'`; transitions live in `handleAction()` (plus `openShop`/`winRound`/`endRound`).
- Positions are arena coordinates: `x` left-right, `y` back-front (depth), `z` height. Convert with `toScreen()`.

Style: plain ES modules, no frameworks, no TypeScript, short readable functions,
a 1–2 line header comment on every file. Keep each file small and single-purpose.

## Checking your work

- `npm run check` — both builds must pass. Do this before every commit.
- The presenter usually has `npm run dev` open; Vite reloads the page automatically on save.
- In dev, `window.game` is the live game state (e.g. `game.hero.hp = 99`, `game.coins = 500`,
  `game.wave = 5; game.breakTimer = 0` to jump to the dragon) — handy for showing a change quickly.
