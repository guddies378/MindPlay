"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import {
  getPlayerName,
  PLAYER_NAME_UPDATED_EVENT,
  savePlayerName,
} from "@/lib/player";

export default function PlayerNameGate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const playerName = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(PLAYER_NAME_UPDATED_EVENT, onStoreChange);
      return () => {
        window.removeEventListener(PLAYER_NAME_UPDATED_EVENT, onStoreChange);
      };
    },
    getPlayerName,
    () => undefined,
  );
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = nameInput.trim();

    if (name.length < 2) {
      setError("Please enter at least 2 characters.");
      return;
    }

    if (name.length > 20) {
      setError("Please keep your name under 20 characters.");
      return;
    }

    savePlayerName(name);
  };

  return (
    <>
      {children}

      {playerName === null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050711]/80 px-5 backdrop-blur-md">
          <div
            aria-labelledby="player-name-title"
            aria-modal="true"
            className="w-full max-w-md rounded-4xl border border-cyan-300/15 bg-[#0d1222]/95 p-6 shadow-2xl shadow-cyan-950/30 sm:p-8"
            role="dialog"
          >
            <div className="mb-6 text-center">
              <div className="mb-4 text-5xl">🧠</div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300/60">
                Welcome to MindPlay
              </p>
              <h1
                className="mt-2 text-3xl font-black tracking-tight text-white"
                id="player-name-title"
              >
                SYNC YOUR SYNAPSES
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/45">
                Claim your name and be Einstein!
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  className="mb-2 block text-xs font-black uppercase tracking-wider text-white/45"
                  htmlFor="player-name"
                >
                 name
                </label>
                <input
                  autoFocus
                  className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3.5 text-white outline-none transition placeholder:text-white/20 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10"
                  id="player-name"
                  maxLength={20}
                  onChange={(event) => {
                    setNameInput(event.target.value);
                    setError("");
                  }}
                  placeholder="Who's thinking today?..."
                  required
                  value={nameInput}
                />
              </div>

              {error && (
                <p className="text-sm text-rose-300" role="alert">
                  {error}
                </p>
              )}

              <button
                className="mp-button w-full bg-white px-5 py-3.5 text-sm text-black shadow-lg shadow-white/5 hover:bg-cyan-50"
                type="submit"
              >
                SYNC 
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
