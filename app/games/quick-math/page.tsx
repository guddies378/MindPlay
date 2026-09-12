"use client";

import { useEffect, useState } from "react";

import GameShell from "@/components/GameShell";
import { recordGame } from "@/lib/progress";
import { unlockGameAchievement } from "@/lib/achievements";
import {
  completeDailyChallenge,
  DAILY_CHALLENGE_BONUS_POINTS,
  getDailyChallenge,
} from "@/lib/dailyChallenge";

type Difficulty = "easy" | "normal" | "hard";

type Question = {
  a: number;
  b: number;
  operator: "+" | "-" | "×" | "÷";
  answer: number;
};

const DIFFICULTIES: Record<
  Difficulty,
  {
    label: string;
    description: string;
    maxNumber: number;
    operations: Question["operator"][];
    xp: number;
    time: number;
  }
> = {
  easy: {
    label: "Easy",
    description:
      "Warm up with quick addition and subtraction.",
    maxNumber: 10,
    operations: ["+", "-"],
    xp: 20,
    time: 30,
  },

  normal: {
    label: "Normal",
    description:
      "Mix things up with multiplication.",
    maxNumber: 20,
    operations: ["+", "-", "×"],
    xp: 35,
    time: 45,
  },

  hard: {
    label: "Hard",
    description:
      "Fast calculations with every operation.",
    maxNumber: 50,
    operations: ["+", "-", "×", "÷"],
    xp: 50,
    time: 60,
  },
};

function randomNumber(max: number) {
  return Math.floor(Math.random() * max) + 1;
}

function createQuestion(
  difficulty: Difficulty,
): Question {
  const settings =
    DIFFICULTIES[difficulty];

  const operator =
    settings.operations[
      Math.floor(
        Math.random() *
          settings.operations.length,
      )
    ];

  let a = randomNumber(
    settings.maxNumber,
  );

  let b = randomNumber(
    settings.maxNumber,
  );

  if (operator === "-") {
    if (b > a) {
      [a, b] = [b, a];
    }
  }

  if (operator === "÷") {
    b = randomNumber(
      Math.max(
        2,
        Math.floor(
          settings.maxNumber / 2,
        ),
      ),
    );

    const answer = randomNumber(
      Math.max(
        2,
        Math.floor(
          settings.maxNumber / b,
        ),
      ),
    );

    a = b * answer;

    return {
      a,
      b,
      operator,
      answer,
    };
  }

  let answer = 0;

  switch (operator) {
    case "+":
      answer = a + b;
      break;

    case "-":
      answer = a - b;
      break;

    case "×":
      answer = a * b;
      break;
  }

  return {
    a,
    b,
    operator,
    answer,
  };
}

