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
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button disabled={!canMove} onClick={() => moveUp()}>Up</button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <button disabled={!canMove} onClick={() => moveLeft()}>Left</button>
        <button disabled={!canMove} onClick={() => moveRight()}>Right</button>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button disabled={!canMove} onClick={() => moveDown()}>Down</button>
      </div>

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}
      >
        <button style={{ width: "100%" }} onClick={() => pauseGame()}>
          Pause (spacebar)
        </button>
      </div>
    </div>
  );
};
