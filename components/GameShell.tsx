import Link from "next/link";
import type { ReactNode } from "react";

import PlayerBrand from "@/components/PlayerBrand";
import PlayerFooterText from "@/components/PlayerFooterText";

type GameShellProps = {
  icon: string;
  category: string;
  title: string;
  highlightedTitle?: string;
  description: string;
  children: ReactNode;
  maxWidth?: "md" | "lg" | "xl";
};

const MAX_WIDTHS = {
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
};

export default function GameShell({
  icon,
  category,
  title,
  highlightedTitle,
  description,
  children,
  maxWidth = "lg",
}: GameShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-transparent text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-12%] h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="absolute right-[-12%] top-[25%] h-80 w-80 rounded-full bg-purple-500/[0.07] blur-3xl" />

        <div className="absolute bottom-[-15%] left-[35%] h-96 w-96 rounded-full bg-fuchsia-500/[0.07] blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-black tracking-tight"
          aria-label="Go to MindPlay home"
        >
          <PlayerBrand />
        </Link>

        <Link
          href="/games"
          className="mp-button border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/70 hover:bg-white/8 hover:text-white"
        >
          ← Games
        </Link>
      </nav>

      {/* Main content */}
      <section
        className={`relative z-10 mx-auto w-full ${MAX_WIDTHS[maxWidth]} px-5 pb-20 pt-8 sm:px-8`}
      >
        {/* Game header */}
        <div className="mp-fade-up text-center">
          <div className="mp-float mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-4xl shadow-2xl">
            {icon}
          </div>

          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300/60">
            {category}
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            {title}{" "}
            {highlightedTitle && (
              <span className="mp-gradient-text">
                {highlightedTitle}
              </span>
            )}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/45 sm:text-base">
            {description}
          </p>
        </div>

        {/* Game content */}
        {children}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/6 px-5 py-8 text-center">
        <PlayerFooterText>
          MindPlay · Play. Think. Repeat.
        </PlayerFooterText>
      </footer>
    </main>
  );
}