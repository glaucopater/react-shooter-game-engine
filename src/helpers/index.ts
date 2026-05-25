import {
  ENEMY_MAX_SPEED,
  PLAYER_AVATAR,
  PLAYER_AVATAR_DEAD,
  PLAYER_AVATAR_SICK,
  audio,
  DEFAULT_PLAYER_WIDTH,
  DEFAULT_PLAYER_HEIGHT,
  BASE_WALL_COUNT,
  GRID_CELL_COUNT,
  GRID_PIXEL_SIZE,
  SHOTGUN_AOE_RADIUS,
  SHOTGUN_SPREAD_COUNT,
  SHOTGUN_SPREAD_ANGLE,
  RICOCHET_MAX_BOUNCES,
} from "../constants";
import { Position, SpecialWeaponType } from "../custom-types";
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
  wallCount: number = BASE_WALL_COUNT
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

export const getWallCellKeys = (walls: WallProps[]): Set<string> => {
  const cells = new Set<string>();
  walls.forEach((wall) =>
    wall.wallCoordinates.forEach((coordinate) =>
      cells.add(coordinateKey(coordinate))
    )
  );
  return cells;
};

export const isPositionOnWall = (position: Position, walls: WallProps[]) =>
  getWallCellKeys(walls).has(coordinateKey(position));

export const getEntityFootprintCells = (
  position: Position,
  width: number,
  height: number
): Position[] => {
  const cells: Position[] = [];
  const baseX = Math.floor(position.x);
  const baseY = Math.floor(position.y);

  for (let dx = 0; dx < width; dx++) {
    for (let dy = 0; dy < height; dy++) {
      cells.push({ x: baseX + dx, y: baseY + dy });
    }
  }

  return cells;
};

export const isOpenGridCell = (
  position: Position,
  walls: WallProps[],
  blocked: Position[] = []
) => {
  const key = coordinateKey(position);
  const blockedKeys = new Set(blocked.map((cell) => coordinateKey(cell)));

  return !getWallCellKeys(walls).has(key) && !blockedKeys.has(key);
};

export const getRandomOpenPosition = (
  walls: WallProps[],
  options?: {
    maxX?: number;
    maxY?: number;
    blocked?: Position[];
    maxAttempts?: number;
  }
): Position | null => {
  const maxX = options?.maxX ?? GRID_CELL_COUNT;
  const maxY = options?.maxY ?? GRID_CELL_COUNT;
  const maxAttempts = options?.maxAttempts ?? 250;
  const blocked = options?.blocked ?? [];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const position = {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY),
    };

    if (isOpenGridCell(position, walls, blocked)) {
      return position;
    }
  }

  return null;
};

export const CELL_SIZE = 20;
export const PLAYER_SIZE = 40;

export type PixelPoint = { x: number; y: number };

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

export const isEnemyCollidingWithPlayer = (
  enemy: Position,
  player: Position,
  playerWidth: number,
  playerHeight: number
) => {
  const enemyCellX = Math.floor(enemy.x);
  const enemyCellY = Math.floor(enemy.y);

  return (
    enemyCellX >= player.x &&
    enemyCellX < player.x + playerWidth &&
    enemyCellY >= player.y &&
    enemyCellY < player.y + playerHeight
  );
};

export const isEnemyPositionBlocked = (
  x: number,
  y: number,
  walls: WallProps[],
  enemyWidth: number,
  enemyHeight: number,
  gridSize: number = GRID_SIZE
) => {
  const gridX = Math.floor(x);
  const gridY = Math.floor(y);

  if (
    gridX < 0 ||
    gridY < 0 ||
    gridX + enemyWidth > gridSize ||
    gridY + enemyHeight > gridSize
  ) {
    return true;
  }

  for (let dx = 0; dx < enemyWidth; dx++) {
    for (let dy = 0; dy < enemyHeight; dy++) {
      if (
        walls.some((wall) =>
          wall.wallCoordinates.some(
            (coordinate) =>
              coordinate.x === gridX + dx && coordinate.y === gridY + dy
          )
        )
      ) {
        return true;
      }
    }
  }

  return false;
};

