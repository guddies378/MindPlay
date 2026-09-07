"use client";

import type { Achievement } from "@/lib/achievements";

type AchievementCardProps = {
  achievement: Achievement;
  unlocked?: boolean;
};

export default function AchievementCard({
  achievement,
  unlocked = false,
}: AchievementCardProps) {
  return (
    <div
      className={[
        "group relative overflow-hidden rounded-3xl border p-5 transition-all duration-200",
        unlocked
          ? "border-cyan-300/15 bg-cyan-300/5 hover:-translate-y-1 hover:border-cyan-300/25"
          : "border-white/[0.07] bg-white/2.5 opacity-60",
      ].join(" ")}
    >
      {unlocked && (
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-300/10 blur-3xl" />
      )}

      <div className="relative flex items-start gap-4">
        <div
          className={[
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl transition-transform duration-200",
            unlocked
              ? "border-cyan-300/15 bg-cyan-300/[0.07] group-hover:scale-105"
              : "border-white/[0.07] bg-white/3 grayscale",
          ].join(" ")}
        >
          {unlocked ? achievement.icon : "🔒"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                className={[
                  "text-sm font-black",
                  unlocked
                    ? "text-white"
                    : "text-white/50",
                ].join(" ")}
              >
                {achievement.title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-white/35">
                {achievement.description}
              </p>
            </div>

            {unlocked && (
              <span className="shrink-0 rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                Unlocked
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/20">
              Requirement
            </span>

            <span className="text-[10px] font-black text-white/35">
              {achievement.requirement}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}