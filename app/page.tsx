"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getProgress,
  subscribeToProgress,
  type MindPlayProgress,
} from "@/lib/progress";
import PlayerFooterText from "@/components/PlayerFooterText";
import PlayerBrand from "@/components/PlayerBrand";
import DailyChallengeCard from "@/components/DailyChallengeCard";

const games = [
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
    tag: "MATH",
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
    tag: "STRATEGY",
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
];

const accentStyles: Record<
  string,
  {
    icon: string;
    category: string;
    action: string;
  }
> = {
  cyan: {
    icon: "group-hover:bg-cyan-300/10 group-hover:border-cyan-300/20",
    category: "text-cyan-300/70",
    action: "text-cyan-300/70 group-hover:text-cyan-200",
  },
  yellow: {
    icon: "group-hover:bg-yellow-300/10 group-hover:border-yellow-300/20",
    category: "text-yellow-300/70",
    action: "text-yellow-300/70 group-hover:text-yellow-200",
  },
  purple: {
    icon: "group-hover:bg-purple-300/10 group-hover:border-purple-300/20",
    category: "text-purple-300/70",
    action: "text-purple-300/70 group-hover:text-purple-200",
  },
  pink: {
    icon: "group-hover:bg-pink-300/10 group-hover:border-pink-300/20",
    category: "text-pink-300/70",
    action: "text-pink-300/70 group-hover:text-pink-200",
  },
  blue: {
    icon: "group-hover:bg-blue-300/10 group-hover:border-blue-300/20",
    category: "text-blue-300/70",
    action: "text-blue-300/70 group-hover:text-blue-200",
  },
  green: {
    icon: "group-hover:bg-green-300/10 group-hover:border-green-300/20",
    category: "text-green-300/70",
    action: "text-green-300/70 group-hover:text-green-200",
  },
};

export default function HomePage() {
  const [progress, setProgress] =
    useState<MindPlayProgress | null>(null);

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

  const level = Math.floor(xp / 100) + 1;
  const levelXP = xp % 100;

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Background decorations */}
      <div className="mp-ambient-background pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-45 -top-45 h-112.5 w-112.5 rounded-full bg-cyan-400/[0.07] blur-[120px]" />

        <div className="absolute -right-45 top-[30%] h-112.5 w-112.5 rounded-full bg-purple-500/[0.07] blur-[130px]" />

        <div className="absolute -bottom-50 left-[35%] h-100 w-100 rounded-full bg-pink-500/5 blur-[130px]" />
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
          href="/games"
          className="mp-button border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/9 hover:text-white"
        >
          All Games →
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mp-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/10 bg-cyan-300/5 px-4 py-2 text-xs font-bold tracking-wide text-cyan-200/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
            YOUR BRAIN. YOUR GAME.
          </div>

          <h1 className="mp-fade-up text-5xl font-black tracking-[-0.04em] sm:text-7xl">
            Play.
            <br />
            <span className="mp-gradient-text">
              Think. Repeat.
            </span>
          </h1>

          <p className="mp-fade-up mx-auto mt-6 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
            Quick games designed to challenge your memory,
            speed, logic, and focus.
          </p>

          <div className="mp-fade-up mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/games"
              className="mp-button bg-white px-7 py-3.5 text-sm text-black shadow-xl shadow-white/5 hover:bg-cyan-50"
            >
              🎮 Start Playing
            </Link>

            <a
              href="#games"
              className="mp-button border border-white/10 bg-white/4 px-7 py-3.5 text-sm text-white/70 hover:bg-white/8 hover:text-white"
            >
              Explore Games ↓
            </a>
          </div>
        </div>
      </section>

      {/* Player progress */}
      <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mp-card rounded-4xl p-5 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Level */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.07] text-xl font-black">
                {level}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                  Current Level
                </p>

                <p className="mt-1 text-lg font-black">
                  Level {level}
                </p>
              </div>
            </div>

            {/* XP */}
            <div className="w-full max-w-md">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-bold text-white/50">
                  Progress
                </span>

                <span className="font-bold text-cyan-300/80">
                  {levelXP}/100 XP
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-linear-to-r from-cyan-300 via-purple-400 to-pink-300 transition-all duration-700"
                  style={{
                    width: `${levelXP}%`,
                  }}
                />
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-3 rounded-2xl border border-orange-300/10 bg-orange-300/4 px-4 py-3">
              <span className="text-2xl">🔥</span>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-white/35">
                  Streak
                </p>

                <p className="text-lg font-black text-orange-200">
                  {streak} day{streak === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto w-full max-w-6xl px-5 pt-5 sm:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="mp-card rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-white/30">
              Games
            </p>

            <p className="mt-1 text-2xl font-black">
              {gamesPlayed}
            </p>
          </div>

          <div className="mp-card rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-white/30">
              XP
            </p>

            <p className="mt-1 text-2xl font-black text-cyan-300">
              {xp}
            </p>
          </div>

          <div className="mp-card rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-white/30">
              Streak
            </p>

            <p className="mt-1 text-2xl font-black text-orange-300">
              🔥 {streak}
            </p>
          </div>

          <div className="mp-card rounded-2xl p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-white/30">
              Best Score
            </p>

            <p className="mt-1 text-2xl font-black text-purple-300">
              {bestScore}
            </p>
          </div>
        </div>
      </section>

      {/* Games */}
      <section
        id="games"
        className="mx-auto w-full max-w-6xl px-5 pb-16 pt-16 sm:px-8 sm:pt-20"
      >
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-300/60">
              Game Arcade
            </p>

            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Pick a game
            </h2>
          </div>

          <Link
            href="/games"
            className="hidden text-sm font-bold text-white/40 transition hover:text-white sm:block"
          >
            View all →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game, index) => (
            (() => {
              const accent = accentStyles[game.accent];

              return (
            <Link
              key={game.href}
              href={game.href}
              className="mp-card mp-card-hover group rounded-[1.75rem] p-5"
              style={{
                animationDelay: `${index * 60}ms`,
              }}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/6 bg-white/6 text-3xl transition-all duration-200 ${accent.icon}`}>
                  {game.icon}
                </div>

                <span className={`rounded-full border border-white/10 bg-white/4 px-2.5 py-1 text-[10px] font-black tracking-wider ${accent.category}`}>
                  {game.tag}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-black">
                {game.title}
              </h3>

              <p className="mt-2 min-h-12 text-sm leading-6 text-white/45">
                {game.description}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className={`text-sm font-bold transition ${accent.action}`}>
                  Play game
                </span>

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/6 text-sm text-white/40 transition group-hover:translate-x-1 group-hover:bg-white/10 group-hover:text-white">
                  →
                </span>
              </div>
            </Link>
              );
            })()
          ))}
        </div>
      </section>

      {/* Daily challenge */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        <DailyChallengeCard />
      </section>

      {/* Footer */}
      <footer className="border-t border-white/6 px-5 py-8 text-center sm:px-8">
        <PlayerFooterText>MindPlay · Train your brain. Have fun.</PlayerFooterText>
      </footer>
    </main>
  );
}