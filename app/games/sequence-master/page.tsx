"use client";

import { useEffect, useRef, useState } from "react";
import { recordGame } from "@/lib/progress";

type Difficulty = "Easy" | "Normal" | "Hard";
type GameState = "menu" | "showing" | "playing" | "feedback" | "finished";

type DifficultyConfig = {
  sequenceStart: number;
  sequenceMax: number;
  rounds: number;
  displayTime: number;
  baseXP: number;
};

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  Easy: {
    sequenceStart: 3,
    sequenceMax: 7,
    rounds: 8,
    displayTime: 800,
    baseXP: 20,
  },
  Normal: {
    sequenceStart: 4,
    sequenceMax: 8,
    rounds: 9,
    displayTime: 650,
    baseXP: 35,
  },
  Hard: {
    sequenceStart: 5,
    sequenceMax: 9,
    rounds: 10,
    displayTime: 500,
    baseXP: 50,
  },
};

const NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

function generateSequence(length: number): string[] {
  const sequence: string[] = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * NUMBERS.length);
    sequence.push(NUMBERS[randomIndex]);
  }

  return sequence;
}

export default function SequenceMasterPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("Normal");
  const [gameState, setGameState] = useState<GameState>("menu");

  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);

  const [showIndex, setShowIndex] = useState(-1);

  const [score, setScore] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [combo, setCombo] = useState(0);

  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const [finalXP, setFinalXP] = useState(0);

  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = DIFFICULTIES[difficulty];

  function clearShowTimer() {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      clearShowTimer();
    };
  }, []);

  function startGame() {
    clearShowTimer();

    setRound(1);
    setScore(0);
    setCorrectRounds(0);
    setBestCombo(0);
    setCombo(0);
    setUserSequence([]);
    setLastCorrect(null);
    setFinalXP(0);

    startRound(1);
  }

  function startRound(roundNumber: number) {
    clearShowTimer();

    const sequenceLength = Math.min(
      config.sequenceStart + Math.floor((roundNumber - 1) / 2),
      config.sequenceMax
    );

    const newSequence = generateSequence(sequenceLength);

    setRound(roundNumber);
    setSequence(newSequence);
    setUserSequence([]);
    setShowIndex(0);
    setLastCorrect(null);
    setGameState("showing");

    showTimeoutRef.current = setTimeout(
      () => showNextNumber(newSequence, 0),
      config.displayTime
    );
  }

  function showNextNumber(currentSequence: string[], currentIndex: number) {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= currentSequence.length) {
      setShowIndex(-1);
      setUserSequence([]);
      setGameState("playing");
      return;
    }

    setShowIndex(nextIndex);

    showTimeoutRef.current = setTimeout(
      () => showNextNumber(currentSequence, nextIndex),
      config.displayTime
    );
  }

  function handleNumberClick(number: string) {
    if (gameState !== "playing") {
      return;
    }

    if (userSequence.length >= sequence.length) {
      return;
    }

    setUserSequence((current) => [...current, number]);
  }

  function handleUndo() {
    if (gameState !== "playing") {
      return;
    }

    setUserSequence((current) => current.slice(0, -1));
  }

  function handleClear() {
    if (gameState !== "playing") {
      return;
    }

    setUserSequence([]);
  }

  function submitSequence() {
    if (
      gameState !== "playing" ||
      userSequence.length !== sequence.length
    ) {
      return;
    }

    const isCorrect = userSequence.every(
      (number, index) => number === sequence[index]
    );

    setLastCorrect(isCorrect);

    if (isCorrect) {
      const nextCombo = combo + 1;

      const multiplier = Math.min(
        1.5,
        1 + Math.floor(nextCombo / 3) * 0.1
      );

      const basePoints = sequence.length * 10;
      const comboBonus = Math.min(30, Math.floor(nextCombo / 2) * 5);

      const earnedPoints = Math.round(
        (basePoints + comboBonus) * multiplier
      );

      setScore((current) => current + earnedPoints);
      setCorrectRounds((current) => current + 1);
      setCombo(nextCombo);
      setBestCombo((current) => Math.max(current, nextCombo));
    } else {
      setScore((current) => Math.max(0, current - 5));
      setCombo(0);
    }

    setGameState("feedback");
  }

  function continueGame() {
    if (round >= config.rounds) {
      finishGame();
      return;
    }

    startRound(round + 1);
  }

  function finishGame() {
    const finalScore = score;

    const scoreBonus = Math.min(50, Math.floor(finalScore / 30));

    let comboBonus = 0;

    if (bestCombo >= 7) {
      comboBonus = 20;
    } else if (bestCombo >= 4) {
      comboBonus = 10;
    }

    const totalXP = config.baseXP + scoreBonus + comboBonus;

    setFinalXP(totalXP);
    recordGame(finalScore, totalXP);
    setGameState("finished");
  }

  function playAgain() {
    startGame();
  }

  function backToArcade() {
    window.location.href = "/#games";
  }

  function handleKeyboard(event: globalThis.KeyboardEvent) {
    if (gameState !== "playing") {
      return;
    }

    if (event.key >= "1" && event.key <= "9") {
      handleNumberClick(event.key);
    }

    if (event.key === "Backspace") {
      handleUndo();
    }

    if (event.key === "Enter") {
      submitSequence();
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  });

  const accuracy =
    round > 0 ? Math.round((correctRounds / round) * 100) : 0;

  const currentMultiplier = Math.min(
    1.5,
    1 + Math.floor(combo / 3) * 0.1
  );

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <a
            href="/#games"
            className="text-sm font-bold text-white/50 transition hover:text-white"
          >
            ← Arcade
          </a>

          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
              MindPlay
            </p>
            <p className="text-xs text-white/40">
              Sequence Master
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🔁</div>

          <h1 className="text-3xl font-black sm:text-4xl">
            Sequence Master
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/50">
            Watch the numbers. Remember the order. Rebuild the sequence.
          </p>
        </div>

        {/* MENU */}
        {gameState === "menu" && (
          <section className="mp-card rounded-3xl p-6 sm:p-8">
            <div className="mb-7 text-center">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-white/40">
                Choose difficulty
              </p>

              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(DIFFICULTIES) as Difficulty[]).map(
                  (level) => {
                    const active = difficulty === level;

                    return (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`rounded-2xl border px-3 py-4 text-sm font-black transition ${
                          active
                            ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200"
                            : "border-white/10 bg-white/3 text-white/50 hover:bg-white/6 hover:text-white"
                        }`}
                      >
                        {level}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-white/4 p-4 text-center">
                <p className="text-xs text-white/40">Starting</p>
                <p className="mt-1 text-xl font-black">
                  {config.sequenceStart}
                </p>
              </div>

              <div className="rounded-2xl bg-white/4 p-4 text-center">
                <p className="text-xs text-white/40">Max</p>
                <p className="mt-1 text-xl font-black">
                  {config.sequenceMax}
                </p>
              </div>

              <div className="rounded-2xl bg-white/4 p-4 text-center">
                <p className="text-xs text-white/40">Rounds</p>
                <p className="mt-1 text-xl font-black">
                  {config.rounds}
                </p>
              </div>

              <div className="rounded-2xl bg-white/4 p-4 text-center">
                <p className="text-xs text-white/40">Base XP</p>
                <p className="mt-1 text-xl font-black text-cyan-300">
                  +{config.baseXP}
                </p>
              </div>
            </div>

            <button
              onClick={startGame}
              className="mp-button w-full bg-white px-6 py-4 text-sm text-black hover:opacity-90"
            >
              Start Sequence
            </button>
          </section>
        )}

        {/* GAME */}
        {gameState !== "menu" && gameState !== "finished" && (
          <>
            {/* Stats */}
            <div className="mb-5 grid grid-cols-3 gap-2">
              <div className="mp-card rounded-2xl p-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/35">
                  Round
                </p>
                <p className="mt-1 font-black">
                  {round}/{config.rounds}
                </p>
              </div>

              <div className="mp-card rounded-2xl p-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/35">
                  Score
                </p>
                <p className="mt-1 font-black">{score}</p>
              </div>

              <div className="mp-card rounded-2xl p-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/35">
                  Combo
                </p>
                <p className="mt-1 font-black text-cyan-300">
                  {combo}×
                </p>
              </div>
            </div>

            {/* SHOWING */}
            {gameState === "showing" && (
              <section className="mp-card rounded-3xl p-6 sm:p-10">
                <div className="mb-6 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                    Memorize
                  </p>

                  <p className="mt-2 text-sm text-white/40">
                    Remember the exact order
                  </p>
                </div>

                <div className="flex min-h-57.5 items-center justify-center">
                  <div
                    key={showIndex}
                    className="mp-fade-up text-8xl font-black tracking-tight text-white sm:text-9xl"
                  >
                    {sequence[showIndex]}
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  {sequence.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full transition ${
                        index === showIndex
                          ? "scale-125 bg-cyan-300"
                          : index < showIndex
                            ? "bg-white/30"
                            : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* PLAYING */}
            {gameState === "playing" && (
              <section className="mp-card rounded-3xl p-5 sm:p-8">
                <div className="mb-6 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                    Your Turn
                  </p>

                  <p className="mt-2 text-sm text-white/40">
                    Reproduce the sequence in the same order
                  </p>
                </div>

                {/* User sequence */}
                <div className="mb-7 min-h-20 rounded-2xl border border-white/10 bg-white/3 p-4">
                  <div className="flex min-h-11.25 flex-wrap items-center justify-center gap-2">
                    {Array.from({
                      length: sequence.length,
                    }).map((_, index) => {
                      const value = userSequence[index];

                      return (
                        <div
                          key={index}
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg font-black ${
                            value
                              ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                              : "border-white/10 bg-white/2 text-white/15"
                          }`}
                        >
                          {value ?? "?"}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Number buttons */}
                <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
                  {NUMBERS.map((number) => (
                    <button
                      key={number}
                      onClick={() => handleNumberClick(number)}
                      className="mp-button h-16 border border-white/10 bg-white/4 text-2xl hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-200"
                    >
                      {number}
                    </button>
                  ))}
                </div>

                {/* Controls */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={handleUndo}
                    disabled={userSequence.length === 0}
                    className="mp-button border border-white/10 bg-white/3 py-3 text-sm text-white/60 hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ↶ Undo
                  </button>

                  <button
                    onClick={handleClear}
                    disabled={userSequence.length === 0}
                    className="mp-button border border-white/10 bg-white/3 py-3 text-sm text-white/60 hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Clear
                  </button>
                </div>

                <button
                  onClick={submitSequence}
                  disabled={userSequence.length !== sequence.length}
                  className="mp-button mt-3 w-full bg-white py-4 text-sm text-black disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Lock In Sequence
                </button>

                <p className="mt-4 text-center text-xs text-white/30">
                  Keyboard: 1–9 · Backspace to undo · Enter to submit
                </p>
              </section>
            )}

            {/* FEEDBACK */}
            {gameState === "feedback" && (
              <section className="mp-card rounded-3xl p-6 sm:p-8">
                <div className="text-center">
                  <div className="text-5xl">
                    {lastCorrect ? "🔥" : "💥"}
                  </div>

                  <h2
                    className={`mt-4 text-2xl font-black ${
                      lastCorrect
                        ? "text-cyan-300"
                        : "text-fuchsia-300"
                    }`}
                  >
                    {lastCorrect ? "Perfect Sequence!" : "Sequence Broken!"}
                  </h2>

                  {lastCorrect ? (
                    <p className="mt-2 text-sm text-white/45">
                      Combo: {combo}× · Multiplier:{" "}
                      {currentMultiplier.toFixed(1)}×
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-white/45">
                      Your sequence did not match.
                    </p>
                  )}
                </div>

                <div className="my-7 grid gap-3">
                  <div className="rounded-2xl bg-white/4 p-4">
                    <p className="mb-2 text-xs font-black uppercase tracking-wider text-white/35">
                      Correct sequence
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {sequence.map((number, index) => (
                        <span
                          key={`${number}-${index}`}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 font-black text-cyan-200"
                        >
                          {number}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/4 p-4">
                    <p className="mb-2 text-xs font-black uppercase tracking-wider text-white/35">
                      Your sequence
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {userSequence.map((number, index) => (
                        <span
                          key={`${number}-${index}`}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/6 font-black text-white/70"
                        >
                          {number}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={continueGame}
                  className="mp-button w-full bg-white py-4 text-sm text-black hover:opacity-90"
                >
                  {round >= config.rounds
                    ? "See Results"
                    : "Next Sequence →"}
                </button>
              </section>
            )}
          </>
        )}

        {/* RESULTS */}
        {gameState === "finished" && (
          <section className="mp-card rounded-3xl p-6 sm:p-8">
            <div className="text-center">
              <div className="text-6xl">🏆</div>

              <h2 className="mt-4 text-3xl font-black">
                Sequence Complete
              </h2>

              <p className="mt-2 text-sm text-white/45">
                You survived {config.rounds} rounds of memory chaos.
              </p>
            </div>

            <div className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-white/4 p-4 text-center">
                <p className="text-xs text-white/40">Score</p>
                <p className="mt-1 text-2xl font-black">
                  {score}
                </p>
              </div>

              <div className="rounded-2xl bg-white/4 p-4 text-center">
                <p className="text-xs text-white/40">Accuracy</p>
                <p className="mt-1 text-2xl font-black">
                  {accuracy}%
                </p>
              </div>

              <div className="rounded-2xl bg-white/4 p-4 text-center">
                <p className="text-xs text-white/40">Best Combo</p>
                <p className="mt-1 text-2xl font-black">
                  {bestCombo}×
                </p>
              </div>

              <div className="rounded-2xl bg-white/4 p-4 text-center">
                <p className="text-xs text-white/40">XP Earned</p>
                <p className="mt-1 text-2xl font-black text-cyan-300">
                  +{finalXP}
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-cyan-300/10 bg-cyan-300/4 p-5 text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                Performance
              </p>

              <p className="mt-2 text-sm text-white/60">
                {accuracy >= 90
                  ? "Your memory is absolutely cracked. 🧠"
                  : accuracy >= 70
                    ? "Sharp work. Your sequence memory is strong. 🔥"
                    : accuracy >= 50
                      ? "Not bad. Keep playing and build that combo. ⚡"
                      : "The sequences won this round. Run it back. 😈"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={playAgain}
                className="mp-button bg-white py-4 text-sm text-black hover:opacity-90"
              >
                Play Again
              </button>

              <button
                onClick={backToArcade}
                className="mp-button border border-white/10 bg-white/4 py-4 text-sm text-white/70 hover:bg-white/[0.07] hover:text-white"
              >
                Back to Arcade
              </button>
            </div>
          </section>
        )}

        {/* Footer hint */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/25">
            {difficulty} Mode · Base XP + score bonuses
          </p>
        </div>
      </div>
    </main>
  );
}