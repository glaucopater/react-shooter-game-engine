import { FIRE_AVATAR, BOMB_EXPLOSION_RADIUS } from "../../constants";
import { FireZone } from "../../custom-types";
import { getGridCellCenter } from "../../helpers";
import "./FireZone.css";

type FireZoneProps = {
  zone: FireZone;
};

const FIRE_OFFSETS = [
  { x: 0, y: 0 },
  { x: -14, y: -10 },
  { x: 14, y: -10 },
  { x: -12, y: 12 },
  { x: 12, y: 12 },
  { x: 0, y: -18 },
];

export const FireZoneEffect = ({ zone }: FireZoneProps) => {
  const center = getGridCellCenter(zone);

  return (
    <div
      className="fire-zone"
      style={{
        left: `${center.x - BOMB_EXPLOSION_RADIUS}px`,
        top: `${center.y - BOMB_EXPLOSION_RADIUS}px`,
        width: `${BOMB_EXPLOSION_RADIUS * 2}px`,
        height: `${BOMB_EXPLOSION_RADIUS * 2}px`,
      }}
    >
      <div className="fire-zone__glow" />
      {FIRE_OFFSETS.map((offset, index) => (
        <span
          key={`${zone.id}-${index}`}
          className="fire-zone__flame"
          style={{
            left: `calc(50% + ${offset.x}px)`,
            top: `calc(50% + ${offset.y}px)`,
          }}
          aria-hidden="true"
        >
          {FIRE_AVATAR}
        </span>
      ))}
    </div>
  );
};
