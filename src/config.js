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
    bodyColor: '#9d4edd',         // Main robot color
    faceColor: '#e0e0ea',         // Robot face-screen color
    eyeColor: '#1a1026',          // Robot eye and smile color
    antennaColor: '#c0c0d0',      // Antenna color
  },

  // ---- The cockpit: you ride a flying skateboard, flappy-style ----
  cockpit: {
    gravity: 400,                 // How hard you sink (bigger = fall faster)
    flapStrength: 280,            // How big a boost each SPACE press gives you
    startHeight: 300,             // How high you start
    maxHeight: 600,               // You can't fly higher than this
    aimSpeed: 600,                // How fast the arrow keys move the crosshair
    groundSpeed: 1.5,             // How fast the ground stripes zoom past
    groundColor: '#2a1745',       // Ground color far below you
    groundStripeColor: '#7b2cbf', // Color of the zooming ground stripes
    boardColor: '#ff9f1c',        // Your skateboard's color
    boardStripeColor: '#fff3e0',  // The racing stripe on your skateboard
    crosshairColor: '#7dffb3',    // Aiming crosshair color
  },

  // ---- Lasers (click or F to fire) ----
  laser: {
    color: '#ff4fd8',             // Laser beam color
    popColor: '#ffe066',          // Color of the stars when something gets bonked
    cooldown: 0.15,               // Seconds between shots (smaller = faster firing)
    beamSeconds: 0.1,             // How long each beam stays on screen
    aimForgiveness: 20,           // Extra pixels around targets that still count as a hit
  },

  // ---- Dinos (they ride mini flying skateboards toward you) ----
  dino: {
    name: 'dinos',                // What we call them (used in on-screen text)
    arriveSeconds: 4,             // How many seconds a normal dino takes to reach you at level 1
    fasterPerLevel: 0.12,         // Each level, dinos fly this much faster (0.12 = 12%)
    skateboardColor: '#ffd23f',   // Color of the dinos' mini skateboards
    spikeColor: '#ffb3de',        // Color of the spikes on their backs
  },

  // ---- The 5 dino types! size = how big up close, hp = zaps to bonk, speed = 1 is normal ----
  dinoTypes: {
    zigzag: { color: '#6bd66b', size: 60, hp: 1, points: 25, speed: 1 },    // wiggles side to side
    swoop:  { color: '#b07cff', size: 60, hp: 1, points: 30, speed: 1 },    // swoops up and down
    speedy: { color: '#ff9f43', size: 45, hp: 1, points: 50, speed: 1.8 },  // small and FAST
    tank:   { color: '#4fa3ff', size: 95, hp: 3, points: 75, speed: 0.6 },  // big, slow, takes 3 zaps
    sneaky: { color: '#ff6fb5', size: 55, hp: 1, points: 60, speed: 1.1 },  // fades in and out
  },

  // ---- Zap zones: laser walls at random heights. Flap over or under them! ----
  zapZone: {
    firstAfterSeconds: 6,         // The first wall shows up after this many seconds
    everySeconds: 7,              // Then a new wall comes this often
    arriveSeconds: 3,             // How long a wall takes to zoom all the way to you
    minThickness: 100,            // Thinnest wall (in heights)
    maxThickness: 180,            // Thickest wall
    passPoints: 20,               // Points for making it past a wall
    color: '#ff3355',             // Wall glow color
    lineColor: '#ffd1dc',         // Buzzing laser line color
  },

  // ---- Boss fight: the Raccoon Mastermind in a giant ship ----
  boss: {
    dinosToSummon: 12,            // Bonk this many dinos and the boss shows up
    health: 20,                   // Zaps needed to beat the first boss
    healthGrowth: 10,             // Each time the boss comes back, it has this much more health
    size: 120,                    // How big the ship is
    sway: 0.6,                    // How fast it swoops side to side
    summonEverySeconds: 2.2,      // How often it sends a dino at you
    bonus: 500,                   // Points for beating the boss
    shipColor: '#5a4b7a',         // Ship color
    furColor: '#a3a3b3',          // Raccoon fur color
    maskColor: '#2b2233',         // Raccoon mask and tail-stripe color
    healthColor: '#ff4fd8',       // Health bar color
  },

  // ---- Spawning & difficulty ramp ----
  spawnEverySeconds: 1.6,         // At level 1, a new dino appears this often (in seconds)
  fastestSpawnSeconds: 0.5,       // No matter the level, never spawn faster than this
  secondsPerLevel: 15,            // Survive this many seconds to reach the next level
  spawnFasterPerLevel: 0.1,       // Each level, the wait between spawns shrinks by this many seconds

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
    title: 'SKY BOARD SHOWDOWN',                  // Big title on the start screen
    subtitle: 'Help {hero} fly the skateboard!',   // {hero} and {things} get filled in automatically
    start: 'Press SPACE to start',                // Start instructions
    controls: 'SPACE flap  ·  mouse/arrows aim  ·  click or F fire  ·  P pause  ·  M mute', // Controls hint
    paused: 'PAUSED',                             // Pause screen
    resume: 'Press P to keep playing',            // Pause screen hint
    gameOver: 'GAME OVER',                        // Game over title
    playAgain: 'Press SPACE to play again',       // Game over hint
    newBest: 'NEW BEST SCORE!',                   // Shown when you beat your best
    levelUp: 'LEVEL {level}!',                    // Banner when the level goes up
    bossIncoming: 'RACCOON BOSS INCOMING!',       // Banner when the boss shows up
    bossBeaten: 'BOSS BONKED! +{bonus}',          // Banner when you beat the boss
  },

  // ---- Sound ----
  soundOn: true,                  // Start with sound on? (M toggles it during the game)
  volume: 0.25,                   // How loud (0 = silent, 1 = LOUD)
};

// ---- TWISTS: ready-made surprises. Flip one to true to turn it on! ----
export const TWISTS = {
  speedUpOverTime: false,         // The WHOLE game (hero too) slowly speeds up the longer you survive
  gravityFlips: false,            // Every 20 seconds gravity flips: hero jumps to the top and things fall UP
};

// Fine-tuning for the twists above (only matters when that twist is on)
export const TWIST_SETTINGS = {
  speedUpPerSecond: 0.02,         // speedUpOverTime: how much faster each second (0.02 = 2%)
  maxGameSpeed: 2.5,              // speedUpOverTime: never go faster than this (2.5 = 2.5x)
  flipEverySeconds: 20,           // gravityFlips: seconds between flips
};
