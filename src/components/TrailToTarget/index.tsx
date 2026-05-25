import { SpecialWeaponType } from "../../custom-types";
import { Position } from "../../custom-types";
import { PixelPoint, getPlayerCenter } from "../../helpers";
import { FIRE_AVATAR, SHOTGUN_AOE_RADIUS } from "../../constants";
import "./TrailToTarget.css";

export const TrailToTarget = ({
  playerPosition,
  aimSegments,
  weaponType = null,
  blastCenter = null,
  isShooting = false,
}: {
  playerPosition: Position;
  aimSegments: PixelPoint[][];
  weaponType?: SpecialWeaponType | null;
  blastCenter?: PixelPoint | null;
  isShooting?: boolean;
}) => {
  const playerCenter = getPlayerCenter(playerPosition);
  const isShotgun = weaponType === "shotgun";

  return (
    <svg
      className="trail-to-target"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      {isShotgun && blastCenter && (
        <circle
          className={`shotgun-blast-radius${isShooting ? " shotgun-blast-radius--active" : ""}`}
          cx={blastCenter.x}
          cy={blastCenter.y}
          r={SHOTGUN_AOE_RADIUS}
        />
      )}

      {aimSegments.map((segment, index) => {
        const [start, end] = segment;
        const segmentStart = index === 0 ? playerCenter : start;

        return (
          <line
            key={index}
            className={
              isShotgun
                ? `shotgun-trail${isShooting ? " shotgun-trail--active" : ""}`
                : undefined
            }
            x1={segmentStart.x}
            y1={segmentStart.y}
            x2={end.x}
            y2={end.y}
            stroke={isShotgun ? "#ff7a18" : "white"}
            strokeWidth={isShotgun ? 4 : 2}
            strokeDasharray={isShotgun ? undefined : "5"}
            opacity={isShotgun ? (isShooting ? 1 : 0.85) : 0.5}
          />
        );
      })}

      {isShotgun &&
        aimSegments.map((segment, index) => {
          const end = segment[1];

          return (
            <text
              key={`fire-${index}`}
              className={`shotgun-fire${isShooting ? " shotgun-fire--active" : ""}`}
              x={end.x}
              y={end.y}
              fontSize={isShooting ? 34 : 24}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {FIRE_AVATAR}
            </text>
          );
        })}
    </svg>
  );
};
