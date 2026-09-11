"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getProgress,
  subscribeToProgress,
  type MindPlayProgress,
} from "@/lib/progress";
import { getLevelProgress } from "@/lib/levels";
import PlayerFooterText from "@/components/PlayerFooterText";
import PlayerBrand from "@/components/PlayerBrand";
import DailyChallenge from "@/components/DailyChallenge";
import DeveloperSupport from "@/components/DeveloperSupport";
import AccountMenu from "@/components/AccountMenu";
import Feedback from "@/app/components/Feedback";
import Achievements from "@/app/components/Achievements";

type GameCategory =
  | "ALL"
  | "MEMORY"
  | "SPEED"
  | "FOCUS"
  | "WORDS"
  | "LOGIC";

type Game = {
  icon: string;
  title: string;
  description: string;
  href: string;
  tag: Exclude<GameCategory, "ALL">;
  accent: string;
};

const games: Game[] = [
  {
    icon: "🧠",
    title: "Memory Match",
    description: "Remember the cards. Match them all.",
    href: "/games/memory-match",
    tag: "MEMORY",
    accent: "cyan",
  },
  {
    icon: "⚡",
    title: "Quick Math",
    description: "Solve fast. Think faster.",
    href: "/games/quick-math",
    tag: "SPEED",
    accent: "yellow",
  },
  {
    icon: "🔤",
    title: "Word Scramble",
    description: "Unscramble the word before time runs out.",
    href: "/games/word-scramble",
    tag: "WORDS",
    accent: "purple",
  },
  {
    icon: "🧩",
    title: "Riddle Me",
    description: "Can you figure out the answer?",
    href: "/games/riddle-me",
    tag: "LOGIC",
    accent: "pink",
  },
  {
    icon: "❌⭕",
    title: "Tic-Tac-Toe",
    description: "Outsmart the AI.",
    href: "/games/tic-tac-toe",
    tag: "LOGIC",
    accent: "blue",
  },
  {
    icon: "👀",
    title: "Odd One Out",
    description: "Find what doesn't belong.",
    href: "/games/odd-one-out",
    tag: "FOCUS",
    accent: "green",
  },
  {
    icon: "⚡",
    title: "Reaction Rush",
    description: "React as fast as humanly possible.",
    href: "/games/reaction-rush",
    tag: "SPEED",
    accent: "yellow",
  },
  {
    icon: "🔢",
    title: "Number Memory",
    description: "Remember increasingly brutal numbers.",
    href: "/games/number-memory",
    tag: "MEMORY",
    accent: "cyan",
  },
  {
    icon: "🎨",
    title: "Color Clash",
    description: "Ignore the word. Trust the color.",
    href: "/games/color-clash",
    tag: "FOCUS",
    accent: "pink",
  },
  {
    icon: "🟦",
    title: "Pattern Recall",
    description: "Watch the pattern. Rebuild it perfectly.",
    href: "/games/pattern-recall",
    tag: "MEMORY",
    accent: "blue",
  },
  {
    icon: "🔁",
    title: "Sequence Master",
    description: "Remember the sequence. Reproduce it.",
    href: "/games/sequence-master",
    tag: "MEMORY",
    accent: "purple",
  },
  {
    icon: "🧠",
    title: "Logic Rush",
    description: "Solve puzzles before the clock destroys you.",
    href: "/games/logic-rush",
    tag: "LOGIC",
    accent: "green",
  },
];

const accentStyles: Record<
  string,
  {
    icon: string;
    category: string;
    action: string;
    glow: string;
  }
