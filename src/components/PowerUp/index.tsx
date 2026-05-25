import { MedikitPickup } from "../../custom-types";
import { Pickup } from "../Pickup";

interface PowerUpProps {
  powerupPosition: MedikitPickup;
}

const PowerUp = ({ powerupPosition: medikit }: PowerUpProps) => {
  return (
    <Pickup
      x={medikit.x}
      y={medikit.y}
      avatar={medikit.avatar}
      label="energy food"
      isVanishing={medikit.isVanishing}
    />
  );
};

export default PowerUp;
