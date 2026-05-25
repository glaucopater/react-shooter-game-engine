import {
  ENEMY_MAX_SPEED,
  PLAYER_AVATAR,
  PLAYER_AVATAR_DEAD,
  PLAYER_AVATAR_SICK,
  audio,
  DEFAULT_PLAYER_WIDTH,
  DEFAULT_PLAYER_HEIGHT,
} from "../constants";
import { Position } from "../custom-types";
import { WallProps } from "../components/Wall";

export const hasWindow = typeof window !== "undefined";

export function getWindowDimensions() {
  const width = hasWindow ? window.innerWidth : 0;
  const height = hasWindow ? window.innerHeight : 0;

  return {
    width,
    height,
  };
}

export const getWindowSize = () => {
  return { width: window.pageXOffset, height: window.pageYOffset };
};

//generate random rgb number in range
// r
// g
// b
export const getRandomRGBColor = () => {
  return `rgb(${~~(Math.random() * 105) + 150}, ${~~(Math.random() * 80)}, ${~~(
    Math.random() * 32
  )})`;
};

export const getRandomSpeed = (stride: number) => {
  return stride + ~~(Math.random() * 10);
};

export const getRandomPosition = (size: number) => {
  const { height, width } = getWindowDimensions();
  const X = Math.random() < 0.5 ? 0 : width - size * 2;
  const Y = ~~(Math.random() * (height - size * 2));
  return [X, Y];
};

export const getRandomMove = (speed = ENEMY_MAX_SPEED) => {
  return ~~(Math.random() * speed);
};

export const getPlayerAvatar = (health: number) => {
  if (health === 0) return PLAYER_AVATAR_DEAD;
  if (health < 50) return PLAYER_AVATAR_SICK;
  return PLAYER_AVATAR;
};

export const getPlayerNextUp = (
  y: number,
  playerMovementUnit: number,
  size: number
) => {
  const nextY = y - playerMovementUnit;
  return nextY <= 0 + size ? y : nextY;
};

export const getPlayerNextDown = (
  y: number,
  playerMovementUnit: number,
  size: number
) => {
  const nextY = y + playerMovementUnit;

  return nextY >= getWindowDimensions().height - size * 30 ? y : nextY;
};

export const getPlayerNextRight = (
  x: number,
  playerMovementUnit: number,
  size: number
) => {
  const nextX = x + playerMovementUnit;
  return nextX >= getWindowDimensions().width - size * 10 ? x : nextX;
};

export const getPlayerNextLeft = (
  x: number,
  playerMovementUnit: number,
  size: number
) => {
  const nextX = x - playerMovementUnit;
  return nextX <= 0 + size ? x : nextX;
};

export function playSound(
  soundName: string,
  volume: number = 0.3,
  startTime: number = 0
) {
  const sound = audio[soundName as keyof typeof audio];
  if (sound) {
    sound.volume = volume;
    sound.currentTime = startTime;
    sound.play();
  } else {
    console.warn(`Sound "${soundName}" not found.`);
  }
}

const GRID_SIZE = 20;
const WALL_SEGMENT_LENGTHS = [3, 4];
const WALL_COUNT = 3;
const SPAWN_MARGIN = 1;

const coordinateKey = (coordinate: Position) => `${coordinate.x},${coordinate.y}`;

const isInSpawnZone = (
  x: number,
  y: number,
  spawn: Position,
  playerWidth: number,
  playerHeight: number
) =>
  x >= spawn.x - SPAWN_MARGIN &&
  x < spawn.x + playerWidth + SPAWN_MARGIN &&
  y >= spawn.y - SPAWN_MARGIN &&
  y < spawn.y + playerHeight + SPAWN_MARGIN;

const segmentFits = (
  wallCoordinates: Position[],
  occupied: Set<string>,
  spawn: Position,
  playerWidth: number,
  playerHeight: number
) =>
  wallCoordinates.every(
    (coordinate) =>
      coordinate.x >= 0 &&
      coordinate.x < GRID_SIZE &&
      coordinate.y >= 0 &&
      coordinate.y < GRID_SIZE &&
      !occupied.has(coordinateKey(coordinate)) &&
      !isInSpawnZone(
        coordinate.x,
        coordinate.y,
        spawn,
        playerWidth,
        playerHeight
      )
  );

