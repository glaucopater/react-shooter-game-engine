import { SPECIAL_WEAPON_AVATARS } from "../../constants";
import { SpecialWeaponPickup } from "../../custom-types";
import { Pickup } from "../Pickup";

interface SpecialWeaponProps {
  pickup: SpecialWeaponPickup;
}

const SpecialWeapon = ({ pickup }: SpecialWeaponProps) => {
  return (
    <Pickup
      x={pickup.x}
      y={pickup.y}
      avatar={SPECIAL_WEAPON_AVATARS[pickup.type]}
      label={`special weapon ${pickup.type}`}
      isVanishing={pickup.isVanishing}
    />
  );
};

export default SpecialWeapon;
