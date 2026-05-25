import { useMemo, useEffect } from "react";
import {
  MAX_BULLETS,
  AMMO_INCREASE,
  DEFAULT_PLAYER_WIDTH,
  DEFAULT_PLAYER_HEIGHT,
} from "../constants";
import { getEntityFootprintCells, playSound } from "../helpers";
import { Position } from "../custom-types";
import { WallProps } from "../components/Wall";
import { usePowerUpSpawn } from "./usePowerUpSpawn";

type UseAmmunitionProps = {
  isGameOver: boolean;
  isPaused: boolean;
  level: number;
  position: Position;
  bullets: number;
  walls: WallProps[];
  setBullets: React.Dispatch<React.SetStateAction<number>>;
  additionalBlocked?: Position[];
};

export const useAmmunition = ({
  isGameOver,
  isPaused,
  level,
  position,
  bullets,
  walls,
  setBullets,
  additionalBlocked = [],
}: UseAmmunitionProps) => {
  const blockedCells = useMemo(
    () =>
      getEntityFootprintCells(
        position,
        DEFAULT_PLAYER_WIDTH,
        DEFAULT_PLAYER_HEIGHT
      ),
    [position]
  );

  const { powerUps: ammunitions, spawnCountdown, restartSpawnTimer } =
    usePowerUpSpawn({
      enabled: bullets < MAX_BULLETS,
      isGameOver,
      isPaused,
      level,
      walls,
      blockedCells,
      additionalBlocked,
    });

  useEffect(() => {
    const index = ammunitions.findIndex(
      (ammunition) =>
        ammunition.x === position.x && ammunition.y === position.y
    );

    if (index === -1) return;

    playSound("loadAmmo");
    restartSpawnTimer();
    setBullets((prevBullets: number) =>
      prevBullets + AMMO_INCREASE > MAX_BULLETS
        ? MAX_BULLETS
        : prevBullets + AMMO_INCREASE
    );
  }, [position, ammunitions, setBullets, restartSpawnTimer]);

  return {
    ammunitions,
    spawnCountdown,
  };
};
