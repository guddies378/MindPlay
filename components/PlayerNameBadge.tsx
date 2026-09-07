"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  getPlayerName,
  PLAYER_NAME_UPDATED_EVENT,
} from "@/lib/player";

export default function PlayerNameBadge() {
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const update = () => {
      setPlayerName(getPlayerName());
    };

    update();
    window.addEventListener(PLAYER_NAME_UPDATED_EVENT, update);
    window.addEventListener("storage", update);

    return () => {
      window.removeEventListener(PLAYER_NAME_UPDATED_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  if (!mounted || !playerName) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 sm:bottom-4">
      <div
        className="flex max-w-full items-center text-[11px] font-bold text-white/45 sm:text-xs"
        title={playerName}
      >
        <span className="shrink-0 text-white/45">🧠 MindPlay</span>
        <span className="mx-2 text-white/25">·</span>
        <span className="truncate text-cyan-100/85">{playerName}</span>
      </div>
    </div>,
    document.body
  );
}
