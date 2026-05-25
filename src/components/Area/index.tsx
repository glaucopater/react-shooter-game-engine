import { useState } from 'react';
import './Area.css';
import CustomCursor from '../CustomCursor';
import { TrailToTarget } from '../TrailToTarget';
import { Position } from '../../custom-types';
import { WallProps } from '../Wall';
import { getBlockedAimPoint } from '../../helpers';

export const Area = ({
  handleMouseDown,
  handleMouseUp,
  isShooting,
  showTrail,
  playerPosition,
  walls,
  children,
}: {
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  isShooting: boolean;
  showTrail: boolean;
  playerPosition: Position;
  walls: WallProps[];
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const aimPoint = getBlockedAimPoint(playerPosition, cursorPosition, walls);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className="area"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {isVisible && showTrail && (
        <TrailToTarget playerPosition={playerPosition} aimPoint={aimPoint} />
      )}
      {isVisible && (
        <CustomCursor isShooting={isShooting} position={aimPoint} />
      )}
      {children}
    </div>
  );
};
