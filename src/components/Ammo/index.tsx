import { AMMO_AVATAR } from "../../constants";
import { SpawnedPickup } from "../../custom-types";
import { Pickup } from "../Pickup";

interface AmmoProps {
  ammunition: SpawnedPickup;
}

const Ammo = ({ ammunition }: AmmoProps) => {
  return (
    <Pickup
      x={ammunition.x}
      y={ammunition.y}
      avatar={AMMO_AVATAR}
      label="ammo"
      isVanishing={ammunition.isVanishing}
    />
  );
};

export default Ammo;
