import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect } from "react";

import PlayerBrand from "@/components/PlayerBrand";
import PlayerFooterText from "@/components/PlayerFooterText";
import { setAchievementUser } from "@/lib/achievements";
import { supabase } from "@/lib/supabase";

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
  useEffect(() => {
    let mounted = true;

    const initializeUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setAchievementUser(user?.id ?? null);
    };

    void initializeUser();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-transparent text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-12%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl sm:h-96 sm:w-96" />

        <div className="absolute right-[-12%] top-[25%] h-64 w-64 rounded-full bg-purple-500/[0.07] blur-3xl sm:h-80 sm:w-80" />

        <div className="absolute bottom-[-15%] left-[35%] h-72 w-72 rounded-full bg-fuchsia-500/[0.07] blur-3xl sm:h-96 sm:w-96" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-8 sm:py-3">
        <Link
          href="/"
          className="group flex items-center gap-2 text-base font-black tracking-tight sm:text-lg"
          aria-label="Go to MindPlay home"
        >
          <PlayerBrand />
        </Link>

        <Link
          href="/games"
          className="mp-button border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/70 hover:bg-white/8 hover:text-white sm:px-4 sm:py-2 sm:text-sm"
        >
          ← Games
        </Link>
      </nav>

      {/* Main game area */}
      <section
        className={`relative z-10 mx-auto flex w-full ${MAX_WIDTHS[maxWidth]} flex-col px-3 pb-6 pt-2 sm:px-8 sm:pb-8 sm:pt-3`}
      >
        {/* Game heading */}
        <div className="mp-fade-up shrink-0 text-center">
          <div className="mp-float mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl shadow-2xl sm:mb-3 sm:h-14 sm:w-14 sm:text-3xl">
            {icon}
          </div>

          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300/60 sm:text-[10px] sm:tracking-[0.25em]">
            {category}
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">
            {title}{" "}
            {highlightedTitle && (
              <span className="mp-gradient-text">
                {highlightedTitle}
              </span>
            )}
          </h1>

          <p className="mx-auto mt-1 max-w-xl text-[11px] leading-4 text-white/45 sm:mt-2 sm:text-sm sm:leading-5">
            {description}
          </p>
        </div>

        {/* Game content */}
        <div className="w-full">
          {children}
        </div>
      </section>

      {/* Footer */}
      <footer className="hidden border-t border-white/6 px-5 py-4 text-center sm:block sm:py-5">
        <PlayerFooterText>
          MindPlay · Play. Think. Repeat.
        </PlayerFooterText>
      </footer>
    </main>
  );
}