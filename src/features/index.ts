/* eslint-disable @typescript-eslint/no-explicit-any */
/*
issue with netlify

const ALLOW_ENEMIES = import.meta.env.VITE_ALLOW_ENEMIES === "true" ?? true;
const ALLOW_POWERUPS = import.meta.env.VITE_ALLOW_POWERUPS === "true" ?? true;
const ALLOW_PLAYER_IMMORTAL =
  import.meta.env.VITE_ALLOW_PLAYER_IMMORTAL === "true" ?? true;
*/

// abstract the concept of feature with specific typing
// a feature when set has different properties
// so or a subproperty or...

// extract the type of these features

// base type, a feature is a function
// that returns an object with sub features
// that can be changed
export type Feature = {
  [key: string]: string | number | boolean | Feature;
};

export default {
  ALLOW_ENEMIES: false,
  ALLOW_POWERUPS: false,
  ALLOW_PLAYER_IMMORTAL: true,
  ALLOW_PLAYER_HEALTH: false,
  ALLOW_WALLS: true,
  ALLOW_AMMONITIONS: false,
  ALLOW_LINE_TO_MOUSE: false,
};

export const defaultFeatures: Feature = {
  ALLOW_ENEMIES: false,
  WITH_ENEMIES: {
    MAX_AMOUNT: 10,
    MAX_HEALTH: 100,
    MAX_SPEED: 1,
    DEFAULT_AVATAR: "🤖 ",
  },
};

export function flattenFeature(
  feature: Feature,
  prefix: string = ""
): Record<string, string | number | boolean> {
  let result: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(feature)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      // Recursively flatten nested Feature
      const nestedFlattened = flattenFeature(value as Feature, newKey);
      result = { ...result, ...nestedFlattened };
    } else {
      // Add primitive values directly
      result[newKey] = value as string | number | boolean;
    }
  }

  return result;
}
