# AI Vibe Coding · ACP Field Day 2026

A gallery of the four games that **Arizona College Prep Middle School** students built with
[Claude Code](https://claude.com/claude-code) during the **AI Vibe Coding** sessions at Field Day 2026.
In each session the class shouted out ideas, Claude asked questions until everyone agreed on a plan,
and then it built the game live on the projector.

### 🎮 Play them: **https://danielbank.github.io/acp-field-day-2026/**

📑 Presentation: [Slides (PDF)](docs/ai-vibe-coding-acp-field-day-2026.pdf) · [Slides (PowerPoint)](docs/ai-vibe-coding-acp-field-day-2026.pptx)

## The sessions

| | Session | Game | Play | Code |
| --- | --- | --- | --- | --- |
| 1 | Flappy FPS with Dinosaurs and a Raccoon | Sky Board Showdown | [▶ Play](https://danielbank.github.io/acp-field-day-2026/flappy-fps-dinosaurs/) | [`flappy-fps-dinosaurs`](https://github.com/danielbank/acp-field-day-2026/tree/flappy-fps-dinosaurs) |
| 2 | Robo Racer with Space Invaders and a Car Shop | Robo Racer | [▶ Play](https://danielbank.github.io/acp-field-day-2026/robo-racer/) | [`robo-racer`](https://github.com/danielbank/acp-field-day-2026/tree/robo-racer) |
| 3 | Spud Quest with Alien Language, DJ Spudz, and Tater Tot Minions | Spud Racer Quest | [▶ Play](https://danielbank.github.io/acp-field-day-2026/spud-quest/) | [`spud-quest`](https://github.com/danielbank/acp-field-day-2026/tree/spud-quest) |
| 4 | 2.5D Robot Knight with Character Customization | Robo Knights | [▶ Play](https://danielbank.github.io/acp-field-day-2026/robo-knight/) | [`robo-knight`](https://github.com/danielbank/acp-field-day-2026/tree/robo-knight) |

Every session started from the same tiny starter game, **Robo Dodge**
([play](https://danielbank.github.io/acp-field-day-2026/robo-dodge-starter/) · [code](https://github.com/danielbank/acp-field-day-2026/tree/c2495c5)).

The [gallery page](https://danielbank.github.io/acp-field-day-2026/) also lists the prompts each class used:
their requirements, the choices they voted on, and the changes they asked for afterwards.
A few prompts were lightly edited to keep them school-friendly.

## What's in this repo

| Path | What it is |
| --- | --- |
| `index.html` | The gallery page |
| `assets/` | Game screenshots |
| `docs/` | The presentation, as PDF and PowerPoint |
| `build-site.sh` | Builds the gallery plus every game branch into one folder (`_site/`) |
| `.github/workflows/pages.yml` | Runs `build-site.sh` and publishes to GitHub Pages on every push to `main` |

Each game lives on its own branch. They're plain JavaScript + `<canvas>` + [Vite](https://vite.dev), with no runtime
dependencies and no external assets. To run one locally:

```sh
git switch robo-knight   # or flappy-fps-dinosaurs, robo-racer, spud-quest
npm install
npm run dev
```

To build the whole site locally: `./build-site.sh` (needs Node 22+), then open `_site/index.html` through any static server.

## License

The code is free and open, released into the public domain under [the Unlicense](LICENSE).
This is an independent recap made by a volunteer; it isn't an official Arizona College Preparatory publication.
Want something changed or removed? [Open an issue](https://github.com/danielbank/acp-field-day-2026/issues).
