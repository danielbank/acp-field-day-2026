// shop.js — the Car Shop: coins you keep between races, and the upgrades you buy with them.
// Saved in this browser so upgrades stick around. Items and prices live in CONFIG.shop.

import { CONFIG } from './config.js';
import { playSound } from './audio.js';

const SAVE_KEY = 'robo-racer-garage';

export const garage = load();                       // { coins, levels: { engine: 0, armor: 1, … } }
export const shopMenu = { selected: 0, message: '', good: true };

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (saved && typeof saved.coins === 'number') return { coins: saved.coins, levels: { ...saved.levels } };
  } catch { /* nothing saved yet, or storage blocked: start fresh */ }
  return { coins: 0, levels: {} };
}

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(garage)); } catch { /* storage blocked: fine */ }
}

export const levelOf = (id) => garage.levels[id] || 0;

export function addCoins(amount) {
  if (amount <= 0) return;
  garage.coins += amount;
  save();
}

// What your upgrades add up to:
export const topSpeed = () => CONFIG.car.maxSpeed * (1 + CONFIG.shop.engineBoost * levelOf('engine'));
export const maxHealth = () => CONFIG.health.max + CONFIG.shop.armorHealth * levelOf('armor');
export const gatlingBoost = () => 1 + CONFIG.shop.gatlingBoost * levelOf('gatling');
export const extraTurbos = () => levelOf('turbo');
export function paintColor() {
  const level = levelOf('paint');
  const paints = CONFIG.shop.paints;
  return level === 0 || !paints.length ? CONFIG.car.bodyColor : paints[(level - 1) % paints.length];
}

function say(message, good) {
  shopMenu.message = message;
  shopMenu.good = good;
}

function buy(item) {
  const level = levelOf(item.id);
  if (level >= item.prices.length) { playSound('hit'); return say(`${item.name} is maxed out!`, false); }
  const price = item.prices[level];
  if (garage.coins < price) { playSound('hit'); return say(`You need ${price - garage.coins} more coins`, false); }
  garage.coins -= price;
  garage.levels[item.id] = level + 1;
  save();
  playSound('powerup');
  say(`You got: ${item.name}!`, true);
}

// Key presses while the shop is open ('up', 'down', 'start' = buy).
export function shopAction(action) {
  const items = CONFIG.shop.items;
  if (action === 'up') shopMenu.selected = (shopMenu.selected + items.length - 1) % items.length;
  if (action === 'down') shopMenu.selected = (shopMenu.selected + 1) % items.length;
  if (action === 'start') buy(items[shopMenu.selected]);
}

export function openShop() {
  shopMenu.message = '';
}
