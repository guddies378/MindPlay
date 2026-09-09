"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  completeDailyChallenge,
  DAILY_CHALLENGE_BONUS_POINTS,
  getDailyChallenge,
} from "@/lib/dailyChallenge";

import { recordGame } from "@/lib/progress";
import { unlockGameAchievement } from "@/lib/achievements";

import PlayerFooterText from "@/components/PlayerFooterText";
import PlayerBrand from "@/components/PlayerBrand";

type Difficulty = "easy" | "normal" | "hard";

type Round = {
  items: string[];
  oddIndex: number;
};

const DIFFICULTIES = {
  easy: {
    label: "Easy",
    items: 4,
    time: 30,
    xp: 20,
    icon: "🌱",
  },
  normal: {
    label: "Normal",
    items: 6,
    time: 45,
    xp: 30,
    icon: "⚡",
  },
  hard: {
    label: "Hard",
    items: 9,
    time: 60,
    xp: 40,
    icon: "🔥",
  },
};

const ROUND_SETS: Record<
  Difficulty,
  Array<{
    common: string;
    odd: string;
  }>
> = {
  easy: [
    { common: "🍎", odd: "🍊" },
    { common: "🐶", odd: "🐱" },
    { common: "🚗", odd: "✈️" },
    { common: "⭐", odd: "🌙" },
    { common: "🍕", odd: "🍔" },
    { common: "⚽", odd: "🏀" },
    { common: "🌸", odd: "🌻" },
    { common: "🐟", odd: "🦋" },
  ],

  normal: [
    { common: "😀", odd: "😎" },
    { common: "🍓", odd: "🍋" },
    { common: "🚲", odd: "🛵" },
    { common: "🐼", odd: "🐨" },
    { common: "🌧️", odd: "☀️" },
    { common: "🎸", odd: "🎹" },
    { common: "🥕", odd: "🍌" },
    { common: "🏠", odd: "🏰" },
  ],

  hard: [
    { common: "🔵", odd: "🟣" },
    { common: "⬛", odd: "🔲" },
    { common: "🔺", odd: "🔻" },
    { common: "◼️", odd: "◾" },
    { common: "⭐", odd: "🌟" },
    { common: "❤️", odd: "🩷" },
    { common: "🐶", odd: "🐕" },
    { common: "🍎", odd: "🍏" },
    { common: "🌙", odd: "🌚" },
  ],
};

function createRound(
  difficulty: Difficulty
): Round {
  const config = DIFFICULTIES[difficulty];

  const set =
    ROUND_SETS[difficulty][
      Math.floor(
        Math.random() *
          ROUND_SETS[difficulty].length
      )
    ];

  const items = Array(config.items).fill(
    set.common
  );

  const oddIndex = Math.floor(
    Math.random() * config.items
  );

  items[oddIndex] = set.odd;

  return {
    items,
    oddIndex,
  };
}

