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
  | "waiting"
  | "ready"
  | "result"
  | "finished";

const DIFFICULTIES = {
  easy: {
    label: "Easy",
    description: "Relaxed reaction test",
    rounds: 5,
    minDelay: 1800,
    maxDelay: 3500,
    target: 500,
    xp: 20,
    icon: "🌱",
  },
  normal: {
    label: "Normal",
    description: "The real challenge",
    rounds: 7,
    minDelay: 1200,
    maxDelay: 3000,
    target: 350,
    xp: 35,
    icon: "⚡",
  },
  hard: {
    label: "Hard",
    description: "Blink and you'll lose",
    rounds: 10,
    minDelay: 900,
    maxDelay: 2400,
    target: 250,
    xp: 50,
    icon: "🔥",
  },
} as const;

function randomDelay(min: number, max: number) {
  return (
    Math.floor(Math.random() * (max - min + 1)) +
    min
  );
}

function getReactionScore(reaction: number) {
  if (reaction <= 150) return 100;
  if (reaction <= 200) return 90;
  if (reaction <= 250) return 80;
  if (reaction <= 300) return 70;
  if (reaction <= 350) return 60;
  if (reaction <= 400) return 50;
  if (reaction <= 500) return 40;
  if (reaction <= 650) return 25;
  if (reaction <= 800) return 15;

  return 10;
}

function formatReaction(ms: number | null) {
  if (ms === null) return "--";

  return `${ms} ms`;
}