export const getEnemyNextPosition = (
  enemy: Position,
  target: Position,
  step: number,
  walls: WallProps[],
  enemyWidth: number,
  enemyHeight: number
): Position => {
  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 0.01) {
    return enemy;
  }

  const moveX = (dx / distance) * step;
  const moveY = (dy / distance) * step;
  const isBlocked = (nextX: number, nextY: number) =>
    isEnemyPositionBlocked(nextX, nextY, walls, enemyWidth, enemyHeight);

  const candidates = [
    { x: enemy.x + moveX, y: enemy.y + moveY },
    { x: enemy.x + moveX, y: enemy.y },
    { x: enemy.x, y: enemy.y + moveY },
    { x: enemy.x - moveY * 0.35, y: enemy.y + moveX * 0.35 },
    { x: enemy.x + moveY * 0.35, y: enemy.y - moveX * 0.35 },
  ];

  for (const candidate of candidates) {
    if (!isBlocked(candidate.x, candidate.y)) {
      return candidate;
    }
  }

  return enemy;
};

export const isPointInGridCell = (
  pixelX: number,
  pixelY: number,
  cell: Position
) =>
  pixelX >= cell.x * CELL_SIZE &&
  pixelX < (cell.x + 1) * CELL_SIZE &&
  pixelY >= cell.y * CELL_SIZE &&
  pixelY < (cell.y + 1) * CELL_SIZE;

export const getGridCellCenter = (cell: Position): PixelPoint => ({
  x: cell.x * CELL_SIZE + CELL_SIZE / 2,
  y: cell.y * CELL_SIZE + CELL_SIZE / 2,
});

export const isPositionInRadius = (
  cell: Position,
  center: PixelPoint,
  radius: number
) => {
  const cellCenter = getGridCellCenter(cell);
  return Math.hypot(cellCenter.x - center.x, cellCenter.y - center.y) <= radius;
};

export const isPlayerInFireZone = (
  player: Position,
  playerWidth: number,
  playerHeight: number,
  fireZone: { x: number; y: number },
  radius: number
) => {
  const center = getGridCellCenter(fireZone);

  for (let dx = 0; dx < playerWidth; dx++) {
    for (let dy = 0; dy < playerHeight; dy++) {
      if (
        isPositionInRadius(
          { x: player.x + dx, y: player.y + dy },
          center,
          radius
        )
      ) {
        return true;
      }
    }
  }

  return false;
};

export const getRayDirection = (
  start: PixelPoint,
  target: PixelPoint
): PixelPoint => {
  const dx = target.x - start.x;
  const dy = target.y - start.y;
  const length = Math.hypot(dx, dy);

  if (length < 1e-9) {
    return { x: 1, y: 0 };
  }

  return { x: dx / length, y: dy / length };
};

export const rotateDirection = (
  direction: PixelPoint,
  angleRadians: number
): PixelPoint => {
  const cos = Math.cos(angleRadians);
  const sin = Math.sin(angleRadians);

  return {
    x: direction.x * cos - direction.y * sin,
    y: direction.x * sin + direction.y * cos,
  };
};

const getSpreadAngles = (count: number, totalSpreadRadians: number) => {
  if (count <= 1) {
    return [0];
  }

  const step = totalSpreadRadians / (count - 1);

  return Array.from(
    { length: count },
    (_, index) => -totalSpreadRadians / 2 + step * index
  );
};

export const getShotgunSpreadPaths = (
  playerPosition: Position,
  aimPixel: PixelPoint,
  walls: WallProps[]
): PixelPoint[][] => {
  const start = getPlayerCenter(playerPosition);
  const aimPoint = getBlockedAimPoint(playerPosition, aimPixel, walls);
  const baseDirection = getRayDirection(start, aimPoint);
  const distance = Math.max(
    Math.hypot(aimPoint.x - start.x, aimPoint.y - start.y),
    SHOTGUN_AOE_RADIUS
  );

  return getSpreadAngles(SHOTGUN_SPREAD_COUNT, SHOTGUN_SPREAD_ANGLE * 2).map(
    (angle) => {
      const direction = rotateDirection(baseDirection, angle);
      const end = getRayEndPoint(start, direction, distance);
      const wallHit = findClosestWallIntersection(start, end, walls);
      const segmentEnd = wallHit
        ? {
            x: start.x + (end.x - start.x) * wallHit.t,
            y: start.y + (end.y - start.y) * wallHit.t,
          }
        : end;

      return [start, segmentEnd];
    }
  );
};

