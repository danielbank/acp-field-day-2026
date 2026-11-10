// config.js — every knob the class can vote on lives here.
// Change a value, save the file, and the game reloads with the change.

export const CONFIG = {
  // ---- The screen ----
  width: 960,                     // Game width in pixels (it stretches to fit any screen)
  height: 640,                    // Game height in pixels
  font: 'system-ui, "Segoe UI", Arial, sans-serif', // Built-in fonts only (no downloads)

  // ---- Outer space (the background) ----
  space: {
    topColor: '#05010f',          // Sky color at the top of the screen
    bottomColor: '#2a0e4f',       // Sky color near the horizon
    showStars: true,              // Twinkly stars? true or false
    starColor: '#e8e4ff',         // Star color
    starCount: 140,               // How many stars
    planets: [                    // Planets in the sky: x, y, size, color, and an optional ring
      { x: 170, y: 130, size: 70, color: '#ff9e4f', ring: true, ringColor: '#ffd9a8' },
      { x: 770, y: 80, size: 30, color: '#5ef2ff', ring: false },
    ],
  },

  // ---- The space highway ----
  road: {
    width: 2000,                  // How wide the road is (half-width, in world units)
    lanes: 3,                     // How many lanes
    segmentLength: 200,           // Length of one road chunk
    drawDistance: 220,            // How many chunks ahead we can see (bigger = see farther)
    fieldOfView: 100,             // Camera zoom: bigger = wider view
    curviness: 4,                 // How twisty the road is (0 = perfectly straight)
    hilliness: 5000,              // How big the hills are (0 = totally flat)
    stripeEvery: 3,               // Road stripes change color every this many chunks
    color: '#2b1c4f',             // Road color
    colorAlt: '#241743',          // Second road color (for the stripes)
    edgeColor: '#ff4fd8',         // Glowing edge color
    edgeColorAlt: '#5ef2ff',      // Second glowing edge color
    laneColor: '#f2ecff',         // Lane line color
  },

  // ---- Your car ----
  car: {
    name: 'Zoomer',               // Your car's name (shown on the title screen)
    view: 'hood',                 // 'hood' = you're in the driver seat, 'chase' = see your car from behind
    maxSpeed: 9000,               // Top speed
    acceleration: 5000,           // How fast you speed up when you hold gas
    brakes: 10000,                // How fast you slow down when you brake
    coastSlowdown: 2500,          // How fast you slow down when you let go of gas
    steering: 2.5,                // How fast you slide left and right
    curvePull: 0.25,              // How hard curves push you toward the outside
    offRoadMaxSpeed: 3500,        // Space dust off the road slows you to this speed
    jumpPower: 3000,              // How high you jump
    gravity: 7000,                // How fast you fall back down
    turboSpeed: 1.5,              // Turbo top speed (1.5 = 50% faster)
    turboSeconds: 3,              // How long one turbo lasts
    turboStartCharges: 1,         // Turbos you start with (press SHIFT to use one)
    turboMaxCharges: 3,           // Most turbos you can save up
    width: 650,                   // Car size (world units) — used for bumping into things
    height: 350,
    bodyColor: '#9d4edd',         // Main car color
    stripeColor: '#5ef2ff',       // Racing stripe color
    windowColor: '#1a1026',       // Window color
    lightColor: '#ff4f6d',        // Tail light color
    flameColor: '#ffb703',        // Turbo flame color
  },
  autoGas: false,                 // true = the car drives forward by itself (no need to hold ↑)

  // ---- Lives, time & score ----
  lives: 3,                       // How many bonks you can take
  invincibleSeconds: 1.5,         // After a bonk you can't be bonked again for this long
  startTime: 45,                  // Seconds on the clock when the race starts
  checkpointEverySegments: 1100,  // Distance between checkpoints (in road chunks)
  checkpointBonusTime: 25,        // Seconds added when you drive through a checkpoint
  scorePerSecond: 20,             // Points per second when driving at top speed
  turboSmashBonus: 2,             // Smashing things during turbo gives this many times the points

  // ---- How often stuff appears on the road ----
  spawn: {
    firstThingAt: 8000,           // Distance before the first thing appears
    everySegments: 16,            // Road chunks between things at the start
    fewestSegments: 6,            // Never closer together than this
    closerPerCheckpoint: 2,       // Things get this much closer after each checkpoint
    chances: {                    // Bigger number = shows up more often (0 = never)
      rock: 3, hole: 1.5, crate: 3, cone: 2, barrel: 2, traffic: 2.5,
      coins: 3, highCoins: 1, ramp: 1, powerup: 1.2,
    },
    freePlayChances: {            // Same idea, for Free Play mode (no bonky stuff)
      rock: 0, hole: 0, crate: 4, cone: 3, barrel: 3, traffic: 3,
      coins: 3, highCoins: 1, ramp: 2, powerup: 1.5,
    },
  },

  // ---- Things on the road ----
  things: {
    rock:    { size: 650, height: 320, color: '#8d84a8', outlineColor: '#e0aaff' }, // jump over these!
    hole:    { length: 900, glowColor: '#c77dff' },              // space holes across the whole road: jump!
    crate:   { size: 520, color: '#c98a3c', points: 50 },        // smash for points
    cone:    { size: 320, color: '#ff8c42', points: 30 },        // smash for points
    barrel:  { size: 420, color: '#3ddc97', points: 40 },        // smash for points
    traffic: { size: 760, speed: 4000, points: 100,              // slow cars you can bump off the road
               colors: ['#ff4f6d', '#ffd23f', '#3ddc97', '#4f8bff', '#ff8c42'] },
    coin:    { size: 300, color: '#ffd23f', points: 10, rowLength: 5, highHeight: 1100 },
    ramp:    { size: 950, length: 700, color: '#ffd23f', jumpBoost: 1.5 }, // drive over to fly!
    slime:   { size: 900, color: '#7cff6b' },                    // dropped by alien blobs: steer around
    gate:    { height: 1900, color: '#7cff6b', colorAlt: '#5ef2ff' }, // checkpoint arch
  },

  // ---- Powerups (glowing boxes on the road) ----
  powerups: {
    size: 460,                    // How big the boxes are
    seconds: 10,                  // How long 2X and magnet last
    star:   { color: '#ffd23f', multiplier: 2 },      // all points count double
    turbo:  { color: '#ff7a1a' },                     // gives you one more turbo (SHIFT)
    spring: { color: '#3ddc97', jumpBoost: 1.6 },     // your next jump is a MEGA jump
    magnet: { color: '#ff4f6d', pullSpeed: 2.5, reach: 6000 }, // pulls coins toward you
  },

  // ---- Alien blob waves (they show up after checkpoints) ----
  aliens: {
    on: true,                     // Turn alien waves on or off
    everyCheckpoints: 1,          // A wave after every this many checkpoints
    rows: 2,                      // Rows of blobs
    perRow: 4,                    // Blobs in each row
    size: 900,                    // How big each blob is
    hoverHeight: 800,             // How high they float above the road
    distanceAhead: 5200,          // How far ahead of you they fly
    rowGap: 1800,                 // Distance between rows
    sway: 0.25,                   // How far they wiggle side to side
    swaySpeed: 1.5,               // How fast they wiggle
    waveSeconds: 20,              // Seconds before they give up and fly away
    slimeEverySeconds: 1.4,       // How often a blob drops a slime puddle
    points: 75,                   // Points per zapped blob
    clearBonus: 500,              // Bonus for zapping ALL of them
    colors: ['#7cff6b', '#ff7eb6', '#5ef2ff', '#ffd23f'],
    bubbleColor: '#7df9ff',       // Goo bubble color
    bubbleSpeed: 16000,           // How fast goo bubbles fly
    fireEverySeconds: 0.18,       // Hold SPACE: one bubble every this many seconds
  },

  // ---- Colors & text ----
  colors: {
    text: '#f2ecff',              // Main text color (bright, for the projector)
    accent: '#c77dff',            // Purple for titles and highlights
    silver: '#c0c0d0',            // Silver for smaller text
    warning: '#ff7eb6',           // Color for "GAME OVER" and banners
    good: '#7cff6b',              // Color for good news (checkpoints, bonuses)
  },
  text: {
    title: 'ROBO RACER',
    subtitle: 'Drive {car} down the Space Highway!',  // {car} gets filled in automatically
    start: 'SPACE = Race      F = Free Play',
    controls: '← → steer · ↑ gas · ↓ brake · SPACE jump/zap · SHIFT turbo · P pause · M mute',
    freePlayHelp: '1 crates · 2 car · 3 ramp · 4 coins · 5 aliens · ESC menu',
    freePlay: 'FREE PLAY',
    paused: 'PAUSED',
    resume: 'Press P to keep driving',
    gameOver: 'GAME OVER',
    playAgain: 'SPACE = race again   ·   F = Free Play',
    newBest: 'NEW BEST SCORE!',
    timeUp: 'Time ran out!',
    outOfLives: 'Out of bonks!',
    go: 'GO!',
    checkpoint: 'CHECKPOINT! +{time}s',
    waveStart: 'ALIEN BLOBS! HOLD SPACE TO ZAP!',
    waveCleared: 'ALL BLOBS ZAPPED! +{points}',
    waveEscaped: 'The blobs flew away!',
    star: '2X POINTS!',
    turbo: 'TURBO +1 (SHIFT)',
    spring: 'MEGA JUMP READY!',
    magnet: 'COIN MAGNET!',
  },

  // ---- Sound ----
  soundOn: true,                  // Start with sound on? (M toggles it during the game)
  volume: 0.25,                   // How loud sound effects are (0 = silent, 1 = LOUD)
};

// ---- TWISTS: ready-made surprises. Flip one to true to turn it on! ----
export const TWISTS = {
  rainbowRoad: false,             // The road cycles through every color of the rainbow
  moonGravity: false,             // Floaty moon jumps
  coinRain: false,                // WAY more coins everywhere
};

// Fine-tuning for the twists above (only matters when that twist is on)
export const TWIST_SETTINGS = {
  rainbowSpeed: 1,                // rainbowRoad: how fast the colors move
  moonGravity: 0.4,               // moonGravity: 0.4 = gravity is 40% as strong
  coinRainChance: 12,             // coinRain: how much more often coins appear
};
