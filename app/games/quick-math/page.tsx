"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  recordGame,
  unlockGameAchievement,
} from "@/lib/progress";
import { completeDailyChallenge } from "@/lib/dailyChallenge";
import PlayerFooterText from "@/components/PlayerFooterText";
import PlayerBrand from "@/components/PlayerBrand";

type Difficulty = "easy" | "normal" | "hard";

type Question = {
  a: number;
  b: number;
  operator: "+" | "-" | "×" | "÷";
  answer: number;
};

const DIFFICULTIES = {
  easy: {
    label: "Easy",
    description: "Add & subtract",
    maxNumber: 10,
    operations: ["+", "-"] as const,
    xp: 20,
    time: 30,
  },
  normal: {
    label: "Normal",
    description: "Mixed operations",
    maxNumber: 20,
    operations: ["+", "-", "×"] as const,
    xp: 35,
    time: 45,
  },
  hard: {
    label: "Hard",
    description: "Everything",
    maxNumber: 50,
    operations: ["+", "-", "×", "÷"] as const,
    xp: 50,
    time: 60,
  },
};

function randomNumber(min: number, max: number) {
  return (
    Math.floor(Math.random() * (max - min + 1)) +
    min
  );
}

function createQuestion(
  difficulty: Difficulty
): Question {
  const settings = DIFFICULTIES[difficulty];

  const operator =
    settings.operations[
      Math.floor(
        Math.random() * settings.operations.length
      )
    ];

  let a = randomNumber(1, settings.maxNumber);
  let b = randomNumber(1, settings.maxNumber);

  if (operator === "-") {
    if (b > a) {
      [a, b] = [b, a];
    }

    return {
      a,
      b,
      operator,
      answer: a - b,
    };
  }

  if (operator === "×") {
    return {
      a,
      b,
      operator,
      answer: a * b,
    };
  }

  if (operator === "÷") {
    const divisor = randomNumber(2, 12);
    const answer = randomNumber(1, 12);

    return {
      a: divisor * answer,
      b: divisor,
      operator,
      answer,
    };
  }

  return {
    a,
    b,
    operator,
    answer: a + b,
  };
}

