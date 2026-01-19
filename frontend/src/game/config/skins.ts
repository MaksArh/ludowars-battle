export const SKINS = ['red', 'yellow', 'blue', 'green'] as const;

export type SkinId = typeof SKINS[number];

export const getSkinByIndex = (index: number): SkinId => {
  const safeIndex = Number.isFinite(index) ? index : 0;
  return SKINS[((safeIndex % SKINS.length) + SKINS.length) % SKINS.length];
};
