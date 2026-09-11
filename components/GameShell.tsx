"use client";

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

      if (!mounted) {
        return;
      }

      setAchievementUser(user?.id ?? null);
    };

    void initializeUser();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-[#050505] text-white">
      {/* Shared ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-18%] top-[-18%] h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl sm:h-96 sm:w-96" />

        <div className="absolute right-[-18%] top-[22%] h-56 w-56 rounded-full bg-purple-500/[0.07] blur-3xl sm:h-80 sm:w-80" />

        <div className="absolute bottom-[-18%] left-[35%] h-64 w-64 rounded-full bg-fuchsia-500/[0.07] blur-3xl sm:h-96 sm:w-96" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2.5 sm:px-8 sm:py-3">
        <Link
          href="/"
          className="group flex items-center gap-2 text-base font-black tracking-tight sm:text-lg"
          aria-label="Go to MindPlay home"
        >
          <PlayerBrand />
        </Link>

        <Link
          href="/games"
          className="mp-button shrink-0 border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/70 transition-colors hover:bg-white/8 hover:text-white sm:px-4 sm:py-2 sm:text-sm"
        >
          ← Games
        </Link>
      </nav>

      {/* Game content */}
      <section
        className={`relative z-10 mx-auto w-full ${MAX_WIDTHS[maxWidth]} px-3 pb-8 pt-1 sm:px-6 sm:pb-10 sm:pt-2 lg:px-8`}
      >
        {/* Shared game identity */}
        <header className="mp-fade-up text-center">
          <div className="mp-float mb-1.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl shadow-2xl sm:mb-2 sm:h-12 sm:w-12 sm:rounded-2xl sm:text-2xl">
            {icon}
          </div>

          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300/70 sm:text-[10px] sm:tracking-[0.25em]">
            {category}
          </p>

          <h1 className="mt-0.5 text-xl font-black tracking-[-0.035em] sm:text-3xl lg:text-4xl">
            {title}{" "}
            {highlightedTitle && (
              <span className="mp-gradient-text">
                {highlightedTitle}
              </span>
            )}
          </h1>

          <p className="mx-auto mt-1 max-w-xl text-[11px] leading-4.5 text-white/60 sm:mt-1.5 sm:text-sm sm:leading-5">
            {description}
          </p>
        </header>

        {/* Game UI */}
        <div
          className="mt-3 w-full pb-4 sm:mt-5 sm:pb-5"
          style={{
            touchAction: "pan-y",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/6 px-5 py-4 text-center sm:py-5">
        <PlayerFooterText>
          MindPlay · Play. Think. Repeat.
        </PlayerFooterText>
      </footer>

      <style jsx>{`
        html,
        body {
          overflow-x: hidden;
        }

        main {
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 640px) {
          footer {
            padding-bottom: calc(1rem + env(safe-area-inset-bottom));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          main {
            scroll-behavior: auto;
          }
        }
      `}</style>
    </main>
  );
}