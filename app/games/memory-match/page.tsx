"use client";

import { useEffect, useState } from "react";

import GameDailyChallenge from "@/components/GameDailyChallenge";
import GameShell from "@/components/GameShell";

import { recordGame } from "@/lib/progress";
import { unlockGameAchievement } from "@/lib/achievements";

import {
  completeDailyChallenge,
  DAILY_CHALLENGE_BONUS_POINTS,
  getDailyChallenge,
} from "@/lib/dailyChallenge";

type Card = {
  id: number;
  symbol: string;
  matched: boolean;
};

type Difficulty = "easy" | "normal" | "hard";

const SYMBOLS = [
  "🍎",
  "🍕",
  "🚀",
  "🐸",
  "🌈",
  "⚡",
  "🎮",
  "🦊",
  "🍩",
  "🎯",
  "🌙",
  "👾",
];

const DIFFICULTIES = {
  easy: {
    pairs: 4,
    xp: 20,
    label: "Easy",
    description: "8 cards",
    icon: "🌱",
  },
  normal: {
    pairs: 6,
    xp: 35,
    label: "Normal",
    description: "12 cards",
    icon: "⚡",
  },
  hard: {
    pairs: 8,
    xp: 50,
    label: "Hard",
    description: "16 cards",
    icon: "🔥",
  },
};

function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(
      Math.random() * (i + 1),
    );

    [result[i], result[randomIndex]] = [
      result[randomIndex],
      result[i],
    ];
  }

  return result;
}

function createCards(difficulty: Difficulty): Card[] {
  const pairCount = DIFFICULTIES[difficulty].pairs;

  const selectedSymbols = shuffle(SYMBOLS).slice(
    0,
    pairCount,
  );

  const cards = selectedSymbols.flatMap((symbol) => [
    {
      id: Math.random(),
      symbol,
      matched: false,
    },
    {
      id: Math.random(),
      symbol,
      matched: false,
    },
  ]);

  return shuffle(cards);
}

