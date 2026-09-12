import {
  loadAchievementsFromSupabase,
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

const DEFAULT_PROGRESS: MindPlayProgress = {
  xp: 0,
  gamesPlayed: 0,
  streak: 0,
  lastPlayed: null,
  bestScore: 0,
};

const UPDATE_EVENT = "mindplay-progress-updated";

/*
 * ==========================================
 * IN-MEMORY PROGRESS
 * ==========================================
 *
 * Supabase is the permanent source of truth.
 *
 * This variable only keeps the currently
 * loaded progress in memory so existing
 * components can continue using getProgress()
 * synchronously.
 *
 * Nothing is stored in localStorage.
 */

let cachedProgress: MindPlayProgress = {
  ...DEFAULT_PROGRESS,
};

let progressLoaded = false;

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
 * GET PROGRESS
 * ==========================================
 *
 * Returns the currently loaded in-memory
 * progress.
 *
 * Persistent progress comes from Supabase
 * through loadProgressFromSupabase().
 */

export function getProgress(): MindPlayProgress {
  return {
    ...cachedProgress,
  };
}

/*
 * ==========================================
 * SET IN-MEMORY PROGRESS
 * ==========================================
 */

function setProgress(
  progress: MindPlayProgress,
) {
  cachedProgress = {
    ...progress,
  };

  progressLoaded = true;

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

    return;
  }
}

/*
 * ==========================================
 * LOAD PROGRESS FROM SUPABASE
 * ==========================================
 *
 * This is now the ONLY place where
 * persistent progress is loaded.
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
   * No logged-in user.
   */

  if (!user) {
    setAchievementUser(null);

    cachedProgress = {
      ...DEFAULT_PROGRESS,
    };

    progressLoaded = false;

    notifyUpdate();

    return null;
  }

  /*
   * Set active achievement account.
   */

  setAchievementUser(user.id);

  await loadAchievementsFromSupabase();

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

  /*
   * This account has no progress row yet.
   *
   * Start with a clean account instead
   * of reading another source such as
   * localStorage.
   */

  if (!data) {
    const freshProgress: MindPlayProgress = {
      ...DEFAULT_PROGRESS,
    };

    setProgress(freshProgress);

    return freshProgress;
  }

  const progress: MindPlayProgress = {
    xp: data.xp,
    gamesPlayed:
      data.games_played,
    streak: data.streak,
    bestScore:
      data.best_score,
    lastPlayed:
      data.last_played,
  };

  setProgress(progress);

  /*
   * Re-check progression achievements
   * using the current account's progress.
   */

  syncProgressAchievements(
    progress.xp,
    progress.gamesPlayed,
    progress.streak,
  );

  return progress;
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
   * Update memory immediately so the
   * UI responds without waiting for
   * the network.
   */

  setProgress(
    updatedProgress,
  );

  /*
   * Unlock progression achievements
   * for the currently authenticated
   * account.
   */

  syncProgressAchievements(
    updatedProgress.xp,
    updatedProgress.gamesPlayed,
    updatedProgress.streak,
  );

  /*
   * Persist the new progress in Supabase.
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

  /*
   * Update memory immediately.
   */

  setProgress(
    updatedProgress,
  );

  /*
   * Check XP achievements.
   */

  syncProgressAchievements(
    updatedProgress.xp,
    updatedProgress.gamesPlayed,
    updatedProgress.streak,
  );

  /*
   * Persist in Supabase.
   */

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
  const reset: MindPlayProgress = {
    ...DEFAULT_PROGRESS,
  };

  /*
   * Reset in-memory state.
   */

  setProgress(reset);

  /*
   * Persist reset in Supabase.
   */

  void saveProgressToSupabase(reset);

  return reset;
}

/*
 * ==========================================
 * PROGRESS LOADED
 * ==========================================
 *
 * Useful for components that want to know
 * whether the initial Supabase progress
 * has been loaded.
 */

export function isProgressLoaded(): boolean {
  return progressLoaded;
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

  return () => {
    window.removeEventListener(
      UPDATE_EVENT,
      handleUpdate,
    );
  };
}