import { useMemo, useEffect, useState } from "react";
import {
  SPECIAL_WEAPON_MAX_SHOTS,
  SPECIAL_WEAPON_SPAWN_DELAY_SECONDS,
  SPECIAL_WEAPON_TYPES,
  DEFAULT_PLAYER_WIDTH,
  DEFAULT_PLAYER_HEIGHT,
} from "../constants";
import { getEntityFootprintCells, playSound } from "../helpers";
import {
  ActiveSpecialWeapon,
  Position,
  SpecialWeaponPickup,
  SpecialWeaponType,
} from "../custom-types";
import { WallProps } from "../components/Wall";
import { usePowerUpSpawn } from "./usePowerUpSpawn";

type UseSpecialWeaponsProps = {
  isGameOver: boolean;
  isPaused: boolean;
  level: number;
  position: Position;
  walls: WallProps[];
  additionalBlocked?: Position[];
};

const pickRandomWeaponType = (): SpecialWeaponType =>
  SPECIAL_WEAPON_TYPES[
    Math.floor(Math.random() * SPECIAL_WEAPON_TYPES.length)
  ];

export const useSpecialWeapons = ({
  isGameOver,
  isPaused,
  level,
  position,
  walls,
  additionalBlocked = [],
}: UseSpecialWeaponsProps) => {
  const [activeSpecialWeapon, setActiveSpecialWeapon] =
    useState<ActiveSpecialWeapon | null>(null);
  const [specialWeaponPickups, setSpecialWeaponPickups] = useState<
    SpecialWeaponPickup[]
  >([]);

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
    enabled: activeSpecialWeapon === null,
    isGameOver,
    isPaused,
    level,
    walls,
    blockedCells,
    additionalBlocked,
    spawnDelaySeconds: SPECIAL_WEAPON_SPAWN_DELAY_SECONDS,
  });

  useEffect(() => {
    setActiveSpecialWeapon(null);
    setSpecialWeaponPickups([]);
  }, [level]);

  useEffect(() => {
    if (powerUps.length === 0) {
      setSpecialWeaponPickups([]);
      return;
    }

    setSpecialWeaponPickups(
      powerUps.map((pickup) => ({
        ...pickup,
        type: pickRandomWeaponType(),
        isVanishing: pickup.isVanishing,
      }))
    );
  }, [powerUps]);

  useEffect(() => {
    const index = specialWeaponPickups.findIndex(
      (pickup) => pickup.x === position.x && pickup.y === position.y
    );

    if (index === -1) {
      return;
    }

    const pickup = specialWeaponPickups[index];
    playSound("powerup");
    restartSpawnTimer();
    setActiveSpecialWeapon({
      type: pickup.type,
      shotsRemaining: SPECIAL_WEAPON_MAX_SHOTS,
    });
    setSpecialWeaponPickups([]);
  }, [position, specialWeaponPickups, restartSpawnTimer]);

  const resetSpecialWeapon = () => {
    setActiveSpecialWeapon(null);
    setSpecialWeaponPickups([]);
  };

  return {
    specialWeaponPickups,
    spawnCountdown,
    activeSpecialWeapon,
    setActiveSpecialWeapon,
    resetSpecialWeapon,
  };
};
