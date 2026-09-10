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
  },
  normal: {
    pairs: 6,
    xp: 35,
    label: "Normal",
    description: "12 cards",
  },
  hard: {
    pairs: 8,
    xp: 50,
    label: "Hard",
    description: "16 cards",
  },
};

function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [result[i], result[randomIndex]] = [result[randomIndex], result[i]];
  }

  return result;
}

function createCards(difficulty: Difficulty): Card[] {
  const pairCount = DIFFICULTIES[difficulty].pairs;

  const selectedSymbols = shuffle(SYMBOLS).slice(0, pairCount);

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

  const isDailyChallenge = dailyChallenge.game === "memory-match";

  const initialDifficulty: Difficulty = isDailyChallenge
    ? dailyChallenge.difficulty
    : "normal";

  const [difficulty, setDifficulty] =
    useState<Difficulty>(initialDifficulty);

  const [cards, setCards] = useState<Card[]>(() =>
    createCards(initialDifficulty),
  );

  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [checking, setChecking] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [dailyBonusEarned, setDailyBonusEarned] = useState(false);

  const startGame = (selectedDifficulty: Difficulty) => {
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
    if (flipped.length !== 2 || !started || gameOver) return;

    const [firstIndex, secondIndex] = flipped;

    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];

    if (!firstCard || !secondCard) return;

    const currentDifficulty = difficulty;
    const currentMoves = moves;
    const currentMatchedPairs = matchedPairs;
    const currentTime = time;

    const timer = window.setTimeout(() => {
      const isMatch = firstCard.symbol === secondCard.symbol;

      if (isMatch) {
        setCards((previous) =>
          previous.map((card, index) =>
            index === firstIndex || index === secondIndex
              ? { ...card, matched: true }
              : card,
          ),
        );

        const newMatchedPairs = currentMatchedPairs + 1;
        const totalPairs = DIFFICULTIES[currentDifficulty].pairs;

        setMatchedPairs(newMatchedPairs);

        if (newMatchedPairs === totalPairs) {
          const baseXP = DIFFICULTIES[currentDifficulty].xp;

          const efficiencyBonus =
            currentMoves <= totalPairs
              ? 20
              : currentMoves <= totalPairs * 1.5
                ? 10
                : 0;

          const speedBonus =
            currentTime <= totalPairs * 8 ? 10 : 0;

          const totalXP =
            baseXP + efficiencyBonus + speedBonus;

          const dailyCompleted =
            completeDailyChallenge("memory-match");

          const finalScore =
            currentMoves +
            (dailyCompleted
              ? DAILY_CHALLENGE_BONUS_POINTS
              : 0);

          const displayedXP =
            totalXP + (dailyCompleted ? 50 : 0);

          setXpEarned(displayedXP);
          setDailyBonusEarned(dailyCompleted);
          setGameOver(true);

          recordGame(finalScore, totalXP);
          unlockGameAchievement("memory-master");
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
  ]);

  const handleCardClick = (index: number) => {
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

    const nextFlipped = [...flipped, index];

    if (nextFlipped.length === 2) {
      setChecking(true);
      setMoves((previous) => previous + 1);
    }

    setFlipped(nextFlipped);
  };

  const isVisible = (index: number) =>
    flipped.includes(index) || cards[index].matched;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const currentDifficulty = DIFFICULTIES[difficulty];

  const progress =
    currentDifficulty.pairs > 0
      ? (matchedPairs / currentDifficulty.pairs) * 100
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
      <GameDailyChallenge gameId="memory-match" />

      {/* Difficulty */}
      <div className="mx-auto mt-4 max-w-2xl sm:mt-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
            Difficulty
          </p>

          <p className="text-xs text-white/30">
            Base XP{" "}
            <span className="font-bold text-cyan-300">
              +{currentDifficulty.xp}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map(
            (level) => {
              const selected = difficulty === level;
              const difficultyLocked =
                started && !gameOver;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  disabled={difficultyLocked}
                  className={`group rounded-2xl border p-2.5 text-left transition-all duration-200 sm:p-4 ${
                    selected
                      ? "border-cyan-300/30 bg-cyan-300/8 shadow-[0_0_30px_rgba(103,232,249,0.05)]"
                      : "border-white/10 bg-white/[0.035] hover:-translate-y-0.5 hover:bg-white/6"
                  } ${
                    difficultyLocked
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">
                      {level === "easy"
                        ? "🌱"
                        : level === "normal"
                          ? "⚡"
                          : "🔥"}
                    </span>

                    {selected && (
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                    )}
                  </div>

                  <p
                    className={`mt-2 text-sm font-black ${
                      selected
                        ? "text-cyan-200"
                        : "text-white/70"
                    }`}
                  >
                    {DIFFICULTIES[level].label}
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    {DIFFICULTIES[level].description}
                  </p>
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto mt-3 grid max-w-2xl grid-cols-3 gap-1.5 sm:mt-5 sm:gap-3">
        <div className="mp-card rounded-2xl p-2 text-center sm:p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 sm:text-xs">
            Moves
          </p>

          <p className="mt-1 text-xl font-black sm:text-2xl">
            {moves}
          </p>
        </div>

        <div className="mp-card rounded-2xl p-2 text-center sm:p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 sm:text-xs">
            Pairs
          </p>

          <p className="mt-1 text-xl font-black text-cyan-300 sm:text-2xl">
            {matchedPairs}
            <span className="text-white/25">
              /{currentDifficulty.pairs}
            </span>
          </p>
        </div>

        <div className="mp-card rounded-2xl p-2 text-center sm:p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 sm:text-xs">
            Time
          </p>

          <p className="mt-1 text-xl font-black sm:text-2xl">
            {formatTime(time)}
          </p>
        </div>
      </div>

      {/* Progress */}
      {started && !gameOver && (
        <div className="mx-auto mt-3 max-w-2xl sm:mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-bold text-white/30">
              Match progress
            </span>

            <span className="font-black text-cyan-300/60">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full bg-linear-to-r from-cyan-300 via-purple-400 to-pink-300 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Game */}
      <section className="mp-card mp-fade-up mx-auto mt-3 w-full max-w-2xl rounded-3xl p-3 shadow-2xl sm:mt-5 sm:rounded-4xl sm:p-6">
        {started && !gameOver && (
          <>
            <div className="mb-4 flex items-center justify-between sm:mb-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/25">
                  Find the pairs
                </p>

                <p className="mt-1 text-sm font-bold text-white/60">
                  {checking
                    ? "Checking..."
                    : "Choose two cards"}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-xs font-black text-white/40">
                {currentDifficulty.label}
              </div>
            </div>

            {/* Card Grid */}
            <div className="mx-auto grid w-full max-w-lg grid-cols-4 gap-1.5 sm:gap-3">
              {cards.map((card, index) => {
                const visible = isVisible(index);

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleCardClick(index)}
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
                    className={`group relative aspect-square overflow-hidden rounded-xl border transition-all duration-200 sm:rounded-3xl ${
                      visible
                        ? "border-cyan-300/20 bg-linear-to-br from-cyan-300/11 to-purple-300/5 shadow-lg shadow-cyan-400/3"
                        : "border-white/[0.07] bg-white/[0.035] hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/6.5 hover:shadow-xl hover:shadow-cyan-400/3 active:scale-95"
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/4 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                    {visible ? (
                      <span className="relative flex h-full items-center justify-center text-2xl animate-[pop_0.2s_ease-out] sm:text-4xl md:text-5xl">
                        {card.symbol}
                      </span>
                    ) : (
                      <span className="relative flex h-full items-center justify-center text-2xl font-black text-white/16 transition-transform duration-200 group-hover:scale-110 group-hover:text-cyan-200/30 sm:text-3xl">
                        ?
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-white/25 sm:mt-5 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/50" />

              {checking
                ? "Checking your match..."
                : "Remember the positions"}
            </div>
          </>
        )}

        {/* Start Screen */}
        {!started && !gameOver && (
          <div className="flex min-h-80 flex-col items-center justify-center px-3 py-6 text-center sm:min-h-115 sm:py-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-cyan-300/10 bg-cyan-300/5 text-4xl shadow-xl shadow-cyan-400/4">
              🎴
            </div>

            <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-300/50 sm:mt-4">
              Ready?
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Test your memory
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
              Match all{" "}
              <span className="font-bold text-white/70">
                {currentDifficulty.pairs}
              </span>{" "}
              pairs using as few moves as possible.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/40">
                {currentDifficulty.pairs * 2} cards
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/40">
                +{currentDifficulty.xp} base XP
              </div>
            </div>

            {isDailyChallenge && (
              <div className="mt-4 rounded-xl border border-purple-300/10 bg-purple-300/5 px-3 py-2 text-xs font-bold text-purple-200/60">
                🎯 Today&apos;s Daily Challenge ·{" "}
                {dailyChallenge.difficulty.toUpperCase()}
              </div>
            )}

            <button
              type="button"
              onClick={() => startGame(difficulty)}
              className="mp-button mt-5 bg-white px-7 py-3.5 text-sm text-black shadow-xl shadow-white/5 hover:bg-cyan-50 sm:mt-4"
            >
              🎮 Start Game
            </button>
          </div>
        )}

        {/* Result Screen */}
        {gameOver && (
          <div className="flex min-h-80 flex-col items-center justify-center px-3 py-6 text-center sm:min-h-115 sm:py-10">
            <div className="mp-float flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-yellow-300/10 bg-yellow-300/5 text-4xl">
              🏆
            </div>

            <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-yellow-300/60 sm:mt-4">
              Challenge Complete
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Memory Master!
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/45">
              You matched every pair in{" "}
              <span className="font-black text-white">
                {moves}
              </span>{" "}
              moves.
            </p>

            <div className="mt-4 grid w-full max-w-sm grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/25">
                  Time
                </p>

                <p className="mt-1 text-xl font-black">
                  {formatTime(time)}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/4 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/25">
                  XP Earned
                </p>

                <p className="mt-1 text-xl font-black text-cyan-300">
                  +{xpEarned}
                </p>
              </div>
            </div>

            {dailyBonusEarned && (
              <div className="mt-4 w-full max-w-sm rounded-2xl border border-purple-300/15 bg-purple-300/4 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-300/70">
                  Daily Challenge
                </p>

                <p className="mt-1 text-sm font-black text-white/80">
                  +50 XP · +10 Score
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Today&apos;s challenge reward has been added.
                </p>
              </div>
            )}

            <p className="mt-5 text-xs text-white/25">
              Added to your MindPlay progress
            </p>

            <div className="mt-4 flex w-full max-w-sm flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => startGame(difficulty)}
                className="mp-button flex-1 bg-white px-6 py-3.5 text-sm text-black hover:bg-cyan-50"
              >
                Play Again
              </button>

              <a
                href="/games"
                className="mp-button flex-1 border border-white/10 bg-white/4 px-6 py-3.5 text-sm text-white/65 hover:bg-white/8 hover:text-white"
              >
                All Games
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Memory Tip */}
      <div className="mx-auto mt-5 hidden max-w-2xl rounded-2xl border border-white/6 bg-white/2.5 p-4 sm:block sm:p-5">
        <div className="flex gap-3">
          <span className="text-lg">💡</span>

          <div>
            <p className="text-sm font-black">
              Memory tip
            </p>

            <p className="mt-1 text-xs leading-6 text-white/35 sm:text-sm">
              Remember positions instead of just symbols.
              Group nearby cards together in your mind.
            </p>
          </div>
        </div>
      </div>
    </GameShell>
  );
}