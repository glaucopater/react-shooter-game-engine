import { ActiveSpecialWeapon } from "../../custom-types";
import {
  SPECIAL_WEAPON_LABELS,
  SPECIAL_WEAPON_MAX_SHOTS,
} from "../../constants";

export const Hud = ({
  playerHealth,
  bullets,
  activeSpecialWeapon,
}: {
  playerHealth: number;
  bullets: number;
  activeSpecialWeapon: ActiveSpecialWeapon | null;
}) => {
  return (
    <div className="hud">
      <div>Health: {playerHealth}</div>
      <div>Bullets: {bullets}</div>
      {activeSpecialWeapon ? (
        <div>
          {SPECIAL_WEAPON_LABELS[activeSpecialWeapon.type]}:{" "}
          {activeSpecialWeapon.shotsRemaining}/{SPECIAL_WEAPON_MAX_SHOTS}
        </div>
      ) : (
        <div>Weapon: Standard</div>
      )}
    </div>
  );
};
