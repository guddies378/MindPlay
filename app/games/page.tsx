"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getProgress,
  subscribeToProgress,
  type MindPlayProgress,
} from "@/lib/progress";
import PlayerFooterText from "@/components/PlayerFooterText";
import PlayerBrand from "@/components/PlayerBrand";

type GameCategory =
  | "MEMORY"
  | "SPEED"
  | "FOCUS"
  | "WORDS"
  | "LOGIC";

type Game = {
  icon: string;
  title: string;
  description: string;
  category: GameCategory;
  difficulty: string;
  href: string;
  available: boolean;
  accent: string;
};

const games: Game[] = [
  {
    icon: "🧠",
    title: "Memory Match",
    description: "Study the board, then match every pair.",
    category: "MEMORY",
    difficulty: "Easy → Hard",
    href: "/games/memory-match",
    available: true,
    accent: "cyan",
  },
  {
    icon: "⚡",
    title: "Quick Math",
    description: "Build a combo before the clock catches you.",
    category: "SPEED",
    difficulty: "Easy → Hard",
    href: "/games/quick-math",
    available: true,
    accent: "yellow",
  },
  {
    icon: "🔤",
    title: "Word Scramble",
    description: "Untangle words, but use hints wisely.",
    category: "WORDS",
    difficulty: "Easy → Hard",
    href: "/games/word-scramble",
    available: true,
    accent: "purple",
  },
  {
    icon: "🧩",
    title: "Riddle Me",
    description: "Solve riddles before your hints run out.",
    category: "LOGIC",
    difficulty: "Easy → Hard",
    href: "/games/riddle-me",
    available: true,
    accent: "pink",
  },
  {
    icon: "❌⭕",
    title: "Tic-Tac-Toe",
    description: "Outplay the AI and create clever forks.",
    category: "LOGIC",
    difficulty: "Easy → Hard",
    href: "/games/tic-tac-toe",
    available: true,
    accent: "blue",
  },
  {
    icon: "👀",
    title: "Odd One Out",
    description: "Spot the odd item quickly for bonus points.",
    category: "FOCUS",
    difficulty: "Easy → Hard",
    href: "/games/odd-one-out",
    available: true,
    accent: "green",
  },
  {
    icon: "⚡",
    title: "Reaction Rush",
    description: "Wait for the signal, then react as fast as you can.",
    category: "SPEED",
    difficulty: "Easy → Hard",
    href: "/games/reaction-rush",
    available: true,
    accent: "yellow",
  },
  {
    icon: "🔢",
    title: "Number Memory",
    description: "Memorize longer numbers before they disappear.",
    category: "MEMORY",
    difficulty: "Easy → Hard",
    href: "/games/number-memory",
    available: true,
    accent: "cyan",
  },
  {
    icon: "🎨",
    title: "Color Clash",
    description: "Ignore the word and choose the actual color.",
    category: "FOCUS",
    difficulty: "Easy → Hard",
    href: "/games/color-clash",
    available: true,
    accent: "pink",
  },
  {
    icon: "🟦",
    title: "Pattern Recall",
    description: "Memorize the pattern and recreate it perfectly.",
    category: "MEMORY",
    difficulty: "Easy → Hard",
    href: "/games/pattern-recall",
    available: true,
    accent: "blue",
  },
  {
    icon: "🔁",
    title: "Sequence Master",
    description: "Watch the sequence, then reproduce it exactly.",
    category: "MEMORY",
    difficulty: "Easy → Hard",
    href: "/games/sequence-master",
    available: true,
    accent: "purple",
  },
  {
    icon: "🧠",
    title: "Logic Rush",
    description: "Solve tricky logic puzzles before time runs out.",
    category: "LOGIC",
    difficulty: "Easy → Hard",
    href: "/games/logic-rush",
    available: true,
    accent: "green",
  },
];

const accentStyles: Record<
  string,
  {
    icon: string;
    category: string;
    glow: string;
  }
