export type AchievementId =
  | "first-game"
  | "five-games"
  | "ten-games"
  | "hundred-xp"
  | "five-hundred-xp"
  | "three-day-streak"
  | "seven-day-streak"
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

export const ACHIEVEMENTS: Achievement[] = [
  // Progress achievements
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
    id: "hundred-xp",
    title: "XP Hunter",
    description: "Earn 100 XP.",
    icon: "✨",
    requirement: "100 XP",
  },
  {
    id: "five-hundred-xp",
    title: "XP Master",
    description: "Earn 500 XP.",
    icon: "💎",
    requirement: "500 XP",
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

  // Game achievements
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

const STORAGE_KEY = "mindplay-achievements";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getUnlockedAchievements(): AchievementId[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as AchievementId[];
  } catch {
    return [];
  }
}

function saveUnlockedAchievements(
  achievements: AchievementId[]
) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(achievements)
  );
}

function notifyAchievementUpdate() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(
    new Event("mindplay-achievement-updated")
  );
}

export function unlockAchievement(
  id: AchievementId
): Achievement | null {
  const unlocked = getUnlockedAchievements();

  if (unlocked.includes(id)) {
    return null;
  }

  const achievement = ACHIEVEMENTS.find(
    (item) => item.id === id
  );

  if (!achievement) {
    return null;
  }

  const updated = [...unlocked, id];

  saveUnlockedAchievements(updated);

  return achievement;
}

export function isAchievementUnlocked(
  id: AchievementId
): boolean {
  return getUnlockedAchievements().includes(id);
}

export function getAchievement(
  id: AchievementId
): Achievement | undefined {
  return ACHIEVEMENTS.find(
    (achievement) => achievement.id === id
  );
}

export function getAchievementProgress(
  xp: number,
  gamesPlayed: number,
  streak: number
): AchievementId[] {
  const unlocked: AchievementId[] = [];

  if (gamesPlayed >= 1) {
    unlocked.push("first-game");
  }

  if (gamesPlayed >= 5) {
    unlocked.push("five-games");
  }

  if (gamesPlayed >= 10) {
    unlocked.push("ten-games");
  }

  if (xp >= 100) {
    unlocked.push("hundred-xp");
  }

  if (xp >= 500) {
    unlocked.push("five-hundred-xp");
  }

  if (streak >= 3) {
    unlocked.push("three-day-streak");
  }

  if (streak >= 7) {
    unlocked.push("seven-day-streak");
  }

  return unlocked;
}

export function syncProgressAchievements(
  xp: number,
  gamesPlayed: number,
  streak: number
): Achievement[] {
  const progressAchievements =
    getAchievementProgress(
      xp,
      gamesPlayed,
      streak
    );

  const newlyUnlocked: Achievement[] = [];

  for (const id of progressAchievements) {
    const achievement =
      unlockAchievement(id);

    if (achievement) {
      newlyUnlocked.push(achievement);
    }
  }

  if (newlyUnlocked.length > 0) {
    notifyAchievementUpdate();
  }

  return newlyUnlocked;
}

export function unlockGameAchievement(
  id: AchievementId
): Achievement | null {
  const achievement = unlockAchievement(id);

  if (achievement) {
    notifyAchievementUpdate();
  }

  return achievement;
}

export function resetAchievements() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  notifyAchievementUpdate();
}