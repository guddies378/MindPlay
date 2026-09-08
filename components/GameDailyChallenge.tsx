"use client";

import { useEffect, useState } from "react";

import {
  getDailyChallenge,
  isDailyChallengeCompleted,
  subscribeToDailyChallenge,
} from "@/lib/dailyChallenge";

type GameDailyChallengeProps = {
  gameId: string;
};

export default function GameDailyChallenge({
  gameId,
}: GameDailyChallengeProps) {
  const [completed, setCompleted] = useState(false);

  const challenge = getDailyChallenge();

  const isTodayGame = challenge.game === gameId;

  useEffect(() => {
    const update = () => {
      setCompleted(isDailyChallengeCompleted());
    };

    update();

    return subscribeToDailyChallenge(update);
  }, []);

  if (!isTodayGame) {
    return null;
  }

  if (completed) {
    return (
      <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-cyan-300/15 bg-cyan-300/4 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/10 text-lg">
            ✓
          </div>

          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300/70">
              Daily Challenge
            </p>

            <p className="mt-1 text-sm font-bold text-white/80">
              Challenge completed
            </p>
          </div>

          <div className="ml-auto hidden shrink-0 text-right sm:block">
            <p className="text-xs font-black text-cyan-300">
              +50 XP
            </p>
            <p className="mt-0.5 text-[10px] font-bold text-white/30">
              +10 score
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 sm:hidden">
          <span className="rounded-lg border border-cyan-300/10 bg-cyan-300/5 px-2.5 py-1.5 text-[10px] font-black text-cyan-300">
            +50 XP
          </span>

          <span className="rounded-lg border border-white/6 bg-white/3 px-2.5 py-1.5 text-[10px] font-black text-white/40">
            +10 score
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-5 max-w-2xl overflow-hidden rounded-2xl border border-purple-300/15 bg-purple-300/[0.035]">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-300/15 bg-purple-300/10 text-lg">
            🎯
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300/70">
                Daily Challenge
              </p>

              <span className="rounded-full border border-purple-300/10 bg-purple-300/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-purple-200/60">
                Today
              </span>
            </div>

            <p className="mt-1 text-sm font-black text-white/85">
              {challenge.title}
            </p>

            <p className="mt-1 text-xs leading-5 text-white/35">
              {challenge.description}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-xl border border-purple-300/10 bg-purple-300/5 px-3 py-2 text-[10px] font-black text-purple-200/70">
            +50 XP
          </span>

          <span className="rounded-xl border border-white/6 bg-white/3 px-3 py-2 text-[10px] font-black text-white/40">
            +10 score
          </span>

          <span className="rounded-xl border border-white/6 bg-white/3 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white/30">
            {challenge.difficulty}
          </span>
        </div>
      </div>
    </div>
  );
}