> = {
  cyan: {
    icon: "group-hover:bg-cyan-300/10 group-hover:border-cyan-300/20",
    category: "text-cyan-300/70",
    action: "text-cyan-300/70 group-hover:text-cyan-200",
    glow: "group-hover:bg-cyan-300/[0.035]",
  },

  yellow: {
    icon: "group-hover:bg-yellow-300/10 group-hover:border-yellow-300/20",
    category: "text-yellow-300/70",
    action: "text-yellow-300/70 group-hover:text-yellow-200",
    glow: "group-hover:bg-yellow-300/[0.025]",
  },

  purple: {
    icon: "group-hover:bg-purple-300/10 group-hover:border-purple-300/20",
    category: "text-purple-300/70",
    action: "text-purple-300/70 group-hover:text-purple-200",
    glow: "group-hover:bg-purple-300/[0.025]",
  },

  pink: {
    icon: "group-hover:bg-pink-300/10 group-hover:border-pink-300/20",
    category: "text-pink-300/70",
    action: "text-pink-300/70 group-hover:text-pink-200",
    glow: "group-hover:bg-pink-300/[0.025]",
  },

  blue: {
    icon: "group-hover:bg-blue-300/10 group-hover:border-blue-300/20",
    category: "text-blue-300/70",
    action: "text-blue-300/70 group-hover:text-blue-200",
    glow: "group-hover:bg-blue-300/[0.025]",
  },

  green: {
    icon: "group-hover:bg-green-300/10 group-hover:border-green-300/20",
    category: "text-green-300/70",
    action: "text-green-300/70 group-hover:text-green-200",
    glow: "group-hover:bg-green-300/[0.025]",
  },
};

const categories: GameCategory[] = [
  "ALL",
  "MEMORY",
  "SPEED",
  "FOCUS",
  "WORDS",
  "LOGIC",
];

