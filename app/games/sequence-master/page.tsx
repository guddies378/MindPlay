"use client";

import GameShell from "@/components/GameShell";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  completeDailyChallenge,
  DAILY_CHALLENGE_BONUS_POINTS,
  getDailyChallenge,
} from "@/lib/dailyChallenge";
import {
  recordGame,
  unlockGameAchievement,
} from "@/lib/progress";

type Difficulty = "easy" | "normal" | "hard";

type GameState =
  | "idle"
  | "showing"
  | "input"
  | "result"
  | "finished";

type SequenceItem = {
  id: number;
  symbol: string;
};

const SYMBOLS: SequenceItem[] = [
  {
    id: 1,
    symbol: "●",
  },
  {
    id: 2,
    symbol: "◆",
  },
  {
    id: 3,
    symbol: "▲",
  },
  {
    id: 4,
    symbol: "■",
  },
  {
    id: 5,
    symbol: "★",
  },
];

const DIFFICULTIES: Record<
  Difficulty,
  {
    startingLength: number;
    maxLength: number;
    rounds: number;
    displayTime: number;
    xp: number;
    icon: string;
  }
> = {
  easy: {
    startingLength: 3,
    maxLength: 7,
    rounds: 8,
    displayTime: 850,
    xp: 20,
    icon: "🌱",
  },

  normal: {
    startingLength: 4,
    maxLength: 9,
    rounds: 9,
    displayTime: 700,
    xp: 35,
    icon: "⚡",
  },

  hard: {
    startingLength: 5,
    maxLength: 11,
    rounds: 10,
    displayTime: 550,
    xp: 50,
    icon: "🔥",
  },
};

function generateSequence(
  length: number,
): SequenceItem[] {
  const sequence: SequenceItem[] = [];

  for (let i = 0; i < length; i += 1) {
    const randomIndex = Math.floor(
      Math.random() * SYMBOLS.length,
    );

    sequence.push(
      SYMBOLS[randomIndex],
    );
  }

  return sequence;
}

function getSequenceLength(
  round: number,
  difficulty: Difficulty,
) {
  const settings =
    DIFFICULTIES[difficulty];

  const increase = Math.floor(
    (round - 1) / 2,
  );

  return Math.min(
    settings.startingLength +
      increase,
    settings.maxLength,
  );
}

function getRoundScore(
  correct: boolean,
  length: number,
) {
  if (!correct) {
    return 0;
  }

  return length * 10;
}

