import type { AchievementId } from "@/lib/achievements";
import { addXP } from "@/lib/progress";
import { DAILY_CHALLENGE_XP } from "@/lib/gameXP";

export const DAILY_CHALLENGE_BONUS_POINTS = 10;

export type DailyChallengeGame =
  | "memory-match"
  | "quick-math"
  | "word-scramble"
  | "riddle-me"
  | "odd-one-out"
  | "tic-tac-toe"
  | "reaction-rush"
  | "number-memory"
  | "color-clash"
  | "pattern-recall"
  | "sequence-master"
  | "logic-rush";

export type DailyChallengeDifficulty =
  | "easy"
  | "normal"
  | "hard";

export type DailyChallenge = {
  id: string;
  date: string;
  game: DailyChallengeGame;
  title: string;
  description: string;
  icon: string;
  difficulty: DailyChallengeDifficulty;
  rewardXP: number;
  achievementId: AchievementId;
};

const STORAGE_KEY = "mindplay-daily-challenge";

const CHALLENGES: Omit<
  DailyChallenge,
  "id" | "date" | "difficulty"
>[] = [
  {
    game: "memory-match",
    title: "Memory Master",
    description: "Complete a Memory Match challenge.",
    icon: "🧠",
    rewardXP: DAILY_CHALLENGE_XP,
    achievementId: "memory-master",
  },
  {
    game: "quick-math",
    title: "Math Rush",
    description: "Complete a Quick Math challenge.",
    icon: "⚡",
    rewardXP: DAILY_CHALLENGE_XP,
    achievementId: "math-machine",
  },
  {
    game: "word-scramble",
    title: "Word Hunter",
    description: "Complete a Word Scramble challenge.",
    icon: "🔤",
    rewardXP: DAILY_CHALLENGE_XP,
    achievementId: "word-wizard",
  },
  {
    game: "riddle-me",
    title: "Riddle Master",
    description: "Solve a Riddle Me challenge.",
    icon: "🧩",
    rewardXP: DAILY_CHALLENGE_XP,
    achievementId: "riddle-solver",
  },
  {
    game: "odd-one-out",
    title: "Sharp Eyes",
    description: "Complete an Odd One Out challenge.",
    icon: "👀",
    rewardXP: DAILY_CHALLENGE_XP,
    achievementId: "sharp-eyes",
  },
  {
    game: "tic-tac-toe",
    title: "Think Ahead",
    description: "Complete a Tic-Tac-Toe challenge.",
    icon: "❌⭕",
    rewardXP: DAILY_CHALLENGE_XP,
    achievementId: "strategy-master",
  },
  {
    game: "reaction-rush",
    title: "Lightning Reflexes",
    description: "Complete a Reaction Rush challenge.",
    icon: "⚡",
    rewardXP: DAILY_CHALLENGE_XP,
    achievementId: "lightning-reflexes",
  },
  {
    game: "number-memory",
    title: "Number Vault",
    description: "Complete a Number Memory challenge.",
    icon: "🔢",
    rewardXP: DAILY_CHALLENGE_XP,
    achievementId: "number-vault",
  },
  {
    game: "color-clash",
    title: "Color Focus",
    description: "Complete a Color Clash challenge.",
    icon: "🎨",
    rewardXP: DAILY_CHALLENGE_XP,
    achievementId: "color-focus",
  },
  {
    game: "pattern-recall",
    title: "Pattern Master",
    description: "Complete a Pattern Recall challenge.",
    icon: "🟦",
    rewardXP: DAILY_CHALLENGE_XP,
    achievementId: "pattern-master",
  },
  {
    game: "sequence-master",
    title: "Sequence Master",
    description: "Complete a Sequence Master challenge.",
    icon: "🔁",
    rewardXP: DAILY_CHALLENGE_XP,
    achievementId: "sequence-master",
  },
  {
    game: "logic-rush",
    title: "Logic Rush",
    description: "Complete a Logic Rush challenge.",
    icon: "🧠",
    rewardXP: DAILY_CHALLENGE_XP,
    achievementId: "logic-rush",
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function getToday(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function hashString(value: string): number {
  let hash = 0;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash =
      (hash * 31 +
        value.charCodeAt(index)) |
      0;
  }

  return Math.abs(hash);
}

/*
 * Selects one difficulty for the entire day.
 *
 * The date is used as the seed, so the result
 * stays the same throughout the day.
 *
 * The extra seed string is intentionally chosen
 * so the difficulty does not get stuck on the
 * same value for many consecutive dates.
 */
function getDailyDifficulty(
  date: string
): DailyChallengeDifficulty {
  const difficulties: DailyChallengeDifficulty[] = [
    "easy",
    "normal",
    "hard",
  ];

  const difficultyIndex =
    hashString(
      `${date}-daily-difficulty-v2`
    ) % difficulties.length;

  return difficulties[difficultyIndex];
}

export function getDailyChallenge(): DailyChallenge {
  const date = getToday();

  /*
   * Select today's game.
   */
  const gameIndex =
    hashString(date) %
    CHALLENGES.length;

  const challenge =
    CHALLENGES[gameIndex];

  /*
   * Select today's difficulty independently
   * from today's game.
   */
  const difficulty =
    getDailyDifficulty(date);

  return {
    ...challenge,
    difficulty,
    id: `${date}-${challenge.game}-${difficulty}`,
    date,
  };
}

export function isDailyChallenge(
  game: DailyChallengeGame
): boolean {
  return (
    getDailyChallenge().game === game
  );
}

export function isDailyChallengeCompleted(): boolean {
  if (!isBrowser()) {
    return false;
  }

  const challenge =
    getDailyChallenge();

  return (
    localStorage.getItem(
      STORAGE_KEY
    ) === challenge.id
  );
}

export function completeDailyChallenge(
  game: DailyChallengeGame
): boolean {
  if (!isBrowser()) {
    return false;
  }

  const challenge =
    getDailyChallenge();

  if (challenge.game !== game) {
    return false;
  }

  if (isDailyChallengeCompleted()) {
    return false;
  }

  localStorage.setItem(
    STORAGE_KEY,
    challenge.id
  );

  window.dispatchEvent(
    new Event(
      "mindplay-daily-challenge-updated"
    )
  );

  addXP(challenge.rewardXP);

  return true;
}

export function subscribeToDailyChallenge(
  callback: () => void
): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  window.addEventListener(
    "mindplay-daily-challenge-updated",
    callback
  );

  window.addEventListener(
    "storage",
    callback
  );

  return () => {
    window.removeEventListener(
      "mindplay-daily-challenge-updated",
      callback
    );

    window.removeEventListener(
      "storage",
      callback
    );
  };
}