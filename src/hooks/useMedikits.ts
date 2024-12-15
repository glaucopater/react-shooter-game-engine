import { useState, useEffect } from "react";
import {
  PLAYER_MAX_HEALTH,
  MEDIKIT_HEALTH_INCREASE,
  RANDOM_RANGE_INTERVAL,
  MIN_LEFT_X,
  MIN_BOTTOM_Y,
} from "../constants";
import { playSound } from "../helpers";
import { Position } from "../custom-types";
import FEATURES from "../features/";

type UseMedikitsProps = {
  isGameOver: boolean;
  isPaused: boolean;
  position: Position;
  playerHealth: number;
  setPlayerHealth: React.Dispatch<React.SetStateAction<number>>;
};
export const useMedikits = ({
  isGameOver,
  isPaused,
  position,
  playerHealth,
  setPlayerHealth,
}: UseMedikitsProps) => {
  const [medikits, setMedikits] = useState<Position[]>([]);

  useEffect(() => {
    if (!FEATURES.ALLOW_POWERUPS) return;

    if (playerHealth <= PLAYER_MAX_HEALTH) {
      const spawnMedikitInterval = setInterval(() => {
        if (!isGameOver && !isPaused && medikits.length === 0) {
          setMedikits((prevMedikits) => [
            ...prevMedikits,
            {
              x: Math.floor(Math.random() * MIN_LEFT_X),
              y: Math.floor(Math.random() * MIN_BOTTOM_Y),
            },
          ]);
        }
      }, Math.floor(Math.random() * RANDOM_RANGE_INTERVAL[1]) + RANDOM_RANGE_INTERVAL[0]);

      return () => clearInterval(spawnMedikitInterval);
    }
  }, [medikits.length, isGameOver, isPaused, playerHealth]);

  useEffect(() => {
    const collectMedikit = () => {
      const index = medikits.findIndex(
        (medikit) => medikit.x === position.x && medikit.y === position.y
      );
      if (index !== -1) {
        const updatedMedikits = [...medikits];
        updatedMedikits.splice(index, 1);
        playSound("powerup");
        setMedikits(updatedMedikits);
        setPlayerHealth((prevHealth: number) =>
          prevHealth + MEDIKIT_HEALTH_INCREASE > PLAYER_MAX_HEALTH
            ? PLAYER_MAX_HEALTH
            : prevHealth + MEDIKIT_HEALTH_INCREASE
        );
      }
    };
    collectMedikit();
  }, [position, medikits, setPlayerHealth]);

  return { medikits, setMedikits };
};