export default function OddOneOutPage() {
  const dailyChallenge = getDailyChallenge();

  const isDailyChallenge =
    dailyChallenge.game === "odd-one-out";

  const initialDifficulty: Difficulty =
    isDailyChallenge
      ? dailyChallenge.difficulty
      : "normal";

  const [difficulty, setDifficulty] =
    useState<Difficulty>(
      initialDifficulty
    );

  const [round, setRound] = useState<Round>(() =>
    createRound(initialDifficulty)
  );

  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  const [timeLeft, setTimeLeft] = useState(
    DIFFICULTIES[initialDifficulty].time
  );

  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const [feedback, setFeedback] = useState<
    "correct" | "wrong" | null
  >(null);

  const [xpEarned, setXpEarned] =
    useState<number | null>(null);

  const [dailyBonusEarned, setDailyBonusEarned] =
    useState(false);

  const startGame = (
    selectedDifficulty: Difficulty
  ) => {
    setDifficulty(selectedDifficulty);

    setRound(
      createRound(selectedDifficulty)
    );

    setScore(0);
    setCorrect(0);
    setWrong(0);

    setTimeLeft(
      DIFFICULTIES[selectedDifficulty].time
    );

    setStarted(true);
    setGameOver(false);

    setSelectedIndex(null);
    setFeedback(null);
    setXpEarned(null);
    setDailyBonusEarned(false);
  };

  useEffect(() => {
    if (!started || gameOver) {
      return;
    }

    if (timeLeft <= 0) {
      const timer = window.setTimeout(() => {
        const dailyCompleted =
          isDailyChallenge &&
          completeDailyChallenge(
            "odd-one-out"
          );

        const finalScore =
          score +
          (dailyCompleted
            ? DAILY_CHALLENGE_BONUS_POINTS
            : 0);

        const baseXP =
          DIFFICULTIES[difficulty].xp;

        const scoreBonus = Math.min(
          50,
          Math.max(0, finalScore)
        );

        const baseTotalXP =
          baseXP + scoreBonus;

        const displayedXP =
          baseTotalXP +
          (dailyCompleted ? 50 : 0);

        setScore(finalScore);
        setXpEarned(displayedXP);
        setDailyBonusEarned(
          dailyCompleted
        );
        setGameOver(true);

        recordGame(
          finalScore,
          baseTotalXP
        );

        unlockGameAchievement(
          "sharp-eyes"
        );
      }, 0);

      return () => {
        window.clearTimeout(timer);
      };
    }

    const timer = window.setTimeout(() => {
      setTimeLeft(
        (previous) => previous - 1
      );
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    started,
    gameOver,
    timeLeft,
    difficulty,
    score,
    isDailyChallenge,
  ]);

  const handleChoice = (
    index: number
  ) => {
    if (
      !started ||
      gameOver ||
      feedback !== null
    ) {
      return;
    }

    setSelectedIndex(index);

    const isCorrect =
      index === round.oddIndex;

    if (isCorrect) {
      setScore(
        (previous) =>
          previous + 10
      );

      setCorrect(
        (previous) =>
          previous + 1
      );

      setFeedback("correct");

      window.setTimeout(() => {
        setRound(
          createRound(difficulty)
        );

        setSelectedIndex(null);
        setFeedback(null);
      }, 350);

      return;
    }

    setScore(
      (previous) =>
        Math.max(0, previous - 5)
    );

    setWrong(
      (previous) =>
        previous + 1
    );

    setFeedback("wrong");

    window.setTimeout(() => {
      setRound(
        createRound(difficulty)
      );

      setSelectedIndex(null);
      setFeedback(null);
    }, 500);
  };

  const timerPercentage =
    (timeLeft /
      DIFFICULTIES[difficulty].time) *
    100;

  const timerDanger =
    timeLeft <= 5 && started;

  return (
    <main className="min-h-screen overflow-hidden bg-transparent text-white">
      {/* Background */}

      <div className="mp-ambient-background pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-12%] h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="absolute right-[-12%] top-[25%] h-80 w-80 rounded-full bg-purple-500/[0.07] blur-3xl" />

        <div className="absolute bottom-[-15%] left-[35%] h-96 w-96 rounded-full bg-fuchsia-500/[0.07] blur-3xl" />
      </div>

      {/* Navbar */}

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-black tracking-tight"
        >
          <PlayerBrand />
        </Link>

        <Link
          href="/games"
          className="mp-button border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/70 hover:bg-white/8 hover:text-white"
        >
          ← Games
        </Link>
      </nav>

      {/* Main */}

      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-20 pt-8 sm:px-8">
        {/* Header */}

        <div className="mp-fade-up text-center">
          <div className="mp-float mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-4xl shadow-2xl">
            👀
          </div>

          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300/60">
            Visual Challenge
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            Odd{" "}
            <span className="mp-gradient-text">
              One Out
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/45 sm:text-base">
            Spot the item that doesn&apos;t belong.
            Trust your eyes and react fast.
          </p>

          {isDailyChallenge && (
            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-fuchsia-300/15 bg-fuchsia-300/5 px-4 py-2 text-xs font-bold text-fuchsia-200/70">
              🌟 Today&apos;s Daily Challenge
            </div>
          )}
        </div>

        {/* Difficulty */}

        <div className="mx-auto mt-8 max-w-2xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
              Difficulty
            </p>

            <p className="text-xs text-white/30">
              Base XP{" "}
              <span className="font-bold text-cyan-300">
                +{DIFFICULTIES[difficulty].xp}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(
              Object.keys(
                DIFFICULTIES
              ) as Difficulty[]
            ).map((level) => {
              const active =
                difficulty === level;

              return (
                <button
                  key={level}
                  onClick={() =>
                    setDifficulty(level)
                  }
                  className={[
                    "group rounded-2xl border p-3 text-left transition-all duration-200 sm:p-4",
                    active
                      ? "border-cyan-300/30 bg-cyan-300/8 shadow-[0_0_30px_rgba(103,232,249,0.05)]"
                      : "border-white/10 bg-white/[0.035] hover:-translate-y-0.5 hover:bg-white/6",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">
                      {
                        DIFFICULTIES[
                          level
                        ].icon
                      }
                    </span>

                    {active && (
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                    )}
                  </div>

                  <p
                    className={[
                      "mt-2 text-sm font-black",
                      active
                        ? "text-cyan-200"
                        : "text-white/70",
                    ].join(" ")}
                  >
                    {
                      DIFFICULTIES[
                        level
                      ].label
                    }
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    {
                      DIFFICULTIES[
                        level
                      ].items
                    }{" "}
                    items ·{" "}
                    {
                      DIFFICULTIES[
                        level
                      ].time
                    }s
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats */}

        <div className="mx-auto mt-5 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
          <div className="mp-card rounded-2xl p-3 text-center sm:p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 sm:text-xs">
              Score
            </p>

            <p className="mt-1 text-xl font-black text-cyan-300 sm:text-2xl">
              {score}
            </p>
          </div>

          <div className="mp-card rounded-2xl p-3 text-center sm:p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 sm:text-xs">
              Found
            </p>

            <p className="mt-1 text-xl font-black text-emerald-300 sm:text-2xl">
              {correct}
            </p>
          </div>

          <div className="mp-card rounded-2xl p-3 text-center sm:p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 sm:text-xs">
              Time
            </p>

            <p
              className={[
                "mt-1 text-xl font-black transition-colors sm:text-2xl",
                timerDanger
                  ? "animate-pulse text-red-300"
                  : "text-white",
              ].join(" ")}
            >
              {started
                ? timeLeft
                : DIFFICULTIES[difficulty].time}
              s
            </p>
          </div>
        </div>

        {/* Timer */}

        {started && !gameOver && (
          <div className="mx-auto mt-4 max-w-2xl">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className={[
                  "h-full rounded-full transition-all duration-1000",
                  timerDanger
                    ? "bg-red-400"
                    : "bg-linear-to-r from-cyan-400 via-purple-400 to-fuchsia-400",
                ].join(" ")}
                style={{
                  width: `${Math.max(
                    0,
                    timerPercentage
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Game Card */}

        <div className="mp-card mp-fade-up mx-auto mt-6 max-w-2xl rounded-4xl p-5 shadow-2xl sm:mt-8 sm:p-8">
          {/* Start */}

          {!started && !gameOver && (
            <div className="py-8 text-center sm:py-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/4 text-5xl">
                👀
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-cyan-300/50">
                {
                  DIFFICULTIES[
                    difficulty
                  ].label
                }{" "}
                Mode
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Can you spot it?
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
                Find the one item that is
                different before the timer runs
                out.
              </p>

              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/40">
                  {DIFFICULTIES[difficulty].time}s timer
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/40">
                  +{DIFFICULTIES[difficulty].xp} base XP
                </div>
              </div>

              {isDailyChallenge && (
                <div className="mx-auto mt-4 max-w-xs rounded-xl border border-fuchsia-300/10 bg-fuchsia-300/5 px-3 py-2 text-xs font-bold text-fuchsia-200/60">
                  🌟 Daily reward: +10 points
                  +50 XP
                </div>
              )}

              <button
                onClick={() =>
                  startGame(difficulty)
                }
                className="mp-button mt-7 rounded-2xl bg-white px-7 py-3.5 text-sm font-black text-[#080b14] shadow-lg hover:bg-cyan-100"
              >
                Start Game
                <span className="ml-2">
                  →
                </span>
              </button>
            </div>
          )}

          {/* Active Game */}

          {started && !gameOver && (
            <div className="text-center">
              <div className="mb-6 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
                    Visual Scan
                  </p>

                  <p className="mt-1 text-sm font-bold text-white/60">
                    Which one is different?
                  </p>
                </div>

                <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-bold text-white/40">
                  +10 / −5
                </div>
              </div>

              {/* Item Grid */}

              <div
                className={[
                  "grid gap-3 sm:gap-4",
                  round.items.length === 4
                    ? "grid-cols-2"
                    : round.items.length === 6
                      ? "grid-cols-3"
                      : "grid-cols-3",
                ].join(" ")}
              >
                {round.items.map(
                  (item, index) => {
                    const selected =
                      selectedIndex ===
                      index;

                    const isCorrectChoice =
                      feedback ===
                        "correct" &&
                      selected;

                    const isWrongChoice =
                      feedback === "wrong" &&
                      selected;

                    return (
                      <button
                        key={`${item}-${index}`}
                        onClick={() =>
                          handleChoice(
                            index
                          )
                        }
                        disabled={
                          feedback !== null
                        }
                        aria-label={`Item ${index + 1}`}
                        className={[
                          "group relative aspect-square overflow-hidden rounded-3xl border transition-all duration-200",
                          "bg-white/[0.035] hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.07]",
                          "active:scale-95",
                          isCorrectChoice
                            ? "border-emerald-300/40 bg-emerald-300/12 shadow-[0_0_35px_rgba(52,211,153,0.12)]"
                            : isWrongChoice
                              ? "border-red-300/40 bg-red-300/12 shadow-[0_0_35px_rgba(248,113,113,0.12)]"
                              : "border-white/10",
                        ].join(" ")}
                      >
                        <span className="absolute left-3 top-3 text-[10px] font-black text-white/15">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <span
                          className={[
                            "relative block text-5xl transition-transform duration-200 sm:text-6xl",
                            selected
                              ? "scale-110"
                              : "group-hover:scale-110",
                          ].join(" ")}
                        >
                          {item}
                        </span>

                        {isCorrectChoice && (
                          <span className="absolute right-3 top-3 text-lg text-emerald-300">
                            ✓
                          </span>
                        )}

                        {isWrongChoice && (
                          <span className="absolute right-3 top-3 text-lg text-red-300">
                            ✕
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Feedback */}

              <div className="h-9 pt-4">
                {feedback ===
                  "correct" && (
                  <p className="text-sm font-black text-emerald-300">
                    ✨ Nice catch! +10
                  </p>
                )}

                {feedback === "wrong" && (
                  <p className="text-sm font-black text-red-300">
                    Not that one! −5
                  </p>
                )}
              </div>

              <p className="mt-3 text-[11px] text-white/25">
                Find the one that doesn&apos;t
                belong.
              </p>
            </div>
          )}

          {/* Game Over */}

          {gameOver && (
            <div className="py-5 text-center sm:py-8">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-yellow-300/10 bg-yellow-300/5 text-5xl">
                🏆
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300/60">
                Challenge Complete
              </p>

              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Time&apos;s up!
              </h2>

              <p className="mt-2 text-sm text-white/40">
                Your visual reflexes scored{" "}
                <span className="font-black text-white">
                  {score}
                </span>{" "}
                points.
              </p>

              {/* Results */}

              <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/25">
                    Score
                  </p>

                  <p className="mt-1 text-2xl font-black text-cyan-300">
                    {score}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/25">
                    Found
                  </p>

                  <p className="mt-1 text-2xl font-black text-emerald-300">
                    {correct}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/25">
                    Missed
                  </p>

                  <p className="mt-1 text-2xl font-black text-red-300">
                    {wrong}
                  </p>
                </div>
              </div>

              {/* XP */}

              <div className="mt-4 overflow-hidden rounded-2xl border border-cyan-300/15 bg-cyan-300/4 p-5">
                <p className="text-xs font-black uppercase tracking-widest text-cyan-300/50">
                  XP Earned
                </p>

                <p className="mt-1 text-3xl font-black text-cyan-300">
                  +{xpEarned ?? 0} XP
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Added to your MindPlay
                  progress
                </p>
              </div>

              {dailyBonusEarned && (
                <div className="mt-3 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/5 px-4 py-3 text-sm font-bold text-fuchsia-200/70">
                  🌟 Daily Challenge complete
                  · +10 points · +50 XP
                </div>
              )}

              <button
                onClick={() =>
                  startGame(difficulty)
                }
                className="mp-button mt-6 rounded-2xl bg-white px-7 py-3.5 text-sm font-black text-[#080b14] hover:bg-cyan-100"
              >
                Play Again
                <span className="ml-2">
                  →
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Tip */}

        <div className="mp-card mx-auto mt-6 max-w-2xl rounded-2xl p-5">
          <div className="flex gap-3">
            <span className="text-xl">
              👀
            </span>

            <div>
              <p className="text-sm font-black text-white/80">
                Spotting tip
              </p>

              <p className="mt-1 text-sm leading-6 text-white/35">
                Don&apos;t stare at each item for too
                long. Scan the whole group first,
                then look for the small detail
                that breaks the pattern.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}

      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <PlayerFooterText>
          🧠 MindPlay{" "}
          <span className="mx-2">•</span>{" "}
          Play. Think. Have fun.
        </PlayerFooterText>
      </footer>
    </main>
  );
}