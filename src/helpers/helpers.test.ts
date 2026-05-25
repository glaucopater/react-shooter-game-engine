import { vi } from "vitest";
import { audio, ENEMY_MOVE_SPEED, getEnemyMoveSpeed, getMaxConcurrentEnemies, getMaxTotalEnemySpawns, getWallCountForLevel } from "../constants";
import { generateRandomWalls, getRandomOpenPosition, getBlockedAimPoint, getEntityFootprintCells, getPlayerNextLeft, hasLineOfSight, isEnemyCollidingWithPlayer, isEnemyPositionBlocked, getEnemyNextPosition, isOpenGridCell, isPositionOnWall, playSound, getEnemiesHitByPierceShot, getEnemiesHitByShotgun, traceRicochetPath, getSpecialWeaponAimPath, isPointInGridCell } from "./index";
import { RICOCHET_MAX_BOUNCES, SHOTGUN_AOE_RADIUS } from "../constants";

describe("generateRandomWalls", () => {
  const playerSpawn = { x: 9, y: 9 };

  it("generates wall segments within the grid", () => {
    const walls = generateRandomWalls(playerSpawn);

    expect(walls.length).toBeGreaterThan(0);
    walls.forEach((wall) => {
      expect(wall.wallCoordinates.length).toBeGreaterThanOrEqual(3);
      wall.wallCoordinates.forEach((coordinate) => {
        expect(coordinate.x).toBeGreaterThanOrEqual(0);
        expect(coordinate.x).toBeLessThan(20);
        expect(coordinate.y).toBeGreaterThanOrEqual(0);
        expect(coordinate.y).toBeLessThan(20);
      });
    });
  });

  it("keeps walls away from the player spawn", () => {
    const walls = generateRandomWalls(playerSpawn);
    const occupied = walls.flatMap((wall) => wall.wallCoordinates);

    occupied.forEach((coordinate) => {
      const blocksSpawn =
        coordinate.x >= playerSpawn.x - 1 &&
        coordinate.x < playerSpawn.x + 3 &&
        coordinate.y >= playerSpawn.y - 1 &&
        coordinate.y < playerSpawn.y + 3;

      expect(blocksSpawn).toBe(false);
    });
  });

  it("does not overlap wall coordinates", () => {
    const walls = generateRandomWalls(playerSpawn);
    const keys = walls.flatMap((wall) =>
      wall.wallCoordinates.map(
        (coordinate) => `${coordinate.x},${coordinate.y}`
      )
    );

    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("level config", () => {
  it("increases enemy pressure on higher levels", () => {
    expect(getMaxConcurrentEnemies(1)).toBe(5);
    expect(getMaxConcurrentEnemies(2)).toBe(6);
    expect(getMaxTotalEnemySpawns(1)).toBeLessThan(getMaxTotalEnemySpawns(3));
  });

  it("adds more walls every two levels", () => {
    expect(getWallCountForLevel(1)).toBe(3);
    expect(getWallCountForLevel(2)).toBe(3);
    expect(getWallCountForLevel(3)).toBe(4);
    expect(getWallCountForLevel(4)).toBe(4);
    expect(getWallCountForLevel(5)).toBe(5);
  });

  it("makes enemies slightly faster each level", () => {
    expect(getEnemyMoveSpeed(1)).toBe(ENEMY_MOVE_SPEED);
    expect(getEnemyMoveSpeed(2)).toBeGreaterThan(getEnemyMoveSpeed(1));
    expect(getEnemyMoveSpeed(5)).toBe(ENEMY_MOVE_SPEED + 0.4);
  });
});

describe("getRandomOpenPosition", () => {
  const walls = [{ wallCoordinates: [{ x: 5, y: 5 }] }];

  it("never returns a position on a wall", () => {
    for (let index = 0; index < 20; index++) {
      const position = getRandomOpenPosition(walls);

      expect(position).not.toBeNull();
      expect(position).not.toEqual({ x: 5, y: 5 });
    }
  });

  it("avoids blocked positions", () => {
    const position = getRandomOpenPosition(walls, {
      blocked: [{ x: 0, y: 0 }],
      maxAttempts: 50,
    });

    expect(position).not.toEqual({ x: 0, y: 0 });
  });

  it("avoids the full player footprint", () => {
    const playerPosition = { x: 9, y: 9 };
    const blocked = getEntityFootprintCells(playerPosition, 2, 2);

    for (let index = 0; index < 20; index++) {
      const position = getRandomOpenPosition(walls, { blocked });
      expect(position).not.toBeNull();
      expect(
        blocked.some((cell) => cell.x === position?.x && cell.y === position?.y)
      ).toBe(false);
    }
  });
});

describe("isOpenGridCell", () => {
  const walls = [{ wallCoordinates: [{ x: 4, y: 4 }] }];

  it("rejects wall cells and blocked cells", () => {
    expect(isOpenGridCell({ x: 4, y: 4 }, walls)).toBe(false);
    expect(isOpenGridCell({ x: 1, y: 1 }, walls, [{ x: 1, y: 1 }])).toBe(false);
    expect(isOpenGridCell({ x: 1, y: 1 }, walls)).toBe(true);
  });

  it("detects power-ups stuck on walls", () => {
    expect(isPositionOnWall({ x: 4, y: 4 }, walls)).toBe(true);
    expect(isPositionOnWall({ x: 1, y: 1 }, walls)).toBe(false);
  });
});

describe("isEnemyCollidingWithPlayer", () => {
  it("detects collision when the enemy overlaps the player footprint", () => {
    expect(
      isEnemyCollidingWithPlayer({ x: 9.8, y: 9.2 }, { x: 9, y: 9 }, 2, 2)
    ).toBe(true);
    expect(
      isEnemyCollidingWithPlayer({ x: 8.2, y: 9.5 }, { x: 9, y: 9 }, 2, 2)
    ).toBe(false);
  });
});

describe("getBlockedAimPoint", () => {
  const playerPosition = { x: 9, y: 9 };
  const blockingWalls = [{ wallCoordinates: [{ x: 12, y: 10 }] }];

  it("returns the target when no wall blocks the line", () => {
    const target = { x: 150, y: 150 };
    const aimPoint = getBlockedAimPoint(playerPosition, target, blockingWalls);

    expect(aimPoint.blocked).toBe(false);
    expect(aimPoint.x).toBe(target.x);
    expect(aimPoint.y).toBe(target.y);
  });

  it("shortens the aim point when a wall is in the way", () => {
    const target = { x: 280, y: 210 };
    const aimPoint = getBlockedAimPoint(playerPosition, target, blockingWalls);

    expect(aimPoint.blocked).toBe(true);
    expect(aimPoint.x).toBeLessThan(target.x);
    expect(aimPoint.y).toBeLessThan(target.y);
  });

  it("reports line of sight only when the path is clear", () => {
    expect(hasLineOfSight(playerPosition, { x: 150, y: 150 }, blockingWalls)).toBe(
      true
    );
    expect(hasLineOfSight(playerPosition, { x: 280, y: 210 }, blockingWalls)).toBe(
      false
    );
  });
});

describe("getPlayerNextLeft", () => {
  it("returns x when nextX is less than or esqual to 0 + size", () => {
    const x = 5;
    const playerMovementUnit = 2;
    const size = 3;
    expect(getPlayerNextLeft(x, playerMovementUnit, size)).toBe(x);
  });

  it("returns nextX when nextX is greater than 0 + size", () => {
    const x = 5;
    const playerMovementUnit = 2;
    const size = 1;
    expect(getPlayerNextLeft(x, playerMovementUnit, size)).toBe(
      x - playerMovementUnit
    );
  });
});

describe("special weapon combat helpers", () => {
  const playerPosition = { x: 9, y: 9 };

  it("pierce hits multiple aligned enemies and stops at walls", () => {
    const enemies = [
      { x: 11, y: 10 },
      { x: 13, y: 10 },
      { x: 15, y: 10 },
    ];
    const walls = [{ wallCoordinates: [{ x: 14, y: 10 }] }];
    const aimPixel = { x: 300, y: 210 };

    const hits = getEnemiesHitByPierceShot(
      playerPosition,
      aimPixel,
      enemies,
      walls
    );

    expect(hits).toEqual([0, 1]);
  });

  it("shotgun only hits enemies inside the radius with line of sight", () => {
    const enemies = [
      { x: 10, y: 10 },
      { x: 11, y: 10 },
      { x: 12, y: 10 },
    ];
    const walls = [{ wallCoordinates: [{ x: 11, y: 10 }] }];
    const aimPixel = { x: 220, y: 210 };

    const hits = getEnemiesHitByShotgun(
      playerPosition,
      aimPixel,
      enemies,
      walls,
      SHOTGUN_AOE_RADIUS
    );

    expect(hits).toEqual([0]);
  });

  it("ricochet produces at most four segments and can hit enemies on bounce segments", () => {
    const ricochetPlayer = { x: 2, y: 9 };
    const enemies = [{ x: 4, y: 9 }];
    const walls = [
      {
        wallCoordinates: [
          { x: 5, y: 8 },
          { x: 5, y: 9 },
          { x: 5, y: 10 },
        ],
      },
    ];
    const aimPixel = { x: 400, y: 200 };

    const { segments, enemyIndices } = traceRicochetPath(
      ricochetPlayer,
      aimPixel,
      walls,
      RICOCHET_MAX_BOUNCES,
      enemies
    );

    expect(segments.length).toBeLessThanOrEqual(RICOCHET_MAX_BOUNCES + 1);
    expect(segments.length).toBeGreaterThan(1);
    expect(enemyIndices).toContain(0);
  });

  it("getSpecialWeaponAimPath returns multi-segment preview for ricochet", () => {
    const walls = [{ wallCoordinates: [{ x: 12, y: 10 }] }];
    const aimPixel = { x: 280, y: 210 };

    const piercePath = getSpecialWeaponAimPath(
      "pierce",
      playerPosition,
      aimPixel,
      walls
    );
    const ricochetPath = getSpecialWeaponAimPath(
      "ricochet",
      playerPosition,
      aimPixel,
      walls
    );
    const shotgunPath = getSpecialWeaponAimPath(
      "shotgun",
      playerPosition,
      aimPixel,
      walls
    );

    expect(piercePath).toHaveLength(1);
    expect(ricochetPath.length).toBeGreaterThanOrEqual(1);
    expect(shotgunPath).toHaveLength(3);
  });
});

describe("enemy movement", () => {
  const walls = [{ wallCoordinates: [{ x: 6, y: 5 }] }];

  it("slides along a wall instead of stopping completely", () => {
    const enemy = { x: 5, y: 6 };
    const target = { x: 9, y: 5 };
    const next = getEnemyNextPosition(enemy, target, 0.5, walls, 1, 1);

    expect(next.x).toBeGreaterThan(enemy.x);
    expect(isEnemyPositionBlocked(next.x, next.y, walls, 1, 1)).toBe(false);
  });

  it("detects grid boundaries as blocked", () => {
    expect(isEnemyPositionBlocked(-0.1, 5, walls, 1, 1)).toBe(true);
    expect(isEnemyPositionBlocked(20, 19, walls, 1, 1)).toBe(true);
  });

  it("detects clicks inside a grid cell", () => {
    expect(isPointInGridCell(65, 45, { x: 3, y: 2 })).toBe(true);
    expect(isPointInGridCell(10, 10, { x: 3, y: 2 })).toBe(false);
  });
});

/*
describe("playSound", () => {
  let soundSpy: vi.MockInstance;

  beforeEach(() => {
    soundSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    soundSpy.mockRestore();
  });

  it("plays the sound when the sound name is valid", () => {
    const soundName = "hit1";
    const volume = 0.5;
    const startTime = 2;

    playSound(soundName, volume, startTime);

    expect(audio[soundName].volume).toBe(volume);
    expect(audio[soundName].currentTime).toBe(startTime);
    expect(audio[soundName].play).toHaveBeenCalled();
  });

  it("logs a warning when the sound name is not found", () => {
    const soundName = "invalidSound";

    playSound(soundName);

    expect(console.warn).toHaveBeenCalledWith(
      `Sound "${soundName}" not found.`
    );
  });

  it("sets the volume correctly", () => {
    const soundName = "shotgun";
    const volume = 0.8;

    playSound(soundName, volume);

    expect(audio[soundName].volume).toBe(volume);
  });

  it("sets the start time correctly", () => {
    const soundName = "powerup";
    const startTime = 5;

    playSound(soundName, undefined, startTime);

    expect(audio[soundName].currentTime).toBe(startTime);
  });
});*/

// audio.test.ts

describe("playSound", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should play the specified sound", () => {
    const playSpy = vi.spyOn(audio.shotgun, "play");
    playSound("shotgun");
    expect(playSpy).toHaveBeenCalled();
  });

  it("should set the volume and start time correctly", () => {
    const audioInstance = audio.shotgun;
    const volumeSetter = vi.fn();
    const currentTimeSetter = vi.fn();

    Object.defineProperty(audioInstance, "volume", {
      set: volumeSetter,
    });
    Object.defineProperty(audioInstance, "currentTime", {
      set: currentTimeSetter,
    });

    playSound("shotgun", 0.5, 2);

    expect(volumeSetter).toHaveBeenCalledWith(0.5);
    expect(currentTimeSetter).toHaveBeenCalledWith(2);
  });

  it("should log a warning if the sound is not found", () => {
    const warnSpy = vi.spyOn(console, "warn");
    playSound("nonexistent");
    expect(warnSpy).toHaveBeenCalledWith('Sound "nonexistent" not found.');
  });
});
