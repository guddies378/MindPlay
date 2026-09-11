"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getProgress,
  subscribeToProgress,
  type MindPlayProgress,
} from "@/lib/progress";
import { getLevelProgress } from "@/lib/levels";
import PlayerFooterText from "@/components/PlayerFooterText";
import PlayerBrand from "@/components/PlayerBrand";
import AccountMenu from "@/components/AccountMenu";

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
    line: string;
  }
> = {
  cyan: {
    icon: "group-hover:bg-cyan-300/10 group-hover:border-cyan-300/20",
    category: "text-cyan-300/70",
    glow: "group-hover:bg-cyan-300/[0.025]",
    line: "group-hover:bg-cyan-300/50",
  },

  yellow: {
    icon: "group-hover:bg-yellow-300/10 group-hover:border-yellow-300/20",
    category: "text-yellow-300/70",
    glow: "group-hover:bg-yellow-300/[0.02]",
    line: "group-hover:bg-yellow-300/50",
  },

  purple: {
    icon: "group-hover:bg-purple-300/10 group-hover:border-purple-300/20",
    category: "text-purple-300/70",
    glow: "group-hover:bg-purple-300/[0.02]",
    line: "group-hover:bg-purple-300/50",
  },

  pink: {
    icon: "group-hover:bg-pink-300/10 group-hover:border-pink-300/20",
    category: "text-pink-300/70",
    glow: "group-hover:bg-pink-300/[0.02]",
    line: "group-hover:bg-pink-300/50",
  },

  blue: {
    icon: "group-hover:bg-blue-300/10 group-hover:border-blue-300/20",
    category: "text-blue-300/70",
    glow: "group-hover:bg-blue-300/[0.02]",
    line: "group-hover:bg-blue-300/50",
  },

  green: {
    icon: "group-hover:bg-green-300/10 group-hover:border-green-300/20",
    category: "text-green-300/70",
    glow: "group-hover:bg-green-300/[0.02]",
    line: "group-hover:bg-green-300/50",
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

export default function GamesPage() {
  const pageRef = useRef<HTMLElement>(null);

  const [progress, setProgress] =
    useState<MindPlayProgress | null>(null);

  const [activeCategory, setActiveCategory] =
    useState<"ALL" | GameCategory>("ALL");

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
     SHUFFLE
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

  const levelProgress = getLevelProgress(xp);

  const filteredGames = useMemo(() => {
    if (activeCategory === "ALL") {
      return shuffledGames;
    }

    return shuffledGames.filter(
      (game) => game.category === activeCategory,
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

        <div className="absolute -right-60 top-[30%] h-162.5 w-162.5 rounded-full bg-fuchsia-500/2.5 blur-[150px]" />

        <div className="absolute -bottom-75 left-[35%] h-125 w-125 rounded-full bg-purple-500/2 blur-[150px]" />
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
            href="/"
            aria-label="Home"
            className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2.5 text-sm font-semibold text-white/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07] hover:text-white sm:px-5"
          >
            <span className="sm:hidden">
              🏠
            </span>

            <span className="hidden sm:inline">
              🏠 Home
            </span>
          </Link>
        </div>
      </nav>

      {/* =========================
          MAIN
      ========================== */}

      <div className="mx-auto w-full max-w-6xl px-6 pb-20 sm:px-8">
        {/* =========================
            HERO
        ========================== */}

        <section className="pb-20 pt-16 text-center sm:pb-28 sm:pt-24">
          <div
            data-reveal
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/2.5 px-4 py-2 text-xs font-bold tracking-wide text-white/45"
          >
            <span className="text-sm">
              🎮
            </span>

            GAME ARCADE
          </div>

          <div data-reveal>
            <h1 className="text-[clamp(4rem,9vw,7rem)] font-extrabold leading-[0.88] tracking-[-0.07em]">
              Choose your
              <br />

              <span className="bg-linear-to-r from-cyan-300 via-white to-fuchsia-400 bg-clip-text text-transparent">
                challenge.
              </span>
            </h1>
          </div>

          <p
            data-reveal
            className="mx-auto mt-8 max-w-xl text-base font-medium leading-8 text-white/35 sm:text-lg"
          >
            Think differently. Play differently.
          <br />
            Find a challenge worth taking.
          </p>
        </section>

        {/* =========================
            PLAYER PROGRESS
        ========================== */}

        <section data-reveal>
          <div className="rounded-3xl border border-white/[0.07] bg-white/2.5 p-6 sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              {/* Level */}

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/6 text-xl font-extrabold">
                  {levelProgress.level}
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                    Player level
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
                    XP progress
                  </span>

                  <span className="font-bold text-cyan-300/75">
                    {levelProgress.xpIntoLevel}/
                    {levelProgress.xpNeeded} XP
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-cyan-300 to-purple-400 transition-all duration-700"
                    style={{
                      width: `${levelProgress.percentage}%`,
                    }}
                  />
                </div>
              </div>

              {/* Stats */}

              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/25">
                    Played
                  </p>

                  <p className="mt-1 text-lg font-extrabold">
                    {gamesPlayed}
                  </p>
                </div>

                <div className="h-9 w-px bg-white/8" />

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/25">
                    Streak
                  </p>

                  <p className="mt-1 text-lg font-extrabold text-orange-200">
                    🔥 {streak}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            GAME LIBRARY
        ========================== */}

        <section className="pt-28 sm:pt-36">
          <div
            data-reveal
            className="mb-10 flex items-end justify-between gap-6"
          >
            <div>
              <p className="mb-4 text-sm font-bold text-cyan-300/60">
                Game library
              </p>

              <h2 className="text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">
                Pick one.
              </h2>
            </div>

            <span className="hidden pb-1 text-sm font-medium text-white/25 sm:block">
              {filteredGames.length}{" "}
              {filteredGames.length === 1
                ? "game"
                : "games"}
            </span>
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
            {filteredGames.length}{" "}
            {filteredGames.length === 1
              ? "game"
              : "games"}
          </div>

          {/* Game Cards */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((game, index) => {
              const accent =
                accentStyles[game.accent];

              if (!game.available) {
                return (
                  <div
                    key={game.href}
                    className="rounded-3xl border border-white/6 bg-white/2 p-6 opacity-45"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/3 text-3xl grayscale">
                        {game.icon}
                      </div>

                      <span className="rounded-full border border-white/6 bg-white/2.5 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white/25">
                        SOON
                      </span>
                    </div>

                    <h3 className="mt-7 text-xl font-extrabold text-white/60">
                      {game.title}
                    </h3>

                    <p className="mt-2 min-h-12 text-sm leading-6 text-white/30">
                      {game.description}
                    </p>

                    <div className="mt-7 border-t border-white/6 pt-4 text-sm font-bold text-white/20">
                      Coming soon
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={game.href}
                  href={game.href}
                  className={`game-card group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/2.5 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-white/13 hover:bg-white/4 ${accent.glow}`}
                  style={{
                    animationDelay: `${index * 70}ms`,
                  }}
                >
                  <div className="relative">
                    {/* Icon + category */}

                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/6 bg-white/4.5 text-3xl transition-all duration-500 group-hover:scale-105 ${accent.icon}`}
                      >
                        <span className="transition-transform duration-500 group-hover:scale-110">
                          {game.icon}
                        </span>
                      </div>

                      <span
                        className={`rounded-full border border-white/8 bg-white/2.5 px-2.5 py-1 text-[10px] font-bold tracking-wide ${accent.category}`}
                      >
                        {game.category}
                      </span>
                    </div>

                    {/* Content */}

                    <h3 className="mt-7 text-xl font-extrabold tracking-tight transition-transform duration-500 group-hover:translate-x-0.5">
                      {game.title}
                    </h3>

                    <p className="mt-2 min-h-12 text-sm font-medium leading-6 text-white/35">
                      {game.description}
                    </p>

                    {/* Footer */}

                    <div className="mt-7 flex items-center justify-between border-t border-white/6 pt-4">
                      <span className="text-xs font-semibold text-white/25">
                        {game.difficulty}
                      </span>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-sm text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white/9 group-hover:text-white">
                        →
                      </span>
                    </div>

                    {/* Bottom accent */}

                    <div
                      className={`absolute bottom-0 left-6 right-6 h-px scale-x-0 opacity-0 transition-all duration-500 group-hover:scale-x-100 group-hover:opacity-100 ${accent.line}`}
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Empty state */}

          {filteredGames.length === 0 && (
            <div className="rounded-3xl border border-white/[0.07] bg-white/2.5 p-12 text-center">
              <div className="text-4xl">
                🤔
              </div>

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
            BOTTOM CTA
        ========================== */}

        <section
          data-reveal
          className="mt-32"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/2.5 px-6 py-14 text-center sm:px-10 sm:py-16"
          >
            <div className="pointer-events-none absolute left-1/2 -top-25 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-300/[0.035] blur-[100px]" />

            <div className="relative">
              <div className="text-3xl">
                🧠
              </div>

              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
                How sharp is your brain today?
              </h2>

              <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-7 text-white/35">
                Pick a game, chase a high score, and
                keep your streak alive.
              </p>

              <Link
                href="/"
                className="mt-7 inline-flex rounded-full border border-white/10 bg-white/[0.035] px-6 py-3 text-sm font-semibold text-white/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* =========================
          FOOTER
      ========================== */}

      <footer className="border-t border-white/6">
        <div className="mx-auto max-w-6xl px-6 py-10 text-center sm:px-8">
          <PlayerFooterText>
            MindPlay · Play. Think. Grow.
          </PlayerFooterText>
        </div>
      </footer>
    </main>
  );
}