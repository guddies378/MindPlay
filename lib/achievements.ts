import { supabase } from "@/lib/supabase";

/*
 * ==========================================
 * TYPES
 * ==========================================
 */

export type AchievementId =
  // Progress achievements
  | "first-game"
  | "five-games"
  | "ten-games"
  | "twenty-games"
  | "twenty-five-games"
  | "fifty-games"
  | "hundred-games"
  | "hundred-xp"
  | "two-hundred-fifty-xp"
  | "five-hundred-xp"
  | "thousand-xp"
  | "fifteen-hundred-xp"
  | "two-thousand-five-hundred-xp"
  | "five-thousand-xp"
  | "three-day-streak"
  | "seven-day-streak"
  | "fourteen-day-streak"
  | "thirty-day-streak"

  // Game achievements
  | "memory-master"
  | "math-machine"
  | "word-wizard"
  | "riddle-solver"
  | "sharp-eyes"
  | "strategy-master"
  | "lightning-reflexes"
  | "number-vault"
  | "color-focus"
  | "pattern-master"
  | "sequence-master"
  | "logic-rush";

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  requirement: string;
};

/*
 * ==========================================
 * ACHIEVEMENTS
 * ==========================================
 */

export const ACHIEVEMENTS: Achievement[] = [
  // ==========================================
  // PROGRESS ACHIEVEMENTS
  // ==========================================

  {
    id: "first-game",
    title: "First Step",
    description: "Play your first MindPlay game.",
    icon: "🎮",
    requirement: "1 game",
  },

  {
    id: "five-games",
    title: "Getting Started",
    description: "Play 5 games.",
    icon: "⭐",
    requirement: "5 games",
  },

  {
    id: "ten-games",
    title: "Regular Player",
    description: "Play 10 games.",
    icon: "🏅",
    requirement: "10 games",
  },

  {
    id: "twenty-games",
    title: "Committed",
    description: "Play 20 games.",
    icon: "🎯",
    requirement: "20 games",
  },

  {
    id: "twenty-five-games",
    title: "Dedicated",
    description: "Play 25 games.",
    icon: "💪",
    requirement: "25 games",
  },

  {
    id: "fifty-games",
    title: "Game Machine",
    description: "Play 50 games.",
    icon: "🤖",
    requirement: "50 games",
  },

  {
    id: "hundred-games",
    title: "Arcade Legend",
    description: "Play 100 games.",
    icon: "👑",
    requirement: "100 games",
  },

  {
    id: "hundred-xp",
    title: "XP Hunter",
    description: "Earn 100 XP.",
    icon: "✨",
    requirement: "100 XP",
  },

  {
    id: "two-hundred-fifty-xp",
    title: "XP Collector",
    description: "Earn 250 XP.",
    icon: "💫",
    requirement: "250 XP",
  },

  {
    id: "five-hundred-xp",
    title: "XP Master",
    description: "Earn 500 XP.",
    icon: "💎",
    requirement: "500 XP",
  },

  {
    id: "thousand-xp",
    title: "XP Veteran",
    description: "Earn 1,000 XP.",
    icon: "🔥",
    requirement: "1,000 XP",
  },

  {
    id: "fifteen-hundred-xp",
    title: "XP Elite",
    description: "Earn 1,500 XP.",
    icon: "⚡",
    requirement: "1,500 XP",
  },

  {
    id: "two-thousand-five-hundred-xp",
    title: "XP Mastermind",
    description: "Earn 2,500 XP.",
    icon: "🔮",
    requirement: "2,500 XP",
  },

  {
    id: "five-thousand-xp",
    title: "XP Legend",
    description: "Earn 5,000 XP.",
    icon: "🏆",
    requirement: "5,000 XP",
  },

  {
    id: "three-day-streak",
    title: "On Fire",
    description: "Build a 3-day playing streak.",
    icon: "🔥",
    requirement: "3-day streak",
  },

  {
    id: "seven-day-streak",
    title: "Unstoppable",
    description: "Build a 7-day playing streak.",
    icon: "🚀",
    requirement: "7-day streak",
  },

  {
    id: "fourteen-day-streak",
    title: "No Days Off",
    description: "Build a 14-day playing streak.",
    icon: "⚡",
    requirement: "14-day streak",
  },

  {
    id: "thirty-day-streak",
    title: "MindPlay Legend",
    description: "Build a 30-day playing streak.",
    icon: "👑",
    requirement: "30-day streak",
  },

  // ==========================================
  // GAME ACHIEVEMENTS
  // ==========================================

  {
    id: "memory-master",
    title: "Memory Master",
    description: "Complete a Memory Match challenge.",
    icon: "🧠",
    requirement: "Memory Match",
  },

  {
    id: "math-machine",
    title: "Math Machine",
    description: "Complete a Quick Math challenge.",
    icon: "⚡",
    requirement: "Quick Math",
  },

  {
    id: "word-wizard",
    title: "Word Wizard",
    description: "Complete a Word Scramble challenge.",
    icon: "🔤",
    requirement: "Word Scramble",
  },

  {
    id: "riddle-solver",
    title: "Riddle Solver",
    description: "Complete a Riddle Me challenge.",
    icon: "🧩",
    requirement: "Riddle Me",
  },

  {
    id: "sharp-eyes",
    title: "Sharp Eyes",
    description: "Complete an Odd One Out challenge.",
    icon: "👀",
    requirement: "Odd One Out",
  },

  {
    id: "strategy-master",
    title: "Strategy Master",
    description: "Complete a Tic-Tac-Toe challenge.",
    icon: "❌⭕",
    requirement: "Tic-Tac-Toe",
  },

  {
    id: "lightning-reflexes",
    title: "Lightning Reflexes",
    description: "Complete a Reaction Rush challenge.",
    icon: "⚡",
    requirement: "Reaction Rush",
  },

  {
    id: "number-vault",
    title: "Number Vault",
    description: "Complete a Number Memory challenge.",
    icon: "🔢",
    requirement: "Number Memory",
  },

  {
    id: "color-focus",
    title: "Color Focus",
    description: "Complete a Color Clash challenge.",
    icon: "🎨",
    requirement: "Color Clash",
  },

  {
    id: "pattern-master",
    title: "Pattern Master",
    description: "Complete a Pattern Recall challenge.",
    icon: "🟦",
    requirement: "Pattern Recall",
  },

  {
    id: "sequence-master",
    title: "Sequence Master",
    description: "Complete a Sequence Master challenge.",
    icon: "🔁",
    requirement: "Sequence Master",
  },

  {
    id: "logic-rush",
    title: "Logic Rush",
    description: "Complete a Logic Rush challenge.",
    icon: "🧠",
    requirement: "Logic Rush",
  },
];

