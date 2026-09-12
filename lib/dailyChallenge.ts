import type { AchievementId } from "@/lib/achievements";
import { addXP } from "@/lib/progress";
import { DAILY_CHALLENGE_XP } from "@/lib/gameXP";
import { supabase } from "@/lib/supabase";

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

export const DAILY_CHALLENGE_UPDATED_EVENT =
  "mindplay-daily-challenge-updated";

/*
 * Cloud-first in-memory cache.
 *
 * Nothing is stored in localStorage or sessionStorage.
 */
let completedChallengeId: string | null = null;
let completedChallengeUserId: string | null = null;

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
    now.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    now.getDate(),
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
  date: string,
): DailyChallengeDifficulty {
  const difficulties: DailyChallengeDifficulty[] = [
    "easy",
    "normal",
    "hard",
  ];

  const difficultyIndex =
    hashString(
      `${date}-daily-difficulty-v2`,
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
  game: DailyChallengeGame,
): boolean {
  return (
    getDailyChallenge().game === game
  );
}

/*
 * Synchronous check against the in-memory
 * cache loaded from Supabase.
 */
export function isDailyChallengeCompleted(): boolean {
  if (!isBrowser()) {
    return false;
  }

  const challenge =
    getDailyChallenge();

  return (
    completedChallengeId ===
      challenge.id &&
    completedChallengeUserId !== null
  );
}

/*
 * Loads today's completion from Supabase.
 *
 * Call this after the user has authenticated.
 */
export async function loadDailyChallengeFromSupabase(): Promise<boolean> {
  if (!isBrowser()) {
    return false;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    completedChallengeId = null;
    completedChallengeUserId = null;

    window.dispatchEvent(
      new Event(
        DAILY_CHALLENGE_UPDATED_EVENT,
      ),
    );

    return false;
  }

  const challenge =
    getDailyChallenge();

  const { data, error } =
    await supabase
      .from("daily_challenges")
      .select("challenge_id")
      .eq("user_id", user.id)
      .eq(
        "challenge_date",
        challenge.date,
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Failed to load daily challenge:",
      error.message,
    );

    return false;
  }

  completedChallengeUserId =
    user.id;

  completedChallengeId =
    data?.challenge_id ?? null;

  window.dispatchEvent(
    new Event(
      DAILY_CHALLENGE_UPDATED_EVENT,
    ),
  );

  return (
    completedChallengeId ===
    challenge.id
  );
}

/*
 * Completes today's challenge.
 *
 * Supabase is the source of truth.
 *
 * The database unique constraint
 * (user_id, challenge_date) prevents
 * duplicate completion and duplicate XP.
 */
export async function completeDailyChallenge(
  game: DailyChallengeGame,
): Promise<boolean> {
  if (!isBrowser()) {
    return false;
  }

  const challenge =
    getDailyChallenge();

  /*
   * Make sure the game being completed
   * is today's selected daily challenge.
   */
  if (challenge.game !== game) {
    return false;
  }

  /*
   * Check the in-memory cache first.
   */
  if (isDailyChallengeCompleted()) {
    return false;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  /*
   * Get the user's MindPlay name from
   * the profiles table.
   */
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("mindplay_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Failed to load player profile:",
      profileError.message,
    );

    return false;
  }

  const mindPlayName =
    profile?.mindplay_name?.trim();

  if (!mindPlayName) {
    console.error(
      "Cannot complete daily challenge: MindPlay name is missing.",
    );

    return false;
  }

  /*
   * Save the completion to Supabase.
   *
   * The unique(user_id, challenge_date)
   * constraint prevents the same user
   * from completing the daily challenge
   * more than once on the same date.
   */
  const { error } =
    await supabase
      .from("daily_challenges")
      .insert({
        user_id: user.id,
        mindplay_name: mindPlayName,
        challenge_date:
          challenge.date,
        challenge_id:
          challenge.id,
      });

  /*
   * PostgreSQL error 23505 means the
   * unique constraint was triggered.
   *
   * This can happen if the user completed
   * today's challenge on another device
   * or another browser tab.
   */
  if (error) {
    if (error.code === "23505") {
      completedChallengeUserId =
        user.id;

      completedChallengeId =
        challenge.id;

      window.dispatchEvent(
        new Event(
          DAILY_CHALLENGE_UPDATED_EVENT,
        ),
      );

      return false;
    }

    console.error(
      "Failed to save daily challenge:",
      error.message,
    );

    return false;
  }

  /*
   * Update the in-memory cache after
   * Supabase confirms the completion.
   */
  completedChallengeUserId =
    user.id;

  completedChallengeId =
    challenge.id;

  window.dispatchEvent(
    new Event(
      DAILY_CHALLENGE_UPDATED_EVENT,
    ),
  );

  /*
   * Award the daily challenge XP only
   * after the database insert succeeds.
   */
  addXP(challenge.rewardXP);

  return true;
}

/*
 * Clears only the in-memory cache.
 *
 * The Supabase record is intentionally
 * NOT deleted.
 */
export function clearDailyChallengeCache(): void {
  completedChallengeId = null;
  completedChallengeUserId = null;

  if (isBrowser()) {
    window.dispatchEvent(
      new Event(
        DAILY_CHALLENGE_UPDATED_EVENT,
      ),
    );
  }
}

export function subscribeToDailyChallenge(
  callback: () => void,
): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  window.addEventListener(
    DAILY_CHALLENGE_UPDATED_EVENT,
    callback,
  );

  return () => {
    window.removeEventListener(
      DAILY_CHALLENGE_UPDATED_EVENT,
      callback,
    );
  };
}