> = {
  cyan: {
    icon: "group-hover:bg-cyan-300/10 group-hover:border-cyan-300/20",
    category: "text-cyan-300/70",
    glow: "group-hover:shadow-cyan-400/[0.06]",
  },
  yellow: {
    icon: "group-hover:bg-yellow-300/10 group-hover:border-yellow-300/20",
    category: "text-yellow-300/70",
    glow: "group-hover:shadow-yellow-400/[0.06]",
  },
  purple: {
    icon: "group-hover:bg-purple-300/10 group-hover:border-purple-300/20",
    category: "text-purple-300/70",
    glow: "group-hover:shadow-purple-400/[0.06]",
  },
  pink: {
    icon: "group-hover:bg-pink-300/10 group-hover:border-pink-300/20",
    category: "text-pink-300/70",
    glow: "group-hover:shadow-pink-400/[0.06]",
  },
  blue: {
    icon: "group-hover:bg-blue-300/10 group-hover:border-blue-300/20",
    category: "text-blue-300/70",
    glow: "group-hover:shadow-blue-400/[0.06]",
  },
  green: {
    icon: "group-hover:bg-green-300/10 group-hover:border-green-300/20",
    category: "text-green-300/70",
    glow: "group-hover:shadow-green-400/[0.06]",
  },
};

const categories: Array<"ALL" | GameCategory> = [
  "ALL",
  "MEMORY",
  "SPEED",
  "FOCUS",
  "WORDS",
  "LOGIC",
];

