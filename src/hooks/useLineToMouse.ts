import { useState, useEffect } from "react";
import { Position } from "../custom-types";
import FEATURES from "../features/";

const useLineToMouse = () => {
  const [mousePosition, setMousePosition] = useState<Position>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!FEATURES.ALLOW_LINE_TO_MOUSE) return;

    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      // clearInterval(intervalId);
    };
  }, []);

  return { mousePosition };
};

export default useLineToMouse;
