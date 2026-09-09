import {
  syncProgressAchievements,
  unlockGameAchievement,
} from "./achievements";

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

const UPDATE_EVENT = "mindplay-progress-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function notifyUpdate() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function getProgress(): MindPlayProgress {
  if (!isBrowser()) {
    return DEFAULT_PROGRESS;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

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

function saveProgress(progress: MindPlayProgress) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(progress)
  );

  notifyUpdate();
}

function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getYesterday(): string {
  const yesterday = new Date();

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const year = yesterday.getFullYear();
  const month = String(
    yesterday.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    yesterday.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function recordGame(
  score = 0,
  xpEarned = 10
): MindPlayProgress {
  const progress = getProgress();
  const today = getToday();
  const yesterday = getYesterday();

  let streak = progress.streak;

  if (progress.lastPlayed === today) {
    streak = Math.max(
      streak,
      1
    );
  } else if (
    progress.lastPlayed === yesterday
  ) {
    streak += 1;
  } else {
    streak = 1;
  }

  const updatedProgress: MindPlayProgress = {
    xp:
      progress.xp +
      Math.max(0, xpEarned),

    gamesPlayed:
      progress.gamesPlayed + 1,

    streak,

    lastPlayed: today,

    bestScore: Math.max(
      progress.bestScore,
      score
    ),
  };

  saveProgress(updatedProgress);

  syncProgressAchievements(
    updatedProgress.xp,
    updatedProgress.gamesPlayed,
    updatedProgress.streak
  );

  return updatedProgress;
}

export function addXP(
  amount: number
): MindPlayProgress {
  const progress = getProgress();

  const updatedProgress: MindPlayProgress = {
    ...progress,
    xp:
      progress.xp +
      Math.max(0, amount),
  };

  saveProgress(updatedProgress);

  // Keep XP-based achievements in sync
  // even when XP comes from a Daily Challenge.
  syncProgressAchievements(
    updatedProgress.xp,
    updatedProgress.gamesPlayed,
    updatedProgress.streak
  );

  return updatedProgress;
}

export function resetProgress(): MindPlayProgress {
  saveProgress(DEFAULT_PROGRESS);

  return DEFAULT_PROGRESS;
}

export function subscribeToProgress(
  callback: () => void
): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  window.addEventListener(
    UPDATE_EVENT,
    callback
  );

  window.addEventListener(
    "storage",
    callback
  );

  return () => {
    window.removeEventListener(
      UPDATE_EVENT,
      callback
    );

    window.removeEventListener(
      "storage",
      callback
    );
  };
}