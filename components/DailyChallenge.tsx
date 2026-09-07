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

  const gameRoute = GAME_ROUTES[challenge.game];

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300/60">
            Daily Challenge
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            One challenge. Every day.
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/30">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
          Today&apos;s mission
        </div>
      </div>

      <div
        className={[
          "relative overflow-hidden rounded-4xl border p-5 transition-all duration-300 sm:p-7",
          completed
            ? "border-emerald-300/20 bg-emerald-300/4"
            : "border-purple-300/15 bg-linear-to-br from-purple-400/8 to-cyan-300/4",
        ].join(" ")}
      >
        {/* Background glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-fuchsia-400/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 -left-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Challenge info */}
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl shadow-lg">
                {challenge.icon}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-white sm:text-2xl">
                    {challenge.title}
                  </h3>

                  <span
                    className={[
                      "rounded-full border px-2.5 py-1 text-[9px] font-black tracking-wider",
                      challenge.difficulty === "easy"
                        ? "border-emerald-300/15 bg-emerald-300/6 text-emerald-300"
                        : challenge.difficulty === "normal"
                          ? "border-cyan-300/15 bg-cyan-300/6 text-cyan-300"
                          : "border-fuchsia-300/15 bg-fuchsia-300/6 text-fuchsia-300",
                    ].join(" ")}
                  >
                    {DIFFICULTY_LABELS[challenge.difficulty]}
                  </span>
                </div>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
                  {challenge.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/40">
                    <span>🎁</span>
                    <span>
                      Reward:{" "}
                      <strong className="text-cyan-300">
                        +{challenge.rewardXP} XP
                      </strong>
                    </span>
                  </div>

                  <div className="h-1 w-1 rounded-full bg-white/20" />

                  <div className="text-xs font-bold text-white/30">
                    {challenge.game.replaceAll("-", " ")}
                  </div>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="shrink-0 lg:pl-4">
              {completed ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.07] px-5 py-3 text-sm font-black text-emerald-300">
                  <span>✓</span>
                  Completed
                </div>
              ) : (
                <Link
                  href={gameRoute}
                  className="mp-button w-full bg-white px-6 py-3 text-sm text-black shadow-lg shadow-white/5 hover:bg-cyan-50 sm:w-auto"
                >
                  Play Challenge
                  <span className="ml-2">→</span>
                </Link>
              )}
            </div>
          </div>

          {/* Bottom status */}
          <div className="mt-6 border-t border-white/6 pt-4">
            {completed ? (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300/70">
                <span>🔥</span>
                <span>
                  Daily challenge complete. Come back tomorrow!
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