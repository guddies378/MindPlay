import { addXP } from "@/lib/progress";

export type DailyGameId =
  | "memory-match"
  | "quick-math"
  | "word-scramble"
  | "riddle-me"
  | "tic-tac-toe"
  | "odd-one-out";

export type DailyChallenge = {
  date: string;
  gameId: DailyGameId;
  title: string;
  description: string;
  difficulty: "Easy" | "Normal" | "Hard";
  rewardXP: number;
  icon: string;
  href: string;
};

export type DailyChallengeState = {
  date: string;
  completed: boolean;
  claimed: boolean;
};

const STORAGE_KEY = "mindplay-daily-challenge";
const UPDATE_EVENT = "mindplay-daily-challenge-updated";

const CHALLENGES: Omit<DailyChallenge, "date">[] = [
  {
    gameId: "memory-match",
    title: "Memory Match",
    description: "Match every pair before your focus fades.",
    difficulty: "Hard",
    rewardXP: 50,
    icon: "🧠",
    href: "/games/memory-match",
  },
  {
    gameId: "quick-math",
    title: "Quick Math",
    description: "Solve as many problems as you can.",
    difficulty: "Hard",
    rewardXP: 50,
    icon: "⚡",
    href: "/games/quick-math",
  },
  {
    gameId: "word-scramble",
    title: "Word Scramble",
    description: "Unscramble words before the timer runs out.",
    difficulty: "Normal",
    rewardXP: 40,
    icon: "🔤",
    href: "/games/word-scramble",
  },
  {
    gameId: "riddle-me",
    title: "Riddle Me",
    description: "Solve a set of tricky brain teasers.",
    difficulty: "Hard",
    rewardXP: 50,
    icon: "🧩",
    href: "/games/riddle-me",
  },
  {
    gameId: "tic-tac-toe",
    title: "Tic-Tac-Toe",
    description: "Outsmart the AI in a strategic match.",
    difficulty: "Normal",
    rewardXP: 40,
    icon: "❌⭕",
    href: "/games/tic-tac-toe",
  },
  {
    gameId: "odd-one-out",
    title: "Odd One Out",
    description: "Find what does not belong.",
    difficulty: "Hard",
    rewardXP: 50,
    icon: "👀",
    href: "/games/odd-one-out",
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

export function getToday(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getChallengeIndex(date: string) {
  let hash = 0;

  for (const character of date) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash % CHALLENGES.length;
}

export function getDailyChallenge(date = getToday()): DailyChallenge {
  return {
    ...CHALLENGES[getChallengeIndex(date)],
    date,
  };
}

function getStoredState(): DailyChallengeState {
  const date = getToday();
  const defaultState = {
    date,
    completed: false,
    claimed: false,
  };

  if (!isBrowser()) {
    return defaultState;
  }

  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(saved) as Partial<DailyChallengeState>;

    if (parsed.date !== date) {
      return defaultState;
    }

    return {
      ...defaultState,
      ...parsed,
    };
  } catch {
    return defaultState;
  }
}

function saveState(state: DailyChallengeState) {
  if (!isBrowser()) {
    return state;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(UPDATE_EVENT));
  return state;
}

export function getDailyChallengeState(): DailyChallengeState {
  return getStoredState();
}

export function completeDailyChallenge(gameId: DailyGameId) {
  const challenge = getDailyChallenge();
  const state = getStoredState();

  if (state.completed || challenge.gameId !== gameId) {
    return state;
  }

  return saveState({
    ...state,
    completed: true,
  });
}

export function claimDailyChallenge(): DailyChallengeState {
  const challenge = getDailyChallenge();
  const state = getStoredState();

  if (!state.completed || state.claimed) {
    return state;
  }

  const updatedState = saveState({
    ...state,
    claimed: true,
  });

  addXP(challenge.rewardXP);
  return updatedState;
}

export function subscribeToDailyChallenge(callback: () => void) {
  if (!isBrowser()) {
    return () => {};
  }

  window.addEventListener(UPDATE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(UPDATE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
