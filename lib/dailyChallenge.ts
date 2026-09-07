import type { AchievementId } from "@/lib/achievements";
import { addXP } from "@/lib/progress";

export type DailyChallengeGame =
  | "memory-match"
  | "quick-math"
  | "word-scramble"
  | "riddle-me"
  | "odd-one-out"
  | "tic-tac-toe";

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
  "id" | "date"
>[] = [
  {
    game: "memory-match",
    title: "Memory Master",
    description: "Complete a Memory Match challenge.",
    icon: "🧠",
    difficulty: "normal",
    rewardXP: 50,
    achievementId: "memory-master",
  },
  {
    game: "quick-math",
    title: "Math Rush",
    description: "Complete a Quick Math challenge.",
    icon: "⚡",
    difficulty: "hard",
    rewardXP: 60,
    achievementId: "math-machine",
  },
  {
    game: "word-scramble",
    title: "Word Hunter",
    description: "Complete a Word Scramble challenge.",
    icon: "🔤",
    difficulty: "normal",
    rewardXP: 50,
    achievementId: "word-wizard",
  },
  {
    game: "riddle-me",
    title: "Riddle Master",
    description: "Solve a Riddle Me challenge.",
    icon: "🧩",
    difficulty: "hard",
    rewardXP: 60,
    achievementId: "riddle-solver",
  },
  {
    game: "odd-one-out",
    title: "Sharp Eyes",
    description: "Complete an Odd One Out challenge.",
    icon: "👀",
    difficulty: "hard",
    rewardXP: 55,
    achievementId: "sharp-eyes",
  },
  {
    game: "tic-tac-toe",
    title: "Think Ahead",
    description: "Complete a Tic-Tac-Toe challenge.",
    icon: "❌⭕",
    difficulty: "normal",
    rewardXP: 50,
    achievementId: "strategy-master",
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function getToday(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Creates a deterministic number from today's date.
 *
 * This means the challenge stays the same for the entire day,
 * even if the player refreshes the page.
 */
function getDailyIndex(date: string): number {
  let hash = 0;

  for (let i = 0; i < date.length; i++) {
    hash = (hash << 5) - hash + date.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash) % CHALLENGES.length;
}

export function getDailyChallenge(): DailyChallenge {
  const date = getToday();

  const challenge = CHALLENGES[getDailyIndex(date)];

  return {
    ...challenge,
    id: `${date}-${challenge.game}`,
    date,
  };
}

export function isDailyChallengeCompleted(): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    return (
      localStorage.getItem(STORAGE_KEY) ===
      getDailyChallenge().id
    );
  } catch {
    return false;
  }
}

export function completeDailyChallenge(
  game: DailyChallengeGame
): boolean {
  if (!isBrowser()) {
    return false;
  }

  const challenge = getDailyChallenge();

  if (
    challenge.game !== game ||
    isDailyChallengeCompleted()
  ) {
    return false;
  }

  localStorage.setItem(STORAGE_KEY, challenge.id);

  window.dispatchEvent(
    new Event("mindplay-daily-challenge-updated")
  );

  addXP(challenge.rewardXP);
  return true;
}

export function resetDailyChallenge(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);

  window.dispatchEvent(
    new Event("mindplay-daily-challenge-updated")
  );
}

export function subscribeToDailyChallenge(
  callback: () => void
): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  const handleUpdate = () => {
    callback();
  };

  window.addEventListener(
    "mindplay-daily-challenge-updated",
    handleUpdate
  );

  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener(
      "mindplay-daily-challenge-updated",
      handleUpdate
    );

    window.removeEventListener("storage", handleUpdate);
  };
}