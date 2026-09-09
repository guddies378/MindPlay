"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recordGame } from "@/lib/progress";
import {
  completeDailyChallenge,
  DAILY_CHALLENGE_BONUS_POINTS,
  getDailyChallenge,
} from "@/lib/dailyChallenge";
import { unlockGameAchievement } from "@/lib/achievements";

type Difficulty = "easy" | "normal" | "hard";

type ColorOption = {
  name: string;
  value: string;
};

const COLORS: ColorOption[] = [
  { name: "RED", value: "#ef4444" },
  { name: "BLUE", value: "#3b82f6" },
  { name: "GREEN", value: "#22c55e" },
  { name: "YELLOW", value: "#eab308" },
  { name: "PURPLE", value: "#a855f7" },
  { name: "ORANGE", value: "#f97316" },
];

const DIFFICULTIES: Record<
  Difficulty,
  {
    rounds: number;
    colors: number;
    responseTime: number;
    baseXP: number;
  }
> = {
  easy: {
    rounds: 10,
    colors: 4,
    responseTime: 3000,
    baseXP: 20,
  },
  normal: {
    rounds: 15,
    colors: 5,
    responseTime: 2200,
    baseXP: 35,
  },
  hard: {
    rounds: 20,
    colors: 6,
    responseTime: 1600,
    baseXP: 50,
  },
};

const getRandomColor = (count: number): ColorOption => {
  const available = COLORS.slice(0, count);

  return available[
    Math.floor(Math.random() * available.length)
  ];
};

const getDifferentColor = (
  correctColor: ColorOption,
  count: number
): ColorOption => {
  const available = COLORS.slice(0, count).filter(
    (color) => color.name !== correctColor.name
  );

  return available[
    Math.floor(Math.random() * available.length)
  ];
};

