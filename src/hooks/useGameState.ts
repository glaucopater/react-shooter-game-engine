import { useState, useEffect } from "react";
import { MAX_BULLETS, WIN_SCORE, MAX_LEVEL } from "../constants";
import { PLAYER_MAX_HEALTH } from "../constants";
import {
  playSound,
  hasLineOfSight,
  CELL_SIZE,
  getEnemiesHitBySpecialWeapon,
  getGridCellCenter,
} from "../helpers";
import { ActiveSpecialWeapon, Bomb, Position } from "../custom-types";
import { WallProps } from "../components/Wall";

type UseGameStateProps = {
  isGameOver: boolean;
  setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  setEnemies: React.Dispatch<React.SetStateAction<Position[]>>;
  setPlayerHealth: React.Dispatch<React.SetStateAction<number>>;
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  setLastDamageTime: React.Dispatch<React.SetStateAction<number>>;
  setBullets: React.Dispatch<React.SetStateAction<number>>;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setIsLevelComplete: React.Dispatch<React.SetStateAction<boolean>>;
  isPaused: boolean;
  isLevelComplete: boolean;
  bullets: number;
  enemies: Position[];
  position: Position;
  walls: WallProps[];
  score: number;
  activeSpecialWeapon: ActiveSpecialWeapon | null;
  setActiveSpecialWeapon: React.Dispatch<
    React.SetStateAction<ActiveSpecialWeapon | null>
  >;
  findBombAtPoint?: (pixelX: number, pixelY: number) => Bomb | null;
  explodeBomb?: (bomb: Bomb) => void;
};

export const useGameState = ({
  isGameOver,
  setIsGameOver,
  setEnemies,
  setPlayerHealth,
  setPosition,
  setIsPaused,
  setLastDamageTime,
  setBullets,
  setLevel,
  setScore,
  setIsLevelComplete,
  isPaused,
  isLevelComplete,
  bullets,
  enemies,
  position,
  walls,
  score,
  activeSpecialWeapon,
  setActiveSpecialWeapon,
  findBombAtPoint,
  explodeBomb,
}: UseGameStateProps) => {
  const [isShooting, setIsShooting] = useState(false);

  const resetGame = () => {
    setPosition({ x: 9, y: 9 });
    setEnemies([]);
    setIsGameOver(false);
    setIsLevelComplete(false);
    setPlayerHealth(PLAYER_MAX_HEALTH);
    setLevel(1);
    setScore(0);
    setIsPaused(false);
    setLastDamageTime(0);
    setBullets(MAX_BULLETS);
  };

  const advanceLevel = () => {
    setLevel((prevLevel) => Math.min(prevLevel + 1, MAX_LEVEL));
    setScore(0);
    setIsLevelComplete(false);
    setPosition({ x: 9, y: 9 });
    setEnemies([]);
    setLastDamageTime(0);
  };

  const pauseGame = () => {
    setIsPaused((prevPaused: boolean) => !prevPaused);
  };

  const handleMouseDown = (e: {
    currentTarget: { getBoundingClientRect: () => DOMRect };
    clientX: number;
    clientY: number;
  }) => {
    if (isGameOver || isLevelComplete || isPaused) return;

    const hasSpecialShots =
      activeSpecialWeapon !== null && activeSpecialWeapon.shotsRemaining > 0;

    if (!hasSpecialShots && bullets === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setIsShooting(true);
    playSound("shotgun");

    const hitBomb = findBombAtPoint?.(mouseX, mouseY) ?? null;
    if (hitBomb && explodeBomb) {
      const bombCenter = getGridCellCenter(hitBomb);
      if (hasLineOfSight(position, bombCenter, walls)) {
        explodeBomb(hitBomb);

        if (hasSpecialShots && activeSpecialWeapon) {
          setActiveSpecialWeapon((current) => {
            if (!current) {
              return null;
            }

            const shotsRemaining = current.shotsRemaining - 1;
            return shotsRemaining > 0 ? { ...current, shotsRemaining } : null;
          });
        } else {
          setBullets((prevBullets: number) => prevBullets - 1);
        }

        return;
      }
    }

    if (hasSpecialShots && activeSpecialWeapon) {
      const hitIndices = getEnemiesHitBySpecialWeapon(
        activeSpecialWeapon.type,
        position,
        { x: mouseX, y: mouseY },
        enemies,
        walls
      );
      const hitSet = new Set(hitIndices);

      if (hitSet.size > 0) {
        setEnemies(enemies.filter((_, index) => !hitSet.has(index)));
        setScore((prevScore) => prevScore + hitSet.size);
      }

      setActiveSpecialWeapon((current) => {
        if (!current) {
          return null;
        }

        const shotsRemaining = current.shotsRemaining - 1;
        return shotsRemaining > 0 ? { ...current, shotsRemaining } : null;
      });
      return;
    }

    setBullets((prevBullets: number) => prevBullets - 1);
    const clickedEnemyIndex = enemies.findIndex(
      (enemy: Position) =>
        mouseX >= enemy.x * 20 &&
        mouseX < (enemy.x + 1) * 20 &&
        mouseY >= enemy.y * 20 &&
        mouseY < (enemy.y + 1) * 20
    );
    if (clickedEnemyIndex !== -1) {
      const enemy = enemies[clickedEnemyIndex];
      const enemyCenter = {
        x: enemy.x * CELL_SIZE + CELL_SIZE / 2,
        y: enemy.y * CELL_SIZE + CELL_SIZE / 2,
      };

      if (!hasLineOfSight(position, enemyCenter, walls)) return;

      const updatedEnemies = [...enemies];
      updatedEnemies.splice(clickedEnemyIndex, 1);
      setEnemies(updatedEnemies);
      setScore((prevScore) => prevScore + 1);
    }
  };

  const handleMouseUp = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsShooting(false);
  };

  useEffect(() => {
    if (!isGameOver && !isLevelComplete && score >= WIN_SCORE) {
      setIsLevelComplete(true);
    }
  }, [score, isGameOver, isLevelComplete, setIsLevelComplete]);

  const handlePauseModalClose = () => {
    setIsPaused(false);
  };

  return {
    isShooting,
    resetGame,
    advanceLevel,
    pauseGame,
    handleMouseDown,
    handleMouseUp,
    handlePauseModalClose,
  };
};
