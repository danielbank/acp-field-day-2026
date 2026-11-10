// config.js — every knob the class can vote on lives here.
// Change a value, save the file, and the game reloads with the change.

export const CONFIG = {
  // ---- The screen ----
  width: 960,                     // Game width in pixels (it stretches to fit any screen)
  height: 640,                    // Game height in pixels
  backgroundColor: '#2a1608',     // Fallback color behind everything
  skyTopColor: '#24120a',         // Dusty wasteland sky at the top
  skyBottomColor: '#9a4a1c',      // Dusty wasteland sky at the bottom (rusty orange glow)
  showStars: true,                // Faint stars through the dust? true or false
  starColor: '#f0c89a',           // Color of the background stars
  showRoad: true,                 // Draw the dusty space road? true or false
  roadColor: '#4a2e1a',           // Road color
  roadLineColor: '#e8b04a',       // Dashed line down the middle of the road
  roadScrollSpeed: 320,           // How fast the road zooms past

  // ---- The hero ----
  hero: {
    name: 'Captain Tater',        // The hero's name (shown on the title screen)
    width: 64,                    // How wide the rocket car is
    height: 92,                   // How long the rocket car is
    speed: 460,                   // How fast the car slides left and right (at level 1)
    carColor: '#c1440e',          // Rocket car paint
    stripeColor: '#ffd166',       // Racing stripe
    potatoColor: '#c8a165',       // The potato driver's skin
    potatoSpotColor: '#9c7646',   // Potato spots
    eyeColor: '#1a1026',          // Eyes and smile
    flameColor: '#ffb703',        // Rocket flame
    slowSeconds: 1.2,             // After a bonk, the car is slow for this long
    slowFactor: 0.5,              // How slow (0.5 = half speed)
  },

  // ---- The things that fall ----
  faller: {
    name: 'space junk',           // What we call the falling things (used in on-screen text)
    look: 'junk',                 // How they're drawn: 'junk', 'asteroid' or 'ball'
    color: '#8a5a3b',             // Main color (rust)
    outlineColor: '#d98c4a',      // Outline color
    hasFace: true,                // Give them little friendly eyes? true or false
    minSize: 24,                  // Smallest size (radius in pixels)
    maxSize: 46,                  // Biggest size (radius in pixels)
    startSpeed: 200,              // How fast they fall on lap 1
    maxSpeed: 620,                // They never fall faster than this
    spin: 2,                      // How fast they spin (0 = no spinning)
  },

  // ---- Spawning & difficulty ramp (gets harder every lap of the quest) ----
  spawnEverySeconds: 0.9,         // On lap 1, new junk appears this often (in seconds)
  fastestSpawnSeconds: 0.25,      // Never spawn faster than this
  speedUpPerLap: 40,              // Each lap, junk falls this much faster
  spawnFasterPerLap: 0.1,         // Each lap, the wait between junk shrinks by this many seconds

  // ---- Coins (coins = XP!) ----
  coins: {
    spawnEverySeconds: 0.6,       // A new coin appears this often during the race
    size: 16,                     // Coin size (radius)
    speed: 230,                   // How fast coins fall
    color: '#ffd166',             // Coin gold
    shineColor: '#fff3b0',        // Coin shine
    xp: 1,                        // XP for each coin
  },

  // ---- RPG leveling ----
  rpg: {
    xpToLevel2: 10,               // XP needed to go from level 1 to level 2
    xpGrowthPerLevel: 5,          // Each level needs this much more XP than the last
    xpLostPerBonk: 3,             // A bonk costs this much XP (you never lose the game!)
    carSpeedPerLevel: 25,         // Each level, the car gets this much faster
    totSizePerLevel: 1.5,         // Each level, tater tots get this much bigger
    fireFasterPerLevel: 0.02,     // Each level, tots fire this many seconds faster
  },
  invincibleSeconds: 1.5,         // After a bonk, the car blinks and can't be bonked again for this long

  // ---- Tater tot blaster ----
  tots: {
    size: 9,                      // Tot size at level 1
    speed: 720,                   // How fast tots fly up
    fireEverySeconds: 0.3,        // Time between tots when you hold SPACE (level 1)
    fastestFireSeconds: 0.08,     // Never fire faster than this
    color: '#e9a23b',             // Tot color
    outlineColor: '#9c5a12',      // Tot crispy edges
  },

  // ---- Ultimate French Fry Move (press F) ----
  fry: {
    unlockLevel: 3,               // Level when the fry move unlocks
    chargeNeeded: 15,             // Coins/targets needed to fill the fry meter
    seconds: 1.4,                 // How long the fry blast lasts
    color: '#ffd23f',             // Fry color
  },

  // ---- Quest stages (they loop forever: race → targets → puzzle → boss → race …) ----
  race: {
    seconds: 20,                  // How long the drive to the destination takes
    destination: 'TATERTOWN',     // Destination name (written in alien letters!)
  },
  targets: {
    toHit: 8,                     // Targets to hit on lap 1
    extraPerLap: 2,               // Extra targets each lap
    maxSeconds: 30,               // Stage ends after this long no matter what
    onScreen: 3,                  // How many targets float around at once
    size: 30,                     // Target size (radius)
    speed: 140,                   // How fast targets slide side to side
    xp: 2,                        // XP per target
    junkEverySeconds: 2.2,        // A little junk still falls during target practice
  },
  puzzle: {
    words: ['SPUD', 'TOT', 'FRY', 'MASH', 'YAM', 'CHIP', 'TATER'], // Secret words to decode
    xp: 3,                        // XP for each correct letter
    decoys: 4,                    // Extra letters in the decoder chart
  },
  boss: {
    name: 'DJ SPUDZ',             // The rapping potato boss
    hp: 3,                        // Mega-tot bonks needed on lap 1
    extraHpPerLap: 1,             // Extra bonks needed each lap
    size: 80,                     // Boss size (radius)
    color: '#b5834a',             // Boss potato color
    headphoneColor: '#7b2cbf',    // Headphones color
    beatBombEverySeconds: 1.1,    // How often he drops a beat-bomb
    beatBombSpeed: 250,           // How fast beat-bombs fall
    chargePerMash: 7,             // Mega-tot charge per SPACE press (out of 100)
    chargePerMashPerLevel: 0.6,   // Extra charge per press for each level you have
    chargeDrainPerSecond: 14,     // The charge leaks away if you stop mashing
    bonkXp: 5,                    // XP per mega-tot bonk
    defeatXp: 15,                 // XP for beating him
    lyrics: ['SPUD LIFE', 'MASH IT UP', 'TOT TOT TOT', 'FRY GUY', 'YAM JAM'], // Rap lines (shown in alien letters)
  },
  crowd: {
    count: 16,                    // How many potato fans cheer at the boss fight
  },

  // ---- Colors & text ----
  colors: {
    text: '#fff1dc',              // Main text color (bright, for the projector)
    accent: '#ffb703',            // Gold for titles and highlights
    silver: '#e0c9a6',            // Sandy color for smaller text
    warning: '#ff7b54',           // Color for banners
    alien: '#7fffd4',             // Glowing alien letters
  },
  font: 'system-ui, "Segoe UI", Arial, sans-serif', // Built-in fonts only (no downloads)
  text: {
    title: 'SPUD RACER QUEST',                    // Big title on the start screen
    subtitle: 'Drive {hero} across the wasteland!', // {hero} gets filled in automatically
    start: 'Press SPACE to start',                // Start instructions
    controls: '← → drive  ·  SPACE shoot / mash / pick  ·  F fry move  ·  P pause  ·  M mute', // Controls hint
    paused: 'PAUSED',                             // Pause screen
    resume: 'Press P to keep playing',            // Pause screen hint
    gameOver: 'GAME OVER',                        // Game over title (you can't actually lose!)
    playAgain: 'Press SPACE to play again',       // Game over hint
    newBest: 'NEW BEST LEVEL!',                   // Shown when you beat your best
    levelUp: 'LEVEL {level}!',                    // Banner when the level goes up
    fryUnlocked: 'FRY MOVE UNLOCKED! Press F',    // Banner when the fry move unlocks
    fryMove: 'ULTIMATE FRY MOVE!',                // Banner when you use it
    raceStage: 'RACE TO {place}!',                // Stage banners…
    targetsStage: 'TARGET PRACTICE!',
    targetsHint: 'Hold SPACE to fire tater tots',
    puzzleStage: 'ALIEN GATE!',
    puzzleHint: 'Drive under the matching letter, press SPACE',
    bossStage: 'BOSS: {boss}!',
    bossHint: 'MASH SPACE to charge the MEGA-TOT!',
    bossBonked: '{boss} BONKED!',
    wrong: 'Try again!',
  },

  // ---- Sound ----
  soundOn: true,                  // Start with sound on? (M toggles it during the game)
  volume: 0.25,                   // How loud (0 = silent, 1 = LOUD)
};

// ---- TWISTS: ready-made surprises. Flip one to true to turn it on! ----
export const TWISTS = {
  speedUpOverTime: false,         // The WHOLE game (hero too) slowly speeds up the longer you play
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
