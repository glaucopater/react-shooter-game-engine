import Modal from "../Modal";
import { Player } from "../Player";
import { Enemy } from "../Enemy";
import Ammo from "../Ammo";
import PowerUp from "../PowerUp";
import { Area } from "../Area";
import { Hud } from "../Hud";
import FEATURES from "../../features";
import { usePlayerHealth } from "../../hooks/usePlayerHealth";
import { useEnemies } from "../../hooks/useEnemies";
import { useAmmunition } from "../../hooks/useAmmonitions";
import { useMedikits } from "../../hooks/useMedikits";
import { useKeyboardEvents } from "../../hooks/useKeyboardEvents";
import { useGameState } from "../../hooks/useGameState";
import { usePlayerMovement } from "../../hooks/usePlayerMovement";
import { useState, useCallback } from "react";
import {
  MAX_BULLETS,
  WIN_SCORE,
  DEFAULT_PLAYER_WIDTH,
  DEFAULT_PLAYER_HEIGHT,
  DEFAULT_ENEMY_WIDTH,
  DEFAULT_ENEMY_HEIGHT,
} from "../../constants";
import { Controls } from "../Controls";
import { WallProps } from "../Wall/index";
import Wall from "../Wall";
import { generateRandomWalls } from "../../helpers";

const Game = () => {
  const initialPosition = { x: 9, y: 9 };
  const [walls, setWalls] = useState<WallProps[]>(() =>
    generateRandomWalls(
      initialPosition,
      DEFAULT_PLAYER_WIDTH,
      DEFAULT_PLAYER_HEIGHT
    )
  );

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

  const { enemies, setEnemies } = useEnemies(
    isGameOver,
    isPaused,
    playerPositionRef,
    walls,
    DEFAULT_ENEMY_WIDTH,
    DEFAULT_ENEMY_HEIGHT
  );
  const { playerHealth, setPlayerHealth, setLastDamageTime } = usePlayerHealth({
    isGameOver,
    setIsGameOver,
    isPaused,
    position,
    enemies,
    setEnemies,
  });
  const {
    score,
    isShooting,
    resetGame,
    pauseGame,
    handleMouseDown,
    handleMouseUp,
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
    isPaused,
    bullets,
    enemies,
    position,
    walls,
  });

  const { ammunitions } = useAmmunition({
    isGameOver,
    isPaused,
    position,
    bullets,
    setBullets,
  });

  const { medikits } = useMedikits({
    isGameOver,
    isPaused,
    position,
    playerHealth,
    setPlayerHealth,
  });

  useKeyboardEvents({
    isGameOver,
    isPaused,
    playerHealth,
    moveUp,
    moveDown,
    moveLeft,
    moveRight,
    pauseGame,
  });

  const handleResetGame = useCallback(() => {
    resetGame();
    setWalls(
      generateRandomWalls(
        initialPosition,
        DEFAULT_PLAYER_WIDTH,
        DEFAULT_PLAYER_HEIGHT
      )
    );
  }, [resetGame]);

  return (
    <div style={{ padding: 0, position: "relative" }}>
      <Area
        handleMouseDown={handleMouseDown}
        handleMouseUp={handleMouseUp}
        isShooting={isShooting}
        showTrail={!isPaused}
        playerPosition={position}
        walls={walls}
      >
        <Player
          position={position}
          health={playerHealth}
          isPaused={isPaused}
          refPlayerPosition={refPlayerPosition}
          setRefPlayerPosition={setRefPlayerPosition}
        />
        {FEATURES.ALLOW_ENEMIES &&
          enemies.map((enemy, index) => (
            <Enemy
              key={index}
              enemy={enemy}
              id={index.toString()}
              isPaused={isPaused}
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

        {FEATURES.ALLOW_WALLS &&
          walls.map((wall, index) => (
            <Wall key={index} wallCoordinates={wall.wallCoordinates} />
          ))}
      </Area>
      <Hud playerHealth={playerHealth} bullets={bullets} />
      <Controls
        isGameOver={isGameOver}
        isPaused={isPaused}
        playerHealth={playerHealth}
        moveUp={moveUp}
        moveLeft={moveLeft}
        moveRight={moveRight}
        moveDown={moveDown}
        pauseGame={pauseGame}
      />

      <Modal isOpen={isGameOver} onClose={handleResetGame}>
        <h2>{score >= WIN_SCORE ? "You Win!" : "Game Over!"}</h2>
        <p>Your score: {score}</p>
        <button onClick={handleResetGame}>Restart</button>
      </Modal>

      <Modal isOpen={isPaused} onClose={handlePauseModalClose}>
        <h2>Game Paused</h2>
        <button onClick={handlePauseModalClose}>Resume</button>
      </Modal>
    </div>
  );
};

export default Game;