export default function GamesPage() {
  const [progress, setProgress] =
    useState<MindPlayProgress | null>(null);

  const [activeCategory, setActiveCategory] =
    useState<"ALL" | GameCategory>("ALL");

  useEffect(() => {
    const update = () => {
      setProgress(getProgress());
    };

    update();

    return subscribeToProgress(update);
  }, []);

  const xp = progress?.xp ?? 0;
  const streak = progress?.streak ?? 0;
  const gamesPlayed = progress?.gamesPlayed ?? 0;

  const level = Math.floor(xp / 100) + 1;
  const levelXP = xp % 100;

  const filteredGames = useMemo(() => {
    if (activeCategory === "ALL") {
      return games;
    }

    return games.filter(
      (game) => game.category === activeCategory
    );
  }, [activeCategory]);

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Background */}
      <div className="mp-ambient-background pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-45 -top-45 h-112.5 w-112.5 rounded-full bg-cyan-400/[0.07] blur-[120px]" />

        <div className="absolute -right-45 top-[25%] h-112.5 w-112.5 rounded-full bg-purple-500/[0.07] blur-[130px]" />

        <div className="absolute -bottom-45 left-[30%] h-100 w-100 rounded-full bg-pink-500/5 blur-[130px]" />
      </div>

      {/* Navigation */}
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-black tracking-tight"
        >
          <PlayerBrand />
        </Link>

        <Link
          href="/"
          className="mp-button border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/9 hover:text-white"
        >
          ← Home
        </Link>
      </nav>

      {/* Main content */}
      <div className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        {/* Header */}
        <section className="pt-8 text-center sm:pt-12">
          <div className="mp-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-purple-300/10 bg-purple-300/5 px-4 py-2 text-xs font-bold tracking-wide text-purple-200/80">
            <span className="text-sm">🎮</span>
            GAME ARCADE
          </div>

          <h1 className="mp-fade-up text-4xl font-black tracking-[-0.04em] sm:text-6xl">
            Choose your
            <br />
            <span className="mp-gradient-text">
              challenge.
            </span>
          </h1>

          <p className="mp-fade-up mx-auto mt-5 max-w-xl text-sm leading-7 text-white/45 sm:text-base">
            Twelve quick games. Different ways to test your
            brain. Pick one and see how far you can go.
          </p>
        </section>

        {/* Player mini dashboard */}
        <section className="mt-10">
          <div className="mp-card rounded-4xl p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              {/* Level */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.07] text-lg font-black">
                  {level}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                    Player Level
                  </p>

                  <p className="mt-1 font-black">
                    Level {level}
                  </p>
                </div>
              </div>

              {/* XP */}
              <div className="w-full sm:max-w-xs">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-white/40">
                    XP Progress
                  </span>

                  <span className="font-bold text-cyan-300/70">
                    {levelXP}/100
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-cyan-300 to-purple-400 transition-all duration-500"
                    style={{
                      width: `${levelXP}%`,
                    }}
                  />
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/4 px-3 py-2 text-center">
                  <p className="text-[9px] font-black uppercase tracking-wider text-white/25">
                    Played
                  </p>

                  <p className="mt-0.5 font-black">
                    {gamesPlayed}
                  </p>
                </div>

                <div className="rounded-xl bg-orange-300/5 px-3 py-2 text-center">
                  <p className="text-[9px] font-black uppercase tracking-wider text-white/25">
                    Streak
                  </p>

                  <p className="mt-0.5 font-black text-orange-200">
                    🔥 {streak}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Games */}
        <section className="mt-10">
          <div className="mb-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/25">
                  Available Games
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Pick one
                </h2>
              </div>

              <span className="text-xs font-bold text-white/25">
                {filteredGames.length}{" "}
                {filteredGames.length === 1 ? "game" : "games"}
              </span>
            </div>

            {/* Category filters */}
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => {
                const active =
                  activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setActiveCategory(category)
                    }
                    className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-black tracking-wide transition-all duration-200 ${
                      active
                        ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
                        : "border-white/8 bg-white/4 text-white/35 hover:bg-white/7 hover:text-white/70"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((game, index) => {
              const accent =
                accentStyles[game.accent];

              if (!game.available) {
                return (
                  <div
                    key={game.href}
                    className="rounded-[1.75rem] border border-white/6 bg-white/2.5 p-5 opacity-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/3 text-3xl grayscale">
                        {game.icon}
                      </div>

                      <span className="rounded-full border border-white/5 bg-white/3 px-2.5 py-1 text-[10px] font-black tracking-wider text-white/25">
                        SOON
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-black text-white/60">
                      {game.title}
                    </h3>

                    <p className="mt-2 min-h-12 text-sm leading-6 text-white/30">
                      {game.description}
                    </p>

                    <div className="mt-5 text-sm font-bold text-white/20">
                      Coming soon
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={game.href}
                  href={game.href}
                  className={`mp-card mp-card-hover group relative overflow-hidden rounded-[1.75rem] p-5 shadow-xl ${accent.glow}`}
                  style={{
                    animationDelay: `${index * 60}ms`,
                  }}
                >
                  {/* Top */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/6 bg-white/5 text-3xl transition-all duration-200 ${accent.icon}`}
                    >
                      <span className="transition-transform duration-200 group-hover:scale-110">
                        {game.icon}
                      </span>
                    </div>

                    <span
                      className={`rounded-full border border-white/10 bg-white/4 px-2.5 py-1 text-[10px] font-black tracking-wider ${accent.category}`}
                    >
                      {game.category}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="mt-5 text-xl font-black tracking-tight">
                    {game.title}
                  </h3>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-white/45">
                    {game.description}
                  </p>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/6 pt-4">
                    <span className="text-xs font-bold text-white/30">
                      {game.difficulty}
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-sm text-white/40 transition-all duration-200 group-hover:translate-x-1 group-hover:bg-white/10 group-hover:text-white">
                      →
                    </span>
                  </div>

                  {/* Decorative glow */}
                  <div className="pointer-events-none absolute -right-12.5 -top-12.5 h-32 w-32 rounded-full bg-white/2.5 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-12">
          <div className="relative overflow-hidden rounded-4xl border border-white/[0.07] bg-white/2.5 p-6 text-center sm:p-8">
            <div className="pointer-events-none absolute left-1/2 -top-25 h-52 w-52 -translate-x-1/2 rounded-full bg-cyan-300/5 blur-[80px]" />

            <div className="relative">
              <div className="text-3xl">🧠</div>

              <h2 className="mt-3 text-xl font-black">
                How sharp is your brain today?
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
                Pick a game, chase a high score, and
                keep your streak alive.
              </p>

              <Link
                href="/"
                className="mp-button mt-5 border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70 hover:bg-white/9 hover:text-white"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/6 px-5 py-8 text-center sm:px-8">
        <PlayerFooterText>
          MindPlay · Think. Play. Conquer. 
        </PlayerFooterText>
      </footer>
    </main>
  );
}