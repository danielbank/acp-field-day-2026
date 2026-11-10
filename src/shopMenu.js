// shopMenu.js — the shopping menu that opens when you walk into the shop door between waves.
// Items and prices live in CONFIG.shop.items; ITEM_EFFECTS says what each kind of item does.

import { CONFIG } from './config.js';
import { state } from './state.js';
import { input, menuDir } from './input.js';
import { playSound } from './audio.js';
import { shopDoor } from './entities/shop.js';
import { text, panel, dimScreen } from './ui.js';

const ITEMS = CONFIG.shop.items;
const PANEL = { x: 150, y: 40, w: 660, h: 560 };
const ROW_TOP = 130;
const ROW_H = 38;
let cursor = 0;
let message = '';

const ITEM_EFFECTS = {
  damage: (h, item) => { h.upgrades.damage += item.amount; },
  speed: (h, item) => { h.upgrades.speed += item.amount; },
  maxHp: (h, item) => { h.upgrades.maxHp += item.amount; h.maxHp += item.amount; h.hp += item.amount; },
  repair: (h) => { h.hp = h.maxHp; },
  traps: (h, item) => { h.trapCharges += item.amount; },
  weaponEnchant: (h, item) => { h.weaponEnchant = item.element; },
  armorEnchant: (h, item) => { h.armorEnchant = item.element; },
};

export function openShop() {
  state.screen = 'shop';
  message = 'Welcome, knight! What would you like?';
  input.mouseDown = false;
  playSound('door');
}

function closeShop() {
  const h = state.hero;
  state.screen = 'playing';
  h.x = shopDoor.x;
  h.y = shopDoor.y + 70;
  h.vx = h.vy = 0;
  input.mouseDown = false;
}

function price(item) {
  return item.cost + (item.costUp ?? 0) * (state.hero.bought[item.label] ?? 0);
}

function isOwned(item) {
  const h = state.hero;
  return (item.effect === 'weaponEnchant' && h.weaponEnchant === item.element)
    || (item.effect === 'armorEnchant' && h.armorEnchant === item.element);
}

function buy(item) {
  const h = state.hero;
  if (isOwned(item)) { message = 'You already have that one!'; return playSound('nope'); }
  if (item.effect === 'repair' && h.hp >= h.maxHp) { message = "You're already fully repaired!"; return playSound('nope'); }
  const cost = price(item);
  if (state.coins < cost) { message = `You need ${cost - state.coins} more coins.`; return playSound('nope'); }
  state.coins -= cost;
  h.bought[item.label] = (h.bought[item.label] ?? 0) + 1;
  ITEM_EFFECTS[item.effect](h, item);
  message = `Bought ${item.label}!`;
  playSound('buy');
}

export function handleShopAction(action) {
  const dir = menuDir(action);
  if (dir === 'up') cursor = (cursor + ITEMS.length - 1) % ITEMS.length;
  else if (dir === 'down') cursor = (cursor + 1) % ITEMS.length;
  else if (action === 'confirm' || action === 'space') buy(ITEMS[cursor]);
  else if (action === 'back' || action === 'pause' || action === 'blur') closeShop();
  else if (/^char:[1-9]$/.test(action)) {
    cursor = Number(action.slice(5)) - 1;
    if (ITEMS[cursor]) buy(ITEMS[cursor]); else cursor = 0;
  } else if (action === 'click') {
    const row = Math.floor((input.mouseY - ROW_TOP) / ROW_H);
    const inside = input.mouseX > PANEL.x && input.mouseX < PANEL.x + PANEL.w;
    if (inside && row >= 0 && row < ITEMS.length) { cursor = row; buy(ITEMS[row]); }
    else if (input.mouseY > PANEL.y + PANEL.h - 50 && inside) closeShop();
    input.mouseDown = false;
  }
}

function itemColor(item) {
  if (item.element) return CONFIG.enchants[item.element].color;
  return { damage: '#ff4d6d', speed: '#4cc9f0', maxHp: '#80ffdb', repair: '#80ffdb', traps: '#ff9f1c' }[item.effect];
}

export function drawShopMenu(ctx) {
  const { x, y, w, h } = PANEL;
  dimScreen(ctx, 0.55);
  panel(ctx, x, y, w, h, CONFIG.colors.gold);
  text(ctx, CONFIG.text.shopTitle, x + 24, y + 38, 38, CONFIG.colors.gold, 'left');
  text(ctx, `${state.coins} coins`, x + w - 24, y + 38, 30, CONFIG.colors.gold, 'right');
  text(ctx, message, x + w / 2, y + 72, 18, CONFIG.colors.silver);
  ITEMS.forEach((item, i) => {
    const ry = ROW_TOP + i * ROW_H;
    if (i === cursor) {
      ctx.fillStyle = 'rgba(199,125,255,0.3)';
      ctx.beginPath();
      ctx.roundRect(x + 12, ry + 2, w - 24, ROW_H - 4, 8);
      ctx.fill();
    }
    ctx.fillStyle = itemColor(item);
    ctx.beginPath();
    ctx.arc(x + 36, ry + ROW_H / 2, 9, 0, Math.PI * 2);
    ctx.fill();
    const cost = price(item);
    text(ctx, `${i < 9 ? i + 1 : ' '}  ${item.label}`, x + 54, ry + ROW_H / 2, 20, CONFIG.colors.text, 'left');
    text(ctx, item.desc, x + 300, ry + ROW_H / 2, 15, CONFIG.colors.silver, 'left');
    const owned = isOwned(item);
    text(ctx, owned ? 'OWNED' : `${cost}`, x + w - 28, ry + ROW_H / 2, 20,
      owned ? CONFIG.colors.good : state.coins >= cost ? CONFIG.colors.gold : CONFIG.colors.bad, 'right');
  });
  text(ctx, CONFIG.text.shopHint, x + w / 2, y + h - 26, 18, CONFIG.colors.silver);
}