export default function MemoryMatchPage() {
  const dailyChallenge = getDailyChallenge();

  const [dailyMode, setDailyMode] = useState(false);

  const [difficulty, setDifficulty] =
    useState<Difficulty>("normal");

  const [cards, setCards] = useState<Card[]>(() =>
    createCards("normal"),
  );

  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [checking, setChecking] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | null>(
    null,
  );
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [dailyBonusEarned, setDailyBonusEarned] =
    useState(false);

  /*
   * Detect Daily Challenge mode from the URL.
   *
   * Normal visits:
   * /games/memory-match
   *
   * Daily Challenge:
   * /games/memory-match?daily=true&difficulty=hard
   *
   * Daily mode is only enabled when the URL matches
   * today's actual challenge.
   */
  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search,
    );

    const urlDaily =
      params.get("daily") === "true";

    const urlDifficulty =
      params.get("difficulty");

    const validDifficulty =
      urlDifficulty === "easy" ||
      urlDifficulty === "normal" ||
      urlDifficulty === "hard";

    if (
      urlDaily &&
      validDifficulty &&
      dailyChallenge.game === "memory-match" &&
      urlDifficulty === dailyChallenge.difficulty
    ) {
      const dailyTimer = setTimeout(() => {
        setDailyMode(true);
        setDifficulty(
          dailyChallenge.difficulty,
        );
      }, 0);

      return () => clearTimeout(dailyTimer);
    }
  }, [dailyChallenge]);

  const startGame = (
    selectedDifficulty: Difficulty,
  ) => {
    /*
     * Daily Challenge difficulty cannot be changed.
     */
    if (
      dailyMode &&
      selectedDifficulty !==
        dailyChallenge.difficulty
    ) {
      return;
    }

    setDifficulty(selectedDifficulty);
    setCards(createCards(selectedDifficulty));
    setFlipped([]);
    setMoves(0);
    setMatchedPairs(0);
    setGameOver(false);
    setChecking(false);
    setXpEarned(null);
    setTime(0);
    setStarted(true);
    setDailyBonusEarned(false);
  };

  useEffect(() => {
    if (!started || gameOver) return;

    const timer = window.setInterval(() => {
      setTime((previous) => previous + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [started, gameOver]);

  useEffect(() => {
    if (
      flipped.length !== 2 ||
      !started ||
      gameOver
    ) {
      return;
    }

    const [firstIndex, secondIndex] =
      flipped;

    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];

    if (!firstCard || !secondCard) return;

    const currentDifficulty = difficulty;
    const currentMoves = moves;
    const currentMatchedPairs =
      matchedPairs;
    const currentTime = time;

    const timer = window.setTimeout(() => {
      const isMatch =
        firstCard.symbol ===
        secondCard.symbol;

      if (isMatch) {
        setCards((previous) =>
          previous.map(
            (card, index) =>
              index === firstIndex ||
              index === secondIndex
                ? {
                    ...card,
                    matched: true,
                  }
                : card,
          ),
        );

        const newMatchedPairs =
          currentMatchedPairs + 1;

        const totalPairs =
          DIFFICULTIES[
            currentDifficulty
          ].pairs;

        setMatchedPairs(
          newMatchedPairs,
        );

        if (
          newMatchedPairs ===
          totalPairs
        ) {
          const baseXP =
            DIFFICULTIES[
              currentDifficulty
            ].xp;

          const efficiencyBonus =
            currentMoves <= totalPairs
              ? 20
              : currentMoves <=
                  totalPairs * 1.5
                ? 10
                : 0;

          const speedBonus =
            currentTime <=
            totalPairs * 8
              ? 10
              : 0;

          const totalXP =
            baseXP +
            efficiencyBonus +
            speedBonus;

          /*
           * Daily bonus is only possible when
           * the game was actually launched through
           * Daily Challenge mode.
           */
          const dailyCompleted =
            dailyMode &&
            dailyChallenge.game ===
              "memory-match"
              ? completeDailyChallenge(
                  "memory-match",
                )
              : false;

          const finalScore =
            currentMoves +
            (dailyCompleted
              ? DAILY_CHALLENGE_BONUS_POINTS
              : 0);

          const displayedXP =
            totalXP +
            (dailyCompleted
              ? dailyChallenge.rewardXP
              : 0);

          setXpEarned(
            displayedXP,
          );

          setDailyBonusEarned(
            dailyCompleted,
          );

          setGameOver(true);

          /*
           * recordGame stores the normal game XP.
           * completeDailyChallenge handles the
           * separate Daily Challenge XP reward.
           */
          recordGame(
            finalScore,
            totalXP,
          );

          unlockGameAchievement(
            "memory-master",
          );
        }
      }

      setFlipped([]);
      setChecking(false);
    }, 650);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    flipped,
    cards,
    difficulty,
    matchedPairs,
    moves,
    started,
    time,
    gameOver,
    dailyMode,
    dailyChallenge,
  ]);

  const handleCardClick = (
    index: number,
  ) => {
    if (
      !started ||
      gameOver ||
      checking ||
      flipped.includes(index) ||
      cards[index].matched ||
      flipped.length >= 2
    ) {
      return;
    }

    const nextFlipped = [
      ...flipped,
      index,
    ];

    if (nextFlipped.length === 2) {
      setChecking(true);
      setMoves(
        (previous) =>
          previous + 1,
      );
    }

    setFlipped(nextFlipped);
  };

  const isVisible = (
    index: number,
  ) =>
    flipped.includes(index) ||
    cards[index].matched;

  const formatTime = (
    seconds: number,
  ) => {
    const minutes = Math.floor(
      seconds / 60,
    );

    const remainingSeconds =
      seconds % 60;

    return `${String(
      minutes,
    ).padStart(
      2,
      "0",
    )}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const currentDifficulty =
    DIFFICULTIES[difficulty];

  const progress =
    currentDifficulty.pairs > 0
      ? (matchedPairs /
          currentDifficulty.pairs) *
        100
      : 0;

  return (
    <GameShell
      icon="🧠"
      category="Memory Challenge"
      title="Memory"
      highlightedTitle="Match"
      description="Flip two cards at a time and remember where every symbol is hiding."
      maxWidth="lg"
    >
      <style jsx>{`
        .memory-card {
          perspective: 1000px;
        }

        .memory-card-inner {
          transform-style: preserve-3d;
          transition:
            transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.25s ease;
        }

        .memory-card-visible .memory-card-inner {
          transform: rotateY(180deg);
        }

        .memory-card-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .memory-card-front {
          transform: rotateY(180deg);
        }

        @keyframes matchPop {
          0% {
            transform: rotateY(180deg) scale(0.88);
          }

          70% {
            transform: rotateY(180deg) scale(1.05);
          }

          100% {
            transform: rotateY(180deg) scale(1);
          }
        }

        .memory-card-matched .memory-card-inner {
          animation: matchPop 0.4s
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes screenIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .screen-in {
          animation: screenIn 0.65s
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes softPulse {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(1);
          }

          50% {
            opacity: 0.8;
            transform: scale(1.08);
          }
        }

        .soft-pulse {
          animation: softPulse 2.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .memory-card-inner,
          .memory-card-matched .memory-card-inner,
          .screen-in,
          .soft-pulse {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <GameDailyChallenge gameId="memory-match" />

      {/* Difficulty */}
      <div className="mx-auto mt-5 max-w-2xl sm:mt-7">
        <div className="mb-3 flex items-end justify-between px-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
              {dailyMode
                ? "Daily difficulty"
                : "Choose difficulty"}
            </p>

            <p className="mt-1 text-xs text-white/40">
              {dailyMode
                ? "Today's difficulty is locked."
                : "Higher difficulty, higher reward."}
            </p>
          </div>

          <p className="text-xs font-bold text-white/45">
            +{currentDifficulty.xp}
            <span className="ml-1 text-cyan-300/60">
              XP
            </span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(
            Object.keys(
              DIFFICULTIES,
            ) as Difficulty[]
          ).map((level) => {
            const selected =
              difficulty === level;

            const difficultyLocked =
              dailyMode ||
              (started && !gameOver);

            return (
              <button
                key={level}
                type="button"
                onClick={() =>
                  setDifficulty(level)
                }
                disabled={
                  difficultyLocked
                }
                className={`group relative overflow-hidden rounded-[1.35rem] border px-3 py-3.5 text-left transition-all duration-300 sm:rounded-3xl sm:px-4 sm:py-4 ${
                  selected
                    ? "border-cyan-300/20 bg-cyan-300/[0.07] shadow-lg shadow-cyan-400/2.5"
                    : "border-white/6 bg-white/2.5 hover:-translate-y-0.5 hover:border-white/11 hover:bg-white/4.5"
                } ${
                  difficultyLocked
                    ? "cursor-not-allowed opacity-40"
                    : ""
                }`}
              >
                {selected && (
                  <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-cyan-300/80 to-transparent" />
                )}

                <div className="flex items-center justify-between">
                  <span
                    className={`text-lg transition-transform duration-300 sm:text-xl ${
                      selected
                        ? "scale-110"
                        : "group-hover:scale-110"
                    }`}
                  >
                    {
                      DIFFICULTIES[
                        level
                      ].icon
                    }
                  </span>

                  {selected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                  )}
                </div>

                <p
                  className={`mt-2 text-sm font-extrabold ${
                    selected
                      ? "text-cyan-200"
                      : "text-white/65"
                  }`}
                >
                  {
                    DIFFICULTIES[
                      level
                    ].label
                  }
                </p>

                <p className="mt-0.5 text-[10px] font-medium text-white/45 sm:text-[11px]">
                  {
                    DIFFICULTIES[
                      level
                    ].description
                  }
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto mt-3 grid max-w-2xl grid-cols-3 gap-2 sm:mt-4">
        <div className="rounded-[1.35rem] border border-white/6 bg-white/2.5 px-3 py-3.5 text-center sm:rounded-3xl sm:px-4 sm:py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
            Moves
          </p>

          <p className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">
            {moves}
          </p>
        </div>

        <div className="rounded-[1.35rem] border border-cyan-300/9 bg-cyan-300/2.5 px-3 py-3.5 text-center sm:rounded-3xl sm:px-4 sm:py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
            Pairs
          </p>

          <p className="mt-1 text-xl font-extrabold tracking-tight text-cyan-300 sm:text-2xl">
            {matchedPairs}
            <span className="text-white/15">
              /{currentDifficulty.pairs}
            </span>
          </p>
        </div>

        <div className="rounded-[1.35rem] border border-white/6 bg-white/2.5 px-3 py-3.5 text-center sm:rounded-3xl sm:px-4 sm:py-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
            Time
          </p>

          <p className="mt-1 text-xl font-extrabold tracking-tight tabular-nums sm:text-2xl">
            {formatTime(time)}
          </p>
        </div>
      </div>

      {/* Progress */}
      {started && !gameOver && (
        <div className="mx-auto mt-4 max-w-2xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40 sm:text-[10px]">
              Progress
            </span>

            <span className="text-[10px] font-bold tabular-nums text-cyan-300/55">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full bg-linear-to-r from-cyan-300 via-purple-400 to-fuchsia-300 transition-all duration-700"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Main Game */}
      <section className="mx-auto mt-5 w-full max-w-2xl sm:mt-6">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-white/2.5 p-3 shadow-2xl shadow-black/20 sm:rounded-4xl sm:p-6">
          <div className="pointer-events-none absolute left-1/2 -top-text-white/45 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-300/2.5 blur-[110px]" />

          {/* Active Game */}
          {started && !gameOver && (
            <div className="relative">
              <div className="mb-4 flex items-center justify-between sm:mb-6">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 sm:text-[10px]">
                    Memory board
                  </p>

                  <p className="mt-1 text-sm font-bold text-white/55">
                    {checking
                      ? "Checking your match..."
                      : "Remember the positions."}
                  </p>
                </div>

                <div className="rounded-full border border-white/[0.07] bg-white/3 px-3 py-1.5 text-[10px] font-bold text-white/50">
                  {dailyMode
                    ? `Daily · ${currentDifficulty.label} 🔒`
                    : currentDifficulty.label}
                </div>
              </div>

              {/* Card Grid */}
              <div
                className={`mx-auto grid w-full grid-cols-4 gap-2 sm:gap-3 ${
                  cards.length > 12
                    ? "max-w-xl"
                    : "max-w-lg"
                }`}
              >
                {cards.map(
                  (card, index) => {
                    const visible =
                      isVisible(index);

                    const matched =
                      card.matched;

                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() =>
                          handleCardClick(
                            index,
                          )
                        }
                        disabled={
                          !started ||
                          gameOver ||
                          checking ||
                          visible
                        }
                        aria-label={
                          visible
                            ? `Memory card ${card.symbol}`
                            : `Hidden memory card ${index + 1}`
                        }
                        className={`memory-card group relative aspect-square w-full ${
                          visible
                            ? "memory-card-visible"
                            : ""
                        } ${
                          matched
                            ? "memory-card-matched"
                            : ""
                        }`}
                      >
                        <div className="memory-card-inner relative h-full w-full">
                          {/* Back */}
                          <div
                            className={`memory-card-face absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl border transition-all duration-300 sm:rounded-3xl ${
                              visible
                                ? "border-cyan-300/10 bg-white/2.5"
                                : "border-white/[0.07] bg-white/[0.035] group-hover:-translate-y-1 group-hover:border-cyan-300/20 group-hover:bg-white/5.5 group-active:scale-95"
                            }`}
                          >
                            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/[0.035] via-transparent to-cyan-300/1.5" />

                            <div
                              className={`relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/6 bg-white/2.5 text-lg font-black text-white/15 transition-all duration-300 sm:h-10 sm:w-10 sm:rounded-2xl sm:text-xl ${
                                !visible
                                  ? "group-hover:scale-110 group-hover:border-cyan-300/15 group-hover:text-cyan-200/30"
                                  : ""
                              }`}
                            >
                              ?
                            </div>
                          </div>

                          {/* Front */}
                          <div
                            className={`memory-card-face memory-card-front absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl border bg-linear-to-br from-cyan-300/9 via-white/2.5 to-purple-300/6 shadow-lg shadow-cyan-400/2.5 sm:rounded-3xl ${
                              matched
                                ? "border-cyan-300/25"
                                : "border-cyan-300/15"
                            }`}
                          >
                            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/5 to-transparent" />

                            <span className="relative text-[clamp(1.65rem,7vw,3.1rem)] leading-none drop-shadow-lg">
                              {
                                card.symbol
                              }
                            </span>

                            {matched && (
                              <div className="soft-pulse absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)] sm:right-3 sm:top-3" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-medium text-white/40 sm:mt-6 sm:text-xs">
                <span className="h-1 w-1 rounded-full bg-cyan-300/50" />

                {checking
                  ? "Checking your match"
                  : "Find every pair"}
              </div>
            </div>
          )}

          {/* Start Screen */}
          {!started && !gameOver && (
            <div className="screen-in relative flex min-h-[clamp(12rem,42dvh,22rem)] flex-col items-center justify-center px-4 py-8 text-center sm:min-h-[clamp(14rem,48dvh,30rem)]">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-cyan-300/10 bg-cyan-300/4.5 text-4xl shadow-2xl shadow-cyan-400/4 sm:h-24 sm:w-24 sm:text-5xl">
                🎴

                <div className="absolute inset-0 rounded-[1.75rem] border border-white/4" />
              </div>

              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300/50">
                Memory challenge
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
                How sharp are you?
              </h2>

              <p className="mt-4 max-w-md text-sm font-medium leading-7 text-white/50">
                Match all{" "}
                <span className="font-bold text-white/65">
                  {
                    currentDifficulty.pairs
                  }
                </span>{" "}
                pairs. Use as few moves
                as possible.
              </p>

              <div className="mt-6 flex items-center gap-2">
                <div className="rounded-full border border-white/[0.07] bg-white/2.5 px-3.5 py-2 text-[10px] font-bold text-white/50">
                  {
                    currentDifficulty.pairs *
                    2
                  }{" "}
                  cards
                </div>

                <div className="rounded-full border border-white/[0.07] bg-white/2.5 px-3.5 py-2 text-[10px] font-bold text-white/50">
                  +{currentDifficulty.xp}{" "}
                  XP
                </div>
              </div>

              {dailyMode && (
                <div className="mt-5 rounded-full border border-purple-300/10 bg-purple-300/4.5 px-4 py-2 text-[10px] font-bold tracking-wide text-purple-200/60">
                  🎯 Daily Challenge ·{" "}
                  {dailyChallenge.difficulty.toUpperCase()}{" "}
                  🔒
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  startGame(
                    difficulty,
                  )
                }
                className="mt-7 inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-extrabold text-black shadow-xl shadow-white/6 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-text-white/50 active:translate-y-0 active:scale-[0.98]"
              >
                {dailyMode
                  ? "Start Daily Challenge"
                  : "Start Game"}

                <span className="ml-2 text-black/35">
                  →
                </span>
              </button>
            </div>
          )}

          {/* Result Screen */}
          {gameOver && (
            <div className="screen-in relative flex min-h-[clamp(12rem,42dvh,22rem)] flex-col items-center justify-center px-4 py-8 text-center sm:min-h-[clamp(14rem,48dvh,30rem)]">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-yellow-300/10 bg-yellow-300/4.5 text-4xl shadow-2xl shadow-yellow-400/2.5 sm:h-24 sm:w-24 sm:text-5xl">
                🏆

                <div className="absolute inset-0 rounded-[1.75rem] border border-white/4" />
              </div>

              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-300/55">
                {dailyMode
                  ? "Daily Challenge complete"
                  : "Challenge complete"}
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
                Memory Master.
              </h2>

              <p className="mt-3 max-w-md text-sm font-medium leading-7 text-white/55">
                Every pair found in{" "}
                <span className="font-extrabold text-white">
                  {moves}
                </span>{" "}
                moves.
              </p>

              <div className="mt-7 grid w-full max-w-sm grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-white/[0.07] bg-white/2.5 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                    Time
                  </p>

                  <p className="mt-1.5 text-xl font-extrabold tabular-nums">
                    {formatTime(time)}
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/2.5 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                    XP earned
                  </p>

                  <p className="mt-1.5 text-xl font-extrabold text-cyan-300">
                    +{xpEarned}
                  </p>
                </div>
              </div>

              {dailyBonusEarned && (
                <div className="mt-3 w-full max-w-sm rounded-2xl border border-purple-300/10 bg-purple-300/2.5 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-purple-300/60">
                    Daily Challenge
                  </p>

                  <p className="mt-1.5 text-sm font-extrabold text-white/75">
                    +{dailyChallenge.rewardXP}{" "}
                    XP · +10 Score
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-white/45">
                    Today&apos;s bonus has
                    been added.
                  </p>
                </div>
              )}

              <p className="mt-5 text-[10px] font-medium text-white/40">
                Added to your MindPlay progress
              </p>

              <div className="mt-5 flex w-full max-w-sm flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    startGame(
                      difficulty,
                    )
                  }
                  className="flex-1 rounded-full bg-white px-6 py-3.5 text-sm font-extrabold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-text-white/50 active:translate-y-0"
                >
                  Play Again
                </button>

                <a
                  href="/games"
                  className="flex-1 rounded-full border border-white/8 bg-white/2.5 px-6 py-3.5 text-sm font-bold text-white/55 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/5.5 hover:text-white"
                >
                  All Games
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Memory Tip */}
      <div className="mx-auto mt-5 hidden max-w-2xl sm:block">
        <div className="rounded-2xl border border-white/6 bg-white/2 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/4 text-sm">
              💡
            </div>

            <div>
              <p className="text-xs font-extrabold text-white/70">
                Memory tip
              </p>

              <p className="mt-1 text-xs font-medium leading-6 text-white/45">
                Remember positions instead of
                just symbols. Group nearby cards
                together in your mind.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}