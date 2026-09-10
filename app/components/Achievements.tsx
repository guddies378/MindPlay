"use client";

import { useEffect, useState } from "react";
import {
  ACHIEVEMENTS,
  getUnlockedAchievements,
  type AchievementId,
} from "@/lib/achievements";

export default function Achievements() {
  const [unlocked, setUnlocked] = useState<AchievementId[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // localStorage is an external source, so load it after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnlocked(getUnlockedAchievements());

    const handleAchievementUpdate = () => {
      setUnlocked(getUnlockedAchievements());
    };

    window.addEventListener(
      "mindplay-achievement-updated",
      handleAchievementUpdate,
    );

    return () => {
      window.removeEventListener(
        "mindplay-achievement-updated",
        handleAchievementUpdate,
      );
    };
  }, []);

  const unlockedCount = unlocked.length;
  const totalCount = ACHIEVEMENTS.length;

  const progress =
    totalCount === 0
      ? 0
      : Math.round((unlockedCount / totalCount) * 100);

  return (
    <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-lg">🏆</span>

          <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
            Achievements
          </h2>

          <span className="text-xs text-white/30">
            {unlockedCount}/{totalCount}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? "Minimize achievements"
              : "Show achievements"
          }
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          {isExpanded ? "▲" : "▼"}
        </button>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-cyan-300 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[10px] font-medium text-cyan-300/70">
          {progress}%
        </span>
      </div>

      <div
        className={[
          "grid transition-all duration-300 ease-in-out",
          isExpanded
            ? "mt-3 grid-rows-[1fr] opacity-100"
            : "mt-0 grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = unlocked.includes(achievement.id);

              return (
                <div
                  key={achievement.id}
                  className={[
                    "relative flex min-h-22 flex-col items-center justify-center rounded-xl border p-3 text-center transition-all",
                    isUnlocked
                      ? "border-cyan-300/15 bg-cyan-300/5"
                      : "border-white/6 bg-white/2 opacity-50",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-lg",
                      isUnlocked
                        ? "bg-cyan-300/10"
                        : "bg-white/5 grayscale",
                    ].join(" ")}
                  >
                    {isUnlocked ? (
                      achievement.icon
                    ) : (
                      <span className="text-sm">🔒</span>
                    )}
                  </div>

                  <p
                    className={[
                      "line-clamp-1 text-[11px] font-semibold",
                      isUnlocked
                        ? "text-white/90"
                        : "text-white/40",
                    ].join(" ")}
                  >
                    {achievement.title}
                  </p>

                  <p className="mt-0.5 line-clamp-1 text-[9px] text-white/30">
                    {achievement.requirement}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}