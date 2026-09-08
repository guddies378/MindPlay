"use client";

import { useEffect, useRef, useState } from "react";
import { recordGame } from "@/lib/progress";

type Difficulty = "easy" | "normal" | "hard";

type ColorId =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "orange";

type ColorOption = {
  id: ColorId;
  label: string;
  hex: string;
};

const COLORS: ColorOption[] = [
  {
    id: "red",
    label: "RED",
    hex: "#f87171",
  },
  {
    id: "blue",
    label: "BLUE",
    hex: "#60a5fa",
  },
  {
    id: "green",
    label: "GREEN",
    hex: "#4ade80",
  },
  {
    id: "yellow",
    label: "YELLOW",
    hex: "#facc15",
  },
  {
    id: "purple",
    label: "PURPLE",
    hex: "#c084fc",
  },
  {
    id: "orange",
    label: "ORANGE",
    hex: "#fb923c",
  },
];

const DIFFICULTIES: Record<
  Difficulty,
  {
    label: string;
    description: string;
    rounds: number;
    colors: number;
    responseTime: number;
    baseXP: number;
  }
> = {
  easy: {
    label: "Easy",
    description: "Warm up your focus.",
    rounds: 10,
    colors: 4,
    responseTime: 3000,
    baseXP: 20,
  },
  normal: {
    label: "Normal",
    description: "The colors start fighting back.",
    rounds: 15,
    colors: 5,
    responseTime: 2200,
    baseXP: 35,
  },
  hard: {
    label: "Hard",
    description: "Fast eyes. Faster brain.",
    rounds: 20,
    colors: 6,
    responseTime: 1600,
    baseXP: 50,
  },
};

type GameState = "menu" | "playing" | "feedback" | "finished";

