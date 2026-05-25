import { useEffect } from "react";

type UseKeyboardEventsProps = {
  isGameOver: boolean;
  isPaused: boolean;
  playerHealth: number;
  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  pauseGame: () => void;
};
export const useKeyboardEvents = ({
  isGameOver,
  isPaused,
  playerHealth,
  moveUp,
  moveDown,
  moveLeft,
  moveRight,
  pauseGame,
}: UseKeyboardEventsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: { key: string }) => {
      if (isGameOver || playerHealth <= 0) return;
      if (e.key === " ") {
        pauseGame();
      } else if (!isPaused) {
        switch (e.key) {
          case "w":
          case "ArrowUp":
            moveUp();
            break;
          case "s":
          case "ArrowDown":
            moveDown();
            break;
          case "a":
          case "ArrowLeft":
            moveLeft();
            break;
          case "d":
          case "ArrowRight":
            moveRight();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameOver, isPaused, playerHealth, moveUp, moveDown, moveLeft, moveRight, pauseGame]);
};