export const generateRandomWalls = (
  playerSpawn: Position,
  playerWidth: number = DEFAULT_PLAYER_WIDTH,
  playerHeight: number = DEFAULT_PLAYER_HEIGHT,
  wallCount: number = WALL_COUNT
): WallProps[] => {
  const occupied = new Set<string>();
  const walls: WallProps[] = [];
  const maxAttempts = 100;

  for (let wallIndex = 0; wallIndex < wallCount; wallIndex++) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const length =
        WALL_SEGMENT_LENGTHS[
          Math.floor(Math.random() * WALL_SEGMENT_LENGTHS.length)
        ];
      const horizontal = Math.random() < 0.5;
      const startX = Math.floor(Math.random() * GRID_SIZE);
      const startY = Math.floor(Math.random() * GRID_SIZE);

      const wallCoordinates = Array.from({ length }, (_, index) => ({
        x: horizontal ? startX + index : startX,
        y: horizontal ? startY : startY + index,
      }));

      if (
        segmentFits(
          wallCoordinates,
          occupied,
          playerSpawn,
          playerWidth,
          playerHeight
        )
      ) {
        wallCoordinates.forEach((coordinate) =>
          occupied.add(coordinateKey(coordinate))
        );
        walls.push({ wallCoordinates });
        break;
      }
    }
  }

  return walls;
};

export const CELL_SIZE = 20;
export const PLAYER_SIZE = 40;

type PixelPoint = { x: number; y: number };

export type AimPoint = PixelPoint & { blocked: boolean };

export const getPlayerCenter = (playerPosition: Position): PixelPoint => ({
  x: playerPosition.x * CELL_SIZE + PLAYER_SIZE / 2,
  y: playerPosition.y * CELL_SIZE + PLAYER_SIZE / 2,
});

const rayIntersectsCell = (
  start: PixelPoint,
  end: PixelPoint,
  cellX: number,
  cellY: number
): number | null => {
  const left = cellX * CELL_SIZE;
  const top = cellY * CELL_SIZE;
  const right = left + CELL_SIZE;
  const bottom = top + CELL_SIZE;
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  let tMin = 0;
  let tMax = 1;

  if (Math.abs(dx) < 1e-9) {
    if (start.x < left || start.x >= right) return null;
  } else {
    const t1 = (left - start.x) / dx;
    const t2 = (right - start.x) / dx;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }

  if (Math.abs(dy) < 1e-9) {
    if (start.y < top || start.y >= bottom) return null;
  } else {
    const t1 = (top - start.y) / dy;
    const t2 = (bottom - start.y) / dy;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }

  if (tMin > tMax || tMax < 0 || tMin > 1) return null;

  const tEnter = Math.max(tMin, 0);
  return tEnter <= 1 ? tEnter : null;
};

export const getBlockedAimPoint = (
  playerPosition: Position,
  targetPosition: PixelPoint,
  walls: WallProps[]
): AimPoint => {
  const start = getPlayerCenter(playerPosition);
  const end = targetPosition;
  let closestT: number | null = null;

  walls.forEach((wall) => {
    wall.wallCoordinates.forEach((cell) => {
      const t = rayIntersectsCell(start, end, cell.x, cell.y);
      if (t !== null && t > 0.001 && (closestT === null || t < closestT)) {
        closestT = t;
      }
    });
  });

  if (closestT === null) {
    return { ...end, blocked: false };
  }

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  const stopDistance = Math.max(closestT * distance - 1, 0);
  const tFinal = distance === 0 ? 0 : stopDistance / distance;

  return {
    x: start.x + dx * tFinal,
    y: start.y + dy * tFinal,
    blocked: true,
  };
};

export const hasLineOfSight = (
  playerPosition: Position,
  targetPosition: PixelPoint,
  walls: WallProps[]
) => !getBlockedAimPoint(playerPosition, targetPosition, walls).blocked;
