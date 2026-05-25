import "./Controls.css";

type ControlsProps = {
  isGameOver: boolean;
  isPaused: boolean;
  playerHealth: number;
  moveUp: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  moveDown: () => void;
  pauseGame: () => void;
};

export const Controls = ({
  isGameOver,
  isPaused,
  playerHealth,
  moveUp,
  moveLeft,
  moveRight,
  moveDown,
  pauseGame,
}: ControlsProps) => {
  const canMove = !isGameOver && !isPaused && playerHealth > 0;

  return (
    <div className="controls">
      <div className="controls__row">
        <button
          className="controls__button"
          disabled={!canMove}
          onClick={() => moveUp()}
        >
          Up
        </button>
      </div>
      <div className="controls__row controls__row--middle">
        <button
          className="controls__button"
          disabled={!canMove}
          onClick={() => moveLeft()}
        >
          Left
        </button>
        <button
          className="controls__button"
          disabled={!canMove}
          onClick={() => moveRight()}
        >
          Right
        </button>
      </div>
      <div className="controls__row">
        <button
          className="controls__button"
          disabled={!canMove}
          onClick={() => moveDown()}
        >
          Down
        </button>
      </div>

      <button
        className="controls__pause"
        type="button"
        onClick={() => pauseGame()}
      >
        {isPaused ? "Resume (spacebar)" : "Pause (spacebar)"}
      </button>
    </div>
  );
};
