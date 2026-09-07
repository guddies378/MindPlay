export type GameDifficulty = "easy" | "normal" | "hard";

export const GAME_XP: Record<GameDifficulty, number> = {
  easy: 20,
  normal: 35,
  hard: 50,
};

export const MAX_PERFORMANCE_BONUS = 30;
export const DAILY_CHALLENGE_XP = 50;

export function getPerformanceBonus(score: number): number {
  return Math.min(
    MAX_PERFORMANCE_BONUS,
    Math.max(0, Math.floor(score / 10))
  );
}
