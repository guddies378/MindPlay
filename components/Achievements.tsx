"use client";

import { useEffect, useState } from "react";
import {
  ACHIEVEMENTS,
  getUnlockedAchievements,
  type AchievementId,
} from "@/lib/achievements";
import AchievementCard from "./AchievementCard";

export default function Achievements() {
  const [unlocked, setUnlocked] = useState<
    AchievementId[]
  >([]);

  useEffect(() => {
    const update = () => {
      setUnlocked(getUnlockedAchievements());
    };

    update();

    const handleAchievementUpdate = () => {
      update();
    };

    window.addEventListener(
      "mindplay-achievement-updated",
      handleAchievementUpdate
    );
    window.addEventListener(
      "storage",
      handleAchievementUpdate
    );

    return () => {
      window.removeEventListener(
        "mindplay-achievement-updated",
        handleAchievementUpdate
      );
      window.removeEventListener(
        "storage",
        handleAchievementUpdate
      );
    };
  }, []);

  const unlockedCount = ACHIEVEMENTS.filter(
    (achievement) =>
      unlocked.includes(achievement.id)
  ).length;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300/50">
            Achievements
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight">
            Your collection
          </h2>
        </div>

        <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-black text-white/40">
          {unlockedCount}/{ACHIEVEMENTS.length}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            unlocked={unlocked.includes(
              achievement.id
            )}
          />
        ))}
      </div>
    </section>
  );
}