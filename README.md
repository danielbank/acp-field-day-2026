# Robo Dodge 🤖☄️

A tiny dodge-the-falling-things game for live "vibe coding" with middle schoolers.
The class shouts ideas; you prompt Claude; the game changes live.

Plain JavaScript + `<canvas>` + Vite. No runtime dependencies, no external assets, works fully offline.

## Setup (the night before)

```sh
nvm use          # Node 26 LTS (see .nvmrc)
npm install
npm run dev      # open the printed URL
```

## Pre-flight checklist (morning of)

- [ ] `npm run dev` starts and the game shows **ROBO DODGE** in the browser
- [ ] Press Space, play a round, die, press Space again
- [ ] **Sound works** (start blip, bonk, game-over tune). Check projector/HDMI audio. `M` toggles mute.
- [ ] `npm run build:offline` creates `dist-offline/game.html`; double-click it to make sure it opens
- [ ] Copy `game.html` to a USB stick / cloud drive just in case
- [ ] `git status` is clean and you're on `main`

## Running a session

```sh
npm run session -- 6th-period   # creates + switches to session/YYYY-MM-DD-6th-period from main
npm run dev                     # keep this running; the page reloads on every save
claude                          # start Claude Code in this folder
```

Then riff: take an idea from the class, prompt it, watch the game change. Claude announces each change,
commits it with a plain-English message, and tells the class how to see it (rules are in `CLAUDE.md`).

- Undo the last change: ask Claude to "undo that", or run `git revert --no-edit HEAD`.
- See what the class built: `git log --oneline`.
- `main` stays as the clean starter for the next class.

Controls: ← → or A/D to move · drag on touchscreens · Space to start · P pause · M mute.
The game auto-pauses when the browser window loses focus (e.g. when you click into the terminal).

## Offline fallback

If a school computer won't run Node: open `dist-offline/game.html` (double-click, no server needed).
Rebuild it any time with `npm run build:offline`. It's one self-contained file (~12 KB).

## Handy scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server (with `--host`, so phones/tablets on the same Wi-Fi can open the Network URL) |
| `npm run build` | Normal build into `dist/` |
| `npm run build:offline` | One-file build: `dist-offline/game.html` |
| `npm run check` | Runs both builds and fails loudly if anything breaks |
| `npm run session -- <name>` | New `session/YYYY-MM-DD-<name>` branch from `main` (refuses if you have uncommitted changes) |

## Starter prompts the class can pick from

1. "Make the asteroids glow with a bright orange outline."
2. "Turn the hero into a round, smiling alien instead of a robot."
3. "Make the bonk sound sillier, like a cartoon boing."
4. "Turn on the speed-up-over-time twist."
5. "Turn on the gravity-flips twist."
6. "Turn on the boss twist, and make the boss rainbow colored."
7. "Add a golden star power-up that gives you an extra life when you catch it."
8. "Make the game-over screen show a random funny message, like 'The asteroids send their regards.'"
9. "Add a secret cheat code: typing ROBOT on the title screen gives you 10 lives."
10. "Add a two-player mode: a second robot controlled with J and L."

Tips: it's a hit to let the class vote on numbers in `src/config.js` (speeds, sizes, lives, colors)
between bigger ideas. Every knob there has a plain-English comment.
