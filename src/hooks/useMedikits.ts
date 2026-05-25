import { useMemo, useEffect, useState } from "react";
import {
  PLAYER_MAX_HEALTH,
  MEDIKIT_HEALTH_INCREASE,
  DEFAULT_PLAYER_WIDTH,
  DEFAULT_PLAYER_HEIGHT,
  getRandomPowerupAvatar,
} from "../constants";
import { getEntityFootprintCells, playSound } from "../helpers";
import { MedikitPickup, Position } from "../custom-types";
import { WallProps } from "../components/Wall";
import { usePowerUpSpawn } from "./usePowerUpSpawn";

type UseMedikitsProps = {
  isGameOver: boolean;
  isPaused: boolean;
  level: number;
  position: Position;
  playerHealth: number;
  walls: WallProps[];
  setPlayerHealth: React.Dispatch<React.SetStateAction<number>>;
  additionalBlocked?: Position[];
};

export const useMedikits = ({
  isGameOver,
  isPaused,
  level,
  position,
  playerHealth,
  walls,
  setPlayerHealth,
  additionalBlocked = [],
}: UseMedikitsProps) => {
  const [medikitPickups, setMedikitPickups] = useState<MedikitPickup[]>([]);
  const blockedCells = useMemo(
    () =>
      getEntityFootprintCells(
        position,
        DEFAULT_PLAYER_WIDTH,
        DEFAULT_PLAYER_HEIGHT
      ),
    [position]
  );

  const { powerUps, spawnCountdown, restartSpawnTimer } = usePowerUpSpawn({
    enabled: playerHealth < PLAYER_MAX_HEALTH,
    isGameOver,
    isPaused,
    level,
    walls,
    blockedCells,
    additionalBlocked,
  });

  useEffect(() => {
    if (powerUps.length === 0) {
      setMedikitPickups([]);
      return;
    }

    setMedikitPickups(
      powerUps.map((pickup) => ({
        ...pickup,
        avatar: getRandomPowerupAvatar(),
      }))
    );
  }, [powerUps]);

  useEffect(() => {
    const index = medikitPickups.findIndex(
      (medikit) => medikit.x === position.x && medikit.y === position.y
    );

    if (index === -1) return;

    playSound("powerup");
    restartSpawnTimer();
    setPlayerHealth((prevHealth: number) =>
      prevHealth + MEDIKIT_HEALTH_INCREASE > PLAYER_MAX_HEALTH
        ? PLAYER_MAX_HEALTH
        : prevHealth + MEDIKIT_HEALTH_INCREASE
    );
  }, [position, medikitPickups, setPlayerHealth, restartSpawnTimer]);

  return {
    medikits: medikitPickups,
    spawnCountdown,
  };
};
