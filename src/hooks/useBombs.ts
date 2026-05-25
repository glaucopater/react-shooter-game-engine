import { useState, useEffect, useRef, useCallback } from "react";
import {
  BOMB_SPAWN_INTERVAL_SECONDS,
  BOMB_MAX_ON_FIELD,
  BOMB_EXPLOSION_RADIUS,
  FIRE_ZONE_DURATION_MS,
  FIRE_ZONE_DAMAGE,
  FIRE_ZONE_TICK_MS,
  DEFAULT_PLAYER_WIDTH,
  DEFAULT_PLAYER_HEIGHT,
} from "../constants";
import {
  getEntityFootprintCells,
  getRandomOpenPosition,
  getGridCellCenter,
  isPointInGridCell,
  isPositionInRadius,
  isPlayerInFireZone,
  playSound,
} from "../helpers";
import { Bomb, FireZone, Position } from "../custom-types";
import { WallProps } from "../components/Wall";

type UseBombsOptions = {
  isGameOver: boolean;
  isPaused: boolean;
  level: number;
  walls: WallProps[];
  position: Position;
  enemies: Position[];
  setEnemies: React.Dispatch<React.SetStateAction<Position[]>>;
  setPlayerHealth: React.Dispatch<React.SetStateAction<number>>;
  setLastDamageTime: React.Dispatch<React.SetStateAction<number>>;
};

const createBombId = () =>
  `bomb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createFireZoneId = () =>
  `fire-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useBombs = ({
  isGameOver,
  isPaused,
  level,
  walls,
  position,
  enemies: _enemies,
  setEnemies,
  setPlayerHealth,
  setLastDamageTime,
}: UseBombsOptions) => {
  const [bombs, setBombs] = useState<Bomb[]>([]);
  const [fireZones, setFireZones] = useState<FireZone[]>([]);
  const lastFireDamageRef = useRef<Record<string, number>>({});
  const fireZonesRef = useRef(fireZones);

  fireZonesRef.current = fireZones;

  useEffect(() => {
    setBombs([]);
    setFireZones([]);
    lastFireDamageRef.current = {};
  }, [level]);

  useEffect(() => {
    if (isGameOver || isPaused) {
      return;
    }

    const spawnTimer = window.setInterval(() => {
      setBombs((currentBombs) => {
        if (currentBombs.length >= BOMB_MAX_ON_FIELD) {
          return currentBombs;
        }

        const blocked = [
          ...currentBombs,
          ...getEntityFootprintCells(
            position,
            DEFAULT_PLAYER_WIDTH,
            DEFAULT_PLAYER_HEIGHT
          ),
        ];

        const spawnPosition = getRandomOpenPosition(walls, { blocked });
        if (!spawnPosition) {
          return currentBombs;
        }

        return [...currentBombs, { ...spawnPosition, id: createBombId() }];
      });
    }, BOMB_SPAWN_INTERVAL_SECONDS * 1000);

    return () => window.clearInterval(spawnTimer);
  }, [isGameOver, isPaused, level, walls, position]);

  useEffect(() => {
    if (isGameOver || isPaused || fireZones.length === 0) {
      return;
    }

    const cleanupTimer = window.setInterval(() => {
      const now = Date.now();
      setFireZones((current) =>
        current.filter((zone) => now - zone.createdAt < FIRE_ZONE_DURATION_MS)
      );
    }, 250);

    return () => window.clearInterval(cleanupTimer);
  }, [fireZones.length, isGameOver, isPaused]);

  useEffect(() => {
    if (isGameOver || isPaused) {
      return;
    }

    const damageTimer = window.setInterval(() => {
      const now = Date.now();
      const activeZones = fireZonesRef.current;

      if (activeZones.length === 0) {
        return;
      }

      activeZones.forEach((zone) => {
        const lastDamage = lastFireDamageRef.current[zone.id] ?? 0;
        if (now - lastDamage < FIRE_ZONE_TICK_MS) {
          return;
        }

        const center = getGridCellCenter(zone);

        if (
          isPlayerInFireZone(
            position,
            DEFAULT_PLAYER_WIDTH,
            DEFAULT_PLAYER_HEIGHT,
            zone,
            BOMB_EXPLOSION_RADIUS
          )
        ) {
          lastFireDamageRef.current[zone.id] = now;
          setLastDamageTime(now);
          playSound("damage", 0.25);
          setPlayerHealth((health) => Math.max(health - FIRE_ZONE_DAMAGE, 0));
        }

        setEnemies((currentEnemies) => {
          const survivors = currentEnemies.filter(
            (enemy) =>
              !isPositionInRadius(enemy, center, BOMB_EXPLOSION_RADIUS)
          );

          return survivors.length === currentEnemies.length
            ? currentEnemies
            : survivors;
        });
      });
    }, FIRE_ZONE_TICK_MS);

    return () => window.clearInterval(damageTimer);
  }, [
    isGameOver,
    isPaused,
    position,
    setEnemies,
    setLastDamageTime,
    setPlayerHealth,
  ]);

  const explodeBomb = useCallback(
    (bomb: Bomb) => {
      setBombs((current) => current.filter((currentBomb) => currentBomb.id !== bomb.id));
      setFireZones((current) => [
        ...current,
        {
          id: createFireZoneId(),
          x: bomb.x,
          y: bomb.y,
          createdAt: Date.now(),
        },
      ]);

      const center = getGridCellCenter(bomb);
      setEnemies((currentEnemies) =>
        currentEnemies.filter(
          (enemy) => !isPositionInRadius(enemy, center, BOMB_EXPLOSION_RADIUS)
        )
      );
      playSound("shotgun", 0.45);
    },
    [setEnemies]
  );

  const findBombAtPoint = useCallback(
    (pixelX: number, pixelY: number) =>
      bombs.find((bomb) => isPointInGridCell(pixelX, pixelY, bomb)) ?? null,
    [bombs]
  );

  const resetBombs = useCallback(() => {
    setBombs([]);
    setFireZones([]);
    lastFireDamageRef.current = {};
  }, []);

  return {
    bombs,
    fireZones,
    explodeBomb,
    findBombAtPoint,
    resetBombs,
  };
};
