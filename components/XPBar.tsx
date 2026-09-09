"use client";

import { useEffect, useState } from "react";
import {
  getProgress,
  subscribeToProgress,
} from "@/lib/progress";
import { getLevelProgress } from "@/lib/levels";

export default function XPBar() {
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const update = () => {
      setXp(getProgress().xp);
    };

    update();

    return subscribeToProgress(update);
  }, []);

  const levelProgress = getLevelProgress(xp);

  return (
    <div className="w-full max-w-xs">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-bold text-white/70">
          LEVEL {levelProgress.level}
        </span>

        <span className="text-white/40">
          {levelProgress.xpIntoLevel}/
          {levelProgress.xpNeeded} XP
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-linear-to-r from-cyan-400 to-fuchsia-400 transition-all duration-500"
          style={{
            width: `${levelProgress.percentage}%`,
          }}
        />
      </div>
    </div>
  );
}