const getRayEndPoint = (
  start: PixelPoint,
  direction: PixelPoint,
  distance: number
): PixelPoint => ({
  x: start.x + direction.x * distance,
  y: start.y + direction.y * distance,
});

const findClosestWallIntersection = (
  start: PixelPoint,
  end: PixelPoint,
  walls: WallProps[]
): { t: number; cell: Position } | null => {
  let closestT: number | null = null;
  let hitCell: Position | null = null;

  walls.forEach((wall) => {
    wall.wallCoordinates.forEach((cell) => {
      const t = rayIntersectsCell(start, end, cell.x, cell.y);
      if (t !== null && t > 0.001 && (closestT === null || t < closestT)) {
        closestT = t;
        hitCell = cell;
      }
    });
  });

  if (closestT === null || hitCell === null) {
    return null;
  }

  return { t: closestT, cell: hitCell };
};

const getEnemyHitsOnSegment = (
  start: PixelPoint,
  end: PixelPoint,
  enemies: Position[]
): { index: number; t: number }[] => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared < 1e-9) {
    return [];
  }

  const hits: { index: number; t: number }[] = [];

  enemies.forEach((enemy, index) => {
    const center = {
      x: enemy.x * CELL_SIZE + CELL_SIZE / 2,
      y: enemy.y * CELL_SIZE + CELL_SIZE / 2,
    };
    const t = ((center.x - start.x) * dx + (center.y - start.y) * dy) / lengthSquared;

    if (t <= 0.001 || t > 1) {
      return;
    }

    const closestPoint = {
      x: start.x + dx * t,
      y: start.y + dy * t,
    };
    const distance = Math.hypot(center.x - closestPoint.x, center.y - closestPoint.y);

    if (distance <= CELL_SIZE / 2) {
      hits.push({ index, t });
    }
  });

  return hits.sort((a, b) => a.t - b.t);
};

const reflectDirection = (
  direction: PixelPoint,
  cell: Position,
  impactPoint: PixelPoint
): PixelPoint => {
  const left = cell.x * CELL_SIZE;
  const right = left + CELL_SIZE;
  const top = cell.y * CELL_SIZE;
  const bottom = top + CELL_SIZE;

  const distLeft = Math.abs(impactPoint.x - left);
  const distRight = Math.abs(impactPoint.x - right);
  const distTop = Math.abs(impactPoint.y - top);
  const distBottom = Math.abs(impactPoint.y - bottom);
  const minDist = Math.min(distLeft, distRight, distTop, distBottom);

  if (minDist === distLeft || minDist === distRight) {
    return { x: -direction.x, y: direction.y };
  }

  return { x: direction.x, y: -direction.y };
};

export const getEnemiesHitByPierceShot = (
  playerPosition: Position,
  aimPixel: PixelPoint,
  enemies: Position[],
  walls: WallProps[]
): number[] => {
  const start = getPlayerCenter(playerPosition);
  const direction = getRayDirection(start, aimPixel);
  const maxDistance = GRID_PIXEL_SIZE * 2;
  const end = getRayEndPoint(start, direction, maxDistance);
  const wallHit = findClosestWallIntersection(start, end, walls);
  const maxT = wallHit?.t ?? 1;

  return getEnemyHitsOnSegment(start, end, enemies)
    .filter(({ t }) => t <= maxT)
    .map(({ index }) => index);
};