export default function SequenceMasterPage() {
  const [difficulty, setDifficulty] =
    useState<Difficulty>("normal");

  const [dailyMode, setDailyMode] =
    useState(false);

  const [gameState, setGameState] =
    useState<GameState>("idle");

  const [round, setRound] =
    useState(1);

  const [sequence, setSequence] =
    useState<SequenceItem[]>([]);

  const [
    playerSequence,
    setPlayerSequence,
  ] = useState<SequenceItem[]>([]);

  const [score, setScore] =
    useState(0);

  const [
    correctCount,
    setCorrectCount,
  ] = useState(0);

  const [streak, setStreak] =
    useState(0);

  const [
    bestStreak,
    setBestStreak,
  ] = useState(0);

  const [
    longestSequence,
    setLongestSequence,
  ] = useState(0);

  const [
    showingIndex,
    setShowingIndex,
  ] = useState(0);

  const [
    selectedWrong,
    setSelectedWrong,
  ] = useState(false);

  const [
    roundScore,
    setRoundScore,
  ] = useState(0);

  const [earnedXP, setEarnedXP] =
    useState(0);

  const [dailyBonus, setDailyBonus] =
    useState(false);

  const dailyChallenge =
    useMemo(
      () => getDailyChallenge(),
      [],
    );

  /*
   * Detect Daily Challenge mode.
   *
   * The difficulty comes from the URL:
   *
   * ?daily=true&difficulty=easy
   * ?daily=true&difficulty=normal
   * ?daily=true&difficulty=hard
   *
   * We also verify that the URL matches
   * today's actual Sequence Master challenge.
   */
  useEffect(() => {
    const params =
      new URLSearchParams(
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
      dailyChallenge.game ===
        "sequence-master" &&
      urlDifficulty ===
        dailyChallenge.difficulty
    ) {
      const dailyTimer = setTimeout(() => {
        setDailyMode(true);
      setDifficulty(
        dailyChallenge.difficulty,
      );
      }, 0);

      return () => clearTimeout(dailyTimer);
    }
  }, [dailyChallenge.game, dailyChallenge.difficulty]);

  const settings =
    DIFFICULTIES[difficulty];

  function startGame() {
    const activeDifficulty =
      dailyMode &&
      dailyChallenge.game === "sequence-master"
        ? dailyChallenge.difficulty
        : difficulty;

    setDifficulty(activeDifficulty);

    setRound(1);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setLongestSequence(0);
    setRoundScore(0);
    setEarnedXP(0);
    setDailyBonus(false);
    setPlayerSequence([]);
    setSelectedWrong(false);

    startRound(
      1,
      activeDifficulty,
    );
  }

  function startRound(
    roundNumber: number,
    selectedDifficulty: Difficulty,
  ) {
    const length =
      getSequenceLength(
        roundNumber,
        selectedDifficulty,
      );

    const newSequence =
      generateSequence(length);

    setSequence(newSequence);
    setPlayerSequence([]);
    setShowingIndex(0);
    setSelectedWrong(false);
    setRoundScore(0);
    setGameState("showing");
  }

  useEffect(() => {
    if (
      gameState !== "showing" ||
      sequence.length === 0
    ) {
      return;
    }

    if (
      showingIndex >= sequence.length
    ) {
      const timer =
        window.setTimeout(() => {
          setShowingIndex(-1);
          setGameState("input");
        }, 350);

      return () => {
        window.clearTimeout(timer);
      };
    }

    const timer =
      window.setTimeout(() => {
        setShowingIndex(
          (previous) =>
            previous + 1,
        );
      }, settings.displayTime);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    gameState,
    sequence,
    showingIndex,
    settings.displayTime,
  ]);

  function handleSymbolClick(
    item: SequenceItem,
  ) {
    if (gameState !== "input") {
      return;
    }

    const expectedIndex =
      playerSequence.length;

    const expected =
      sequence[expectedIndex];

    if (!expected) {
      return;
    }

    if (item.id !== expected.id) {
      setSelectedWrong(true);
      setStreak(0);
      setRoundScore(0);
      setGameState("result");

      return;
    }

    const nextPlayerSequence = [
      ...playerSequence,
      item,
    ];

    setPlayerSequence(
      nextPlayerSequence,
    );

    if (
      nextPlayerSequence.length ===
      sequence.length
    ) {
      const points =
        getRoundScore(
          true,
          sequence.length,
        );

      const nextStreak =
        streak + 1;

      setScore(
        (previous) =>
          previous + points,
      );

      setCorrectCount(
        (previous) =>
          previous + 1,
      );

      setStreak(
        nextStreak,
      );

      setBestStreak(
        (previous) =>
          Math.max(
            previous,
            nextStreak,
          ),
      );

      setLongestSequence(
        (previous) =>
          Math.max(
            previous,
            sequence.length,
          ),
      );

      setRoundScore(
        points,
      );

      setGameState(
        "result",
      );
    }
  }

  function continueGame() {
    if (
      round >= settings.rounds
    ) {
      finishGame();
      return;
    }

    const nextRound =
      round + 1;

    setRound(nextRound);

    startRound(
      nextRound,
      difficulty,
    );
  }

  async function finishGame() {
    const baseXP =
      settings.xp;

    const scoreBonus =
      Math.min(
        30,
        Math.floor(
          score / 10,
        ),
      );

    const streakBonus =
      Math.min(
        20,
        bestStreak * 2,
      );

    const gameXP =
      baseXP +
      scoreBonus +
      streakBonus;

    let receivedDailyBonus =
      false;

    /*
     * Only complete the daily challenge
     * when this page was actually opened
     * in valid Daily Challenge mode.
     */
    if (
      dailyMode &&
      dailyChallenge.game ===
        "sequence-master"
    ) {
      receivedDailyBonus =
        await completeDailyChallenge(
          "sequence-master",
        );
    }

    const finalScore =
      score +
      (receivedDailyBonus
        ? DAILY_CHALLENGE_BONUS_POINTS
        : 0);

    const totalXP =
      gameXP +
      (receivedDailyBonus
        ? dailyChallenge.rewardXP
        : 0);

    setDailyBonus(
      receivedDailyBonus,
    );

    setEarnedXP(
      totalXP,
    );

    setGameState(
      "finished",
    );

    /*
     * Record only the normal game XP.
     *
     * The Daily Challenge reward is
     * handled separately.
     */
    recordGame(
      finalScore,
      gameXP,
    );

    /*
     * Sequence Master has a
     * game-specific achievement.
     */
    unlockGameAchievement(
      "sequence-master",
    );
  }

  function restartGame() {
    startGame();
  }

  function changeDifficulty(
    nextDifficulty: Difficulty,
  ) {
    /*
     * Daily Challenge difficulty is locked.
     */
    if (dailyMode) {
      return;
    }

    if (
      gameState !== "idle"
    ) {
      return;
    }

    setDifficulty(
      nextDifficulty,
    );
  }

  return (
    <GameShell
      category="MEMORY"
      icon="🔁"
      title="Sequence Master"
      description="Watch the pattern. Rebuild it in the right order."
    >
      <div className="mx-auto w-full max-w-5xl">

        {/* ========================================
            IDLE
        ======================================== */}

        {gameState === "idle" && (
          <div className="space-y-5">

            <div className="rounded-4xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20 sm:p-8">
              <div className="mx-auto max-w-2xl text-center">

                <div className="mb-5 text-5xl">
                  🧠
                </div>

                <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                  Remember the{" "}
                  <span className="bg-linear-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
                    order.
                  </span>
                </h2>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/55 sm:text-base">
                  Watch each symbol appear
                  in sequence, then tap the
                  symbols in exactly the same
                  order.
                </p>

                <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    {
                      icon: "👀",
                      title: "Watch",
                      text: "Follow the sequence",
                    },
                    {
                      icon: "🧠",
                      title: "Remember",
                      text: "Hold the order",
                    },
                    {
                      icon: "👆",
                      title: "Rebuild",
                      text: "Tap it back",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/8 bg-white/2.5 p-3 sm:p-4"
                    >
                      <div className="text-xl sm:text-2xl">
                        {item.icon}
                      </div>

                      <div className="mt-2 text-xs font-bold text-white sm:text-sm">
                        {item.title}
                      </div>

                      <div className="mt-1 text-[10px] leading-4 text-white/40 sm:text-xs">
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            <div className="rounded-4xl border border-white/10 bg-white/2.5 p-5 sm:p-6">

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    Difficulty
                  </p>

                  <p className="mt-1 text-sm font-bold text-white/75">
                    {dailyMode
                      ? "Daily difficulty is locked."
                      : "Choose your pace."}
                  </p>
                </div>

                <span className="text-xl">
                  {settings.icon}
                </span>
              </div>

              {dailyMode && (
                <div className="mb-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/6 px-4 py-3 text-center text-sm font-bold text-cyan-200">
                  🌟 Daily Challenge ·{" "}
                  <span className="capitalize">
                    {difficulty}
                  </span>{" "}
                  🔒
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">

                {(
                  Object.keys(
                    DIFFICULTIES,
                  ) as Difficulty[]
                ).map((level) => {
                  const active =
                    difficulty ===
                    level;

                  return (
                    <button
                      key={level}
                      type="button"
                      disabled={
                        dailyMode
                      }
                      onClick={() =>
                        changeDifficulty(
                          level,
                        )
                      }
                      className={`rounded-2xl border px-3 py-3 text-sm font-bold capitalize transition ${
                        active
                          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                          : "border-white/8 bg-white/2.5 text-white/50 hover:bg-white/5 hover:text-white"
                      } ${
                        dailyMode
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      {level}

                      {dailyMode &&
                        active && (
                          <span className="ml-1">
                            🔒
                          </span>
                        )}
                    </button>
                  );
                })}

              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-5 text-xs text-white/40">
                <span>
                  {settings.rounds} rounds
                </span>

                <span>
                  Up to{" "}
                  {settings.maxLength}{" "}
                  symbols
                </span>

                <span>
                  +{settings.xp} XP
                </span>
              </div>

            </div>

            <button
              type="button"
              onClick={startGame}
              className="w-full rounded-2xl bg-white px-6 py-4 text-sm font-black text-black transition hover:scale-[1.01] hover:bg-cyan-100 active:scale-[0.99] sm:text-base"
            >
              {dailyMode
                ? "Start Daily Challenge"
                : "Start Sequence"}
            </button>

          </div>
        )}

        {/* ========================================
            SHOWING
        ======================================== */}

        {gameState === "showing" && (
          <div className="rounded-4xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 sm:p-8">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                  Round {round}
                </p>

                <p className="mt-1 text-sm font-bold text-white/75">
                  Watch carefully.
                </p>
              </div>

              <div className="flex items-center gap-2">

                {dailyMode && (
                  <div className="rounded-full border border-cyan-300/15 bg-cyan-300/6 px-3 py-1.5 text-xs font-bold text-cyan-200">
                    Daily 🔒
                  </div>
                )}

                <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-bold text-white/50">
                  {sequence.length}{" "}
                  symbols
                </div>

              </div>

            </div>

            <div className="mt-10 flex min-h-55 items-center justify-center">

              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">

                {sequence.map(
                  (
                    item,
                    index,
                  ) => {
                    const visible =
                      index <=
                      showingIndex;

                    const current =
                      index ===
                      showingIndex;

                    return (
                      <div
                        key={`${item.id}-${index}`}
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-xl font-black transition-all duration-300 sm:h-20 sm:w-20 sm:text-3xl ${
                          visible
                            ? current
                              ? "scale-110 border-cyan-300/50 bg-cyan-300/10 text-cyan-200 shadow-lg shadow-cyan-400/10"
                              : "border-white/15 bg-white/6 text-white"
                            : "border-white/5 bg-white/1.5 text-transparent"
                        }`}
                      >
                        {visible
                          ? item.symbol
                          : "•"}
                      </div>
                    );
                  },
                )}

              </div>

            </div>

            <div className="mt-5 text-center text-xs font-bold uppercase tracking-[0.18em] text-white/30">
              Memorize the order
            </div>

          </div>
        )}

        {/* ========================================
            INPUT
        ======================================== */}

        {gameState === "input" && (
          <div className="space-y-5">

            <div className="rounded-4xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 sm:p-8">

              <div className="text-center">

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                  Round {round}
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] sm:text-4xl">
                  Rebuild the
                  sequence.
                </h2>

                <p className="mt-2 text-sm text-white/45">
                  Tap each symbol in the
                  order you saw it.
                </p>

              </div>

              <div className="mt-8">

                <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                  Your sequence
                </p>

                <div className="flex min-h-16 flex-wrap justify-center gap-2 rounded-2xl border border-white/8 bg-black/20 p-3">

                  {sequence.map(
                    (_, index) => {
                      const selected =
                        playerSequence[
                          index
                        ];

                      return (
                        <div
                          key={index}
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg font-black transition sm:h-14 sm:w-14 sm:text-2xl ${
                            selected
                              ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-200"
                              : "border-white/8 bg-white/2.5 text-white/15"
                          }`}
                        >
                          {selected
                            ? selected.symbol
                            : "?"}
                        </div>
                      );
                    },
                  )}

                </div>

              </div>

              <div className="mx-auto mt-8 grid max-w-xl grid-cols-5 gap-2 sm:gap-3">

                {SYMBOLS.map(
                  (item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        handleSymbolClick(
                          item,
                        )
                      }
                      className="flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-white/4 text-2xl font-black text-white transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-300/8 hover:text-cyan-200 active:scale-95 sm:text-3xl"
                    >
                      {item.symbol}
                    </button>
                  ),
                )}

              </div>

              <div className="mt-6 text-center text-xs text-white/30">
                {playerSequence.length}{" "}
                / {sequence.length}
              </div>

            </div>

          </div>
        )}

        {/* ========================================
            RESULT
        ======================================== */}

        {gameState === "result" && (
          <div className="rounded-4xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 sm:p-8">

            <div className="text-center">

              <div className="text-5xl">
                {selectedWrong
                  ? "✕"
                  : "✓"}
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-5xl">
                {selectedWrong
                  ? "Not quite."
                  : "Perfect."}
              </h2>

              <p className="mt-2 text-sm text-white/45">
                {selectedWrong
                  ? "One symbol was out of order."
                  : "You rebuilt the sequence correctly."}
              </p>

            </div>

            <div className="mt-8 space-y-4">

              <div>

                <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                  Correct sequence
                </p>

                <div className="flex flex-wrap justify-center gap-2">

                  {sequence.map(
                    (
                      item,
                      index,
                    ) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl font-black text-white sm:h-14 sm:w-14 sm:text-2xl"
                      >
                        {item.symbol}
                      </div>
                    ),
                  )}

                </div>

              </div>

              {playerSequence.length >
                0 && (
                <div>

                  <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                    Your answer
                  </p>

                  <div className="flex flex-wrap justify-center gap-2">

                    {playerSequence.map(
                      (
                        item,
                        index,
                      ) => (
                        <div
                          key={`${item.id}-${index}`}
                          className="flex h-12 w-12 items-center justify-center rounded-xl border border-fuchsia-300/15 bg-fuchsia-300/6 text-xl font-black text-fuchsia-200 sm:h-14 sm:w-14 sm:text-2xl"
                        >
                          {item.symbol}
                        </div>
                      ),
                    )}

                  </div>

                </div>
              )}

            </div>

            <div className="mt-8 flex items-center justify-between rounded-2xl border border-white/8 bg-white/2.5 px-4 py-4">

              <span className="text-sm text-white/45">
                Round score
              </span>

              <span className="text-lg font-black text-cyan-200">
                +{roundScore}
              </span>

            </div>

            <button
              type="button"
              onClick={
                continueGame
              }
              className="mt-4 w-full rounded-2xl bg-white px-6 py-4 text-sm font-black text-black transition hover:bg-cyan-100 active:scale-[0.99]"
            >
              {round >=
              settings.rounds
                ? "See Results"
                : "Next Round"}
            </button>

          </div>
        )}

        {/* ========================================
            FINISHED
        ======================================== */}

        {gameState === "finished" && (
          <div className="space-y-5">

            <div className="rounded-4xl border border-white/10 bg-white/[0.035] p-6 text-center shadow-2xl shadow-black/20 sm:p-10">

              <div className="text-5xl">
                🧠
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                Sequence complete
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tighter sm:text-6xl">
                {score}

                <span className="ml-2 text-lg text-white/30 sm:text-xl">
                  points
                </span>
              </h2>

              <div className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">

                <Stat
                  label="Correct"
                  value={`${correctCount}/${settings.rounds}`}
                />

                <Stat
                  label="Best streak"
                  value={bestStreak}
                />

                <Stat
                  label="Longest"
                  value={longestSequence}
                />

                <Stat
                  label="XP earned"
                  value={`+${earnedXP}`}
                />

              </div>

              {dailyBonus && (
                <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-cyan-300/15 bg-cyan-300/6 px-4 py-3 text-sm font-bold text-cyan-200">
                  ✦ Daily Challenge
                  complete

                  <span className="ml-2 text-cyan-200/60">
                    +{DAILY_CHALLENGE_BONUS_POINTS} score · +
                    {dailyChallenge.rewardXP} XP
                  </span>
                </div>
              )}

            </div>

            <div className="grid gap-2 sm:grid-cols-2">

              <button
                type="button"
                onClick={
                  restartGame
                }
                className="rounded-2xl bg-white px-6 py-4 text-sm font-black text-black transition hover:bg-cyan-100 active:scale-[0.99]"
              >
                {dailyMode
                  ? "Play Daily Again"
                  : "Play Again"}
              </button>

              <Link
                href="/games"
                className="rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-4 text-center text-sm font-bold text-white/70 transition hover:bg-white/6 hover:text-white"
              >
                Back to Games
              </Link>

            </div>

          </div>
        )}

      </div>
    </GameShell>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/2.5 p-4">

      <div className="text-xl font-black text-white">
        {value}
      </div>

      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/30">
        {label}
      </div>

    </div>
  );
}