function shuffleGames(gameList: Game[]): Game[] {
  const shuffled = [...gameList];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export default function HomePage() {
  const pageRef = useRef<HTMLElement>(null);

  const [progress, setProgress] =
    useState<MindPlayProgress | null>(null);

  const [activeCategory, setActiveCategory] =
    useState<GameCategory>("ALL");

  const [shuffledGames, setShuffledGames] =
    useState<Game[]>(games);

  /* =========================
     SCROLL REVEAL
  ========================== */

  useEffect(() => {
    const page = pageRef.current;

    if (!page) return;

    const elements =
      page.querySelectorAll<HTMLElement>(
        "[data-reveal]",
      );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  /* =========================
     SHUFFLE GAMES
  ========================== */

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setShuffledGames(shuffleGames(games));
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  /* =========================
     PROGRESS
  ========================== */

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
  const bestScore = progress?.bestScore ?? 0;

  const levelProgress = getLevelProgress(xp);

  const filteredGames = useMemo(() => {
    if (activeCategory === "ALL") {
      return shuffledGames;
    }

    return shuffledGames.filter(
      (game) => game.tag === activeCategory,
    );
  }, [activeCategory, shuffledGames]);

  return (
    <main
      ref={pageRef}
      className="min-h-screen overflow-hidden bg-[#050505] text-white"
    >
      {/* =========================
          ANIMATION STYLES
      ========================== */}

      <style jsx>{`
        [data-reveal] {
          opacity: 0;
          transform: translateY(35px);
          transition:
            opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }

        [data-reveal].is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .game-card {
          opacity: 0;
          transform: translateY(25px);
          animation: gameReveal 0.8s
            cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes gameReveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-reveal],
          .game-card {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* =========================
          AMBIENT BACKGROUND
      ========================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-60 -top-60 h-162.5 w-162.5 rounded-full bg-cyan-400/[0.035] blur-[150px]" />

        <div className="absolute -right-60 top-[35%] h-162.5 w-162.5 rounded-full bg-fuchsia-500/2.5 blur-[150px]" />
      </div>

      {/* =========================
          NAVIGATION
      ========================== */}

      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-6 sm:px-8">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2"
        >
          <PlayerBrand />
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <AccountMenu />

          <Link
            href="/games"
            aria-label="All Games"
            className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2.5 text-sm font-semibold text-white/65 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07] hover:text-white sm:px-5"
          >
            <span className="sm:hidden">
              🎮
            </span>

            <span className="hidden sm:inline">
              All Games →
            </span>
          </Link>
        </div>
      </nav>

      {/* =========================
          HERO
      ========================== */}

      <section className="relative">
        <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <div
              data-reveal
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/2.5 px-4 py-2 text-xs font-bold tracking-wide text-white/45"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />

              YOUR BRAIN. YOUR GAME.
            </div>

            <div data-reveal>
  <h1 className="text-center font-extrabold leading-[0.86] tracking-[-0.3em]">
    <span className="block text-[clamp(4rem,10vw,8rem)]">
      Play.
    </span>

    <span className="mt-4 block whitespace-nowrap text-[clamp(3rem,10vw,8rem)] tracking-[-0.045em] bg-linear-to-r from-cyan-300 via-white to-fuchsia-400 bg-clip-text text-transparent">
      Think. Grow.
    </span>
  </h1>
</div>

            <p
              data-reveal
              className="mx-auto mt-8 max-w-xl text-base font-medium leading-8 text-white/35 sm:text-lg"
            >
              Think curious. Play smart.
            </p>

            <div
              data-reveal
              className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"
            >
              <Link
                href="/games"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-300"
              >
                🎮 Start Playing

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <a
                href="#games"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/2 px-7 py-3.5 text-sm font-semibold text-white/55 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                Explore Games ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          PLAYER PROGRESS
      ========================== */}

      <section
        data-reveal
        className="mx-auto w-full max-w-6xl px-6 sm:px-8"
      >
        <div className="rounded-3xl border border-white/[0.07] bg-white/2.5 p-6 sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Level */}

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/6 text-xl font-extrabold">
                {levelProgress.level}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/30">
                  Current level
                </p>

                <p className="mt-1 text-lg font-bold">
                  Level {levelProgress.level}
                </p>
              </div>
            </div>

            {/* XP */}

            <div className="w-full max-w-md">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-white/35">
                  Progress
                </span>

                <span className="font-bold text-cyan-300/75">
                  {levelProgress.xpIntoLevel}/
                  {levelProgress.xpNeeded} XP
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-linear-to-r from-cyan-300 via-purple-400 to-fuchsia-300 transition-all duration-700"
                  style={{
                    width: `${levelProgress.percentage}%`,
                  }}
                />
              </div>
            </div>

            {/* Streak */}

            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/30">
                  Streak
                </p>

                <p className="text-lg font-bold text-orange-200">
                  {streak} day
                  {streak === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          STATS
      ========================== */}

      <section
        data-reveal
        className="mx-auto w-full max-w-6xl px-6 pt-4 sm:px-8"
      >
        <div className="grid grid-cols-2 border-y border-white/6 sm:grid-cols-4">
          <Stat
            label="Games"
            value={gamesPlayed.toString()}
          />

          <Stat
            label="XP"
            value={xp.toString()}
            accent="cyan"
          />

          <Stat
            label="Streak"
            value={`🔥 ${streak}`}
            accent="orange"
          />

          <Stat
            label="Best score"
            value={bestScore.toString()}
            accent="purple"
          />
        </div>
      </section>

      {/* =========================
          ACHIEVEMENTS
      ========================== */}

      <div
        data-reveal
        className="mt-10"
      >
        <Achievements />
      </div>

      {/* =========================
          DAILY CHALLENGE
      ========================== */}

      <div
        data-reveal
        className="mt-2"
      >
        <DailyChallenge />
      </div>

      {/* =========================
          GAMES
      ========================== */}

      <section
        id="games"
        className="mx-auto w-full max-w-6xl px-6 pb-20 pt-24 sm:px-8 sm:pt-32"
      >
        <div
          data-reveal
          className="mb-12 flex items-end justify-between gap-6"
        >
          <div>
            <p className="mb-4 text-sm font-bold text-cyan-300/60">
              Game library
            </p>

            <h2 className="text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Pick a game.
            </h2>
          </div>

          <p className="hidden pb-1 text-sm font-medium text-white/25 sm:block">
            {filteredGames.length}{" "}
            {filteredGames.length === 1
              ? "game"
              : "games"}
          </p>
        </div>

        {/* Categories */}

        <div
          data-reveal
          className="mb-8 overflow-x-auto pb-2"
        >
          <div className="flex min-w-max gap-2">
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
                  className={`rounded-full border px-4 py-2.5 text-xs font-bold tracking-wide transition-all duration-300 ${
                    active
                      ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                      : "border-white/10 bg-white/2 text-white/35 hover:border-white/15 hover:bg-white/5 hover:text-white/70"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile count */}

        <div className="mb-5 text-xs font-medium text-white/25 sm:hidden">
          Showing {filteredGames.length}{" "}
          {filteredGames.length === 1
            ? "game"
            : "games"}
        </div>

        {/* Game cards */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game, index) => {
            const accent =
              accentStyles[game.accent];

            return (
              <Link
                key={game.href}
                href={game.href}
                className={`game-card group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/2.5 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-white/13 hover:bg-white/4 ${accent.glow}`}
                style={{
                  animationDelay: `${index * 70}ms`,
                }}
              >
                {/* Subtle card glow */}

                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/6 bg-white/4.5 text-3xl transition-all duration-500 group-hover:scale-105 ${accent.icon}`}
                    >
                      {game.icon}
                    </div>

                    <span
                      className={`rounded-full border border-white/8 bg-white/2.5 px-2.5 py-1 text-[10px] font-bold tracking-wide ${accent.category}`}
                    >
                      {game.tag}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-extrabold tracking-tight transition-transform duration-500 group-hover:translate-x-0.5">
                    {game.title}
                  </h3>

                  <p className="mt-2 min-h-12 text-sm font-medium leading-6 text-white/35">
                    {game.description}
                  </p>

                  <div className="mt-7 flex items-center justify-between">
                    <span
                      className={`text-sm font-bold transition-colors duration-300 ${accent.action}`}
                    >
                      Play game
                    </span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-sm text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white/9 group-hover:text-white">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}

        {filteredGames.length === 0 && (
          <div className="rounded-3xl border border-white/[0.07] bg-white/2.5 p-10 text-center">
            <div className="text-4xl">🤔</div>

            <p className="mt-4 font-bold">
              No games found
            </p>

            <button
              type="button"
              onClick={() =>
                setActiveCategory("ALL")
              }
              className="mt-4 text-sm font-bold text-cyan-300 transition-colors hover:text-cyan-200"
            >
              Show all games
            </button>
          </div>
        )}
      </section>

      {/* =========================
          SUPPORT
      ========================== */}

      <div
        data-reveal
        className="mx-auto max-w-6xl space-y-5 px-6 pb-20 sm:px-8"
      >
        <DeveloperSupport />

        <Feedback />
      </div>

      {/* =========================
          FOOTER
      ========================== */}

      <footer className="border-t border-white/6">
        <div className="mx-auto max-w-6xl px-6 py-10 text-center sm:px-8">
          <PlayerFooterText>
            MindPlay ·  Play. Think. Grow.
          </PlayerFooterText>
        </div>
      </footer>
    </main>
  );
}

/* =========================
   STAT
========================== */

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "cyan" | "orange" | "purple";
}) {
  const valueColor =
    accent === "cyan"
      ? "text-cyan-300"
      : accent === "orange"
        ? "text-orange-300"
        : accent === "purple"
          ? "text-purple-300"
          : "text-white";

  return (
    <div className="border-b border-white/6 p-5 transition-colors duration-300 hover:bg-white/1.5 sm:border-b-0 sm:border-r sm:p-6 sm:last:border-r-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/25">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-extrabold tracking-tight ${valueColor}`}
      >
        {value}
      </p>
    </div>
  );
}