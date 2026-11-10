// track.js — where the road is. The car can't drive off it, and stuff only appears on it.
// The road width lives in CONFIG.road.width.

import { CONFIG } from './config.js';

export const ROAD_LEFT = (CONFIG.width - CONFIG.road.width) / 2;
export const ROAD_RIGHT = ROAD_LEFT + CONFIG.road.width;
export const clampToRoad = (x, r) => Math.max(ROAD_LEFT + r, Math.min(ROAD_RIGHT - r, x));
