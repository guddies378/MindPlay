"use client";

import { useEffect, useState } from "react";
import {
  getProgress,
  subscribeToProgress,
  type MindPlayProgress,
} from "@/lib/progress";

type MindPlayStatsProps = {
  compact?: boolean;
};

export default function MindPlayStats({
  compact = false,
}: MindPlayStatsProps) {
  const [progress, setProgress] = useState<MindPlayProgress | null>(null);

  useEffect(() => {
    const update = () => {
      setProgress(getProgress());
    };

    update();

    return subscribeToProgress(update);
  }, []);

  if (!progress) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-white/70">
        <span>⭐ {progress.xp} XP</span>
        <span>•</span>
        <span>🔥 {progress.streak}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
          XP
        </p>

        <p className="mt-1 text-2xl font-black text-cyan-300">
          {progress.xp}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Streak
        </p>

        <p className="mt-1 text-2xl font-black text-orange-300">
          🔥 {progress.streak}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Games
        </p>

        <p className="mt-1 text-2xl font-black text-white">
          {progress.gamesPlayed}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Best Score
        </p>

        <p className="mt-1 text-2xl font-black text-fuchsia-300">
          {progress.bestScore}
        </p>
      </div>
    </div>
  );
}