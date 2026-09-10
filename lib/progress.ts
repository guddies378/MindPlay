import {
  setAchievementUser,
  syncProgressAchievements,
  unlockGameAchievement,
} from "./achievements";

import { supabase } from "@/lib/supabase";

export { unlockGameAchievement };

export type MindPlayProgress = {
  xp: number;
  gamesPlayed: number;
  streak: number;
  lastPlayed: string | null;
  bestScore: number;
};

const STORAGE_KEY = "mindplay-progress";

const DEFAULT_PROGRESS: MindPlayProgress = {
  xp: 0,
  gamesPlayed: 0,
  streak: 0,
  lastPlayed: null,
  bestScore: 0,
};

const UPDATE_EVENT =
  "mindplay-progress-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function notifyUpdate() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(
    new Event(UPDATE_EVENT),
  );
}

/*
 * ==========================================
 * LOCAL PROGRESS
 * ==========================================
 */

export function getProgress(): MindPlayProgress {
  if (!isBrowser()) {
    return DEFAULT_PROGRESS;
  }

  try {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_PROGRESS;
    }

    const parsed = JSON.parse(saved);

    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function saveProgress(
  progress: MindPlayProgress,
) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(progress),
  );

  notifyUpdate();
}

/*
 * ==========================================
 * DATE HELPERS
 * ==========================================
 */

