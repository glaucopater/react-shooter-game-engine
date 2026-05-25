export type Position = { x: number; y: number };

export type SpawnedPickup = Position & {
  spawnedAt: number;
  isVanishing: boolean;
};

export type Bomb = Position & {
  id: string;
};

export type FireZone = {
  id: string;
  x: number;
  y: number;
  createdAt: number;
};

export type MedikitPickup = SpawnedPickup & {
  avatar: string;
};

export type SpecialWeaponType = "pierce" | "shotgun" | "ricochet";

export type SpecialWeaponPickup = Position & {
  type: SpecialWeaponType;
  isVanishing?: boolean;
};

export type ActiveSpecialWeapon = {
  type: SpecialWeaponType;
  shotsRemaining: number;
};
