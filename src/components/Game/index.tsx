import Modal from "../Modal";
import { Player } from "../Player";
import { Enemy } from "../Enemy";
import Ammo from "../Ammo";
import PowerUp from "../PowerUp";
import SpecialWeapon from "../SpecialWeapon";
import { Area } from "../Area";
import { AreaHeader } from "../Area/AreaHeader";
import { Hud } from "../Hud";
import FEATURES from "../../features";
import { usePlayerHealth } from "../../hooks/usePlayerHealth";
import { useEnemies } from "../../hooks/useEnemies";
import { useAmmunition } from "../../hooks/useAmmonitions";
import { useMedikits } from "../../hooks/useMedikits";
import { useSpecialWeapons } from "../../hooks/useSpecialWeapons";
import { useKeyboardEvents } from "../../hooks/useKeyboardEvents";
import { useGameState } from "../../hooks/useGameState";
import { usePlayerMovement } from "../../hooks/usePlayerMovement";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  MAX_BULLETS,
  WIN_SCORE,
  MAX_LEVEL,
  getTotalScore,
  DEFAULT_PLAYER_WIDTH,
  DEFAULT_PLAYER_HEIGHT,
  DEFAULT_ENEMY_WIDTH,
  DEFAULT_ENEMY_HEIGHT,
  getWallCountForLevel,
} from "../../constants";
import { Controls } from "../Controls";
import { WallProps } from "../Wall/index";
import Wall from "../Wall";
import { useBombs } from "../../hooks/useBombs";
import { BombItem } from "../Bomb";
import { FireZoneEffect } from "../FireZone";
import { generateRandomWalls } from "../../helpers";
import { GameEndResult } from "../../helpers/highScores";

const initialPosition = { x: 9, y: 9 };

const createWallsForLevel = (level: number) =>
  generateRandomWalls(
    initialPosition,
    DEFAULT_PLAYER_WIDTH,
    DEFAULT_PLAYER_HEIGHT,
    getWallCountForLevel(level)
  );

type GameProps = {
  onGameEnd?: (result: GameEndResult) => void;
  onMainMenu?: () => void;
  suppressEndModals?: boolean;
};