/*
 * ==========================================
 * USER-SPECIFIC CLOUD STATE
 * ==========================================
 *
 * Supabase stores ONE row per user:
 *
 * id
 * user_id
 * mindplay_name
 * achievement_progress
 *
 * Example:
 *
 * achievement_progress = "8/30"
 *
 * The individual achievement IDs are kept
 * only in memory while the user is logged in.
 *
 * There is NO localStorage.
 */

let activeUserId: string | null = null;

let activeMindPlayName = "";

let unlockedAchievementIds =
  new Set<AchievementId>();

/*
 * ==========================================
 * USER
 * ==========================================
 */

export function setAchievementUser(
  userId: string | null,
) {
  if (
    activeUserId !== userId
  ) {
    unlockedAchievementIds =
      new Set();

    activeMindPlayName = "";
  }

  activeUserId = userId;

  notifyAchievementUpdate();
}

function getActiveUserId(): string | null {
  return activeUserId;
}

/*
 * ==========================================
 * HELPERS
 * ==========================================
 */

function isBrowser() {
  return (
    typeof window !==
    "undefined"
  );
}

function notifyAchievementUpdate() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(
    new Event(
      "mindplay-achievement-updated",
    ),
  );
}

/*
 * ==========================================
 * LOAD ACHIEVEMENTS
 * ==========================================
 *
 * Since Supabase only stores "8/30",
 * we cannot reconstruct exactly WHICH
 * achievements were unlocked from that
 * value alone.
 *
 * Therefore the actual achievement IDs
 * are calculated again from the user's
 * current progress and game achievements.
 *
 * Progress achievements are restored from
 * XP, games played and streak.
 *
 * Game achievements are restored from
 * the achievement progress count only
 * when the current session unlocks them.
 */

export async function loadAchievementsFromSupabase(): Promise<
  AchievementId[]
