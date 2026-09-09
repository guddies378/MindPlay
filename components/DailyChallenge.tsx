"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getDailyChallenge,
  isDailyChallengeCompleted,
  subscribeToDailyChallenge,
  type DailyChallenge,
} from "@/lib/dailyChallenge";

const GAME_ROUTES: Record<string, string> = {
  "memory-match": "/games/memory-match",
  "quick-math": "/games/quick-math",
  "word-scramble": "/games/word-scramble",
  "riddle-me": "/games/riddle-me",
  "odd-one-out": "/games/odd-one-out",
  "tic-tac-toe": "/games/tic-tac-toe",
  "reaction-rush": "/games/reaction-rush",
  "number-memory": "/games/number-memory",
  "color-clash": "/games/color-clash",
  "pattern-recall": "/games/pattern-recall",
  "sequence-master": "/games/sequence-master",
  "logic-rush": "/games/logic-rush",
};

const DIFFICULTY_LABELS = {
  easy: "EASY",
  normal: "NORMAL",
  hard: "HARD",
};

export default function DailyChallenge() {
  const [challenge, setChallenge] =
    useState<DailyChallenge | null>(null);

  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const update = () => {
      setChallenge(getDailyChallenge());
      setCompleted(isDailyChallengeCompleted());
    };

    update();

    return subscribeToDailyChallenge(update);
  }, []);

  if (!challenge) {
    return null;
  }

  const gameRoute =
    `${GAME_ROUTES[challenge.game]}?daily=true&difficulty=${challenge.difficulty}`;

  const difficultyStyles = {
    easy: {
      badge:
        "border-emerald-300/20 bg-emerald-300/10 text-emerald-300",
      glow: "bg-emerald-300/10",
    },

    normal: {
      badge:
        "border-cyan-300/20 bg-cyan-300/10 text-cyan-300",
      glow: "bg-cyan-300/10",
    },

    hard: {
      badge:
        "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-300",
      glow: "bg-fuchsia-300/10",
    },
  };

  const difficulty =
    difficultyStyles[challenge.difficulty];

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-12">
      {/* Section heading */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-300" />

            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300/70">
              Daily Challenge
            </p>
          </div>

          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            One challenge.
            <br className="sm:hidden" />{" "}
            <span className="mp-gradient-text">
              Every day.
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-white/8 bg-white/4 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/35 sm:self-auto">
          <span className="text-sm">🎯</span>
          Today&apos;s mission
        </div>
      </div>

      {/* Main challenge card */}
      <div
        className={[
          "relative overflow-hidden rounded-4xl border transition-all duration-300",
          completed
            ? "border-emerald-300/20 bg-emerald-300/[0.035]"
            : "border-purple-300/15 bg-white/2.5",
        ].join(" ")}
      >
        {/* Ambient background */}
        <div
          className={`pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl ${difficulty.glow}`}
        />

        <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-cyan-300/[0.07] blur-3xl" />

        {/* Subtle top line */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-purple-300/30 to-transparent" />

        <div className="relative p-5 sm:p-7 lg:p-8">
          {/* Mission label */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
              Today&apos;s mission
            </p>

            {completed && (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                <span>✓</span>
                Complete
              </span>
            )}
          </div>

          {/* Main content */}
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            {/* Game information */}
            <div className="flex min-w-0 items-start gap-4 sm:gap-5">
              {/* Game icon */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/10 bg-white/6 text-4xl shadow-xl shadow-black/10 sm:h-24 sm:w-24 sm:text-5xl">
                <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/6 to-transparent" />

                <span className="relative">
                  {challenge.icon}
                </span>
              </div>

              {/* Details */}
              <div className="min-w-0 pt-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {challenge.title}
                  </h3>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-[9px] font-black tracking-[0.12em] ${difficulty.badge}`}
                  >
                    {DIFFICULTY_LABELS[challenge.difficulty]}
                  </span>
                </div>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/45 sm:text-[15px]">
                  {challenge.description}
                </p>

                {/* Reward + game type */}
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2 rounded-xl border border-cyan-300/10 bg-cyan-300/5 px-3 py-2">
                    <span className="text-sm">🎁</span>

                    <span className="text-xs font-bold text-white/45">
                      Reward
                    </span>

                    <span className="text-xs font-black text-cyan-300">
                      +{challenge.rewardXP} XP
                    </span>
                  </div>

                  <span className="hidden h-1 w-1 rounded-full bg-white/15 sm:block" />

                  <span className="text-xs font-bold capitalize text-white/25">
                    {challenge.game.replaceAll("-", " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="shrink-0 lg:min-w-45">
              {completed ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/15 bg-emerald-300/6 px-6 py-3.5 text-sm font-black text-emerald-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-300/10">
                    ✓
                  </span>

                  Completed
                </div>
              ) : (
                <Link
                  href={gameRoute}
                  className="mp-button flex w-full items-center justify-center bg-white px-6 py-3.5 text-sm font-black text-black shadow-xl shadow-white/5 transition-all hover:-translate-y-0.5 hover:bg-cyan-50 hover:shadow-cyan-300/10 sm:w-auto"
                >
                  Play Challenge
                  <span className="ml-2 text-base">
                    →
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Bottom status */}
          <div className="mt-7 border-t border-white/6 pt-4">
            {completed ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300/65">
                <span>🔥</span>

                <span>
                  Challenge complete. Come back tomorrow for a new mission.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-white/25">
                <span>💡</span>

                <span>
                  Complete today&apos;s challenge to earn bonus XP.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}