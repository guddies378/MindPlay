"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { recordGame } from "@/lib/progress";
import {
  completeDailyChallenge,
  DAILY_CHALLENGE_BONUS_POINTS,
  getDailyChallenge,
} from "@/lib/dailyChallenge";
import { unlockGameAchievement } from "@/lib/achievements";

type Difficulty = "easy" | "normal" | "hard";

type GameState =
  | "idle"
  | "showing"
  | "input"
  | "result"
  | "finished";

const DIFFICULTIES = {
  easy: {
    label: "Easy",
    description: "Start with short numbers",
    startingLength: 3,
    maxLength: 9,
    rounds: 8,
    displayTime: 2200,
    xp: 20,
    icon: "🌱",
  },

  normal: {
    label: "Normal",
    description: "Your memory gets tested",
    startingLength: 4,
    maxLength: 12,
    rounds: 9,
    displayTime: 1900,
    xp: 35,
    icon: "⚡",
  },

  hard: {
    label: "Hard",
    description: "For serious brain power",
    startingLength: 5,
    maxLength: 15,
    rounds: 10,
    displayTime: 1600,
    xp: 50,
    icon: "🔥",
  },
} as const;

function generateNumber(length: number) {
  let result = String(
    Math.floor(Math.random() * 9) + 1
  );

  for (let i = 1; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }

  return result;
}

function getRoundScore(
  correct: boolean,
  length: number
) {
  if (!correct) {
    return 0;
  }

  return length * 10;
}

