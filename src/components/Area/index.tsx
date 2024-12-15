import { useState } from "react";
import "./Area.css";
import CustomCursor from "../CustomCursor";
import { FIRE_AVATAR } from "../../constants";

const styles: { [key: string]: React.CSSProperties } = {
  "::hover": {
    backgroundColor: "#2980b9",
  },
  "::before": {
    backgroundImage: `url(${FIRE_AVATAR})`,
  },
};

export const Area = ({
  handleMouseDown,
  handleMouseUp,
  isShooting,
  children,
}: {
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseUp: (e: React.MouseEvent<HTMLDivElement>) => void;
  isShooting: boolean;
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div
      className="area"
      style={{
        ...styles,
        // "--hover-opacity": "0.5",
        // "--hover-color": "red",
        // "--hover-background": "url(../../src/assets/images/terrain2.jpg)",
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {isVisible && <CustomCursor isShooting={isShooting} />}
      {children}
    </div>
  );
};
