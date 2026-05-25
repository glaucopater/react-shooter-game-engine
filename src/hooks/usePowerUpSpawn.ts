import { useState, useEffect, useRef, useCallback } from "react";
import {
  POWERUP_SPAWN_DELAY_SECONDS,
  POWERUP_DESPAWN_SECONDS,
  POWERUP_VANISH_DURATION_MS,
} from "../constants";
import { getRandomOpenPosition, isPositionOnWall } from "../helpers";
import { Position, SpawnedPickup } from "../custom-types";
import { WallProps } from "../components/Wall";

type UsePowerUpSpawnOptions = {
  enabled: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  level: number;
  walls: WallProps[];
  blockedCells: Position[];
  additionalBlocked?: Position[];
  spawnDelaySeconds?: number;
};

export const usePowerUpSpawn = ({
  enabled,
  isGameOver,
  isPaused,
  level,
  walls,
  blockedCells,
  additionalBlocked = [],
  spawnDelaySeconds = POWERUP_SPAWN_DELAY_SECONDS,
}: UsePowerUpSpawnOptions) => {
  const [powerUps, setPowerUps] = useState<SpawnedPickup[]>([]);
  const [spawnCountdown, setSpawnCountdown] = useState(spawnDelaySeconds);
  const blockedCellsRef = useRef(blockedCells);
  const additionalBlockedRef = useRef(additionalBlocked);
  const wallsRef = useRef(walls);
  const enabledRef = useRef(enabled);

  blockedCellsRef.current = blockedCells;
  additionalBlockedRef.current = additionalBlocked;
  wallsRef.current = walls;
  enabledRef.current = enabled;

  const waitingToSpawn = enabled && powerUps.length === 0;
  const activePickup = powerUps[0] ?? null;

  const getBlockedSpawnCells = useCallback(
    () => [...blockedCellsRef.current, ...additionalBlockedRef.current],
    []
  );

  const trySpawnPickup = useCallback(() => {
    if (!enabledRef.current) {
      return false;
    }

    const spawnPosition = getRandomOpenPosition(wallsRef.current, {
      blocked: getBlockedSpawnCells(),
    });

    if (!spawnPosition) {
      return false;
    }

    setPowerUps([
      {
        ...spawnPosition,
        spawnedAt: Date.now(),
        isVanishing: false,
      },
    ]);
    return true;
  }, [getBlockedSpawnCells]);

  useEffect(() => {
    setPowerUps([]);
    setSpawnCountdown(spawnDelaySeconds);
  }, [level, spawnDelaySeconds]);

  useEffect(() => {
    setPowerUps((prevPowerUps) =>
      prevPowerUps.filter(
        (powerUp) => !isPositionOnWall(powerUp, wallsRef.current)
      )
    );
  }, [walls]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (waitingToSpawn && spawnCountdown <= 0 && !isGameOver && !isPaused) {
      if (!trySpawnPickup()) {
        setSpawnCountdown(1);
      }
    }
  }, [
    enabled,
    waitingToSpawn,
    spawnCountdown,
    isGameOver,
    isPaused,
    trySpawnPickup,
  ]);

  useEffect(() => {
    if (!waitingToSpawn || isGameOver || isPaused || spawnCountdown <= 0) {
      return;
    }

    const timer = window.setTimeout(
      () => setSpawnCountdown((current) => current - 1),
      1000
    );

    return () => window.clearTimeout(timer);
  }, [waitingToSpawn, isGameOver, isPaused, spawnCountdown, level]);

  useEffect(() => {
    if (!activePickup || isGameOver) {
      return;
    }

    const vanishAt =
      activePickup.spawnedAt + POWERUP_DESPAWN_SECONDS * 1000;
    const despawnAt = vanishAt + POWERUP_VANISH_DURATION_MS;

    const applyVanish = () => {
      setPowerUps((current) =>
        current.length > 0 && !current[0].isVanishing
          ? [{ ...current[0], isVanishing: true }]
          : current
      );
    };

    const applyDespawn = () => {
      setPowerUps([]);
      setSpawnCountdown(spawnDelaySeconds);
    };

    if (isPaused) {
      return undefined;
    }

    const now = Date.now();

    if (now >= despawnAt) {
      applyDespawn();
      return undefined;
    }

    if (now >= vanishAt) {
      applyVanish();
    }

    const vanishTimer =
      now >= vanishAt
        ? undefined
        : window.setTimeout(applyVanish, vanishAt - now);
    const despawnTimer = window.setTimeout(applyDespawn, despawnAt - now);

    return () => {
      if (vanishTimer !== undefined) {
        window.clearTimeout(vanishTimer);
      }
      window.clearTimeout(despawnTimer);
    };
  }, [
    activePickup?.spawnedAt,
    activePickup?.x,
    activePickup?.y,
    isGameOver,
    isPaused,
    spawnDelaySeconds,
  ]);

  const restartSpawnTimer = useCallback(() => {
    setPowerUps([]);
    setSpawnCountdown(spawnDelaySeconds);
  }, [spawnDelaySeconds]);

  return {
    powerUps,
    setPowerUps,
    spawnCountdown: waitingToSpawn ? spawnCountdown : null,
    restartSpawnTimer,
  };
};