export default function NumberMemoryPage() {
  const dailyChallenge = getDailyChallenge();

  const isDailyChallenge =
    dailyChallenge.game ===
    "number-memory";

  const [difficulty, setDifficulty] =
    useState<Difficulty>(() => {
      if (
        typeof window === "undefined" ||
        dailyChallenge.game !==
          "number-memory"
      ) {
        return "normal";
      }

      const params =
        new URLSearchParams(
          window.location.search
        );

      const dailyMode =
        params.get("daily") ===
        "true";

      const urlDifficulty =
        params.get("difficulty");

      const validDifficulty =
        urlDifficulty === "easy" ||
        urlDifficulty === "normal" ||
        urlDifficulty === "hard";

      if (
        dailyMode &&
        validDifficulty &&
        urlDifficulty ===
          dailyChallenge.difficulty
      ) {
        return dailyChallenge.difficulty;
      }

      return "normal";
    });

  const [gameState, setGameState] =
    useState<GameState>("idle");

  const [round, setRound] = useState(0);

  const [currentNumber, setCurrentNumber] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [score, setScore] =
    useState(0);

  const [correct, setCorrect] =
    useState(0);

  const [streak, setStreak] =
    useState(0);

  const [bestStreak, setBestStreak] =
    useState(0);

  const [longestNumber, setLongestNumber] =
    useState(0);

  const [xpEarned, setXpEarned] =
    useState(0);

  const [dailyBonusEarned, setDailyBonusEarned] =
    useState(false);

  const [lastCorrect, setLastCorrect] =
    useState<boolean | null>(null);

  const [showCountdown, setShowCountdown] =
    useState(false);

  const [countdown, setCountdown] =
    useState(0);

  const timeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const countdownRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  const inputRef =
    useRef<HTMLInputElement | null>(null);

  /*
   * Prevent finishGame() from running more than
   * once for the same game.
   *
   * This protects against both:
   * - the automatic final-round timeout
   * - the "See Results" button calling finishGame()
   */
  const finishedRef =
    useRef(false);

  const config =
    DIFFICULTIES[difficulty];

  function clearTimers() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);

      timeoutRef.current = null;
    }

    if (countdownRef.current) {
      clearInterval(
        countdownRef.current
      );

      countdownRef.current = null;
    }
  }

  function getNumberLength(
    nextRound: number
  ) {
    return Math.min(
      config.startingLength +
        Math.floor(
          (nextRound - 1) / 2
        ),
      config.maxLength
    );
  }

  function startRound(
    nextRound: number
  ) {
    clearTimers();

    const length =
      getNumberLength(nextRound);

    const number =
      generateNumber(length);

    setRound(nextRound);
    setCurrentNumber(number);
    setAnswer("");
    setLastCorrect(null);
    setGameState("showing");
    setShowCountdown(true);

    setCountdown(
      Math.ceil(
        config.displayTime / 1000
      )
    );

    let secondsLeft =
      Math.ceil(
        config.displayTime / 1000
      );

    countdownRef.current =
      setInterval(() => {
        secondsLeft -= 1;

        setCountdown(
          Math.max(
            secondsLeft,
            0
          )
        );

        if (secondsLeft <= 0) {
          if (countdownRef.current) {
            clearInterval(
              countdownRef.current
            );

            countdownRef.current =
              null;
          }
        }
      }, 1000);

    timeoutRef.current =
      setTimeout(() => {
        setShowCountdown(false);
        setGameState("input");

        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }, config.displayTime);
  }

  function startGame() {
    clearTimers();

    /*
     * Allow finishGame() again for the new game.
     */
    finishedRef.current = false;

    setRound(0);
    setScore(0);
    setCorrect(0);
    setStreak(0);
    setBestStreak(0);
    setLongestNumber(0);
    setXpEarned(0);
    setDailyBonusEarned(false);
    setCurrentNumber("");
    setAnswer("");
    setLastCorrect(null);
    setShowCountdown(false);

    startRound(1);
  }

  function finishGame(
    finalScore: number
  ) {
    /*
     * Safety guard:
     *
     * If the game has already been finished,
     * do absolutely nothing.
     *
     * This prevents duplicate:
     * - progress records
     * - XP
     * - achievement unlock attempts
     * - Daily Challenge processing
     */
    if (finishedRef.current) {
      return;
    }

    finishedRef.current = true;

    clearTimers();

    const dailyCompleted =
      isDailyChallenge &&
      completeDailyChallenge(
        "number-memory"
      );

    const finalScoreWithDailyBonus =
      finalScore +
      (dailyCompleted
        ? DAILY_CHALLENGE_BONUS_POINTS
        : 0);

    const scoreBonus =
      Math.min(
        40,
        Math.floor(
          finalScoreWithDailyBonus / 50
        )
      );

    const streakBonus =
      bestStreak >= 5
        ? 20
        : bestStreak >= 3
          ? 10
          : 0;

    const baseTotalXP =
      config.xp +
      scoreBonus +
      streakBonus;

    const displayedXP =
      baseTotalXP +
      (dailyCompleted
        ? 50
        : 0);

    setScore(
      finalScoreWithDailyBonus
    );

    setXpEarned(
      displayedXP
    );

    setDailyBonusEarned(
      dailyCompleted
    );

    setGameState("finished");

    recordGame(
      finalScoreWithDailyBonus,
      baseTotalXP
    );

    unlockGameAchievement(
      "number-vault"
    );
  }

  function submitAnswer() {
    if (gameState !== "input") {
      return;
    }

    const isCorrect =
      answer === currentNumber;

    const length =
      currentNumber.length;

    const roundScore =
      getRoundScore(
        isCorrect,
        length
      );

    const nextScore =
      score + roundScore;

    setLastCorrect(
      isCorrect
    );

    if (isCorrect) {
      const nextStreak =
        streak + 1;

      setCorrect(
        (value) => value + 1
      );

      setStreak(
        nextStreak
      );

      if (
        nextStreak >
        bestStreak
      ) {
        setBestStreak(
          nextStreak
        );
      }

      if (
        length >
        longestNumber
      ) {
        setLongestNumber(
          length
        );
      }

      setScore(
        nextScore
      );
    } else {
      setStreak(0);
    }

    setGameState("result");

    if (
      round >=
      config.rounds
    ) {
      const finalScore =
        isCorrect
          ? nextScore
          : score;

      timeoutRef.current =
        setTimeout(() => {
          finishGame(
            finalScore
          );
        }, 700);
    }
  }

  function continueGame() {
    if (
      round >=
      config.rounds
    ) {
      /*
       * finishGame() is protected by finishedRef,
       * so even if the automatic timeout is still
       * pending, this cannot finish the game twice.
       */
      finishGame(score);

      return;
    }

    startRound(
      round + 1
    );
  }

  function handleInputKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key ===
      "Enter"
    ) {
      submitAnswer();
    }
  }

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const progress =
    config.rounds > 0
      ? Math.min(
          100,
          (round /
            config.rounds) *
            100
        )
      : 0;

  const currentLength =
    currentNumber.length ||
    getNumberLength(
      Math.max(
        round,
        1
      )
    );

  return (
    <main className="min-h-screen overflow-hidden px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <header className="mb-8 flex items-center justify-between gap-3">
          <Link
            href="/games"
            className="group flex items-center gap-2 text-sm font-bold text-white/40 transition hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>

            Back to Arcade
          </Link>

          <div className="flex items-center gap-2">
            <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/35">
              Memory Game
            </div>

            {isDailyChallenge && (
              <div className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-yellow-300">
                Daily Challenge
              </div>
            )}
          </div>
        </header>

        {/* Title */}

        <section className="mp-fade-up mb-8 text-center">
          <div className="mb-3 text-5xl">
            🔢
          </div>

          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300/60">
            Number Memory
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            Remember everything.
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/40">
            Memorize the number before it disappears.
            Every few rounds, it gets longer.
          </p>
        </section>

        {/* Difficulty */}

        {gameState === "idle" && (
          <section className="mp-fade-up mb-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wider text-white/30">
                Select difficulty
              </p>

              <p className="text-xs font-bold text-white/20">
                Longer numbers = more points
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(
                Object.keys(
                  DIFFICULTIES
                ) as Difficulty[]
              ).map(
                (level) => {
                  const item =
                    DIFFICULTIES[
                      level
                    ];

                  const selected =
                    difficulty ===
                    level;

                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        setDifficulty(
                          level
                        )
                      }
                      className={[
                        "rounded-3xl border p-5 text-left transition-all duration-200",
                        selected
                          ? "border-cyan-300/25 bg-cyan-300/[0.07] shadow-lg shadow-cyan-400/5"
                          : "border-white/[0.07] bg-white/2.5 hover:-translate-y-1 hover:border-white/15 hover:bg-white/5",
                      ].join(
                        " "
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-2xl">
                          {item.icon}
                        </span>

                        {selected && (
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-cyan-300">
                            Selected
                          </span>
                        )}
                      </div>

                      <h2 className="mt-4 text-base font-black">
                        {item.label}
                      </h2>

                      <p className="mt-1 text-xs text-white/35">
                        {item.description}
                      </p>

                      <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                        <span className="text-white/25">
                          {item.rounds}{" "}
                          rounds
                        </span>

                        <span className="text-cyan-300">
                          +{item.xp} base XP
                        </span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            {isDailyChallenge && (
              <div className="mt-4 rounded-2xl border border-yellow-300/15 bg-yellow-300/5 p-4 text-center">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300/70">
                  🏆 Daily Challenge
                </p>

                <p className="mt-2 text-sm text-white/50">
                  Today&apos;s challenge is set
                  to{" "}
                  <strong className="capitalize text-yellow-300">
                    {
                      dailyChallenge.difficulty
                    }
                  </strong>{" "}
                  difficulty.
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Complete it for +10 score
                  and +50 XP.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Game Card */}

        <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/[0.035]">
          <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl" />

          <div className="relative p-5 sm:p-8">

            {/* Stats */}

            {gameState !== "idle" &&
              gameState !== "finished" && (
                <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/[0.07] bg-white/2.5 p-3 text-center">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/25">
                      Round
                    </p>

                    <p className="mt-1 text-lg font-black">
                      {round}/
                      {config.rounds}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-white/2.5 p-3 text-center">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/25">
                      Score
                    </p>

                    <p className="mt-1 text-lg font-black text-cyan-300">
                      {score}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-white/2.5 p-3 text-center">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/25">
                      Streak
                    </p>

                    <p className="mt-1 text-lg font-black text-orange-300">
                      🔥 {streak}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-white/2.5 p-3 text-center">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/25">
                      Digits
                    </p>

                    <p className="mt-1 text-lg font-black text-fuchsia-300">
                      {currentLength}
                    </p>
                  </div>
                </div>
              )}

            {/* Progress */}

            {gameState !== "idle" &&
              gameState !== "finished" && (
                <div className="mb-6">
                  <div className="mb-2 flex justify-between text-[9px] font-black uppercase tracking-wider text-white/20">
                    <span>
                      Memory Progress
                    </span>

                    <span>
                      {Math.round(
                        progress
                      )}
                      %
                    </span>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-400 transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>
              )}

            {/* Idle */}

            {gameState === "idle" && (
              <div className="py-10 text-center sm:py-14">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-4xl border border-white/10 bg-white/5 text-5xl shadow-xl">
                  🔢
                </div>

                <h2 className="mt-6 text-2xl font-black">
                  Can you remember it?
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
                  A number will appear for a
                  few seconds. Memorize it, then
                  type it back.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <div className="rounded-full border border-white/10 bg-white/3 px-4 py-2 text-xs font-bold text-white/40">
                    🎯 +10 per digit
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/3 px-4 py-2 text-xs font-bold text-white/40">
                    🔥 Build streaks
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    startGame
                  }
                  className="mp-button mt-8 bg-white px-8 py-4 text-sm text-black shadow-xl shadow-white/10 hover:bg-white/90"
                >
                  Start Number Memory

                  <span className="ml-2">
                    →
                  </span>
                </button>
              </div>
            )}

            {/* Showing Number */}

            {gameState === "showing" && (
              <div className="flex min-h-95 flex-col items-center justify-center text-center sm:min-h-107.5">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300/60">
                  Memorize this
                </p>

                <div className="mt-8 rounded-4xl border border-cyan-300/15 bg-cyan-300/4 px-6 py-8 shadow-2xl shadow-cyan-400/5 sm:px-12">
                  <p className="select-none break-all font-mono text-4xl font-black tracking-[0.12em] text-white sm:text-6xl">
                    {currentNumber}
                  </p>
                </div>

                {showCountdown && (
                  <div className="mt-8">
                    <div className="text-4xl font-black text-cyan-300">
                      {countdown}
                    </div>

                    <p className="mt-1 text-xs font-bold text-white/25">
                      seconds
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Input */}

            {gameState === "input" && (
              <div className="flex min-h-95 flex-col items-center justify-center text-center sm:min-h-107.5">
                <div className="text-6xl">
                  🧠
                </div>

                <h2 className="mt-5 text-3xl font-black">
                  What was the number?
                </h2>

                <p className="mt-2 text-sm text-white/35">
                  {currentLength} digits
                </p>

                <div className="mt-8 w-full max-w-md">
                  <input
                    ref={
                      inputRef
                    }
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={
                      currentLength
                    }
                    value={answer}
                    onChange={(
                      event
                    ) => {
                      const value =
                        event.target.value.replace(
                          /\D/g,
                          ""
                        );

                      setAnswer(
                        value
                      );
                    }}
                    onKeyDown={
                      handleInputKeyDown
                    }
                    placeholder="Type the number..."
                    className="w-full rounded-3xl border border-white/10 bg-white/5 px-5 py-5 text-center font-mono text-2xl font-black tracking-[0.15em] text-white outline-none transition placeholder:text-white/15 focus:border-cyan-300/30 focus:bg-white/[0.07]"
                    autoComplete="off"
                  />

                  <button
                    type="button"
                    onClick={
                      submitAnswer
                    }
                    disabled={
                      answer.length ===
                      0
                    }
                    className="mp-button mt-4 w-full bg-white px-8 py-4 text-sm text-black shadow-xl shadow-white/10 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Check Answer

                    <span className="ml-2">
                      →
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Result */}

            {gameState === "result" && (
              <div className="py-10 text-center sm:py-14">
                {lastCorrect ? (
                  <>
                    <div className="mp-float text-7xl">
                      🎯
                    </div>

                    <p className="mt-5 text-3xl font-black text-emerald-300">
                      PERFECT!
                    </p>

                    <p className="mt-2 text-sm font-bold text-white/35">
                      Your memory is getting
                      stronger.
                    </p>

                    <div className="mx-auto mt-7 max-w-md rounded-3xl border border-emerald-300/10 bg-emerald-300/4 p-6">
                      <p className="text-xs font-black uppercase tracking-wider text-white/25">
                        Correct number
                      </p>

                      <p className="mt-3 break-all font-mono text-2xl font-black tracking-wider text-white">
                        {currentNumber}
                      </p>

                      <div className="mt-5 border-t border-white/6 pt-5">
                        <p className="text-xs font-bold text-white/30">
                          Round score
                        </p>

                        <p className="mt-1 text-3xl font-black text-cyan-300">
                          +
                          {getRoundScore(
                            true,
                            currentNumber.length
                          )}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-7xl">
                      💥
                    </div>

                    <p className="mt-5 text-3xl font-black text-orange-300">
                      NOT QUITE!
                    </p>

                    <p className="mt-2 text-sm font-bold text-white/35">
                      Your brain got ambushed.
                    </p>

                    <div className="mx-auto mt-7 max-w-md rounded-3xl border border-white/[0.07] bg-white/2.5 p-6">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-white/25">
                          Correct number
                        </p>

                        <p className="mt-2 break-all font-mono text-xl font-black tracking-wider text-emerald-300">
                          {currentNumber}
                        </p>
                      </div>

                      <div className="mt-5 border-t border-white/6 pt-5">
                        <p className="text-xs font-black uppercase tracking-wider text-white/25">
                          Your answer
                        </p>

                        <p className="mt-2 break-all font-mono text-xl font-black tracking-wider text-orange-300">
                          {answer ||
                            "No answer"}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={
                    continueGame
                  }
                  className="mp-button mt-8 bg-white px-8 py-4 text-sm text-black shadow-xl shadow-white/10 hover:bg-white/90"
                >
                  {round >=
                  config.rounds
                    ? "See Results"
                    : "Next Number"}

                  <span className="ml-2">
                    →
                  </span>
                </button>
              </div>
            )}

            {/* Final Results */}

            {gameState ===
              "finished" && (
              <div className="py-8 text-center sm:py-12">
                <div className="mp-float text-7xl">
                  🏆
                </div>

                <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-cyan-300/60">
                  {dailyBonusEarned
                    ? "Daily Challenge Complete"
                    : "Challenge Complete"}
                </p>

                <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                  Memory test complete!
                </h2>

                {dailyBonusEarned && (
                  <div className="mx-auto mt-5 max-w-md rounded-2xl border border-yellow-300/15 bg-yellow-300/5 p-4">
                    <p className="text-sm font-black text-yellow-300">
                      🏆 Daily Challenge
                      Bonus
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      +10 score · +50 XP
                    </p>
                  </div>
                )}

                <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-3xl border border-white/[0.07] bg-white/2.5 p-5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/25">
                      Score
                    </p>

                    <p className="mt-2 text-2xl font-black text-cyan-300">
                      {score}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/[0.07] bg-white/2.5 p-5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/25">
                      Correct
                    </p>

                    <p className="mt-2 text-2xl font-black text-emerald-300">
                      {correct}/
                      {config.rounds}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/[0.07] bg-white/2.5 p-5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/25">
                      Best Streak
                    </p>

                    <p className="mt-2 text-2xl font-black text-orange-300">
                      🔥 {bestStreak}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-emerald-300/10 bg-emerald-300/4 p-5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/25">
                      XP Earned
                    </p>

                    <p className="mt-2 text-2xl font-black text-emerald-300">
                      +{xpEarned}
                    </p>
                  </div>
                </div>

                <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-white/[0.07] bg-white/2.5 p-5 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-white/25">
                        Memory Record
                      </p>

                      <p className="mt-1 text-sm font-bold text-white/60">
                        Longest number remembered:{" "}
                        <span className="text-cyan-300">
                          {longestNumber}{" "}
                          digits
                        </span>
                      </p>
                    </div>

                    <span className="text-3xl">
                      🧠
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={
                      startGame
                    }
                    className="mp-button bg-white px-8 py-4 text-sm text-black shadow-xl shadow-white/10 hover:bg-white/90"
                  >
                    Play Again

                    <span className="ml-2">
                      ↻
                    </span>
                  </button>

                  <Link
                    href="/games"
                    className="mp-button border border-white/10 bg-white/4 px-8 py-4 text-sm text-white/70 hover:bg-white/[0.07]"
                  >
                    Back to Arcade
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Tips */}

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/[0.07] bg-white/2.5 p-5">
            <div className="text-xl">
              🧩
            </div>

            <h3 className="mt-3 text-sm font-black">
              Chunk it
            </h3>

            <p className="mt-1 text-xs leading-5 text-white/30">
              Group digits together instead of
              remembering them one by one.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-white/2.5 p-5">
            <div className="text-xl">
              👀
            </div>

            <h3 className="mt-3 text-sm font-black">
              Stay focused
            </h3>

            <p className="mt-1 text-xs leading-5 text-white/30">
              Avoid distractions while the
              number is visible.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-white/2.5 p-5">
            <div className="text-xl">
              🔥
            </div>

            <h3 className="mt-3 text-sm font-black">
              Build a streak
            </h3>

            <p className="mt-1 text-xs leading-5 text-white/30">
              Consecutive correct answers show
              how far your memory can go.
            </p>
          </div>
        </section>

        <footer className="mt-10 pb-4 text-center text-xs text-white/20">
          MindPlay · Train your brain. Have fun.
        </footer>
      </div>
    </main>
  );
}