function getToday(): string {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

function getYesterday(): string {
  const date = new Date();

  date.setDate(
    date.getDate() - 1,
  );

  return date
    .toISOString()
    .slice(0, 10);
}

/*
 * ==========================================
 * SAVE PROGRESS TO SUPABASE
 * ==========================================
 *
 * Overall progress belongs to the
 * currently logged-in Supabase user.
 */

async function saveProgressToSupabase(
  progress: MindPlayProgress,
) {
  if (!isBrowser()) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * No authenticated user.
   *
   * Clear the active achievement user so
   * achievements cannot accidentally be
   * saved for another account.
   */
  if (!user) {
    setAchievementUser(null);
    return;
  }

  /*
   * Tell the achievement system which
   * Supabase account is currently active.
   */
  setAchievementUser(user.id);

  const { error } =
    await supabase
      .from("overall_progress")
      .upsert(
        {
          user_id: user.id,
          xp: progress.xp,
          games_played:
            progress.gamesPlayed,
          streak: progress.streak,
          best_score:
            progress.bestScore,
          last_played:
            progress.lastPlayed,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      );

  if (error) {
    console.error(
      "Failed to save progress to Supabase:",
      error.message,
    );
  }
}

/*
 * ==========================================
 * LOAD PROGRESS FROM SUPABASE
 * ==========================================
 */

export async function loadProgressFromSupabase(): Promise<
  MindPlayProgress | null
> {
  if (!isBrowser()) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * No logged-in user means there is
   * no account-specific progress to load.
   */
  if (!user) {
    setAchievementUser(null);
    return null;
  }

  /*
   * Set the active achievement account
   * as soon as we know the Supabase user.
   */
  setAchievementUser(user.id);

  const { data, error } =
    await supabase
      .from("overall_progress")
      .select(
        "xp, games_played, streak, best_score, last_played",
      )
      .eq("user_id", user.id)
      .maybeSingle();

  if (error) {
    console.error(
      "Failed to load progress from Supabase:",
      error.message,
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return {
    xp: data.xp,
    gamesPlayed:
      data.games_played,
    streak: data.streak,
    bestScore:
      data.best_score,
    lastPlayed:
      data.last_played,
  };
}

/*
 * ==========================================
 * SYNC LOCAL PROGRESS WITH SUPABASE
 * ==========================================
 *
 * If cloud progress exists:
 *     cloud progress becomes the source
 *     of truth.
 *
 * If no cloud progress exists:
 *     existing local progress is uploaded
 *     to the newly logged-in account.
 */

export async function syncLocalProgressToSupabase(): Promise<void> {
  if (!isBrowser()) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * No logged-in user.
   *
   * Make sure the achievement system does
   * not continue using the previous account.
   */
  if (!user) {
    setAchievementUser(null);
    return;
  }

  /*
   * IMPORTANT:
   *
   * Set the active achievement user BEFORE
   * reading or synchronizing achievements.
   */
  setAchievementUser(user.id);

  const {
    data: cloudProgress,
    error,
  } = await supabase
    .from("overall_progress")
    .select(
      "xp, games_played, streak, best_score, last_played",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to check cloud progress:",
      error.message,
    );

    return;
  }

  /*
   * ========================================
   * EXISTING ACCOUNT
   * ========================================
   */

  if (cloudProgress) {
    const progress: MindPlayProgress =
      {
        xp: cloudProgress.xp,
        gamesPlayed:
          cloudProgress.games_played,
        streak:
          cloudProgress.streak,
        bestScore:
          cloudProgress.best_score,
        lastPlayed:
          cloudProgress.last_played,
      };

    saveProgress(progress);

    /*
     * Re-check progression achievements
     * using THIS user's progress.
     */
    syncProgressAchievements(
      progress.xp,
      progress.gamesPlayed,
      progress.streak,
    );

    return;
  }

  /*
   * ========================================
   * NEW ACCOUNT
   * ========================================
   *
   * There is no cloud progress yet.
   *
   * We currently preserve your existing
   * behavior and upload the local progress.
   *
   * IMPORTANT:
   * Achievements are now account-specific,
   * so the new account will NOT read the
   * previous account's achievement list.
   */

  const localProgress =
    getProgress();

  await saveProgressToSupabase(
    localProgress,
  );

  syncProgressAchievements(
    localProgress.xp,
    localProgress.gamesPlayed,
    localProgress.streak,
  );
}

/*
 * ==========================================
 * RECORD GAME
 * ==========================================
 */

export function recordGame(
  score = 0,
  xpEarned = 10,
): MindPlayProgress {
  const currentProgress =
    getProgress();

  const today = getToday();

  const yesterday =
    getYesterday();

  let streak =
    currentProgress.streak;

  if (
    currentProgress.lastPlayed ===
    today
  ) {
    streak =
      currentProgress.streak;
  } else if (
    currentProgress.lastPlayed ===
    yesterday
  ) {
    streak =
      currentProgress.streak + 1;
  } else {
    streak = 1;
  }

  const updatedProgress: MindPlayProgress =
    {
      xp:
        currentProgress.xp +
        xpEarned,

      gamesPlayed:
        currentProgress.gamesPlayed +
        1,

      streak,

      lastPlayed: today,

      bestScore: Math.max(
        currentProgress.bestScore,
        score,
      ),
    };

  /*
   * Save locally for immediate UI updates.
   */
  saveProgress(
    updatedProgress,
  );

  /*
   * Unlock progression achievements
   * for the currently active account.
   */
  syncProgressAchievements(
    updatedProgress.xp,
    updatedProgress.gamesPlayed,
    updatedProgress.streak,
  );

  /*
   * Save account progress to Supabase.
   */
  void saveProgressToSupabase(
    updatedProgress,
  );

  return updatedProgress;
}

/*
 * ==========================================
 * ADD XP
 * ==========================================
 */

export function addXP(
  amount: number,
): MindPlayProgress {
  const currentProgress =
    getProgress();

  const updatedProgress: MindPlayProgress =
    {
      ...currentProgress,

      xp:
        currentProgress.xp +
        amount,
    };

  saveProgress(
    updatedProgress,
  );

  /*
   * XP achievements are checked
   * for the active account.
   */
  syncProgressAchievements(
    updatedProgress.xp,
    updatedProgress.gamesPlayed,
    updatedProgress.streak,
  );

  void saveProgressToSupabase(
    updatedProgress,
  );

  return updatedProgress;
}

/*
 * ==========================================
 * RESET PROGRESS
 * ==========================================
 */

export function resetProgress(): MindPlayProgress {
  saveProgress(
    DEFAULT_PROGRESS,
  );

  void saveProgressToSupabase(
    DEFAULT_PROGRESS,
  );

  return DEFAULT_PROGRESS;
}

/*
 * ==========================================
 * SUBSCRIBE TO PROGRESS UPDATES
 * ==========================================
 */

export function subscribeToProgress(
  callback: () => void,
): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  const handleUpdate = () => {
    callback();
  };

  window.addEventListener(
    UPDATE_EVENT,
    handleUpdate,
  );

  window.addEventListener(
    "storage",
    handleUpdate,
  );

  return () => {
    window.removeEventListener(
      UPDATE_EVENT,
      handleUpdate,
    );

    window.removeEventListener(
      "storage",
      handleUpdate,
    );
  };
}