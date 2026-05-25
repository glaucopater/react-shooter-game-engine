import { BOMB_AVATAR } from "../../constants";
import { Bomb } from "../../custom-types";

type BombItemProps = {
  bomb: Bomb;
};

export const BombItem = ({ bomb }: BombItemProps) => (
  <div
    className="bomb-item"
    style={{
      position: "absolute",
      left: `${bomb.x * 20}px`,
      top: `${bomb.y * 20}px`,
      width: "20px",
      height: "20px",
    }}
  >
    <span aria-label="bomb" role="img" style={{ fontSize: 20 }}>
      {BOMB_AVATAR}
    </span>
  </div>
);
