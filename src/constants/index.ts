export const PLAYER_AVATAR = "🤨";
export const PLAYER_AVATAR_SICK = "🥵";
export const PLAYER_AVATAR_DEAD = "💀";
export const ENEMY_AVATARS = ["👽", "👾"];
export const FIRE_AVATAR = "🔥";
export const TARGET_AVATAR = "💢";
export const POWERUPS_AVATARS = [
  "🍇",
  "🍈",
  "🍉",
  "🍊",
  "🍒",
  "🍑",
  "🍍",
  "🍰",
  "🍭",
];

export const getRandomPowerupAvatar = () =>
  POWERUPS_AVATARS[Math.floor(Math.random() * POWERUPS_AVATARS.length)];
export const AMMO_AVATAR = "🔫";
export const BOMB_AVATAR = "💣";

import { SpecialWeaponType } from "../custom-types";

export const SPECIAL_WEAPON_MAX_SHOTS = 5;
export const SPECIAL_WEAPON_SPAWN_DELAY_SECONDS = 12;
export const SHOTGUN_AOE_RADIUS = 50;
export const SHOTGUN_SPREAD_COUNT = 3;
export const SHOTGUN_SPREAD_ANGLE = 0.35;
export const RICOCHET_MAX_BOUNCES = 3;
export const GRID_PIXEL_SIZE = 400;

export const SPECIAL_WEAPON_TYPES: SpecialWeaponType[] = [
  "pierce",
  "shotgun",
  "ricochet",
];

export const SPECIAL_WEAPON_AVATARS: Record<SpecialWeaponType, string> = {
  pierce: "⚡",
  shotgun: "💥",
  ricochet: "🔄",
};

export const SPECIAL_WEAPON_LABELS: Record<SpecialWeaponType, string> = {
  pierce: "Pierce Rifle",
  shotgun: "Shotgun",
  ricochet: "Ricochet Rifle",
};

// min is 2 for movement
export const ENEMY_MAX_SPEED = 2;
export const DAMAGE_AREA_SIZE = 5;

export const DEFAULT_ENEMY_SIZE = 30;
export const ENEMY_HIT_SIZE = DEFAULT_ENEMY_SIZE;
export const DEFAULT_ENEMY_DAMAGE = 25;
export const DEFAULT_ENEMY_STRIDE = 7;
export const DEFAULT_ENEMY_WIDTH = 1;
export const DEFAULT_ENEMY_HEIGHT = 1;
export const ENEMY_MOVE_SPEED = 1.2;
export const ENEMY_SPEED_INCREASE_PER_LEVEL = 0.1;

export const ENEMY_INCREMENT_PER_STAGE = 1;
export const ENEMY_INITIAL_COUNT = 1;
export const INITIAL_STAGE = 0;
export const BASE_MAX_CONCURRENT_ENEMIES = 5;
export const TOTAL_ENEMIES_BONUS_PER_LEVEL = 3;
export const BASE_WALL_COUNT = 3;
export const WALLS_ADDED_EVERY_TWO_LEVELS = 1;

export const WIN_SCORE = 20;
export const MAX_LEVEL = 4;
export const PLAYER_MAX_HEALTH = 100;

export const getTotalScore = (level: number, score: number) =>
  (level - 1) * WIN_SCORE + score;

export const getMaxConcurrentEnemies = (level: number) =>
  BASE_MAX_CONCURRENT_ENEMIES + (level - 1) * ENEMY_INCREMENT_PER_STAGE;

export const getMaxTotalEnemySpawns = (level: number) =>
  WIN_SCORE +
  getMaxConcurrentEnemies(level) +
  (level - 1) * TOTAL_ENEMIES_BONUS_PER_LEVEL;

export const getWallCountForLevel = (level: number) =>
  BASE_WALL_COUNT +
  Math.floor((level - 1) / 2) * WALLS_ADDED_EVERY_TWO_LEVELS;

export const getEnemyMoveSpeed = (level: number) =>
  ENEMY_MOVE_SPEED + (level - 1) * ENEMY_SPEED_INCREASE_PER_LEVEL;

export const DEFAULT_PLAYER_WIDTH = 2;
export const DEFAULT_PLAYER_HEIGHT = 2;

export const MAX_BULLETS = 20;
export const MEDIKIT_HEALTH_INCREASE = 5;
export const AMMO_INCREASE = 5;

export const POWERUP_SPAWN_DELAY_SECONDS = 5;
export const POWERUP_DESPAWN_SECONDS = 7;
export const POWERUP_VANISH_DURATION_MS = 500;

export const BOMB_SPAWN_INTERVAL_SECONDS = 12;
export const BOMB_MAX_ON_FIELD = 2;
export const BOMB_EXPLOSION_RADIUS = 45;
export const FIRE_ZONE_DURATION_MS = 3000;
export const FIRE_ZONE_DAMAGE = 15;
export const FIRE_ZONE_TICK_MS = 500;

export const GRID_CELL_COUNT = 20;

export const RANDOM_RANGE_INTERVAL = [5000, 2000];

export const MIN_LEFT_X = 18;
export const MIN_BOTTOM_Y = 18;

import powerup from "../assets/audio/power-up-sparkle-1-177983.mp3";
import loadAmmo from "../assets/audio/rifle-or-shotgun-reload-6787.mp3";
import shotgun from "../assets/audio/080902_shotgun-39753.mp3";
import damage from "../assets/audio/male_hurt7-48124.mp3";
import terrain1 from "../assets/images/terrain1.jpg";
import terrain2 from "../assets/images/terrain2.jpg";
import terrain3 from "../assets/images/terrain3.jpg";
import space1 from "../assets/images/space1.jpg";

export const LEVEL_BACKGROUNDS = [terrain1, terrain2, terrain3, space1];

export const getLevelBackground = (level: number) =>
  LEVEL_BACKGROUNDS[Math.min(Math.max(level, 1), MAX_LEVEL) - 1];

export const audio = {
  powerup: new Audio(powerup),
  loadAmmo: new Audio(loadAmmo),
  shotgun: new Audio(shotgun),
  damage: new Audio(damage),
};

export const defaultWalls = [
  {
    wallCoordinates: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 2, y: 4 },
      { x: 2, y: 5 },
    ],
  },
  {
    wallCoordinates: [
      { x: 17, y: 10 },
      { x: 18, y: 10 },
      { x: 19, y: 10 },
    ],
  },
  {
    wallCoordinates: [
      { x: 9, y: 16 },
      { x: 9, y: 17 },
      { x: 9, y: 18 },
      { x: 9, y: 19 },
    ],
  },
];
