"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  claimDailyChallenge,
  getDailyChallenge,
  getDailyChallengeState,
  subscribeToDailyChallenge,
  type DailyChallenge,
  type DailyChallengeState,
} from "@/lib/dailyChallenge";

type DailyChallengeCardProps = {
  fullPage?: boolean;
};

export default function DailyChallengeCard({
  fullPage = false,
}: DailyChallengeCardProps) {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [state, setState] = useState<DailyChallengeState | null>(null);

  useEffect(() => {
    const update = () => {
      setChallenge(getDailyChallenge());
      setState(getDailyChallengeState());
    };

    update();
    return subscribeToDailyChallenge(update);
  }, []);

  if (!challenge || !state) {
    return null;
  }

  const claimed = state.claimed;
  const completed = state.completed;

  return (
    <div
      className={`relative overflow-hidden rounded-4xl border border-purple-300/10 bg-linear-to-br from-purple-400/8 to-cyan-300/4 p-6 sm:p-8 ${
        fullPage ? "mx-auto w-full max-w-3xl" : ""
      }`}
    >
      <div className="pointer-events-none absolute -right-12.5 -top-17.5 text-[160px] opacity-[0.04]">
        {challenge.icon}
      </div>

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-purple-300/70">
          <span>Today&apos;s Challenge</span>
          {claimed && (
            <span className="rounded-full bg-emerald-300/10 px-2 py-1 text-emerald-200">
              Claimed
            </span>
          )}
        </div>

        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-3xl">
            {challenge.icon}
          </div>

          <div>
            <h2 className="text-2xl font-black">{challenge.title}</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/50">
              {completed
                ? "Challenge complete! Claim your bonus XP."
                : challenge.description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-white/60">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            {challenge.difficulty}
          </span>
          <span className="rounded-full border border-cyan-300/10 bg-cyan-300/5 px-3 py-1.5 text-cyan-200">
            +{challenge.rewardXP} XP
          </span>
        </div>

        {claimed ? (
          <p className="mt-6 text-sm font-bold text-emerald-200">
            Daily reward claimed. Come back tomorrow!
          </p>
        ) : completed ? (
          <button
            type="button"
            onClick={() => {
              claimDailyChallenge();
              setState(getDailyChallengeState());
            }}
            className="mp-button mt-6 bg-white px-5 py-3 text-sm text-black hover:bg-cyan-50"
          >
            Claim +{challenge.rewardXP} XP
          </button>
        ) : (
          <Link
            href={challenge.href}
            className="mp-button mt-6 border border-white/10 bg-white/6 px-5 py-3 text-sm text-white hover:bg-white/10"
          >
            Start Challenge →
          </Link>
        )}
      </div>
    </div>
  );
}
