import { useState, useEffect, useRef } from "react";
import FEATURES from "../features/";
import { Position } from "../custom-types";
import { WallProps } from "../components/Wall";
import {
  getMaxConcurrentEnemies,
  getMaxTotalEnemySpawns,
  getEnemyMoveSpeed,
} from "../constants";
import { getEnemyNextPosition, isEnemyPositionBlocked } from "../helpers";

export const useEnemies = (
  isGameOver: boolean,
  isLevelComplete: boolean,
  isPaused: boolean,
  level: number,
  playerPositionRef: { current: Position },
  walls: WallProps[],
  enemyWidth: number,
  enemyHeight: number
) => {
  const [enemies, setEnemies] = useState<Position[]>([]);
  const totalSpawnedRef = useRef(0);
  const maxConcurrentEnemies = getMaxConcurrentEnemies(level);
  const maxTotalEnemySpawns = getMaxTotalEnemySpawns(level);
  const enemyMoveSpeed = getEnemyMoveSpeed(level);

  const isPositionBlocked = (x: number, y: number) =>
    isEnemyPositionBlocked(x, y, walls, enemyWidth, enemyHeight);

  useEffect(() => {
    totalSpawnedRef.current = 0;
    setEnemies([]);
  }, [level]);

  useEffect(() => {
    if (!FEATURES.ALLOW_ENEMIES) return;

    const spawnEnemyInterval = setInterval(() => {
      if (
        !isGameOver &&
        !isLevelComplete &&
        !isPaused &&
        enemies.length < maxConcurrentEnemies &&
        totalSpawnedRef.current < maxTotalEnemySpawns
      ) {
        let newEnemyPosition: Position;
        do {
          newEnemyPosition = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20),
          };
        } while (isPositionBlocked(newEnemyPosition.x, newEnemyPosition.y));

        totalSpawnedRef.current += 1;
        setEnemies((prevEnemies) => [...prevEnemies, newEnemyPosition]);
      }
    }, 2000);

    return () => clearInterval(spawnEnemyInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isGameOver,
    isLevelComplete,
    enemies.length,
    isPaused,
    level,
    maxConcurrentEnemies,
    maxTotalEnemySpawns,
  ]);

  useEffect(() => {
    if (!FEATURES.ALLOW_ENEMIES || isGameOver || isLevelComplete || isPaused)
      return;

    let animationFrameId = 0;
    let lastTime = performance.now();

    const tick = (currentTime: number) => {
      const deltaSeconds = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      setEnemies((prevEnemies) => {
        if (prevEnemies.length === 0) return prevEnemies;

        return prevEnemies.map((enemy) =>
          getEnemyNextPosition(
            enemy,
            playerPositionRef.current,
            enemyMoveSpeed * deltaSeconds,
            walls,
            enemyWidth,
            enemyHeight
          )
        );
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isGameOver,
    isLevelComplete,
    isPaused,
    playerPositionRef,
    walls,
    enemyWidth,
    enemyHeight,
    enemyMoveSpeed,
  ]);

  return { enemies, setEnemies };
};