export default function ColorClashPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [gameState, setGameState] = useState<GameState>("menu");

  const [round, setRound] = useState(1);
  const [currentWord, setCurrentWord] = useState<ColorId>("blue");
  const [actualColor, setActualColor] = useState<ColorId>("red");

  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [lastPoints, setLastPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const roundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = DIFFICULTIES[difficulty];

  function clearRoundTimers() {
    if (roundTimeoutRef.current) {
      clearTimeout(roundTimeoutRef.current);
      roundTimeoutRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      clearRoundTimers();
    };
  }, []);

  function generateRound() {
    const availableColors = COLORS.slice(0, config.colors);

    const actualIndex = Math.floor(
      Math.random() * availableColors.length
    );

    let wordIndex = Math.floor(
      Math.random() * availableColors.length
    );

    // Make sure the word and actual color are different.
    while (wordIndex === actualIndex) {
      wordIndex = Math.floor(
        Math.random() * availableColors.length
      );
    }

    setActualColor(availableColors[actualIndex].id);
    setCurrentWord(availableColors[wordIndex].id);
  }

  function startRound() {
    clearRoundTimers();

    generateRound();

    const speedIncrease =
      Math.floor((round - 1) / 5) * 150;

    const currentResponseTime = Math.max(
      1000,
      config.responseTime - speedIncrease
    );

    setTimeLeft(currentResponseTime);

    intervalRef.current = setInterval(() => {
      setTimeLeft((previous) => {
        const next = Math.max(0, previous - 100);

        return next;
      });
    }, 100);

    roundTimeoutRef.current = setTimeout(() => {
      handleAnswer(null);
    }, currentResponseTime);
  }

  function startGame() {
    clearRoundTimers();

    setRound(1);
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setCombo(0);
    setBestCombo(0);
    setLastCorrect(null);
    setLastPoints(0);

    setGameState("playing");

    setTimeout(() => {
      startRound();
    }, 50);
  }

  function calculatePoints(nextCombo: number) {
    const comboBonus =
      Math.floor(nextCombo / 3) * 5;

    return Math.min(30, 10 + comboBonus);
  }

  function handleAnswer(selectedColor: ColorId | null) {
    if (gameState !== "playing") {
      return;
    }

    clearRoundTimers();

    const isCorrect = selectedColor === actualColor;

    let nextScore = score;
    let nextCorrect = correct;
    let nextWrong = wrong;
    let nextCombo = combo;
    let nextBestCombo = bestCombo;
    let points = 0;

    if (isCorrect) {
      nextCombo = combo + 1;
      nextCorrect = correct + 1;

      points = calculatePoints(nextCombo);

      nextScore = score + points;
      nextBestCombo = Math.max(bestCombo, nextCombo);
    } else {
      nextCombo = 0;
      nextWrong = wrong + 1;

      nextScore = Math.max(0, score - 5);
      points = -5;
    }

    setScore(nextScore);
    setCorrect(nextCorrect);
    setWrong(nextWrong);
    setCombo(nextCombo);
    setBestCombo(nextBestCombo);

    setLastCorrect(isCorrect);
    setLastPoints(points);
    setGameState("feedback");
  }

  function continueGame() {
    if (round >= config.rounds) {
      finishGame();
      return;
    }

    const nextRound = round + 1;

    setRound(nextRound);
    setGameState("playing");

    setTimeout(() => {
      startRound();
    }, 50);
  }

  function finishGame() {
    clearRoundTimers();

    const totalAnswers = correct + wrong;

    const accuracy =
      totalAnswers > 0
        ? Math.round((correct / totalAnswers) * 100)
        : 0;

    const comboBonus =
      bestCombo >= 8
        ? 20
        : bestCombo >= 5
          ? 10
          : 0;

    const scoreBonus = Math.min(
      50,
      Math.floor(score / 20)
    );

    const totalXP =
      config.baseXP +
      scoreBonus +
      comboBonus;

    recordGame(score, totalXP);

    setGameState("finished");

    console.log("Color Clash result:", {
      score,
      correct,
      wrong,
      accuracy,
      bestCombo,
      totalXP,
    });
  }

  function handleKeyboard(event: globalThis. KeyboardEvent) {
    if (gameState !== "playing") {
      return;
    }

    const key = event.key.toLowerCase();

    const keyMap: Record<string, ColorId> = {
      r: "red",
      b: "blue",
      g: "green",
      y: "yellow",
      p: "purple",
      o: "orange",
    };

    const selected = keyMap[key];

    if (selected) {
      const availableColors = COLORS.slice(
        0,
        config.colors
      );

      if (
        availableColors.some(
          (color) => color.id === selected
        )
      ) {
        handleAnswer(selected);
      }
    }
  }

  useEffect(() => {
    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  });

  function getActualColor() {
    return COLORS.find(
      (color) => color.id === actualColor
    );
  }

  function getWordColor() {
    return COLORS.find(
      (color) => color.id === currentWord
    );
  }

  const actual = getActualColor();
  const word = getWordColor();

  const currentMaxTime = Math.max(
    1000,
    config.responseTime -
      Math.floor((round - 1) / 5) * 150
  );

  const timePercentage = Math.max(
    0,
    Math.min(100, (timeLeft / currentMaxTime) * 100)
  );

  if (gameState === "finished") {
    const totalAnswers = correct + wrong;

    const accuracy =
      totalAnswers > 0
        ? Math.round((correct / totalAnswers) * 100)
        : 0;

    const comboBonus =
      bestCombo >= 8
        ? 20
        : bestCombo >= 5
          ? 10
          : 0;

    const scoreBonus = Math.min(
      50,
      Math.floor(score / 20)
    );

    const totalXP =
      config.baseXP +
      scoreBonus +
      comboBonus;

    let performance = "Keep practicing.";

    if (accuracy >= 95) {
      performance = "Your focus is ridiculous. 🔥";
    } else if (accuracy >= 80) {
      performance = "Excellent color control! ⚡";
    } else if (accuracy >= 65) {
      performance = "Solid run. Your brain is warming up. 🧠";
    } else if (accuracy >= 50) {
      performance = "Not bad. The colors fought hard. 👀";
    }

    return (
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto flex min-h-[85vh] max-w-3xl items-center justify-center">
          <section className="mp-card mp-fade-up w-full rounded-3xl p-6 text-center sm:p-10">
            <div className="mb-3 text-5xl">
              🎨
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/40">
              Color Clash
            </p>

            <h1 className="mt-3 text-4xl font-black sm:text-5xl">
              Game Complete
            </h1>

            <p className="mt-4 text-lg text-white/60">
              {performance}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                <div className="text-2xl font-black text-cyan-300">
                  {score}
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-white/40">
                  Score
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                <div className="text-2xl font-black text-green-300">
                  {accuracy}%
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-white/40">
                  Accuracy
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                <div className="text-2xl font-black text-purple-300">
                  {bestCombo}
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-white/40">
                  Best Combo
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
                <div className="text-2xl font-black text-yellow-300">
                  +{totalXP}
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-white/40">
                  XP
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/2.5 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">
                  Correct
                </span>
                <span className="font-black text-green-300">
                  {correct}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-white/50">
                  Wrong
                </span>
                <span className="font-black text-red-300">
                  {wrong}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-white/50">
                  Difficulty
                </span>
                <span className="font-black capitalize">
                  {difficulty}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={startGame}
                className="mp-button flex-1 bg-white px-6 py-4 text-black"
              >
                🔄 Play Again
              </button>

              <a
                href="/"
                className="mp-button flex-1 border border-white/10 bg-white/4 px-6 py-4 text-white/80"
              >
                ← Back to Arcade
              </a>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (gameState === "feedback") {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto flex min-h-[85vh] max-w-3xl items-center justify-center">
          <section className="mp-card mp-fade-up w-full rounded-3xl p-6 text-center sm:p-10">
            <div className="text-5xl">
              {lastCorrect ? "⚡" : "💥"}
            </div>

            <h1
              className={`mt-4 text-4xl font-black ${
                lastCorrect
                  ? "text-green-300"
                  : "text-red-300"
              }`}
            >
              {lastCorrect
                ? "Correct!"
                : "Wrong!"}
            </h1>

            <p className="mt-3 text-white/50">
              The actual color was
            </p>

            <div
              className="mt-2 text-2xl font-black"
              style={{
                color: actual?.hex,
              }}
            >
              {actual?.label}
            </div>

            <div className="mx-auto mt-8 max-w-md rounded-3xl border border-white/10 bg-white/[0.035] p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                The word said
              </p>

              <div
                className="mt-4 text-4xl font-black"
                style={{
                  color: actual?.hex,
                }}
              >
                {word?.label}
              </div>

              <p className="mt-4 text-xs text-white/30">
                You had to choose the displayed color,
                not the written word.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <span className="text-white/50">
                Score:{" "}
                <strong className="text-white">
                  {score}
                </strong>
              </span>

              <span
                className={
                  combo > 0
                    ? "font-black text-yellow-300"
                    : "text-white/40"
                }
              >
                🔥 {combo} combo
              </span>
            </div>

            <button
              onClick={continueGame}
              className="mp-button mt-8 w-full bg-white px-6 py-4 text-black sm:w-auto sm:min-w-60"
            >
              {round >= config.rounds
                ? "🏁 See Results"
                : "Next Color →"}
            </button>
          </section>
        </div>
      </main>
    );
  }

  if (gameState === "playing") {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex items-center justify-between gap-4">
            <a
              href="/"
              className="text-sm font-bold text-white/40 transition hover:text-white"
            >
              ← Arcade
            </a>

            <div className="text-right">
              <div className="text-sm font-black">
                Round {round}/{config.rounds}
              </div>

              <div className="text-xs text-white/40">
                {difficulty}
              </div>
            </div>
          </div>

          <div className="mp-card rounded-3xl p-5 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                  Score
                </div>

                <div className="mt-1 text-2xl font-black">
                  {score}
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                  Combo
                </div>

                <div
                  className={`mt-1 text-2xl font-black ${
                    combo >= 3
                      ? "text-yellow-300"
                      : "text-white"
                  }`}
                >
                  🔥 {combo}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                  Time
                </div>

                <div className="mt-1 text-2xl font-black tabular-nums">
                  {(timeLeft / 1000).toFixed(1)}
                </div>
              </div>
            </div>

            <div className="mb-8 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${timePercentage}%`,
                  background:
                    timePercentage < 30
                      ? "#f87171"
                      : "#67e8f9",
                }}
              />
            </div>

            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/30">
                Choose the color
              </p>

              <div className="mt-8 flex min-h-45 items-center justify-center">
                <div
                  className="select-none text-5xl font-black tracking-tight sm:text-7xl"
                  style={{
                    color: actual?.hex,
                  }}
                >
                  {word?.label}
                </div>
              </div>

              <p className="mx-auto max-w-md text-sm text-white/35">
                Ignore what the word says.
                <br />
                Choose the color you actually see.
              </p>
            </div>

            <div
              className={`mt-8 grid gap-3 ${
                config.colors <= 4
                  ? "grid-cols-2"
                  : "grid-cols-2 sm:grid-cols-3"
              }`}
            >
              {COLORS.slice(0, config.colors).map(
                (color) => (
                  <button
                    key={color.id}
                    onClick={() =>
                      handleAnswer(color.id)
                    }
                    className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] active:scale-95"
                    aria-label={`Choose ${color.label}`}
                  >
                    <span
                      className="mx-auto block h-8 w-8 rounded-full shadow-lg"
                      style={{
                        background: color.hex,
                      }}
                    />

                    <span className="mt-3 block text-sm font-black tracking-wide">
                      {color.label}
                    </span>
                  </button>
                )
              )}
            </div>

            <p className="mt-6 text-center text-xs text-white/25">
              Keyboard shortcuts: R · B · G · Y · P · O
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[85vh] max-w-3xl items-center justify-center">
        <section className="mp-card mp-fade-up w-full rounded-3xl p-6 sm:p-10">
          <div className="text-center">
            <div className="mb-3 text-6xl">
              🎨
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/30">
              MindPlay Game #9
            </p>

            <h1 className="mt-3 text-5xl font-black">
              Color{" "}
              <span className="mp-gradient-text">
                Clash
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/55">
              Your brain wants to read the word.
              Don't let it.
              <br />
              Choose the{" "}
              <strong className="text-white">
                actual color
              </strong>{" "}
              instead.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {(Object.keys(DIFFICULTIES) as Difficulty[]).map(
              (level) => {
                const item = DIFFICULTIES[level];

                const selected =
                  difficulty === level;

                return (
                  <button
                    key={level}
                    onClick={() =>
                      setDifficulty(level)
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                      selected
                        ? "border-cyan-300/40 bg-cyan-300/8"
                        : "border-white/10 bg-white/2.5 hover:bg-white/6"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black">
                        {item.label}
                      </span>

                      {selected && (
                        <span className="text-cyan-300">
                          ✓
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-5 text-white/40">
                      {item.description}
                    </p>

                    <div className="mt-4 text-xs font-bold uppercase tracking-wider text-white/25">
                      {item.rounds} rounds ·{" "}
                      {item.colors} colors
                    </div>
                  </button>
                );
              }
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/2.5 p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-black text-cyan-300">
                  +10
                </div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/30">
                  Base Points
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-yellow-300">
                  🔥
                </div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/30">
                  Combo Bonus
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-red-300">
                  -5
                </div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/30">
                  Wrong
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="mp-button mt-8 w-full bg-white px-6 py-5 text-lg text-black"
          >
            🎨 Start Color Clash
          </button>

          <a
            href="/"
            className="mt-4 block text-center text-sm font-bold text-white/35 transition hover:text-white"
          >
            ← Back to Arcade
          </a>
        </section>
      </div>
    </main>
  );
}