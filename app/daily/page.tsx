import Link from "next/link";
import DailyChallenge from "@/components/DailyChallenge";
import PlayerBrand from "@/components/PlayerBrand";
import PlayerFooterText from "@/components/PlayerFooterText";

export default function DailyChallengePage() {
  return (
    <main className="min-h-screen overflow-hidden">
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

      <section className="mx-auto w-full max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300/60">
            Daily mission
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            One challenge.
            <br />
            <span className="mp-gradient-text">Every day.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
            Complete today&apos;s game to earn a bonus reward and keep your
            MindPlay momentum going.
          </p>
        </div>

        <DailyChallenge />
      </section>

      <footer className="border-t border-white/6 px-5 py-8 text-center sm:px-8">
        <PlayerFooterText>MindPlay · Train your brain. Have fun.</PlayerFooterText>
      </footer>
    </main>
  );
}
