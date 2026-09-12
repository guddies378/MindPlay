"use client";

import { useEffect, useRef } from "react";

type LandingPageProps = {
  onLogin: () => void;
  onSignup: () => void;
};

export default function LandingPage({
  onLogin,
  onSignup,
}: LandingPageProps) {
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const page = pageRef.current;

    if (!page) return;

    const elements =
      page.querySelectorAll<HTMLElement>("[data-reveal]");

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
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

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
          transform: translateY(24px);
          transition:
            opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform;
        }

        [data-reveal].is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        [data-reveal="slow"] {
          transform: translateY(32px);
          transition-duration: 1s;
        }

        [data-reveal="slow"].is-visible {
          transform: translateY(0);
        }

        /* =========================
           HERO
        ========================== */

        .hero-title {
          animation: heroTitle 1s cubic-bezier(0.22, 1, 0.36, 1)
            both;
          will-change: opacity, transform;
        }

        .hero-subtitle {
          animation: heroSubtitle 0.8s
            cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
          will-change: opacity, transform;
        }

        .hero-button {
          animation: heroButton 0.8s
            cubic-bezier(0.22, 1, 0.36, 1) 0.28s both;
          will-change: opacity, transform;
        }

        .hero-scroll {
          animation: heroScroll 0.8s
            cubic-bezier(0.22, 1, 0.36, 1) 0.65s both;
          will-change: opacity;
        }

        @keyframes heroTitle {
          from {
            opacity: 0;
            transform: translateY(28px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes heroSubtitle {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroButton {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroScroll {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        /* =========================
           ACCESSIBILITY
        ========================== */

        @media (prefers-reduced-motion: reduce) {
          [data-reveal],
          .hero-title,
          .hero-subtitle,
          .hero-button,
          .hero-scroll {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* =========================
          NAVIGATION
      ========================== */}

      <header className="fixed left-0 top-0 z-50 w-full">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="group flex items-center gap-2.5 transition-opacity duration-500 hover:opacity-70"
          >
            <span className="text-lg transition-transform duration-500 group-hover:scale-105">
              🧠
            </span>

            <span className="text-sm font-bold tracking-tight text-white/90">
              MindPlay
            </span>
          </button>

          <button
            type="button"
            onClick={onLogin}
            className="rounded-full px-4 py-2 text-sm font-medium text-white/60 transition-all duration-500 hover:text-white"
          >
            Log in
          </button>
        </div>
      </header>

      {/* =========================
          HERO
      ========================== */}

      <section className="relative flex min-h-screen items-center justify-center px-6">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.035] blur-[140px]" />

        <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-fuchsia-500/2.5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <p className="hero-subtitle mb-8 text-sm font-semibold tracking-wide text-white/40">
            Brain training, made simple.
          </p>

          <div className="hero-title">
            <h1 className="text-[clamp(4rem,11vw,9rem)] font-extrabold leading-[0.88] tracking-[-0.065em]">
              Use your brain.
            </h1>

            <h1 className="mt-3 bg-linear-to-r from-cyan-300 via-white to-fuchsia-400 bg-clip-text text-[clamp(4rem,11vw,9rem)] font-extrabold leading-[0.88] tracking-[-0.065em] text-transparent">
              Don&apos;t waste it.
            </h1>
          </div>

          <p className="hero-subtitle mx-auto mt-10 max-w-lg text-lg font-medium leading-8 text-white/40 sm:text-xl">
            Short games. Serious thinking.
          </p>

          <div className="hero-button">
            <button
              type="button"
              onClick={onSignup}
              className="group mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black transition-all duration-500 ease-out hover:-translate-y-0.5 hover:bg-cyan-300 active:translate-y-0"
            >
              Start playing

              <span className="transition-transform duration-500 ease-out group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>

          <div className="hero-scroll mt-24 text-xs font-medium text-white/20">
            Scroll to explore
          </div>
        </div>
      </section>

      {/* =========================
          PRESENT
      ========================== */}

      <section className="border-t border-white/6">
        <div className="mx-auto max-w-6xl px-6 py-28 sm:px-8 sm:py-36">
          <div
            data-reveal="slow"
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300/40">
              Stay present
            </p>

            <p className="mx-auto mt-6 max-w-2xl text-2xl font-semibold leading-relaxed tracking-tight text-white/45 sm:text-3xl lg:text-4xl">
              Instead of thinking about the past or the future,{" "}
              <span className="bg-linear-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
                be present.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          INTRO
      ========================== */}

      <section className="border-t border-white/6">
        <div className="mx-auto max-w-6xl px-6 py-32 sm:px-8 sm:py-40">
          <div
            data-reveal="slow"
            className="mx-auto max-w-4xl text-center"
          >
            <p className="mb-8 text-sm font-bold text-cyan-300/60">
              Built to keep you sharp.
            </p>

            <h2 className="text-4xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              You don&apos;t need hours
              <br />
              to challenge your mind.
            </h2>

            <p className="mx-auto mt-8 max-w-2xl text-base font-medium leading-8 text-white/35 sm:text-lg">
              MindPlay turns a few minutes into something
              meaningful. Pick a game, think fast, and keep
              getting better.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          WHY MINDPLAY
      ========================== */}

      <section className="border-t border-white/6">
        <div className="mx-auto max-w-6xl px-6 py-32 sm:px-8 sm:py-40">
          <div
            data-reveal
            className="mb-20 text-center"
          >
            <p className="mb-6 text-sm font-bold text-fuchsia-300/60">
              Why MindPlay
            </p>

            <h2 className="text-4xl font-bold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Simple by design.
            </h2>
          </div>

          <div
            data-reveal
            className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] md:grid-cols-2 lg:grid-cols-4"
          >
            <Principle
              title="Quick"
              text="Start playing in seconds."
            />

            <Principle
              title="Challenging"
              text="Simple to learn. Hard to master."
            />

            <Principle
              title="Focused"
              text="Every move makes you think."
            />

            <Principle
              title="Discipline"
              text="Keep showing up. Keep improving."
            />
          </div>
        </div>
      </section>

      {/* =========================
          STATEMENT
      ========================== */}

      <section className="border-t border-white/6">
        <div className="mx-auto max-w-6xl px-6 py-40 sm:px-8 sm:py-52">
          <div
            data-reveal="slow"
            className="text-center"
          >
            <h2 className="text-[clamp(3rem,7vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.055em]">
              Your brain should be
              <br />

              <span className="bg-linear-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
                challenged.
              </span>
            </h2>

            <p className="mt-8 text-lg font-medium text-white/25">
              Not bored.
            </p>
          </div>
        </div>
      </section>

      {/* =========================
          HOW IT WORKS
      ========================== */}

      <section className="border-t border-white/6">
        <div className="mx-auto max-w-6xl px-6 py-32 sm:px-8 sm:py-40">
          <div className="mx-auto max-w-4xl">
            <div
              data-reveal
              className="mb-20 text-center"
            >
              <p className="mb-6 text-sm font-bold text-cyan-300/60">
                How it works
              </p>

              <h2 className="text-4xl font-bold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                Three steps.
                <br />
                That&apos;s it.
              </h2>
            </div>

            <div data-reveal>
              <Step
                number="01"
                title="Pick"
                text="Choose a game that challenges the skill you want to train."
              />

              <Step
                number="02"
                title="Play"
                text="Give it your attention and see how quickly you can solve it."
              />

              <Step
                number="03"
                title="Improve"
                text="Keep playing, learn from your mistakes, and push further."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          FINAL CTA
      ========================== */}

      <section className="border-t border-white/6">
        <div className="mx-auto max-w-6xl px-6 py-40 sm:px-8 sm:py-52">
          <div
            data-reveal="slow"
            className="text-center"
          >
            <p className="mb-8 text-sm font-bold text-white/30">
              Ready?
            </p>

            <h2 className="text-[clamp(4rem,10vw,8rem)] font-extrabold leading-[0.88] tracking-[-0.065em]">
              Your brain
              <br />

              <span className="bg-linear-to-r from-cyan-300 via-white to-fuchsia-400 bg-clip-text text-transparent">
                is waiting.
              </span>
            </h2>

            <p className="mx-auto mt-10 max-w-md text-base font-medium leading-7 text-white/30">
              Your first challenge awaits.
              Think fast. Make it count.
            </p>

            <button
              type="button"
              onClick={onSignup}
              className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-all duration-500 ease-out hover:-translate-y-0.5 hover:bg-cyan-300 active:translate-y-0"
            >
              Enter MindPlay

              <span className="transition-transform duration-500 ease-out group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================== */}

      <footer className="border-t border-white/6">
        <div
          data-reveal
          className="mx-auto flex items-center justify-between px-6 py-8 sm:px-8"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-sm">🧠</span>

            <span className="text-sm font-bold text-white/40">
              MindPlay
            </span>
          </div>

          <span className="text-xs font-medium text-white/20">
            Play. Think. Grow.
          </span>
        </div>
      </footer>
    </main>
  );
}

/* =========================
   PRINCIPLE
========================== */

function Principle({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="group bg-[#050505] p-8 transition-colors duration-500 hover:bg-white/2.5">
      <h3 className="text-lg font-bold tracking-tight transition-all duration-500 group-hover:translate-x-1 group-hover:text-cyan-300">
        {title}
      </h3>

      <p className="mt-3 text-sm font-medium leading-6 text-white/30 transition-colors duration-500 group-hover:text-white/45">
        {text}
      </p>
    </div>
  );
}

/* =========================
   STEP
========================== */

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group grid gap-6 border-t border-white/8 py-10 transition-colors duration-700 hover:border-white/16 sm:grid-cols-[80px_180px_1fr] sm:items-center">
      <span className="text-xs font-bold text-white/20 transition-colors duration-500 group-hover:text-cyan-300/60">
        {number}
      </span>

      <h3 className="text-2xl font-bold tracking-[-0.02em] transition-transform duration-500 group-hover:translate-x-1 sm:text-3xl">
        {title}
      </h3>

      <p className="max-w-md text-sm font-medium leading-7 text-white/30 transition-colors duration-700 group-hover:text-white/45 sm:text-base">
        {text}
      </p>
    </div>
  );
}