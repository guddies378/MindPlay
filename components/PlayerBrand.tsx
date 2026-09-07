"use client";

import { useEffect, useState } from "react";
import {
  getPlayerName,
  PLAYER_NAME_UPDATED_EVENT,
} from "@/lib/player";

export default function PlayerBrand() {
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setPlayerName(getPlayerName());

    update();
    window.addEventListener(PLAYER_NAME_UPDATED_EVENT, update);

    return () => {
      window.removeEventListener(PLAYER_NAME_UPDATED_EVENT, update);
    };
  }, []);

  return (
    <span className="flex min-w-0 flex-col leading-none">
      <span className="flex items-center gap-1.5 text-lg font-black tracking-tight">
        <span className="transition-transform duration-200 group-hover:rotate-6">
          🧠
        </span>
        <span>Mind<span className="text-cyan-300">Play</span></span>
      </span>
      {playerName && (
        <span className="mt-1 flex min-w-0 items-center gap-1.5 pl-7">
          <span className="shrink-0 text-[8px] font-black uppercase tracking-[0.18em] text-white/30">
            Player
          </span>
          <span className="h-1 w-1 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)]" />
          <span className="mp-gradient-text max-w-28 truncate text-[10px] font-black tracking-wide sm:max-w-40">
            {playerName}
          </span>
        </span>
      )}
    </span>
  );
}
