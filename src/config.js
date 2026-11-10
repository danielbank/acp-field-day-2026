// config.js — every knob the class can vote on lives here.
// Change a value, save the file, and the game reloads with the change.

export const CONFIG = {
  // ---- The screen ----
  width: 960,                     // Game width in pixels (it stretches to fit any screen)
  height: 640,                    // Game height in pixels
  backgroundColor: '#140b24',     // Color around the arena
  font: 'system-ui, "Segoe UI", Arial, sans-serif', // Built-in fonts only (no downloads)

  // ---- The arena (2.5D: the floor is tilted away from you) ----
  arena: {
    width: 900,                   // Arena size left-to-right
    depth: 720,                   // Arena size front-to-back
    tilt: 0.6,                    // How squished the floor looks (1 = looking straight down)
    left: 30,                     // Where the arena starts on screen (pixels from the left)
    top: 175,                     // Where the back edge of the floor is on screen
    tileSize: 76,                 // Size of the floor tiles
    floorColor: '#3c2a63',        // Floor tile color
    floorColor2: '#33234f',       // Other floor tile color (checkerboard)
    wallColor: '#5a189a',         // Arena wall color
    wallTopColor: '#9d4edd',      // Top edge of the walls
  },

  // ---- The robot knight (you!) ----
  hero: {
    name: 'Sir Bolt',             // Default name (you can type your own before playing)
    size: 26,                     // How big the knight's footprint is
    hurtSeconds: 0.9,             // After a bonk, you blink and can't be hurt for this long
    grip: 14,                     // How quickly you start and stop (bigger = snappier)
    oilGrip: 1.3,                 // Grip on oil slicks (tiny = super slippery!)
    drawScale: 1.15,              // How big the knight is drawn
  },

  // ---- Roles: pick one before you play ----
  roles: {
    bonker: {
      label: 'Bonker', blurb: 'Big swings up close. Super tough.',
      abilityName: 'Spin Attack', weapon: 'sword',
      maxHp: 12, speed: 230,      // health and walking speed
      attack: 'swing', damage: 3, reach: 95, arc: 2.2, cooldown: 0.38, // arc = how wide the swing is
      abilityCooldown: 4, spinReach: 135, spinMultiplier: 1.5,
    },
    zapper: {
      label: 'Zapper', blurb: 'Shoots zappy bolts from far away.',
      abilityName: 'Bolt Burst', weapon: 'blaster',
      maxHp: 7, speed: 255,
      attack: 'bolt', damage: 2, boltSpeed: 640, cooldown: 0.25,
      abilityCooldown: 3.5, burstBolts: 14,
    },
    builder: {
      label: 'Builder', blurb: 'Drops spring traps that bonk mobs.',
      abilityName: 'Place Trap', weapon: 'hammer',
      maxHp: 9, speed: 235,
      attack: 'swing', damage: 2, reach: 85, arc: 2.0, cooldown: 0.4,
      abilityCooldown: 1.2, maxTraps: 6,
    },
    fixer: {
      label: 'Fixer', blurb: 'Repairs itself and pops a shield.',
      abilityName: 'Repair + Shield', weapon: 'wrench',
      maxHp: 9, speed: 240,
      attack: 'swing', damage: 2, reach: 85, arc: 2.0, cooldown: 0.38,
      abilityCooldown: 8, heal: 4, shieldSeconds: 3, regenPerSecond: 0.25,
    },
  },

  // ---- Mobs (the hordes!) ----
  mobs: {
    junkbot:    { label: 'Junk-bot', hp: 4, speed: 70, size: 24, damage: 1, coins: 2, points: 10,
                  trapChance: 0.35, actionEvery: 6, color: '#8d99ae' },   // sneaky ones drop tacks
    goo:        { label: 'Goo blob', hp: 4, speed: 85, size: 26, damage: 1, coins: 2, points: 10,
                  actionEvery: 5, color: '#70e000' },                     // splits in two, leaves sticky goo
    babyDragon: { label: 'Baby dragon', hp: 3, speed: 110, size: 18, damage: 1, coins: 4, points: 20,
                  actionEvery: 2.6, flyHeight: 50, sparkSpeed: 300, color: '#ff8c42' },
    beetle:     { label: 'Bomb beetle', hp: 2, speed: 165, size: 18, damage: 1, coins: 2, points: 15,
                  fuseSeconds: 0.6, poofRadius: 80, poofDamage: 2, color: '#e63946' },
  },

  // ---- Waves: how many of each mob. After the last wave comes the DRAGON! ----
  waves: [
    { junkbot: 8 },
    { junkbot: 8, goo: 4 },
    { junkbot: 6, goo: 5, beetle: 5 },
    { junkbot: 6, goo: 5, beetle: 5, babyDragon: 3 },
    { junkbot: 10, goo: 7, beetle: 7, babyDragon: 5 },
  ],
  spawnEverySeconds: 0.45,        // A new mob appears this often during a wave
  maxMobsAtOnce: 18,              // Never more than this many mobs at once
  firstBreakSeconds: 4,           // Countdown before wave 1
  breakSeconds: 25,               // Shop time between waves (press ENTER to skip)
  waveBonusCoins: 5,              // Bonus coins for clearing a wave (times the wave number)

  // ---- New Game+ (after you beat the dragon) ----
  newGamePlus: {
    hpBoostPerLoop: 0.6,          // Mobs get this much more health each loop (0.6 = +60%)
    countBoostPerLoop: 0.3,       // ...and there are this many more of them
    speedBoostPerLoop: 0.1,       // ...and they're this much faster
  },

  // ---- The dragon boss ----
  dragon: {
    name: 'SCORCHY THE DRAGON',   // Shown on the boss health bar
    hp: 150,                      // Dragon health
    size: 70,                     // How big the dragon is
    speed: 80,                    // Walking speed
    bodyColor: '#2a9d8f',         // Scales
    bellyColor: '#ffd166',        // Tummy
    wingColor: '#e76f51',         // Wings
    touchDamage: 1,               // Bumping into the dragon
    walkSeconds: 2.2,             // Rest time between attacks
    breathWindup: 0.6, breathSeconds: 1.8, flameEvery: 0.05, flameSpeed: 360, flameDamage: 1,
    swipeRadius: 170, swipeWindup: 0.7, swipeDamage: 2,
    diveHeight: 700, diveAimSeconds: 1.1, diveRadius: 120, diveDamage: 2,
    untouchableHeight: 60,        // When it flies higher than this, you can't hit it
    summonAtHealth: 0.5,          // At half health it calls baby dragons for help
    summonCount: 3,
    coins: 50, points: 500,
  },

  // ---- The flaming sword (the dragon's prize!) ----
  flameSword: {
    damageMultiplier: 2,          // Hits do this many times more damage
    reachBonus: 30,               // Swings reach farther
  },

  // ---- Booby traps on the arena floor ----
  hazards: {
    spikeUpSeconds: 1.2,          // Spikes stay up this long...
    spikeDownSeconds: 2.2,        // ...then down this long
    spikeSize: 64,                // Size of a spike pad
    spikeDamage: 1,               // Spike damage to you
    spikeMobDamage: 2,            // Spike damage to mobs
    bumperSize: 26,               // Size of a bumper post
    bumperForce: 650,             // How hard bumpers bounce you away
    oilMobSlow: 0.6,              // Mobs on oil move this fast (0.6 = 60% speed)
    layout: [                     // Where everything is (x = left-right, y = back-front)
      { type: 'spikes', x: 230, y: 300, offset: 0 },
      { type: 'spikes', x: 670, y: 300, offset: 1.1 },
      { type: 'spikes', x: 450, y: 640, offset: 2.2 },
      { type: 'bumper', x: 450, y: 220 },
      { type: 'bumper', x: 170, y: 560 },
      { type: 'bumper', x: 730, y: 560 },
      { type: 'oil', x: 300, y: 470, r: 70 },
      { type: 'oil', x: 640, y: 150, r: 60 },
    ],
  },

  // ---- Placed traps ----
  traps: {
    springSize: 26, springUses: 3, springDamage: 5,  // Builder / Trap Pack spring traps
    tackSize: 16, tackDamage: 1, tackSeconds: 15,    // Tacks that sneaky junk-bots drop
    gooSize: 36, gooSeconds: 7, gooSlow: 0.5,        // Sticky goo puddles (you walk at half speed)
  },

  // ---- Enchantments (buy them at the shop) ----
  enchants: {
    fire: { label: 'Fire', color: '#ff7b00', burnSeconds: 3, burnDamagePerSecond: 1.5 },
    ice:  { label: 'Ice',  color: '#8ecae6', chillSeconds: 2.5, slow: 0.45 },
    zap:  { label: 'Zap',  color: '#ffee32', chainCount: 2, chainRange: 170, chainDamage: 0.6 },
    armorDamage: 2,               // Enchanted armor hits mobs that bonk you this hard
  },

  // ---- The shop (walk into the door between waves) ----
  shop: {
    x: 40, y: 0, w: 140, h: 70,   // Where the shop building sits
    doorRadius: 42,               // How close you must get to the door
    items: [
      { label: 'Sharper Weapon', desc: '+1 damage', effect: 'damage', amount: 1, cost: 20, costUp: 15 },
      { label: 'Turbo Wheels', desc: '+12% speed', effect: 'speed', amount: 0.12, cost: 15, costUp: 10 },
      { label: 'Bigger Battery', desc: '+3 max health', effect: 'maxHp', amount: 3, cost: 20, costUp: 10 },
      { label: 'Repair Kit', desc: 'Fix all your health', effect: 'repair', cost: 12 },
      { label: 'Trap Pack', desc: '+3 spring traps (press Q)', effect: 'traps', amount: 3, cost: 15 },
      { label: 'Fire Weapon', desc: 'Hits set mobs on fire', effect: 'weaponEnchant', element: 'fire', cost: 35 },
      { label: 'Ice Weapon', desc: 'Hits freeze mobs slow', effect: 'weaponEnchant', element: 'ice', cost: 35 },
      { label: 'Zap Weapon', desc: 'Hits zap nearby mobs too', effect: 'weaponEnchant', element: 'zap', cost: 35 },
      { label: 'Fire Armor', desc: 'Mobs that bonk you get burned', effect: 'armorEnchant', element: 'fire', cost: 30 },
      { label: 'Ice Armor', desc: 'Mobs that bonk you get frozen', effect: 'armorEnchant', element: 'ice', cost: 30 },
      { label: 'Zap Armor', desc: 'Mobs that bonk you get zapped', effect: 'armorEnchant', element: 'zap', cost: 30 },
    ],
  },

  // ---- Character customization choices ----
  customize: {
    bodyColors: ['#9d4edd', '#3a86ff', '#ff006e', '#06d6a0', '#ffbe0b', '#e0e0ea', '#fb5607'],
    armorColors: ['#c0c0d0', '#ffd166', '#8d99ae', '#3c096c', '#ef476f', '#118ab2'],
    eyeColors: ['#4cc9f0', '#80ffdb', '#ff4d6d', '#ffee32', '#ffffff', '#c77dff'],
    helmets: ['plume', 'horns', 'antenna', 'visor'],
    bases: ['wheels', 'treads', 'legs'],
    plumeColor: '#ff4d6d',
    maxNameLength: 12,
  },

  // ---- Colors & text ----
  colors: {
    text: '#f2ecff',              // Main text color (bright, for the projector)
    accent: '#c77dff',            // Purple for titles and highlights
    silver: '#c0c0d0',            // Silver for smaller text
    warning: '#ff7eb6',           // Banners and GAME OVER
    gold: '#ffd166',              // Coins
    good: '#80ffdb',              // Health and good news
    bad: '#ff4d6d',               // Ouch
  },
  text: {
    title: 'ROBO KNIGHTS',
    subtitle: 'Bonk the hordes. Beat the dragon. Win the flaming sword!',
    start: 'Press ENTER to build your knight',
    controls: 'WASD move  ·  Mouse aim + click attack  ·  SPACE ability  ·  Q trap  ·  P pause  ·  M mute',
    customizeTitle: 'BUILD YOUR ROBOT KNIGHT',
    customizeHint: '↑ ↓ choose  ·  ← → change  ·  type your name  ·  ENTER to battle!',
    paused: 'PAUSED',
    resume: 'Press P to keep playing',
    gameOver: 'KNIGHT BONKED!',
    playAgain: 'Press ENTER to try again',
    newBest: 'NEW BEST SCORE!',
    waveStart: 'WAVE {wave}!',
    waveCleared: 'WAVE CLEARED! Shop is open',
    dragonArrives: 'THE DRAGON AWAKENS!',
    dragonSummons: 'Baby dragons to the rescue!',
    dragonBonked: 'DRAGON BONKED!',
    victory: 'YOU WON THE FLAMING SWORD!',
    victoryHint: 'Press ENTER for NEW GAME+ {loop} — harder waves, keep all your gear!',
    shopTitle: 'ROBO SHOP',
    shopHint: '↑ ↓ choose  ·  ENTER buy  ·  ESC leave',
  },

  // ---- Sound ----
  soundOn: true,                  // Start with sound on? (M toggles it during the game)
  volume: 0.2,                    // How loud (0 = silent, 1 = LOUD)
};

// ---- TWISTS: ready-made surprises. Flip one to true to turn it on! ----
export const TWISTS = {
  doubleCoins: false,             // Every coin is worth double
  turboMobs: false,               // All mobs zoom around faster
  giantKnight: false,             // Your robot knight is HUGE (and a bigger target!)
};

// Fine-tuning for the twists above (only matters when that twist is on)
export const TWIST_SETTINGS = {
  coinMultiplier: 2,              // doubleCoins: how much each coin is worth
  turboSpeed: 1.6,                // turboMobs: how much faster mobs move
  giantScale: 1.6,                // giantKnight: how much bigger you are
};
