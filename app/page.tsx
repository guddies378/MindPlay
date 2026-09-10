"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0b1020] text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 -top-45 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-45 -left-25 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute -right-25 top-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex min-h-screen flex-col">
        {/* Navbar */}
        <header className="flex items-center justify-between px-5 py-5 sm:px-8 sm:py-7">
          <div className="text-lg font-black tracking-tight sm:text-xl">
            🧠 MindPlay
          </div>

          <Link
            href="/login"
            className="mp-button border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Log In
          </Link>
        </header>

        {/* Hero */}
        <section className="flex flex-1 items-center justify-center px-5 py-16 sm:px-8">
          <div className="w-full max-w-3xl text-center">
            {/* Icon */}
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-4xl shadow-2xl shadow-cyan-500/5">
              🧠
            </div>

            {/* Heading */}
            <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-cyan-300/70">
              Welcome to MindPlay
            </p>

            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              Train your mind.
              <br />
              <span className="text-cyan-300">
                Have fun doing it.
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/45 sm:text-base">
              Play quick brain games, sharpen your thinking,
              earn XP, and build your streak while having fun.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="mp-button w-full bg-cyan-300 px-7 py-3.5 text-sm font-black text-[#07101b] transition hover:bg-cyan-200 sm:w-auto"
              >
                GET STARTED
              </Link>

              <Link
                href="/login"
                className="mp-button w-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-bold text-white/65 transition hover:bg-white/10 hover:text-white sm:w-auto"
              >
                I ALREADY HAVE AN ACCOUNT
              </Link>
            </div>

            {/* Features */}
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-5">
                <div className="text-2xl">🧠</div>
                <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-white/45 sm:text-xs">
                  Brain Games
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-5">
                <div className="text-2xl">⚡</div>
                <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-white/45 sm:text-xs">
                  Earn XP
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-5">
                <div className="text-2xl">🔥</div>
                <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-white/45 sm:text-xs">
                  Build Streaks
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-5 py-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
            Make your mind sharper, one game at a time.
          </p>
        </footer>
      </div>
    </main>
  );
}