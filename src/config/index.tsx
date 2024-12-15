import { WallProps } from "../components/Wall";

export const initialPosition = { x: 9, y: 9 };

export const initialWalls: WallProps[] = [
  {
    wallCoordinates: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 2, y: 4 },
      { x: 2, y: 5 },
    ],
  },
  {
    wallCoordinates: [
      { x: 17, y: 10 },
      { x: 18, y: 10 },
      { x: 19, y: 10 },
    ],
  },
  {
    wallCoordinates: [
      { x: 9, y: 16 },
      { x: 9, y: 17 },
      { x: 9, y: 18 },
      { x: 9, y: 19 },
    ],
  },
];
