export type LevelProgress = {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  xpIntoLevel: number;
  xpNeeded: number;
  percentage: number;
};

function getXPRequiredForLevel(level: number): number {
  if (level <= 1) {
    return 0;
  }

  return (
    100 * (level - 1) +
    25 * (level - 1) * (level - 2)
  );
}

export function getLevelFromXP(xp: number): number {
  const safeXP = Math.max(0, xp);

  let level = 1;

  while (
    getXPRequiredForLevel(level + 1) <= safeXP
  ) {
    level += 1;
  }

  return level;
}

export function getLevelProgress(
  xp: number
): LevelProgress {
  const safeXP = Math.max(0, xp);
  const level = getLevelFromXP(safeXP);

  const currentLevelXP =
    getXPRequiredForLevel(level);

  const nextLevelXP =
    getXPRequiredForLevel(level + 1);

  const xpIntoLevel =
    safeXP - currentLevelXP;

  const xpNeeded =
    nextLevelXP - currentLevelXP;

  const percentage = Math.min(
    100,
    Math.floor(
      (xpIntoLevel / xpNeeded) * 100
    )
  );

  return {
    level,
    currentXP: safeXP,
    nextLevelXP,
    xpIntoLevel,
    xpNeeded,
    percentage,
  };
}