export const getEnemiesHitByShotgun = (
  playerPosition: Position,
  aimPixel: PixelPoint,
  enemies: Position[],
  walls: WallProps[],
  radius: number = SHOTGUN_AOE_RADIUS
): number[] =>
  enemies
    .map((enemy, index) => ({ enemy, index }))
    .filter(({ enemy }) => {
      const center = {
        x: enemy.x * CELL_SIZE + CELL_SIZE / 2,
        y: enemy.y * CELL_SIZE + CELL_SIZE / 2,
      };
      const distance = Math.hypot(center.x - aimPixel.x, center.y - aimPixel.y);

      if (distance > radius) {
        return false;
      }

      return hasLineOfSight(playerPosition, center, walls);
    })
    .map(({ index }) => index);

export const traceRicochetPath = (
  playerPosition: Position,
  aimPixel: PixelPoint,
  walls: WallProps[],
  maxBounces: number,
  enemies: Position[] = []
): { segments: [PixelPoint, PixelPoint][]; enemyIndices: number[] } => {
  const playerCenter = getPlayerCenter(playerPosition);
  let origin = playerCenter;
  let direction = getRayDirection(playerCenter, aimPixel);
  const segments: [PixelPoint, PixelPoint][] = [];
  const enemyIndices: number[] = [];
  const seenEnemies = new Set<number>();
  const maxSegmentLength = GRID_PIXEL_SIZE * 2;

  for (let bounce = 0; bounce <= maxBounces; bounce++) {
    const end = getRayEndPoint(origin, direction, maxSegmentLength);
    const wallHit = findClosestWallIntersection(origin, end, walls);
    const segmentEnd = wallHit
      ? {
          x: origin.x + (end.x - origin.x) * wallHit.t,
          y: origin.y + (end.y - origin.y) * wallHit.t,
        }
      : end;

    segments.push([origin, segmentEnd]);

    getEnemyHitsOnSegment(origin, segmentEnd, enemies).forEach(({ index }) => {
      if (!seenEnemies.has(index)) {
        seenEnemies.add(index);
        enemyIndices.push(index);
      }
    });

    if (!wallHit || bounce === maxBounces) {
      break;
    }

    direction = reflectDirection(direction, wallHit.cell, segmentEnd);
    origin = {
      x: segmentEnd.x + direction.x * 0.01,
      y: segmentEnd.y + direction.y * 0.01,
    };
  }

  return { segments, enemyIndices };
};

export const getSpecialWeaponAimPath = (
  type: SpecialWeaponType,
  playerPosition: Position,
  aimPixel: PixelPoint,
  walls: WallProps[]
): PixelPoint[][] => {
  const start = getPlayerCenter(playerPosition);

  if (type === "ricochet") {
    return traceRicochetPath(
      playerPosition,
      aimPixel,
      walls,
      RICOCHET_MAX_BOUNCES
    ).segments.map(([segmentStart, segmentEnd]) => [segmentStart, segmentEnd]);
  }

  if (type === "pierce") {
    const direction = getRayDirection(start, aimPixel);
    const end = getRayEndPoint(start, direction, GRID_PIXEL_SIZE * 2);
    const wallHit = findClosestWallIntersection(start, end, walls);
    const segmentEnd = wallHit
      ? {
          x: start.x + (end.x - start.x) * wallHit.t,
          y: start.y + (end.y - start.y) * wallHit.t,
        }
      : end;

    return [[start, segmentEnd]];
  }

  if (type === "shotgun") {
    return getShotgunSpreadPaths(playerPosition, aimPixel, walls);
  }

  const aimPoint = getBlockedAimPoint(playerPosition, aimPixel, walls);
  return [[start, { x: aimPoint.x, y: aimPoint.y }]];
};

export const getEnemiesHitBySpecialWeapon = (
  type: SpecialWeaponType,
  playerPosition: Position,
  aimPixel: PixelPoint,
  enemies: Position[],
  walls: WallProps[]
): number[] => {
  switch (type) {
    case "pierce":
      return getEnemiesHitByPierceShot(
        playerPosition,
        aimPixel,
        enemies,
        walls
      );
    case "shotgun":
      return getEnemiesHitByShotgun(
        playerPosition,
        aimPixel,
        enemies,
        walls
      );
    case "ricochet":
      return traceRicochetPath(
        playerPosition,
        aimPixel,
        walls,
        RICOCHET_MAX_BOUNCES,
        enemies
      ).enemyIndices;
  }
};