export default function QuickMathPage() {
  const [difficulty, setDifficulty] =
    useState<Difficulty>("normal");

  const [question, setQuestion] =
    useState<Question>(() =>
      createQuestion("normal")
    );

  const [answer, setAnswer] = useState("");

  const [score, setScore] = useState(0);

  const [correct, setCorrect] = useState(0);

  const [wrong, setWrong] = useState(0);

  const [timeLeft, setTimeLeft] = useState(
    DIFFICULTIES.normal.time
  );

  const [started, setStarted] = useState(false);

  const [gameOver, setGameOver] = useState(false);

  const [feedback, setFeedback] = useState<
    "correct" | "wrong" | null
  >(null);

  const [xpEarned, setXpEarned] = useState<
    number | null
  >(null);

  const startGame = (
    selectedDifficulty: Difficulty
  ) => {
    setDifficulty(selectedDifficulty);
    setQuestion(
      createQuestion(selectedDifficulty)
    );
    setAnswer("");
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setTimeLeft(DIFFICULTIES[selectedDifficulty].time);
    setStarted(true);
    setGameOver(false);
    setFeedback(null);
    setXpEarned(null);
  };

  /*
   * Timer
   */
  useEffect(() => {
    if (!started || gameOver) {
      return;
    }

    if (timeLeft <= 0) {
      setGameOver(true);

      const baseXP =
        DIFFICULTIES[difficulty].xp;

      const scoreBonus = Math.min(
        30,
        Math.floor(score / 5)
      );

      const totalXP = baseXP + scoreBonus;

      setXpEarned(totalXP);

      recordGame(score, totalXP);
      completeDailyChallenge("quick-math");
      unlockGameAchievement("math-machine");

      return;
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
  ]);

  const submitAnswer = () => {
    if (
      !started ||
      gameOver ||
      answer.trim() === ""
    ) {
      return;
    }

    const numericAnswer = Number(answer);

    if (
      numericAnswer === question.answer
    ) {
      setScore(
        (previous) => previous + 10
      );

      setCorrect(
        (previous) => previous + 1
      );

      setFeedback("correct");
    } else {
      setWrong(
        (previous) => previous + 1
      );

      setFeedback("wrong");
    }

    setAnswer("");

    window.setTimeout(() => {
      setFeedback(null);

      setQuestion(
        createQuestion(difficulty)
      );
    }, 350);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      submitAnswer();
    }
  };

  const timePercentage =
    (timeLeft / DIFFICULTIES[difficulty].time) *
    100;

  return (
    <main className="min-h-screen overflow-hidden bg-transparent text-white">
      {/* -------------------------------- */}
      {/* Background                        */}
      {/* -------------------------------- */}

      <div className="mp-ambient-background pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-12%] h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="absolute right-[-12%] top-[25%] h-80 w-80 rounded-full bg-purple-500/[0.07] blur-3xl" />

        <div className="absolute bottom-[-15%] left-[35%] h-96 w-96 rounded-full bg-fuchsia-500/[0.07] blur-3xl" />
      </div>

      {/* -------------------------------- */}
      {/* Navigation                        */}
      {/* -------------------------------- */}

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

      {/* -------------------------------- */}
      {/* Main                              */}
      {/* -------------------------------- */}

      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-20 pt-8 sm:px-8">
        {/* Header */}

        <div className="mp-fade-up text-center">
          <div className="mp-float mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-4xl shadow-2xl">
            ⚡
          </div>

          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300/60">
            Speed Challenge
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            Quick{" "}
            <span className="mp-gradient-text">
              Math
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/45 sm:text-base">
            Solve as many equations as you can before
            the {DIFFICULTIES[difficulty].time}-second countdown ends.
          </p>
        </div>

        {/* -------------------------------- */}
        {/* Difficulty                        */}
        {/* -------------------------------- */}

        <div className="mx-auto mt-8 max-w-2xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
              Difficulty
            </p>

            <p className="text-xs text-white/30">
              Base XP <span className="font-bold text-cyan-300">+{DIFFICULTIES[difficulty].xp}</span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(
              Object.keys(
                DIFFICULTIES
              ) as Difficulty[]
            ).map((level) => {
              const selected =
                difficulty === level;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`group rounded-2xl border p-3 text-left transition-all duration-200 sm:p-4 ${
                    selected
                      ? "border-cyan-300/30 bg-cyan-300/8 shadow-[0_0_30px_rgba(103,232,249,0.05)]"
                      : "border-white/10 bg-white/[0.035] hover:-translate-y-0.5 hover:bg-white/6"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{level === "easy" ? "🌱" : level === "normal" ? "⚡" : "🔥"}</span>
                    {selected && (
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                    )}
                  </div>

                  <p className={`mt-2 text-sm font-black ${selected ? "text-cyan-200" : "text-white/70"}`}>
                    {DIFFICULTIES[level].label}
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    {
                      DIFFICULTIES[level]
                        .description
                    } · {DIFFICULTIES[level].time}s
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* -------------------------------- */}
        {/* Stats                            */}
        {/* -------------------------------- */}

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
              Correct
            </p>

            <p className="mt-1 text-xl font-black text-green-300 sm:text-2xl">
              {correct}
            </p>
          </div>

          <div className="mp-card rounded-2xl p-3 text-center sm:p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 sm:text-xs">
              Time
            </p>

            <p
              className={`mt-1 text-xl font-black transition-colors sm:text-2xl ${
                timeLeft <= 5 && started
                  ? "text-red-300"
                  : "text-white"
              }`}
            >
              {started
                ? timeLeft
                : DIFFICULTIES[difficulty].time}
              s
            </p>
          </div>
        </div>

        {/* -------------------------------- */}
        {/* Timer Progress                    */}
        {/* -------------------------------- */}

        {started && !gameOver && (
          <div className="mx-auto mt-5 max-w-2xl">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-bold text-white/30">
                Time remaining
              </span>

              <span
                className={`font-black ${
                  timeLeft <= 5
                    ? "text-red-300"
                    : "text-cyan-300/70"
                }`}
              >
                {timeLeft}s
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  timeLeft <= 5
                    ? "bg-red-400"
                    : "bg-linear-to-r from-cyan-400 via-purple-400 to-fuchsia-400"
                }`}
                style={{
                  width: `${timePercentage}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* -------------------------------- */}
        {/* Game Card                         */}
        {/* -------------------------------- */}

        <section className="mp-card mp-fade-up mx-auto mt-6 max-w-2xl rounded-4xl p-5 shadow-2xl sm:mt-8 sm:p-8">
          {/* Start */}

          {!started && !gameOver && (
            <div className="flex min-h-105 flex-col items-center justify-center px-3 py-10 text-center sm:min-h-112.5">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/4 text-5xl">
                🧮
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-cyan-300/50">
                Ready?
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Think fast.
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
                Answer as many equations as possible
                in {DIFFICULTIES[difficulty].time} seconds.
              </p>

              <div className="mt-6 flex items-center gap-2">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/40">
                  {DIFFICULTIES[difficulty].time} seconds
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/40">
                  +10 points
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  startGame(difficulty)
                }
                className="mp-button mt-7 bg-white px-7 py-3.5 text-sm text-black shadow-xl shadow-white/5 hover:bg-yellow-50"
              >
                ⚡ Start Game
              </button>
            </div>
          )}

          {/* Active Game */}

          {started && !gameOver && (
            <div className="text-center">
              <div className="mb-5 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
                    Solve this
                  </p>

                  <p className="mt-1 text-xs font-bold text-white/40">
                    +10 points per correct answer
                  </p>
                </div>

                <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-bold text-white/40">
                  {DIFFICULTIES[difficulty].label}
                </div>
              </div>

              {/* Equation */}

              <div
                className={`relative flex min-h-42.5 items-center justify-center overflow-hidden rounded-[1.75rem] border px-4 transition-all duration-200 sm:min-h-47.5 ${
                  feedback === "correct"
                    ? "border-green-300/25 bg-green-300/[0.07]"
                    : feedback === "wrong"
                      ? "border-red-300/25 bg-red-300/[0.07]"
                      : "border-white/[0.07] bg-white/2.5"
                }`}
              >
                <div className="pointer-events-none absolute left-1/2 -top-20 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-300/4 blur-[70px]" />

                <div
                  className={`relative text-4xl font-black tracking-tight transition-all sm:text-6xl ${
                    feedback === "correct"
                      ? "animate-[pop_0.2s_ease-out] text-green-200"
                      : feedback === "wrong"
                        ? "animate-[pop_0.2s_ease-out] text-red-200"
                        : "text-white"
                  }`}
                >
                  {question.a}{" "}
                  <span className="mx-1 text-cyan-300/80 sm:mx-2">
                    {question.operator}
                  </span>{" "}
                  {question.b}{" "}
                  <span className="mx-1 text-white/25 sm:mx-2">
                    =
                  </span>{" "}
                  <span className="text-white/50">
                    ?
                  </span>
                </div>
              </div>

              {/* Feedback */}

              <div className="mt-4 min-h-5">
                {feedback === "correct" && (
                  <p className="animate-[pop_0.2s_ease-out] text-sm font-black text-green-300">
                    ✓ Correct! Keep going!
                  </p>
                )}

                {feedback === "wrong" && (
                  <p className="animate-[pop_0.2s_ease-out] text-sm font-black text-red-300">
                    ✕ Not quite. Next one!
                  </p>
                )}
              </div>

              {/* Answer */}

              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  autoFocus
                  value={answer}
                  onChange={(event) =>
                    setAnswer(
                      event.target.value
                    )
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Your answer"
                  aria-label="Your answer"
                  className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-black/20 px-4 py-4 text-center text-xl font-black outline-none transition placeholder:text-white/20 focus:border-cyan-300/30 focus:bg-black/30 sm:px-5"
                />

                <button
                  type="button"
                  onClick={submitAnswer}
                  className="mp-button shrink-0 bg-white px-5 py-4 text-sm text-black hover:bg-cyan-50 sm:px-7"
                >
                  Enter
                </button>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-white/25">
                <span>⌨️ Press Enter</span>
                <span>•</span>
                <span>Think fast</span>
              </div>
            </div>
          )}

          {/* Game Over */}

          {gameOver && (
            <div className="flex min-h-105 flex-col items-center justify-center px-3 py-10 text-center sm:min-h-112.5">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-yellow-300/10 bg-yellow-300/5 text-5xl">
                🏆
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300/60">
                Challenge Complete
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Time&apos;s Up!
              </h2>

              <p className="mt-3 text-sm text-white/45">
                You scored{" "}
                <span className="font-black text-white">
                  {score}
                </span>{" "}
                points.
              </p>

              {/* Results */}

              <div className="mt-6 grid w-full max-w-sm grid-cols-3 gap-2.5">
                <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.035] p-3.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">
                    Score
                  </p>

                  <p className="mt-1 text-xl font-black text-cyan-300">
                    {score}
                  </p>
                </div>

                <div className="rounded-2xl border border-green-300/10 bg-green-300/[0.035] p-3.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">
                    Correct
                  </p>

                  <p className="mt-1 text-xl font-black text-green-300">
                    {correct}
                  </p>
                </div>

                <div className="rounded-2xl border border-red-300/10 bg-red-300/[0.035] p-3.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">
                    Wrong
                  </p>

                  <p className="mt-1 text-xl font-black text-red-300">
                    {wrong}
                  </p>
                </div>
              </div>

              {/* XP */}

              <div className="mt-5 w-full max-w-sm rounded-2xl border border-cyan-300/10 bg-cyan-300/4 p-4">
                <p className="text-2xl font-black text-cyan-300">
                  ⭐ +{xpEarned} XP
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Added to your MindPlay progress
                </p>
              </div>

              {/* Actions */}

              <div className="mt-7 flex w-full max-w-sm flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    startGame(difficulty)
                  }
                  className="mp-button flex-1 bg-white px-6 py-3.5 text-sm text-black hover:bg-yellow-50"
                >
                  Play Again
                </button>

                <Link
                  href="/games"
                  className="mp-button flex-1 border border-white/10 bg-white/4 px-6 py-3.5 text-sm text-white/65 hover:bg-white/8 hover:text-white"
                >
                  All Games
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* -------------------------------- */}
        {/* Tip                               */}
        {/* -------------------------------- */}

        <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-white/6 bg-white/2.5 p-4 sm:p-5">
          <div className="flex gap-3">
            <span className="text-lg">💡</span>

            <div>
              <p className="text-sm font-black">
                Quick Math tip
              </p>

              <p className="mt-1 text-xs leading-6 text-white/35 sm:text-sm">
                Look for shortcuts and patterns instead
                of calculating everything the long way.
                Speed comes with practice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- */}
      {/* Footer                            */}
      {/* -------------------------------- */}

      <footer className="border-t border-white/6 px-5 py-8 text-center">
        <PlayerFooterText>MindPlay · Play. Think. Repeat.</PlayerFooterText>
      </footer>
    </main>
  );
}