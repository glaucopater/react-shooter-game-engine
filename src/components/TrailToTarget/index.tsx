import { Position } from "../../custom-types";
import { AimPoint, getPlayerCenter } from "../../helpers";

export const TrailToTarget = ({
  playerPosition,
  aimPoint,
}: {
  playerPosition: Position;
  aimPoint: AimPoint;
}) => {
  const playerCenter = getPlayerCenter(playerPosition);

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <line
        x1={playerCenter.x}
        y1={playerCenter.y}
        x2={aimPoint.x}
        y2={aimPoint.y}
        stroke="white"
        strokeWidth="2"
        strokeDasharray="5"
        opacity={0.5}
      />
    </svg>
  );
};
