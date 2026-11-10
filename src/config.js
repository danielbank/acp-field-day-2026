// config.js — every knob the class can vote on lives here.
// Change a value, save the file, and the game reloads with the change.

export const CONFIG = {
  // ---- The screen ----
  width: 960,                     // Game width in pixels (it stretches to fit any screen)
  height: 640,                    // Game height in pixels
  backgroundColor: '#0d0717',     // Space color behind everything (black with a hint of purple)
  showStars: true,                // Twinkly stars in the background? true or false
  starColor: '#c0c0d0',           // Color of the background stars

  // ---- The hero ----
  hero: {
    name: 'Bolt',                 // The hero's name (shown on the title screen)
    width: 72,                    // How wide the hero is
    height: 72,                   // How tall the hero is
    speed: 560,                   // How fast the hero slides left and right
    bodyColor: '#9d4edd',         // Main robot color
    faceColor: '#e0e0ea',         // Robot face-screen color
    eyeColor: '#1a1026',          // Robot eye and smile color
    antennaColor: '#c0c0d0',      // Antenna color
  },

  // ---- The things that fall ----
  faller: {
    name: 'asteroids',            // What we call the falling things (used in on-screen text)
    look: 'asteroid',             // How they're drawn: 'asteroid' or 'ball'
    color: '#a9a9b8',             // Main color
    outlineColor: '#e0aaff',      // Outline color
    hasFace: true,                // Give them little friendly eyes? true or false
    minSize: 26,                  // Smallest size (radius in pixels)
    maxSize: 50,                  // Biggest size (radius in pixels)
    startSpeed: 200,              // How fast they fall at level 1
    maxSpeed: 650,                // They never fall faster than this
    spin: 2,                      // How fast they spin (0 = no spinning)
  },

  // ---- Spawning & difficulty ramp ----
  spawnEverySeconds: 0.9,         // At level 1, a new one appears this often (in seconds)
  fastestSpawnSeconds: 0.22,      // No matter the level, never spawn faster than this
  secondsPerLevel: 15,            // Survive this many seconds to reach the next level
  speedUpPerLevel: 35,            // Each level, things fall this much faster
  spawnFasterPerLevel: 0.08,      // Each level, the wait between spawns shrinks by this many seconds

  // ---- Lives & score ----
  lives: 3,                       // How many bonks you can take
  invincibleSeconds: 1.5,         // After a bonk, the hero blinks and can't be hit for this long
  scorePerSecond: 10,             // Points earned for every second you survive

  // ---- Colors & text ----
  colors: {
    text: '#f2ecff',              // Main text color (bright, for the projector)
    accent: '#c77dff',            // Purple for titles and highlights
    silver: '#c0c0d0',            // Silver for smaller text
    warning: '#ff7eb6',           // Color for "GAME OVER" and banners
  },
  font: 'system-ui, "Segoe UI", Arial, sans-serif', // Built-in fonts only (no downloads)
  text: {
    title: 'ROBO DODGE',                          // Big title on the start screen
    subtitle: 'Help {hero} dodge the {things}!',  // {hero} and {things} get filled in automatically
    start: 'Press SPACE to start',                // Start instructions
    controls: '← → or A D to move   ·   P pause   ·   M mute', // Controls hint
    paused: 'PAUSED',                             // Pause screen
    resume: 'Press P to keep playing',            // Pause screen hint
    gameOver: 'GAME OVER',                        // Game over title
    playAgain: 'Press SPACE to play again',       // Game over hint
    newBest: 'NEW BEST SCORE!',                   // Shown when you beat your best
    levelUp: 'LEVEL {level}!',                    // Banner when the level goes up
  },

  // ---- Sound ----
  soundOn: true,                  // Start with sound on? (M toggles it during the game)
  volume: 0.25,                   // How loud (0 = silent, 1 = LOUD)
};

// ---- TWISTS: ready-made surprises. Flip one to true to turn it on! ----
export const TWISTS = {
  speedUpOverTime: false,         // The WHOLE game (hero too) slowly speeds up the longer you survive
  gravityFlips: false,            // Every 20 seconds gravity flips: hero jumps to the top and things fall UP
  bossAppears: false,             // At score 100 a giant, slow UFO boss drifts across the screen
};

// Fine-tuning for the twists above (only matters when that twist is on)
export const TWIST_SETTINGS = {
  speedUpPerSecond: 0.02,         // speedUpOverTime: how much faster each second (0.02 = 2%)
  maxGameSpeed: 2.5,              // speedUpOverTime: never go faster than this (2.5 = 2.5x)
  flipEverySeconds: 20,           // gravityFlips: seconds between flips
  bossAtScore: 100,               // bossAppears: score when the boss shows up
  bossSize: 110,                  // bossAppears: how big the boss is (radius)
  bossSpeed: 55,                  // bossAppears: how fast it drifts toward the hero
  bossWiggle: 0.9,                // bossAppears: how fast it sways side to side
  bossColor: '#7b2cbf',           // bossAppears: saucer color
  bossBonus: 100,                 // bossAppears: points for surviving the boss
};