export default function ColorClashPage() {
  const [difficulty, setDifficulty] =
    useState<Difficulty>("normal");

  const [gameState, setGameState] = useState<
    "menu" | "playing" | "finished"
  >("menu");

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);

  const [targetColor, setTargetColor] =
    useState<ColorOption | null>(null);

  const [displayedColor, setDisplayedColor] =
    useState<ColorOption | null>(null);

  const [options, setOptions] = useState<ColorOption[]>([]);

  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

  const [lastCorrect, setLastCorrect] =
    useState<boolean | null>(null);

  const [lastPoints, setLastPoints] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);

  const [xpEarned, setXpEarned] = useState(0);

  const [dailyBonusEarned, setDailyBonusEarned] =
    useState(false);

  const roundTimerRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const countdownTimerRef = useRef<
    ReturnType<typeof setInterval> | null
  >(null);

  const config = DIFFICULTIES[difficulty];

  const dailyChallenge = getDailyChallenge();

  const isDailyChallenge =
    dailyChallenge.game === "color-clash";

  const clearRoundTimers = useCallback(() => {
    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
      roundTimerRef.current = null;
    }

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const createRound = useCallback(() => {
    const wordColor = getRandomColor(config.colors);

    const inkColor = getDifferentColor(
      wordColor,
      config.colors
    );

    const shuffledOptions = [
      inkColor,
      ...COLORS.slice(0, config.colors)
        .filter(
          (color) => color.name !== inkColor.name
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, config.colors - 1),
    ].sort(() => Math.random() - 0.5);

    setTargetColor(wordColor);
    setDisplayedColor(inkColor);
    setOptions(shuffledOptions);

    setTimeLeft(config.responseTime);
    setLastCorrect(null);
    setLastPoints(0);

    if (roundTimerRef.current) {
      clearTimeout(roundTimerRef.current);
    }

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    const startTime = Date.now();

    countdownTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;

      const remaining = Math.max(
        0,
        config.responseTime - elapsed
      );

      setTimeLeft(remaining);
    }, 50);

    roundTimerRef.current = setTimeout(() => {
      setWrong((current) => current + 1);
      setCombo(0);
      setLastCorrect(false);
      setLastPoints(0);

      setRound((current) => current + 1);
    }, config.responseTime);
  }, [
    config.colors,
    config.responseTime,
    round,
  ]);

  const startGame = () => {
    clearRoundTimers();

    setGameState("playing");

    setRound(0);
    setScore(0);
    setCorrect(0);
    setWrong(0);

    setCombo(0);
    setBestCombo(0);

    setLastCorrect(null);
    setLastPoints(0);

    setTimeLeft(config.responseTime);

    setXpEarned(0);
    setDailyBonusEarned(false);
  };

  const finishGame = useCallback(() => {
    clearRoundTimers();

    const dailyCompleted =
      isDailyChallenge &&
      completeDailyChallenge("color-clash");

    const finalScore =
      score +
      (dailyCompleted
        ? DAILY_CHALLENGE_BONUS_POINTS
        : 0);

    const totalAnswers =
      correct + wrong;

    const accuracy =
      totalAnswers > 0
        ? Math.round(
            (correct / totalAnswers) * 100
          )
        : 0;

    const comboBonus =
      bestCombo >= 8
        ? 20
        : bestCombo >= 5
          ? 10
          : 0;

    const scoreBonus = Math.min(
      50,
      Math.floor(finalScore / 20)
    );

    const baseTotalXP =
      config.baseXP +
      scoreBonus +
      comboBonus;

    const displayedXP =
      baseTotalXP +
      (dailyCompleted ? 50 : 0);

    setScore(finalScore);
    setXpEarned(displayedXP);
    setDailyBonusEarned(dailyCompleted);

    recordGame(
      finalScore,
      baseTotalXP
    );

    unlockGameAchievement(
      "color-focus"
    );

    setGameState("finished");
  }, [
    bestCombo,
    clearRoundTimers,
    config.baseXP,
    correct,
    isDailyChallenge,
    score,
    wrong,
  ]);

  const handleAnswer = useCallback(
    (selectedColor: ColorOption) => {
      if (
        gameState !== "playing" ||
        !displayedColor
      ) {
        return;
      }

      clearRoundTimers();

      /*
       * Color Clash uses the classic Stroop-style rule:
       * choose the color the word is displayed in,
       * not the word itself.
       */
      const isCorrect =
        selectedColor.name ===
        displayedColor.name;

      if (isCorrect) {
        const newCombo = combo + 1;

        const comboBonus = Math.min(
          30,
          Math.floor(newCombo / 3) * 5
        );

        const points =
          10 + comboBonus;

        setScore(
          (current) => current + points
        );

        setCorrect(
          (current) => current + 1
        );

        setCombo(newCombo);

        setBestCombo((current) =>
          Math.max(
            current,
            newCombo
          )
        );

        setLastCorrect(true);
        setLastPoints(points);
      } else {
        setScore((current) =>
          Math.max(
            0,
            current - 5
          )
        );

        setWrong(
          (current) => current + 1
        );

        setCombo(0);

        setLastCorrect(false);
        setLastPoints(-5);
      }

      setRound(
        (current) => current + 1
      );
    },
    [
      clearRoundTimers,
      combo,
      displayedColor,
      gameState,
    ]
  );

  useEffect(() => {
    if (gameState !== "playing") {
      return;
    }

    if (round >= config.rounds) {
      finishGame();
      return;
    }

    createRound();
  }, [
    config.rounds,
    createRound,
    finishGame,
    gameState,
    round,
  ]);

  useEffect(() => {
    if (!isDailyChallenge) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    const dailyMode =
      params.get("daily") === "true";

    const urlDifficulty =
      params.get("difficulty");

    const validDifficulty =
      urlDifficulty === "easy" ||
      urlDifficulty === "normal" ||
      urlDifficulty === "hard";

    if (
      dailyMode &&
      validDifficulty &&
      urlDifficulty ===
        dailyChallenge.difficulty
    ) {
      setDifficulty(
        dailyChallenge.difficulty
      );
    }
  }, [
    dailyChallenge.difficulty,
    isDailyChallenge,
  ]);

  useEffect(() => {
    const handleKeyboard = (
      event: globalThis.KeyboardEvent
    ) => {
      if (gameState !== "playing") {
        return;
      }

      const key =
        event.key.toUpperCase();

      const selectedColor =
        options.find(
          (color) =>
            color.name.charAt(0) === key
        );

      if (selectedColor) {
        handleAnswer(
          selectedColor
        );
      }
    };

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
  }, [
    gameState,
    handleAnswer,
    options,
  ]);

  useEffect(() => {
    return () => {
      clearRoundTimers();
    };
  }, [clearRoundTimers]);

  if (gameState === "finished") {
    const totalAnswers =
      correct + wrong;

    const accuracy =
      totalAnswers > 0
        ? Math.round(
            (correct / totalAnswers) *
              100
          )
        : 0;

    return (
      <main className="min-h-screen bg-[#080b14] px-6 py-16 text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-3xl border border-white/10 bg-white/3 p-8 text-center shadow-2xl sm:p-12">
            <div className="text-6xl">
              🎨
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-cyan-300/70">
              Color Clash Complete
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Great Focus!
            </h1>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-white/30">
                  Score
                </p>

                <p className="mt-2 text-3xl font-black text-cyan-300">
                  {score}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-white/30">
                  Accuracy
                </p>

                <p className="mt-2 text-3xl font-black text-purple-300">
                  {accuracy}%
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-white/30">
                  Best Combo
                </p>

                <p className="mt-2 text-3xl font-black text-pink-300">
                  {bestCombo}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-yellow-300/10 bg-yellow-300/5 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
                XP Earned
              </p>

              <div className="mt-2 text-2xl font-black text-yellow-300">
                +{xpEarned}
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-white/40">
              You answered {correct} correctly
              and missed {wrong}. Keep playing to
              sharpen your focus and reaction speed.
            </p>

            {dailyBonusEarned && (
              <div className="mx-auto mt-5 max-w-md rounded-2xl border border-yellow-300/15 bg-yellow-300/5 p-4">
                <p className="text-sm font-black text-yellow-300">
                  🏆 Daily Challenge Bonus
                </p>

                <p className="mt-1 text-xs text-white/40">
                  +10 score · +50 XP
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={startGame}
                className="rounded-2xl bg-white px-6 py-3 text-sm font-black text-black transition hover:scale-[1.02]"
              >
                Play Again
              </button>

              <a
                href="/games"
                className="rounded-2xl border border-white/10 bg-white/3 px-6 py-3 text-sm font-black text-white transition hover:bg-white/6"
              >
                Back to Arcade
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (gameState === "playing") {
    const progress =
      config.rounds > 0
        ? (round / config.rounds) * 100
        : 0;

    const timerProgress =
      config.responseTime > 0
        ? (timeLeft /
            config.responseTime) *
          100
        : 0;

    return (
      <main className="min-h-screen bg-[#080b14] px-4 py-8 text-white sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-white/30">
                  Color Clash
                </p>

                <p className="mt-1 text-sm font-bold text-white/50">
                  Round{" "}
                  {Math.min(
                    round + 1,
                    config.rounds
                  )}{" "}
                  / {config.rounds}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-wider text-white/30">
                  Score
                </p>

                <p className="text-2xl font-black text-cyan-300">
                  {score}
                </p>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-cyan-300 transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    progress
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/3 p-6 shadow-2xl sm:p-10">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/30">
                Choose the display color
              </p>

              <div className="mt-8">
                <p
                  className="text-5xl font-black tracking-tight sm:text-7xl"
                  style={{
                    color:
                      displayedColor?.value ??
                      "#ffffff",
                  }}
                >
                  {targetColor?.name}
                </p>

                <p className="mt-3 text-sm text-white/30">
                  Ignore the word. Choose the color
                  you see.
                </p>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-xl">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/30">
                <span>Time</span>

                <span>
                  {(
                    timeLeft / 1000
                  ).toFixed(1)}
                  s
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-pink-300 transition-[width] duration-75"
                  style={{
                    width: `${timerProgress}%`,
                  }}
                />
              </div>
            </div>

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
              {options.map(
                (color) => (
                  <button
                    key={color.name}
                    onClick={() =>
                      handleAnswer(
                        color
                      )
                    }
                    className="group rounded-2xl border border-white/10 bg-white/3 p-5 text-center transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/6 active:scale-[0.98]"
                  >
                    <div
                      className="mx-auto h-10 w-10 rounded-full"
                      style={{
                        backgroundColor:
                          color.value,
                      }}
                    />

                    <p className="mt-3 text-sm font-black tracking-wider">
                      {color.name}
                    </p>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/20">
                      Press{" "}
                      {color.name.charAt(
                        0
                      )}
                    </p>
                  </button>
                )
              )}
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm">
              <div>
                <span className="text-white/30">
                  Combo
                </span>{" "}
                <span className="font-black text-yellow-300">
                  x{combo}
                </span>
              </div>

              <div>
                <span className="text-white/30">
                  Best
                </span>{" "}
                <span className="font-black text-purple-300">
                  x{bestCombo}
                </span>
              </div>
            </div>

            {lastCorrect !== null && (
              <div
                className={`mt-6 text-center text-sm font-black ${
                  lastCorrect
                    ? "text-green-300"
                    : "text-red-300"
                }`}
              >
                {lastCorrect
                  ? `✓ Correct! +${lastPoints}`
                  : `✕ Wrong! ${lastPoints}`}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080b14] px-6 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <div className="w-full text-center">
          <div className="text-7xl">
            🎨
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/30">
              MindPlay Game #9
            </p>

            {isDailyChallenge && (
              <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-yellow-300">
                Daily Challenge
              </span>
            )}
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">
            Color Clash
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/40 sm:text-lg">
            Test your focus. Pick the color
            the word is displayed in, not
            the word itself.
          </p>

          {isDailyChallenge && (
            <div className="mx-auto mt-5 max-w-md rounded-2xl border border-yellow-300/15 bg-yellow-300/5 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300/70">
                🏆 Daily Challenge
              </p>

              <p className="mt-2 text-sm text-white/50">
                Today&apos;s challenge is set to{" "}
                <strong className="capitalize text-yellow-300">
                  {dailyChallenge.difficulty}
                </strong>{" "}
                difficulty.
              </p>

              <p className="mt-1 text-xs text-white/30">
                Complete it for +10 score and +50 XP.
              </p>
            </div>
          )}

          <div className="mx-auto mt-10 max-w-md">
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/3 p-2">
              {(
                Object.keys(
                  DIFFICULTIES
                ) as Difficulty[]
              ).map((level) => (
                <button
                  key={level}
                  onClick={() =>
                    setDifficulty(level)
                  }
                  className={`rounded-xl px-3 py-3 text-xs font-black uppercase tracking-wider transition ${
                    difficulty === level
                      ? "bg-white text-black"
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl border border-white/5 bg-white/2 p-3">
                <p className="font-black text-white/60">
                  {config.rounds}
                </p>

                <p className="mt-1 text-white/20">
                  Rounds
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/2 p-3">
                <p className="font-black text-white/60">
                  {(
                    config.responseTime /
                    1000
                  ).toFixed(1)}
                  s
                </p>

                <p className="mt-1 text-white/20">
                  Time
                </p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/2 p-3">
                <p className="font-black text-yellow-300/70">
                  +{config.baseXP}
                </p>

                <p className="mt-1 text-white/20">
                  Base XP
                </p>
              </div>
            </div>

            <button
              onClick={startGame}
              className="mt-6 w-full rounded-2xl bg-white px-6 py-4 text-sm font-black text-black transition hover:scale-[1.02] active:scale-[0.99]"
            >
              Start Game
            </button>

            <a
              href="/games"
              className="mt-4 block text-sm font-bold text-white/30 transition hover:text-white"
            >
              ← Back to Arcade
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}