> {
  if (!isBrowser()) {
    return [];
  }

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    setAchievementUser(
      null,
    );

    return [];
  }

  activeUserId =
    user.id;

  const {
    data,
    error,
  } =
    await supabase
      .from("achievements")
      .select(
        "mindplay_name, achievement_progress",
      )
      .eq(
        "user_id",
        user.id,
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Failed to load achievements from Supabase:",
      error.message,
    );

    return [];
  }

  if (!data) {
    activeMindPlayName =
      "";

    unlockedAchievementIds =
      new Set();

    notifyAchievementUpdate();

    return [];
  }

  activeMindPlayName =
    data.mindplay_name ?? "";

  /*
   * The database stores only the count.
   *
   * Example:
   * "8/30"
   */
  const storedProgress =
    parseAchievementProgress(
      data.achievement_progress,
    );

  /*
   * We don't populate achievement IDs
   * from the count because "8/30" alone
   * does not tell us which 8 achievements
   * were unlocked.
   *
   * Progress achievements will be synced
   * from overall_progress immediately after
   * this function.
   */
  unlockedAchievementIds =
    new Set();

  /*
   * Prevent an unused-variable issue while
   * keeping the stored value validated.
   */
  void storedProgress;

  notifyAchievementUpdate();

  return [];
}

/*
 * ==========================================
 * PARSE PROGRESS
 * ==========================================
 */

function parseAchievementProgress(
  value: string | null | undefined,
): {
  unlocked: number;
  total: number;
} {
  if (!value) {
    return {
      unlocked: 0,
      total:
        ACHIEVEMENTS.length,
    };
  }

  const match =
    value.match(
      /^(\d+)\s*\/\s*(\d+)$/,
    );

  if (!match) {
    return {
      unlocked: 0,
      total:
        ACHIEVEMENTS.length,
    };
  }

  const unlocked =
    Number(match[1]);

  const total =
    Number(match[2]);

  return {
    unlocked: Number.isFinite(
      unlocked,
    )
      ? Math.max(
          0,
          Math.min(
            unlocked,
            ACHIEVEMENTS.length,
          ),
        )
      : 0,

    total: Number.isFinite(
      total,
    )
      ? total
      : ACHIEVEMENTS.length,
  };
}

/*
 * ==========================================
 * READ ACHIEVEMENTS
 * ==========================================
 */

export function getUnlockedAchievements(): AchievementId[] {
  return Array.from(
    unlockedAchievementIds,
  );
}

/*
 * ==========================================
 * SAVE ACHIEVEMENT PROGRESS
 * ==========================================
 *
 * Updates ONE row for the current user.
 */

async function saveAchievementProgressToSupabase(
  userId: string,
  achievementCount: number,
) {
  if (!isBrowser()) {
    return;
  }

  /*
   * Get the latest MindPlay name from
   * the profiles table.
   */
  const {
    data: profile,
    error: profileError,
  } =
    await supabase
      .from("profiles")
      .select(
        "mindplay_name",
      )
      .eq(
        "id",
        userId,
      )
      .maybeSingle();

  if (profileError) {
    console.error(
      "Failed to load MindPlay name:",
      profileError.message,
    );

    return;
  }

  const mindPlayName =
    profile?.mindplay_name ??
    activeMindPlayName;

  activeMindPlayName =
    mindPlayName;

  /*
   * One row per user.
   */
  const {
    error,
  } =
    await supabase
      .from("achievements")
      .upsert(
        {
          user_id:
            userId,

          mindplay_name:
            mindPlayName,

          achievement_progress:
            `${achievementCount}/${ACHIEVEMENTS.length}`,
        },
        {
          onConflict:
            "user_id",
        },
      );

  if (error) {
    console.error(
      "Failed to save achievement progress to Supabase:",
      error.message,
    );
  }
}

/*
 * ==========================================
 * UNLOCK ACHIEVEMENT
 * ==========================================
 */

export function unlockAchievement(
  id: AchievementId,
): Achievement | null {
  const userId =
    getActiveUserId();

  if (!userId) {
    return null;
  }

  if (
    unlockedAchievementIds.has(
      id,
    )
  ) {
    return null;
  }

  const achievement =
    ACHIEVEMENTS.find(
      (item) =>
        item.id === id,
    );

  if (!achievement) {
    return null;
  }

  /*
   * Update the in-memory state.
   */
  unlockedAchievementIds.add(
    id,
  );

  /*
   * Save the new count to Supabase.
   *
   * Example:
   * 7 achievements
   * becomes
   * "8/30"
   */
  void saveAchievementProgressToSupabase(
    userId,
    unlockedAchievementIds.size,
  );

  notifyAchievementUpdate();

  return achievement;
}

