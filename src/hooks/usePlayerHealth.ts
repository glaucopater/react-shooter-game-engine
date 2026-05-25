import { useState, useEffect } from "react";
import { DEFAULT_ENEMY_DAMAGE, DEFAULT_PLAYER_HEIGHT, DEFAULT_PLAYER_WIDTH, PLAYER_MAX_HEALTH } from "../constants";
import FEATURES from "../features";
import { isEnemyCollidingWithPlayer, playSound } from "../helpers";
import { Position } from "../custom-types";

type UsePlayerHealthProps = {
  isGameOver: boolean;
  setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  isPaused: boolean;
  position: Position;
  enemies: Position[];
  setEnemies: React.Dispatch<
    React.SetStateAction<
      {
        x: number;
        y: number;
      }[]
    >
  >;
};

export const usePlayerHealth = ({
  isGameOver,
  setIsGameOver,
  isPaused,
  position,
  enemies,
}: UsePlayerHealthProps) => {
  const [playerHealth, setPlayerHealth] = useState(PLAYER_MAX_HEALTH);
  const [lastDamageTime, setLastDamageTime] = useState(0);

  useEffect(() => {
    if (!isGameOver && !isPaused && playerHealth > 0) {
      const now = Date.now();
      if (lastDamageTime === null || now - lastDamageTime > 1000) {
        const collision = enemies.some((enemy: Position) =>
          isEnemyCollidingWithPlayer(
            enemy,
            position,
            DEFAULT_PLAYER_WIDTH,
            DEFAULT_PLAYER_HEIGHT
          )
        );
        if (collision) {
          setLastDamageTime(now);
          playSound("damage", 0.3);
          if (!FEATURES.ALLOW_PLAYER_IMMORTAL)
            setPlayerHealth((prevHealth) =>
              Math.max(prevHealth - DEFAULT_ENEMY_DAMAGE, 0)
            );
        }
      }
    }
  }, [
    enemies,
    isGameOver,
    isPaused,
    playerHealth,
    position,
    lastDamageTime,
    setIsGameOver,
  ]);

  useEffect(() => {
    if (playerHealth <= 0 && !isGameOver) {
      setIsGameOver(true);
    }
  }, [playerHealth, isGameOver, setIsGameOver]);

  return { playerHealth, setPlayerHealth, setLastDamageTime };
};