const Game = ({ onGameEnd, onMainMenu, suppressEndModals = false }: GameProps = {}) => {
  const hasReportedGameEnd = useRef(false);
  const [walls, setWalls] = useState<WallProps[]>(() => createWallsForLevel(1));
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);

  const {
    position,
    playerPositionRef,
    moveRight,
    moveLeft,
    moveDown,
    moveUp,
    setPosition,
  } = usePlayerMovement(
    initialPosition,
    DEFAULT_PLAYER_WIDTH,
    DEFAULT_PLAYER_HEIGHT,
    walls
  );
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [bullets, setBullets] = useState(MAX_BULLETS);

  const [refPlayerPosition, setRefPlayerPosition] =
    useState<HTMLDivElement | null>(null);

  const isGameplayPaused = isPaused || isLevelComplete;

  const { enemies, setEnemies } = useEnemies(
    isGameOver,
    isLevelComplete,
    isPaused,
    level,
    playerPositionRef,
    walls,
    DEFAULT_ENEMY_WIDTH,
    DEFAULT_ENEMY_HEIGHT
  );
  const { playerHealth, setPlayerHealth, setLastDamageTime } = usePlayerHealth({
    isGameOver,
    setIsGameOver,
    isPaused: isGameplayPaused,
    position,
    enemies,
    setEnemies,
  });
  const {
    bombs,
    fireZones,
    explodeBomb,
    findBombAtPoint,
    resetBombs,
  } = useBombs({
    isGameOver,
    isPaused: isGameplayPaused,
    level,
    walls,
    position,
    enemies,
    setEnemies,
    setPlayerHealth,
    setLastDamageTime,
  });
  const {
    specialWeaponPickups,
    spawnCountdown: specialWeaponCountdown,
    activeSpecialWeapon,
    setActiveSpecialWeapon,
    resetSpecialWeapon,
  } = useSpecialWeapons({
    isGameOver,
    isPaused: isGameplayPaused,
    level,
    position,
    walls,
    additionalBlocked: bombs,
  });

  const {
    isShooting,
    resetGame,
    advanceLevel,
    pauseGame,
    handlePointerDown,
    handlePointerUp,
    handlePauseModalClose,
  } = useGameState({
    isGameOver,
    setIsGameOver,
    setBullets,
    setEnemies,
    setPlayerHealth,
    setLastDamageTime,
    setIsPaused,
    setPosition,
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
  });

  const { ammunitions, spawnCountdown: ammoCountdown } = useAmmunition({
    isGameOver,
    isPaused: isGameplayPaused,
    level,
    position,
    bullets,
    walls,
    setBullets,
    additionalBlocked: bombs,
  });

  const { medikits, spawnCountdown: medikitCountdown } = useMedikits({
    isGameOver,
    isPaused: isGameplayPaused,
    level,
    position,
    playerHealth,
    walls,
    setPlayerHealth,
    additionalBlocked: bombs,
  });

  useKeyboardEvents({
    isGameOver,
    isPaused: isGameplayPaused,
    playerHealth,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    pauseGame,
  });

  const handleResetGame = useCallback(() => {
    hasReportedGameEnd.current = false;
    resetGame();
    resetSpecialWeapon();
    resetBombs();
    setWalls(createWallsForLevel(1));
  }, [resetGame, resetSpecialWeapon, resetBombs]);

  const handleNextLevel = useCallback(() => {
    if (level >= MAX_LEVEL) return;
    advanceLevel();
    setWalls(createWallsForLevel(level + 1));
  }, [advanceLevel, level]);

  const isFinalLevelComplete = isLevelComplete && level >= MAX_LEVEL;

  useEffect(() => {
    if (hasReportedGameEnd.current || !onGameEnd) {
      return;
    }

    if (!isGameOver && !isFinalLevelComplete) {
      return;
    }

    hasReportedGameEnd.current = true;
    onGameEnd({
      level,
      score,
      totalScore: getTotalScore(level, score),
      didWin: isFinalLevelComplete,
    });
  }, [isGameOver, isFinalLevelComplete, level, score, onGameEnd]);

  return (
    <div className="game-shell-viewport">
      <div className="game-shell">
      <div className="game-board">
        <AreaHeader
          level={level}
          score={score}
          killsToWin={WIN_SCORE}
          medikitCountdown={medikitCountdown}
          ammoCountdown={ammoCountdown}
          specialWeaponCountdown={specialWeaponCountdown}
        />
        <Area
          level={level}
          handlePointerDown={handlePointerDown}
          handlePointerUp={handlePointerUp}
          isShooting={isShooting}
          showTrail={!isGameplayPaused}
          playerPosition={position}
          walls={walls}
          activeSpecialWeapon={activeSpecialWeapon}
        >
          <Player
            position={position}
            health={playerHealth}
            isPaused={isGameplayPaused}
            refPlayerPosition={refPlayerPosition}
            setRefPlayerPosition={setRefPlayerPosition}
          />
          {FEATURES.ALLOW_ENEMIES &&
            enemies.map((enemy, index) => (
              <Enemy
                key={index}
                enemy={enemy}
                id={index.toString()}
                isPaused={isGameplayPaused}
              />
            ))}
          {FEATURES.ALLOW_POWERUPS &&
            ammunitions.map((ammunition, index) => (
              <Ammo key={index} ammunition={ammunition} />
            ))}
          {FEATURES.ALLOW_POWERUPS &&
            medikits.map((medikit, index) => (
              <PowerUp key={index} powerupPosition={medikit} />
            ))}
          {FEATURES.ALLOW_POWERUPS &&
            specialWeaponPickups.map((pickup, index) => (
              <SpecialWeapon key={index} pickup={pickup} />
            ))}
          {bombs.map((bomb) => (
            <BombItem key={bomb.id} bomb={bomb} />
          ))}
          {fireZones.map((zone) => (
            <FireZoneEffect key={zone.id} zone={zone} />
          ))}

          {FEATURES.ALLOW_WALLS &&
            walls.map((wall, index) => (
              <Wall key={index} wallCoordinates={wall.wallCoordinates} />
            ))}
        </Area>
        <Hud
          playerHealth={playerHealth}
          bullets={bullets}
          activeSpecialWeapon={activeSpecialWeapon}
        />
        <Controls
          isGameOver={isGameOver || isLevelComplete}
          isPaused={isPaused}
          playerHealth={playerHealth}
          moveUp={moveUp}
          moveLeft={moveLeft}
          moveRight={moveRight}
          moveDown={moveDown}
          pauseGame={pauseGame}
        />
      </div>

      <Modal isOpen={isGameOver && !suppressEndModals} onClose={handleResetGame}>
        <h2>Game Over!</h2>
        <p>Level reached: {level}</p>
        <p>Score: {getTotalScore(level, score)}</p>
        <button onClick={handleResetGame}>Restart</button>
        {onMainMenu && (
          <button type="button" onClick={onMainMenu}>
            Main Menu
          </button>
        )}
      </Modal>

      <Modal isOpen={isLevelComplete && level < MAX_LEVEL} onClose={handleNextLevel}>
        <h2>Level {level} Complete!</h2>
        <p>Get ready for level {level + 1}</p>
        <button onClick={handleNextLevel}>Next Level</button>
      </Modal>

      <Modal isOpen={isFinalLevelComplete && !suppressEndModals} onClose={handleResetGame}>
        <h2>You Win!</h2>
        <p>All {MAX_LEVEL} levels complete.</p>
        <p>Score: {getTotalScore(level, score)}</p>
        <button onClick={handleResetGame}>Play Again</button>
        {onMainMenu && (
          <button type="button" onClick={onMainMenu}>
            Main Menu
          </button>
        )}
      </Modal>

      <Modal isOpen={isPaused && !isLevelComplete} onClose={handlePauseModalClose}>
        <h2>Game Paused</h2>
        <button onClick={handlePauseModalClose}>Resume</button>
      </Modal>
      </div>
    </div>
  );
};

export default Game;
