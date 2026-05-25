import { vi } from "vitest";
import { audio } from "../constants";
import { generateRandomWalls, getBlockedAimPoint, getPlayerNextLeft, hasLineOfSight, playSound } from "./index";

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
