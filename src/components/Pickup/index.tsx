import "./Pickup.css";

type PickupProps = {
  x: number;
  y: number;
  avatar: string;
  label: string;
  isVanishing?: boolean;
};

export const Pickup = ({
  x,
  y,
  avatar,
  label,
  isVanishing = false,
}: PickupProps) => (
  <div
    className={`pickup${isVanishing ? " pickup--vanishing" : ""}`}
    style={{
      left: `${x * 20}px`,
      top: `${y * 20}px`,
    }}
  >
    <span aria-label={label} role="img" className="pickup__icon">
      {avatar}
    </span>
  </div>
);