/*
 * ==========================================
 * CHECK ACHIEVEMENT
 * ==========================================
 */

export function isAchievementUnlocked(
  id: AchievementId,
): boolean {
  return unlockedAchievementIds.has(
    id,
  );
}

/*
 * ==========================================
 * GET ACHIEVEMENT
 * ==========================================
 */

export function getAchievement(
  id: AchievementId,
): Achievement | undefined {
  return ACHIEVEMENTS.find(
    (achievement) =>
      achievement.id === id,
  );
}

/*
 * ==========================================
 * PROGRESSION ACHIEVEMENTS
 * ==========================================
 */

export function getAchievementProgress(
  xp: number,
  gamesPlayed: number,
  streak: number,
): AchievementId[] {
  const unlocked: AchievementId[] =
    [];

  // Games played
  if (gamesPlayed >= 1) {
    unlocked.push(
      "first-game",
    );
  }

  if (gamesPlayed >= 5) {
    unlocked.push(
      "five-games",
    );
  }

  if (gamesPlayed >= 10) {
    unlocked.push(
      "ten-games",
    );
  }

  if (gamesPlayed >= 20) {
    unlocked.push(
      "twenty-games",
    );
  }

  if (gamesPlayed >= 25) {
    unlocked.push(
      "twenty-five-games",
    );
  }

  if (gamesPlayed >= 50) {
    unlocked.push(
      "fifty-games",
    );
  }

  if (gamesPlayed >= 100) {
    unlocked.push(
      "hundred-games",
    );
  }

  // XP
  if (xp >= 100) {
    unlocked.push(
      "hundred-xp",
    );
  }

  if (xp >= 250) {
    unlocked.push(
      "two-hundred-fifty-xp",
    );
  }

  if (xp >= 500) {
    unlocked.push(
      "five-hundred-xp",
    );
  }

  if (xp >= 1000) {
    unlocked.push(
      "thousand-xp",
    );
  }

  if (xp >= 1500) {
    unlocked.push(
      "fifteen-hundred-xp",
    );
  }

  if (xp >= 2500) {
    unlocked.push(
      "two-thousand-five-hundred-xp",
    );
  }

  if (xp >= 5000) {
    unlocked.push(
      "five-thousand-xp",
    );
  }

  // Streak
  if (streak >= 3) {
    unlocked.push(
      "three-day-streak",
    );
  }

  if (streak >= 7) {
    unlocked.push(
      "seven-day-streak",
    );
  }

  if (streak >= 14) {
    unlocked.push(
      "fourteen-day-streak",
    );
  }

  if (streak >= 30) {
    unlocked.push(
      "thirty-day-streak",
    );
  }

  return unlocked;
}

/*
 * ==========================================
 * SYNC PROGRESSION ACHIEVEMENTS
 * ==========================================
 */

export function syncProgressAchievements(
  xp: number,
  gamesPlayed: number,
  streak: number,
): Achievement[] {
  if (!getActiveUserId()) {
    return [];
  }

  const progressAchievements =
    getAchievementProgress(
      xp,
      gamesPlayed,
      streak,
    );

  const newlyUnlocked: Achievement[] =
    [];

  for (const id of progressAchievements) {
    const achievement =
      unlockAchievement(id);

    if (achievement) {
      newlyUnlocked.push(
        achievement,
      );
    }
  }

  return newlyUnlocked;
}

/*
 * ==========================================
 * GAME-SPECIFIC ACHIEVEMENT
 * ==========================================
 */

export function unlockGameAchievement(
  id: AchievementId,
): Achievement | null {
  return unlockAchievement(
    id,
  );
}

/*
 * ==========================================
 * RESET ACHIEVEMENTS
 * ==========================================
 */

export async function resetAchievements() {
  const userId =
    getActiveUserId();

  if (!userId) {
    return;
  }

  const {
    error,
  } =
    await supabase
      .from("achievements")
      .delete()
      .eq(
        "user_id",
        userId,
      );

  if (error) {
    console.error(
      "Failed to reset achievements in Supabase:",
      error.message,
    );

    return;
  }

  unlockedAchievementIds =
    new Set();

  activeMindPlayName =
    "";

  notifyAchievementUpdate();
}