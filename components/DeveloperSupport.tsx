"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function DeveloperSupport() {
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          {/* ─────────────────────────────────────────
              SUPPORT THE DEVELOPER
          ───────────────────────────────────────── */}
          <div className="mp-card mp-card-hover group relative min-h-97.5 overflow-hidden rounded-4xl border border-white/8 p-6 sm:p-8">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl transition-all duration-700 group-hover:bg-pink-500/15" />

            <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-pink-500/5 blur-3xl" />

            {/* Decorative corner */}
            <div className="pointer-events-none absolute right-6 top-6 flex items-center gap-1 opacity-30">
              <span className="h-1 w-1 rounded-full bg-pink-300" />
              <span className="h-1 w-1 rounded-full bg-pink-300" />
              <span className="h-1 w-1 rounded-full bg-pink-300" />
            </div>

            <div className="relative z-10 flex min-h-83.5 flex-col">
              {/* Label */}
              <div className="flex items-center gap-3">
                <span className="text-sm">❤️</span>

                <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-300/75">
                  Support the Developer
                </p>
              </div>

              <div className="mt-4 h-px bg-linear-to-r from-pink-300/15 via-white/6 to-transparent" />

              {/* Main copy */}
              <div className="mt-7">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/25">
                  MindPlay // Support
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Enjoying{" "}
                  <span className="mp-gradient-text">
                    MindPlay?
                  </span>
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-white/50">
                  If the games made you think,
                  <br />
                  smile, or rage... 😈
                </p>

                <p className="mt-5 text-sm font-bold text-white/75">
                  GIVE COFFEE → DEV GOES BRRRR
                  <span className="text-base"> ☕🤤</span>
                </p>
              </div>

              {/* CTA */}
              <div className="mt-auto pt-7">
                <button
                  type="button"
                  onClick={() => setShowQR(true)}
                  className="group/button mp-button inline-flex items-center gap-3 border border-pink-300/20 bg-pink-300/10 px-5 py-3.5 text-sm font-black text-pink-100 transition-all duration-300 hover:-translate-y-1 hover:border-pink-300/40 hover:bg-pink-300/15 hover:shadow-[0_12px_30px_rgba(236,72,153,0.12)] active:translate-y-0"
                >
                  <span className="text-base transition-transform duration-300 group-hover/button:scale-110">
                    ☕
                  </span>

                  <span>Buy Me a Coffee</span>

                  <span className="text-pink-300 transition-transform duration-300 group-hover/button:translate-x-1">
                  </span>
                </button>

                <div className="mt-3 flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-pink-300/50" />

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
                    via GCash
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────
              MORE ABOUT THE DEVELOPER
          ───────────────────────────────────────── */}
          <div className="mp-card mp-card-hover group relative min-h-97.5 overflow-hidden rounded-4xl border border-white/8 p-6 sm:p-8">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl transition-all duration-700 group-hover:bg-cyan-400/15" />

            <div className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-cyan-400/5 blur-3xl" />

            {/* Decorative corner */}
            <div className="pointer-events-none absolute right-6 top-6 flex items-center gap-1 opacity-30">
              <span className="h-1 w-1 rounded-full bg-cyan-300" />
              <span className="h-1 w-1 rounded-full bg-cyan-300" />
              <span className="h-1 w-1 rounded-full bg-cyan-300" />
            </div>

            <div className="relative z-10">
              {/* Label */}
              <div className="flex items-center gap-3">
                <span className="text-sm">👨‍💻</span>

                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300/75">
                  More About the Developer
                </p>
              </div>

              <div className="mt-4 h-px bg-linear-to-r from-cyan-300/15 via-white/6 to-transparent" />

              <div className="relative min-h-82.5">
                {/* Text content */}
                <div className="relative z-30 max-w-[72%] pt-7 sm:max-w-[58%]">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/25">
                    MindPlay // Developer
                  </p>

                  <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Wonder who
                    <br />
                    built this?
                  </h2>

                  <p className="mt-5 text-sm leading-7 font-bold text-white/75">
                    Hey!😎
                    <br />
                    I JUST WANT TO MAKE SOME COOL STUFF 👾
                  </p>

                  <Link
                    href="https://portfo-guddies378.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link mp-button mt-7 inline-flex items-center gap-3 border border-cyan-300/20 bg-cyan-300/10 px-5 py-3.5 text-sm font-black text-cyan-100 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-300/15 hover:shadow-[0_12px_30px_rgba(34,211,238,0.12)] active:translate-y-0"
                  >
                    <span>&gt;</span>

                    <span>View My Portfolio</span>

                    <span className="text-cyan-300 transition-transform duration-300 group-hover/link:translate-x-1">
                    </span>
                  </Link>
                </div>

                {/* Developer character */}
                <div className="pointer-events-none absolute -bottom-5 right-[-13%] z-10 w-32 transition-transform duration-500 group-hover:-translate-y-2 sm:-bottom-8 sm:right-[-2%] sm:w-64">
                  {/* Character glow */}
                  <div className="absolute bottom-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl sm:h-40 sm:w-40" />

                  {/* Ground shadow */}
                  <div className="absolute bottom-1 left-1/2 h-2.5 w-24 -translate-x-1/2 rounded-full bg-black/40 blur-md sm:h-3 sm:w-28" />

                  <div className="mp-float relative">
                    <Image
                      src="/Character.png"
                      alt="Developer character"
                      width={400}
                      height={600}
                      priority={false}
                      className="relative h-auto w-full object-contain drop-shadow-[0_18px_25px_rgba(0,0,0,0.35)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          GCASH QR MODAL
      ───────────────────────────────────────── */}
      {showQR && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 px-5 py-6 backdrop-blur-md"
          onClick={() => setShowQR(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="gcash-modal-title"
            className="relative max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-4xl border border-white/10 bg-[#0b0f1a] p-5 shadow-2xl shadow-black/60 sm:p-6"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal glow */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-pink-500/10 blur-3xl" />

            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">☕</span>

                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-300/70">
                      Support the Developer
                    </p>
                  </div>

                  <h3
                    id="gcash-modal-title"
                    className="mt-2 text-2xl font-black tracking-tight text-white"
                  >
                    Buy me a coffee
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowQR(false)
                  }
                  aria-label="Close GCash QR"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-white/40 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95"
                >
                  ×
                </button>
              </div>

              <p className="mt-4 text-sm leading-6 text-white/45">
                Scan the QR code with your GCash app to support MindPlay. ❤️
              </p>

              {/* QR */}
              <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white p-3 shadow-xl shadow-black/20">
                <Image
                  src="/gcash-qr.jpg"
                  alt="GCash payment QR code"
                  width={720}
                  height={1280}
                  className="h-auto w-full"
                />
              </div>

              {/* Footer */}
              <div className="mt-5 flex items-center justify-center gap-2">
                <span className="h-1 w-1 rounded-full bg-cyan-300/50" />

                <p className="text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/25">
                  Thank you for supporting MindPlay 💙
                </p>

                <span className="h-1 w-1 rounded-full bg-cyan-300/50" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}