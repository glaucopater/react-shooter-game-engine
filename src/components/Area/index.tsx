import { useMemo, useState, type CSSProperties } from "react";
import "./Area.css";
import CustomCursor from "../CustomCursor";
import { TrailToTarget } from "../TrailToTarget";
import { Position, ActiveSpecialWeapon } from "../../custom-types";
import { WallProps } from "../Wall";
import {
  getBlockedAimPoint,
  getPlayerCenter,
  getSpecialWeaponAimPath,
} from "../../helpers";
import { getLevelBackground } from "../../constants";

export const Area = ({
  level,
  handlePointerDown,
  handlePointerUp,
  isShooting,
  showTrail,
  playerPosition,
  walls,
  activeSpecialWeapon,
  children,
}: {
  level: number;
  handlePointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  handlePointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  isShooting: boolean;
  showTrail: boolean;
  playerPosition: Position;
  walls: WallProps[];
  activeSpecialWeapon: ActiveSpecialWeapon | null;
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const aimPoint = getBlockedAimPoint(playerPosition, cursorPosition, walls);
  const aimSegments = useMemo(() => {
    if (activeSpecialWeapon) {
      return getSpecialWeaponAimPath(
        activeSpecialWeapon.type,
        playerPosition,
        cursorPosition,
        walls
      );
    }

    return [[getPlayerCenter(playerPosition), { x: aimPoint.x, y: aimPoint.y }]];
  }, [activeSpecialWeapon, playerPosition, cursorPosition, walls, aimPoint]);

  const areaStyle = {
    "--area-background": `url(${getLevelBackground(level)})`,
  } as CSSProperties;

  const updateCursorPosition = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className="area"
      style={areaStyle}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={updateCursorPosition}
      onPointerEnter={() => setIsVisible(true)}
      onPointerLeave={() => setIsVisible(false)}
    >
      {isVisible && showTrail && (
        <TrailToTarget
          playerPosition={playerPosition}
          aimSegments={aimSegments}
          weaponType={activeSpecialWeapon?.type ?? null}
          blastCenter={
            activeSpecialWeapon?.type === "shotgun" ? aimPoint : null
          }
          isShooting={isShooting}
        />
      )}
      {isVisible && (
        <CustomCursor isShooting={isShooting} position={aimPoint} />
      )}
      {children}
    </div>
  );
};