export default function QuickMathPage() {
  /*
   * Daily Challenge
   *
   * The daily challenge is determined from
   * the current date. We only activate daily
   * mode when the URL explicitly contains:
   *
   * ?daily=true&difficulty=easy|normal|hard
   */
  const dailyChallenge = getDailyChallenge();

  const [dailyMode, setDailyMode] =
    useState(false);

  const [difficulty, setDifficulty] =
    useState<Difficulty>("normal");

  const [question, setQuestion] =
    useState<Question>(() =>
      createQuestion("normal"),
    );

  const [answer, setAnswer] =
    useState("");

  const [score, setScore] =
    useState(0);

  const [correct, setCorrect] =
    useState(0);

  const [wrong, setWrong] =
    useState(0);

  const [timeLeft, setTimeLeft] =
    useState(
      DIFFICULTIES.normal.time,
    );

  const [started, setStarted] =
    useState(false);

  const [gameOver, setGameOver] =
    useState(false);

  const [feedback, setFeedback] =
    useState<
      "correct" | "wrong" | null
    >(null);

  const [xpEarned, setXpEarned] =
    useState(0);

  /*
   * Detect Daily Challenge mode.
   *
   * We do this after the component mounts
   * so normal gameplay and server rendering
   * remain unchanged.
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

    const matchesDailyChallenge =
      urlDaily &&
      validDifficulty &&
      urlDifficulty ===
        dailyChallenge.difficulty &&
      dailyChallenge.game ===
        "quick-math";

    if (matchesDailyChallenge) {
      const dailyDifficulty =
        dailyChallenge.difficulty;

      const dailyTimer = setTimeout(() => {
        setDailyMode(true);
        setDifficulty(dailyDifficulty);
      }, 0);

      return () => clearTimeout(dailyTimer);
    }
  }, [dailyChallenge.game, dailyChallenge.difficulty]);

  const startGame = () => {
    const activeDifficulty =
      dailyMode &&
      dailyChallenge.game === "quick-math"
        ? dailyChallenge.difficulty
        : difficulty;

    setDifficulty(activeDifficulty);

    setQuestion(
      createQuestion(activeDifficulty),
    );

    setAnswer("");
    setScore(0);
    setCorrect(0);
    setWrong(0);

    setTimeLeft(
      DIFFICULTIES[activeDifficulty].time,
    );

    setStarted(true);
    setGameOver(false);
    setFeedback(null);
    setXpEarned(0);
  };

  /*
   * Countdown timer.
   */
  useEffect(() => {
    if (
      !started ||
      gameOver ||
      timeLeft <= 0
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(
        (previous) =>
          previous - 1,
      );
    }, 1000);

    return () =>
      clearTimeout(timer);
  }, [
    started,
    gameOver,
    timeLeft,
  ]);

  /*
   * Finish the game when the timer
   * reaches zero.
   */
  useEffect(() => {
    if (
      !started ||
      gameOver ||
      timeLeft > 0
    ) {
      return;
    }

    const finishTimer = setTimeout(async () => {
      setGameOver(true);
      setStarted(false);

      const dailyCompleted =
        dailyMode &&
        dailyChallenge.game === "quick-math"
          ? await completeDailyChallenge("quick-math")
          : false;

      const finalScore =
        score +
        (dailyCompleted
          ? DAILY_CHALLENGE_BONUS_POINTS
          : 0);

      const baseXP =
        DIFFICULTIES[difficulty].xp;

      const scoreBonus = Math.min(
        30,
        Math.floor(finalScore / 10),
      );

      const baseTotalXP =
        baseXP + scoreBonus;

      const displayedXP =
        baseTotalXP +
        (dailyCompleted
          ? dailyChallenge.rewardXP
          : 0);

      setScore(finalScore);
      setXpEarned(displayedXP);

      recordGame(
        finalScore,
        baseTotalXP,
      );

      unlockGameAchievement(
        "math-machine",
      );
    }, 0);

    return () =>
      clearTimeout(finishTimer);
  }, [
    started,
    gameOver,
    timeLeft,
    difficulty,
    score,
    dailyMode,
    dailyChallenge.game,
    dailyChallenge.rewardXP,
  ]);

  const submitAnswer = () => {
    if (
      !started ||
      gameOver ||
      answer.trim() === ""
    ) {
      return;
    }

    const numericAnswer =
      Number(answer);

    if (
      numericAnswer ===
      question.answer
    ) {
      setScore(
        (previous) =>
          previous + 10,
      );

      setCorrect(
        (previous) =>
          previous + 1,
      );

      setFeedback("correct");
      setAnswer("");

      setTimeout(() => {
        setQuestion(
          createQuestion(
            difficulty,
          ),
        );

        setFeedback(null);
      }, 350);
    } else {
      setWrong(
        (previous) =>
          previous + 1,
      );

      setFeedback("wrong");
      setAnswer("");

      setTimeout(() => {
        setFeedback(null);
      }, 350);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      submitAnswer();
    }
  };

  const timePercentage =
    (timeLeft /
      DIFFICULTIES[difficulty].time) *
    100;

  return (
    <GameShell
      icon="⚡"
      category="Speed Challenge"
      title="Quick"
      highlightedTitle="Math"
      description={`Solve as many equations as you can before the ${DIFFICULTIES[difficulty].time}-second countdown ends.`}
      maxWidth="lg"
    >
      <div className="mt-5 space-y-4 sm:mt-8 sm:space-y-6">
        {/* Difficulty */}
        <section className="mp-fade-up">
          <div className="mb-2 flex items-end justify-between px-1 sm:mb-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 sm:text-[10px]">
                Difficulty
              </p>

              <p className="mt-1 text-xs font-semibold text-white/65 sm:text-sm">
                {dailyMode
                  ? "Today&apos;s challenge."
                  : "Choose your pace."}
              </p>
            </div>

            <span className="text-[9px] font-medium text-white/45 sm:text-[10px]">
              {dailyMode
                ? "Daily Challenge 🔒"
                : "More risk · more XP"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(
              Object.keys(
                DIFFICULTIES,
              ) as Difficulty[]
            ).map((level) => {
              const selected =
                difficulty === level;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    if (
                      started ||
                      dailyMode
                    ) {
                      return;
                    }

                    setDifficulty(level);

                    setQuestion(
                      createQuestion(
                        level,
                      ),
                    );

                    setTimeLeft(
                      DIFFICULTIES[level]
                        .time,
                    );
                  }}
                  disabled={
                    started ||
                    dailyMode
                  }
                  className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 sm:rounded-3xl sm:p-4 ${
                    selected
                      ? "border-cyan-300/25 bg-white/7.5 shadow-[0_12px_40px_rgba(34,211,238,0.06)]"
                      : "border-white/8 bg-white/2.5 hover:border-white/15 hover:bg-white/4.5"
                  } ${
                    started ||
                    dailyMode
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                >
                  {selected && (
                    <span className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/70 to-transparent" />
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-black sm:text-sm ${
                        selected
                          ? "text-white"
                          : "text-white/55"
                      }`}
                    >
                      {
                        DIFFICULTIES[
                          level
                        ].label
                      }
                    </span>

                    <span
                      className={`text-[9px] font-bold sm:text-[10px] ${
                        selected
                          ? "text-cyan-300/75"
                          : "text-white/45"
                      }`}
                    >
                      +
                      {
                        DIFFICULTIES[
                          level
                        ].xp
                      }{" "}
                      XP
                    </span>
                  </div>

                  <p className="mt-1.5 hidden text-[10px] leading-4 text-white/50 sm:block">
                    {
                      DIFFICULTIES[
                        level
                      ].description
                    }
                  </p>

                  <p className="mt-1.5 text-[9px] font-medium text-white/45 sm:text-[10px]">
                    {
                      DIFFICULTIES[
                        level
                      ].time
                    }
                    s
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/8 bg-white/2.5 sm:rounded-3xl">
          <div className="border-r border-white/6 px-3 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45 sm:text-[9px]">
              Score
            </p>

            <p className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
              {score}
            </p>
          </div>

          <div className="border-r border-white/6 px-3 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45 sm:text-[9px]">
              Correct
            </p>

            <p className="mt-1 text-xl font-black tracking-tight text-cyan-300 sm:text-2xl">
              {correct}
            </p>
          </div>

          <div className="px-3 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45 sm:text-[9px]">
              Wrong
            </p>

            <p className="mt-1 text-xl font-black tracking-tight text-white/65 sm:text-2xl">
              {wrong}
            </p>
          </div>
        </section>

        {/* Timer */}
        <section className="px-1">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/45">
              Time
            </span>

            <span
              className={`text-xs font-black tabular-nums ${
                timeLeft <= 10 &&
                started
                  ? "text-fuchsia-300"
                  : "text-white/60"
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-white/6">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                timeLeft <= 10 &&
                started
                  ? "bg-fuchsia-400"
                  : "bg-cyan-300"
              }`}
              style={{
                width: `${timePercentage}%`,
              }}
            />
          </div>
        </section>

        {/* Main game card */}
        <section
          className={`relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:rounded-4xl ${
            feedback === "correct"
              ? "mp-math-correct"
              : feedback === "wrong"
                ? "mp-math-wrong"
                : ""
          }`}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />

          {/* Start screen */}
          {!started &&
            !gameOver && (
              <div className="px-5 py-10 text-center sm:px-10 sm:py-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/15 bg-cyan-300/6 text-3xl shadow-[0_15px_50px_rgba(34,211,238,0.06)] sm:h-20 sm:w-20 sm:text-4xl">
                  ⚡
                </div>

                <p className="mt-6 text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300/55">
                  {dailyMode
                    ? "Daily Challenge"
                    : "Ready?"}
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
                  {dailyMode
                    ? `${DIFFICULTIES[difficulty].label} mode.`
                    : "Think fast."}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/55 sm:text-sm">
                  {dailyMode
                    ? `Today&apos;s Quick Math challenge is set to ${DIFFICULTIES[difficulty].label}.`
                    : "Answer as many equations as possible before time runs out."}
                </p>

                <button
                  type="button"
                  onClick={startGame}
                  className="mp-button mt-7 rounded-full bg-white px-7 py-3 text-xs font-black text-black shadow-[0_12px_40px_rgba(255,255,255,0.08)] transition-all hover:bg-cyan-100 hover:shadow-[0_15px_45px_rgba(34,211,238,0.12)] sm:mt-9 sm:px-8 sm:py-3.5 sm:text-sm"
                >
                  {dailyMode
                    ? "Start Daily Challenge"
                    : "Start challenge"}
                </button>
              </div>
            )}

          {/* Active game */}
          {started && !gameOver && (
            <div className="px-5 py-7 sm:px-10 sm:py-12">
              <div className="flex min-h-75 flex-col items-center justify-center sm:min-h-87.5">
                <p className="mb-5 text-[9px] font-black uppercase tracking-[0.22em] text-white/45">
                  Solve
                </p>

                <div className="flex items-center justify-center gap-2 text-4xl font-black tracking-tight sm:gap-4 sm:text-6xl">
                  <span>
                    {question.a}
                  </span>

                  <span className="text-cyan-300/70">
                    {question.operator}
                  </span>

                  <span>
                    {question.b}
                  </span>

                  <span className="ml-1 text-white/40 sm:ml-2">
                    =
                  </span>

                  <span className="min-w-13.75 text-white/40 sm:min-w-20">
                    ?
                  </span>
                </div>

                <div className="mt-8 w-full max-w-sm sm:mt-10">
                  <input
                    type="number"
                    inputMode="numeric"
                    autoFocus
                    value={answer}
                    onChange={(event) =>
                      setAnswer(
                        event.target.value,
                      )
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Your answer"
                    className={`h-14 w-full rounded-2xl border bg-black/20 px-5 text-center text-xl font-black text-white outline-none transition-all placeholder:text-white/15 sm:h-16 sm:text-2xl ${
                      feedback ===
                      "correct"
                        ? "border-cyan-300/50 shadow-[0_0_35px_rgba(34,211,238,0.08)]"
                        : feedback ===
                            "wrong"
                          ? "border-fuchsia-300/50 shadow-[0_0_35px_rgba(217,239,239,0.08)]"
                          : "border-white/10 focus:border-cyan-300/35 focus:bg-white/[0.035]"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={
                      submitAnswer
                    }
                    className="mp-button mt-3 h-12 w-full rounded-2xl bg-white text-xs font-black text-black transition-all hover:bg-cyan-100 sm:h-13 sm:text-sm"
                  >
                    Check answer
                  </button>

                  <div className="mt-3 h-5 text-center">
                    {feedback ===
                      "correct" && (
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
                        Correct
                      </span>
                    )}

                    {feedback ===
                      "wrong" && (
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-300">
                        Try the next one
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game over */}
          {gameOver && (
            <div className="px-5 py-10 text-center sm:px-10 sm:py-14">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300/55">
                Time&apos;s up
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                {score} points.
              </h2>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/55 sm:text-sm">
                You answered {correct}{" "}
                correctly and missed{" "}
                {wrong}.
              </p>

              {dailyMode && (
                <div className="mx-auto mt-4 max-w-md rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/5 px-4 py-3 text-xs font-bold text-fuchsia-200/70">
                  🌟 Daily Challenge complete · +{DAILY_CHALLENGE_BONUS_POINTS} score · +{dailyChallenge.rewardXP} XP
                </div>
              )}

              <div className="mx-auto mt-7 grid max-w-sm grid-cols-2 gap-2 sm:mt-9 sm:gap-3">
                <div className="rounded-2xl border border-white/8 bg-white/2.5 px-4 py-4">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45">
                    Accuracy
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {correct + wrong > 0
                      ? Math.round(
                          (correct /
                            (correct +
                              wrong)) *
                            100,
                        )
                      : 0}
                    %
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/2.5 px-4 py-4">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45">
                    XP earned
                  </p>

                  <p className="mt-1 text-xl font-black text-cyan-300">
                    +{xpEarned}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={startGame}
                className="mp-button mt-7 rounded-full bg-white px-7 py-3 text-xs font-black text-black transition-all hover:bg-cyan-100 sm:mt-9 sm:px-8 sm:py-3.5 sm:text-sm"
              >
                Play again
              </button>
            </div>
          )}
        </section>

        {/* Tip */}
        <div className="mp-fade-up rounded-2xl border border-white/6 bg-white/[0.018] px-4 py-3.5 sm:rounded-3xl sm:px-5 sm:py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-sm">
              💡
            </span>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/50">
                Quick tip
              </p>

              <p className="mt-1 text-[10px] leading-4 text-white/55 sm:text-xs">
                Don&apos;t rush the easy ones.
                Accuracy keeps your score
                climbing faster than random
                guesses.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mp-math-correct {
          animation: mathCorrect 0.35s ease-out;
        }

        .mp-math-wrong {
          animation: mathWrong 0.35s ease-out;
        }

        @keyframes mathCorrect {
          0% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.008);
            border-color: rgba(
              103,
              232,
              249,
              0.3
            );
          }

          100% {
            transform: scale(1);
          }
        }

        @keyframes mathWrong {
          0%,
          100% {
            transform: translateX(0);
          }

          25% {
            transform: translateX(-4px);
          }

          75% {
            transform: translateX(4px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mp-math-correct,
          .mp-math-wrong {
            animation: none;
          }
        }
      `}</style>
    </GameShell>
  );
}