export default function ReactionRushPage() {
  const [difficulty, setDifficulty] =
    useState<Difficulty>("normal");

  const [gameState, setGameState] =
    useState<GameState>("idle");

  const [round, setRound] = useState(0);
  const [reactionTime, setReactionTime] =
    useState<number | null>(null);

  const [bestReaction, setBestReaction] =
    useState<number | null>(null);

  const [averageReaction, setAverageReaction] =
    useState<number | null>(null);

  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [falseStart, setFalseStart] = useState(false);

  const [history, setHistory] = useState<number[]>([]);

  const [dailyBonusEarned, setDailyBonusEarned] =
    useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const startTimeRef = useRef<number | null>(null);

  const config = DIFFICULTIES[difficulty];

  const dailyChallenge = getDailyChallenge();

  const isDailyChallenge =
    dailyChallenge.game === "reaction-rush";

  function clearTimer() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function startRound(nextRound: number) {
    clearTimer();

    setRound(nextRound);
    setReactionTime(null);
    setFalseStart(false);
    setGameState("waiting");

    const delay = randomDelay(
      config.minDelay,
      config.maxDelay
    );

    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setGameState("ready");
    }, delay);
  }

  function startGame() {
    clearTimer();

    setRound(0);
    setScore(0);
    setXpEarned(0);
    setReactionTime(null);
    setBestReaction(null);
    setAverageReaction(null);
    setFalseStart(false);
    setHistory([]);
    setDailyBonusEarned(false);

    startTimeRef.current = null;

    startRound(1);
  }

  function finishGame(
    finalScore: number,
    finalHistory: number[]
  ) {
    clearTimer();

    if (gameState === "finished") {
      return;
    }

    const average =
      finalHistory.length > 0
        ? Math.round(
            finalHistory.reduce(
              (sum, value) => sum + value,
              0
            ) / finalHistory.length
          )
        : 0;

    const best =
      finalHistory.length > 0
        ? Math.min(...finalHistory)
        : 0;

    const dailyCompleted =
      isDailyChallenge &&
      completeDailyChallenge(
        "reaction-rush"
      );

    const finalScoreWithDailyBonus =
      finalScore +
      (dailyCompleted
        ? DAILY_CHALLENGE_BONUS_POINTS
        : 0);

    const scoreBonus = Math.min(
      50,
      Math.floor(
        finalScoreWithDailyBonus / 20
      )
    );

    const speedBonus =
      best > 0 &&
      best <= config.target
        ? 25
        : 0;

    const baseTotalXP =
      config.xp +
      scoreBonus +
      speedBonus;

    const displayedXP =
      baseTotalXP +
      (dailyCompleted ? 50 : 0);

    setBestReaction(best || null);
    setAverageReaction(average || null);
    setScore(finalScoreWithDailyBonus);
    setXpEarned(displayedXP);
    setDailyBonusEarned(
      dailyCompleted
    );
    setGameState("finished");

    recordGame(
      finalScoreWithDailyBonus,
      baseTotalXP
    );

    unlockGameAchievement(
      "lightning-reflexes"
    );
  }

  function handleBoardClick() {
    if (gameState === "waiting") {
      clearTimer();

      setFalseStart(true);
      setReactionTime(null);
      setGameState("result");

      return;
    }

    if (gameState !== "ready") {
      return;
    }

    const startTime =
      startTimeRef.current;

    if (!startTime) {
      return;
    }

    const reaction = Math.round(
      performance.now() - startTime
    );

    const roundScore =
      getReactionScore(reaction);

    const nextScore =
      score + roundScore;

    const nextHistory = [
      ...history,
      reaction,
    ];

    setReactionTime(reaction);
    setScore(nextScore);
    setHistory(nextHistory);

    if (
      bestReaction === null ||
      reaction < bestReaction
    ) {
      setBestReaction(reaction);
    }

    if (round >= config.rounds) {
      finishGame(
        nextScore,
        nextHistory
      );
      return;
    }

    setGameState("result");
  }

  function continueGame() {
    if (gameState === "finished") {
      return;
    }

    if (round >= config.rounds) {
      finishGame(
        score,
        history
      );
      return;
    }

    startRound(round + 1);
  }

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  const progress =
    config.rounds > 0
      ? Math.min(
          100,
          (round / config.rounds) * 100
        )
      : 0;

  return (
    <main className="min-h-screen overflow-hidden px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}

        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/games"
            className="group flex items-center gap-2 text-sm font-bold text-white/40 transition hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            Back to Arcade
          </Link>

          <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/35">
            Reaction Game
          </div>
        </header>

        {/* Title */}

        <section className="mp-fade-up mb-8 text-center">
          <div className="mb-3 text-5xl">
            ⚡
          </div>

          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300/60">
            Reaction Rush
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            How fast are you?
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/40">
            Wait for the signal. Then react as fast
            as possible. But don&apos;t click early.
          </p>

          {isDailyChallenge && (
            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-fuchsia-300/15 bg-fuchsia-300/5 px-4 py-2 text-xs font-bold text-fuchsia-200/70">
              🌟 Today&apos;s Daily Challenge
            </div>
          )}
        </section>

        {/* Difficulty */}

        {gameState === "idle" && (
          <section className="mp-fade-up mb-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wider text-white/30">
                Select difficulty
              </p>

              <p className="text-xs font-bold text-white/20">
                Faster = more points
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(
                Object.keys(
                  DIFFICULTIES
                ) as Difficulty[]
              ).map((level) => {
                const item =
                  DIFFICULTIES[level];

                const selected =
                  difficulty === level;

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() =>
                      setDifficulty(level)
                    }
                    className={[
                      "rounded-3xl border p-5 text-left transition-all duration-200",
                      selected
                        ? "border-cyan-300/25 bg-cyan-300/[0.07] shadow-lg shadow-cyan-400/5"
                        : "border-white/[0.07] bg-white/2.5 hover:-translate-y-1 hover:border-white/15 hover:bg-white/5",
                    ].join(" ")}
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
                        {item.rounds} rounds
                      </span>

                      <span className="text-cyan-300">
                        +{item.xp} base XP
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Game */}

        <section
          className={[
            "relative overflow-hidden rounded-4xl border transition-all duration-300",
            gameState === "ready"
              ? "border-emerald-300/30 bg-emerald-300/5 shadow-2xl shadow-emerald-400/10"
              : "border-white/10 bg-white/[0.035]",
          ].join(" ")}
        >
          {/* Background glow */}

          <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-fuchsia-400/10 blur-3xl" />

          <div className="relative p-5 sm:p-8">
            {/* Game stats */}

            {gameState !== "idle" &&
              gameState !== "finished" && (
                <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="rounded-2xl border border-white/[0.07] bg-white/2.5 p-3 text-center">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/25">
                      Round
                    </p>

                    <p className="mt-1 text-lg font-black">
                      {round}/{config.rounds}
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
                      Best
                    </p>

                    <p className="mt-1 text-lg font-black text-fuchsia-300">
                      {formatReaction(
                        bestReaction
                      )}
                    </p>
                  </div>
                </div>
              )}

            {/* Progress */}

            {gameState !== "idle" &&
              gameState !== "finished" && (
                <div className="mb-6">
                  <div className="mb-2 flex justify-between text-[9px] font-black uppercase tracking-wider text-white/20">
                    <span>Progress</span>

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
                  ⚡
                </div>

                <h2 className="mt-6 text-2xl font-black">
                  Ready?
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
                  The screen will tell you when to
                  click. Don&apos;t click before it turns
                  green.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <div className="rounded-full border border-white/10 bg-white/3 px-4 py-2 text-xs font-bold text-white/40">
                    🎯 +10–100 points
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/3 px-4 py-2 text-xs font-bold text-white/40">
                    🚫 False start = 0
                  </div>
                </div>

                {isDailyChallenge && (
                  <div className="mx-auto mt-4 max-w-xs rounded-xl border border-fuchsia-300/10 bg-fuchsia-300/5 px-3 py-2 text-xs font-bold text-fuchsia-200/60">
                    🌟 Daily reward: +10 points
                    +50 XP
                  </div>
                )}

                <button
                  type="button"
                  onClick={startGame}
                  className="mp-button mt-8 bg-white px-8 py-4 text-sm text-black shadow-xl shadow-white/10 hover:bg-white/90"
                >
                  Start Reaction Rush
                  <span className="ml-2">
                    →
                  </span>
                </button>
              </div>
            )}

            {/* Waiting / Ready */}

            {(gameState === "waiting" ||
              gameState === "ready") && (
              <button
                type="button"
                onClick={handleBoardClick}
                className={[
                  "flex min-h-90 w-full select-none flex-col items-center justify-center rounded-3xl border transition-all duration-200 sm:min-h-105",
                  gameState === "ready"
                    ? "border-emerald-300/20 bg-emerald-400/8 active:scale-[0.99]"
                    : "border-white/[0.07] bg-white/2.5 active:scale-[0.99]",
                ].join(" ")}
              >
                {gameState ===
                "waiting" ? (
                  <>
                    <div className="text-6xl">
                      👀
                    </div>

                    <p className="mt-6 text-2xl font-black sm:text-3xl">
                      Wait...
                    </p>

                    <p className="mt-2 text-sm font-bold text-white/30">
                      Don&apos;t click yet!
                    </p>

                    <div className="mt-8 flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-orange-300" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-orange-300 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-orange-300 [animation-delay:300ms]" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mp-float text-7xl">
                      🟢
                    </div>

                    <p className="mt-6 text-4xl font-black uppercase tracking-tight text-emerald-300 sm:text-5xl">
                      CLICK!
                    </p>

                    <p className="mt-3 text-sm font-bold text-white/35">
                      NOW! NOW! NOW!
                    </p>
                  </>
                )}
              </button>
            )}

            {/* Round Result */}

            {gameState === "result" && (
              <div className="py-10 text-center sm:py-14">
                {falseStart ? (
                  <>
                    <div className="text-6xl">
                      🚫
                    </div>

                    <p className="mt-5 text-3xl font-black text-orange-300">
                      TOO EARLY!
                    </p>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/35">
                      You clicked before the
                      signal. Stay focused and
                      wait for green.
                    </p>

                    <div className="mx-auto mt-7 max-w-sm rounded-3xl border border-orange-300/10 bg-orange-300/5 p-5">
                      <p className="text-xs font-black uppercase tracking-wider text-white/25">
                        Round score
                      </p>

                      <p className="mt-2 text-3xl font-black text-orange-300">
                        0
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl">
                      {reactionTime !== null &&
                      reactionTime <=
                        200
                        ? "🔥"
                        : reactionTime !== null &&
                            reactionTime <=
                              350
                          ? "⚡"
                          : "👏"}
                    </div>

                    <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-white/30">
                      Reaction Time
                    </p>

                    <p className="mt-1 text-5xl font-black text-cyan-300 sm:text-6xl">
                      {formatReaction(
                        reactionTime
                      )}
                    </p>

                    <p className="mt-3 text-sm font-bold text-white/35">
                      {reactionTime !== null &&
                      reactionTime <=
                        config.target
                        ? "🔥 Target beaten!"
                        : "Keep pushing!"}
                    </p>

                    <div className="mx-auto mt-7 max-w-sm rounded-3xl border border-white/[0.07] bg-white/2.5 p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white/30">
                          Round points
                        </span>

                        <span className="text-xl font-black text-white">
                          +
                          {reactionTime !==
                          null
                            ? getReactionScore(
                                reactionTime
                              )
                            : 0}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={continueGame}
                  className="mp-button mt-8 bg-white px-8 py-4 text-sm text-black shadow-xl shadow-white/10 hover:bg-white/90"
                >
                  {round >=
                  config.rounds
                    ? "See Results"
                    : "Next Round"}

                  <span className="ml-2">
                    →
                  </span>
                </button>
              </div>
            )}

            {/* Final Results */}

            {gameState === "finished" && (
              <div className="py-8 text-center sm:py-12">
                <div className="mp-float text-7xl">
                  🏆
                </div>

                <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-cyan-300/60">
                  Challenge Complete
                </p>

                <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                  Reaction Rush cleared!
                </h2>

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
                      Best
                    </p>

                    <p className="mt-2 text-2xl font-black text-fuchsia-300">
                      {formatReaction(
                        bestReaction
                      )}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/[0.07] bg-white/2.5 p-5">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/25">
                      Average
                    </p>

                    <p className="mt-2 text-2xl font-black text-white">
                      {formatReaction(
                        averageReaction
                      )}
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

                {dailyBonusEarned && (
                  <div className="mx-auto mt-4 max-w-2xl rounded-3xl border border-fuchsia-300/15 bg-fuchsia-300/5 px-4 py-3 text-sm font-bold text-fuchsia-200/70">
                    🌟 Daily Challenge
                    complete · +10 points ·
                    +50 XP
                  </div>
                )}

                <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-white/[0.07] bg-white/2.5 p-5 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-white/25">
                        Performance
                      </p>

                      <p className="mt-1 text-sm font-bold text-white/60">
                        {bestReaction !==
                          null &&
                        bestReaction <=
                          150
                          ? "⚡ Absolutely cracked."
                          : bestReaction !==
                                null &&
                              bestReaction <=
                                250
                            ? "🔥 Lightning fast!"
                            : bestReaction !==
                                  null &&
                                bestReaction <=
                                  350
                              ? "💪 Great reflexes!"
                              : "🎯 Keep practicing!"}
                      </p>
                    </div>

                    <span className="text-3xl">
                      ⚡
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={startGame}
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
              👀
            </div>

            <h3 className="mt-3 text-sm font-black">
              Stay focused
            </h3>

            <p className="mt-1 text-xs leading-5 text-white/30">
              Don&apos;t stare at the button. Watch
              for the signal.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-white/2.5 p-5">
            <div className="text-xl">
              🧘
            </div>

            <h3 className="mt-3 text-sm font-black">
              Don&apos;t rush
            </h3>

            <p className="mt-1 text-xs leading-5 text-white/30">
              Clicking early means you lose the
              round.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-white/2.5 p-5">
            <div className="text-xl">
              🔥
            </div>

            <h3 className="mt-3 text-sm font-black">
              Beat yourself
            </h3>

            <p className="mt-1 text-xs leading-5 text-white/30">
              Your real opponent is your previous
              best.
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