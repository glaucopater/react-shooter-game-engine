import './CustomCursor.css';
import { FIRE_AVATAR, TARGET_AVATAR } from '../../constants';

export const CustomCursor = ({
  isShooting,
  position,
}: {
  isShooting: boolean;
  position: { x: number; y: number };
}) => {
  return (
    <div
      className="custom-cursor"
      style={{
        left: position.x - 20,
        top: position.y - 25,
      }}
    >
      <span
        aria-label="fire"
        role="img"
        style={{
          fontSize: 30,
          opacity: isShooting ? 1 : 0.5,
        }}
      >
        {isShooting ? FIRE_AVATAR : TARGET_AVATAR}
      </span>
    </div>
  );
};

export default CustomCursor;
