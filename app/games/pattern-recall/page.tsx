"use client";

import { useEffect, useRef, useState } from "react";
import { recordGame } from "@/lib/progress";
import { unlockGameAchievement } from "@/lib/achievements";
import {
  completeDailyChallenge,
  DAILY_CHALLENGE_BONUS_POINTS,
  getDailyChallenge,
} from "@/lib/dailyChallenge";

type Difficulty = "easy" | "normal" | "hard";

type GameState =
  | "menu"
  | "showing"
  | "playing"
  | "feedback"
  | "finished";

type DifficultyConfig = {
  label: string;
  description: string;
  gridSize: number;
  startTiles: number;
  maxTiles: number;
  rounds: number;
  displayTime: number;
  baseXP: number;
};

const DIFFICULTIES: Record<
  Difficulty,
  DifficultyConfig
> = {
  easy: {
    label: "Easy",
    description: "A gentle memory warm-up.",
    gridSize: 3,
    startTiles: 3,
    maxTiles: 5,
    rounds: 8,
    displayTime: 1500,
    baseXP: 20,
  },
  normal: {
    label: "Normal",
    description: "Remember more. Forget less.",
    gridSize: 4,
    startTiles: 4,
    maxTiles: 8,
    rounds: 9,
    displayTime: 1300,
    baseXP: 35,
  },
  hard: {
    label: "Hard",
    description: "Your visual memory gets tested.",
    gridSize: 5,
    startTiles: 5,
    maxTiles: 11,
    rounds: 10,
    displayTime: 1100,
    baseXP: 50,
  },
};

export default function PatternRecallPage() {
  const [difficulty, setDifficulty] =
    useState<Difficulty>("normal");

  const [gameState, setGameState] =
    useState<GameState>("menu");

  const [round, setRound] = useState(1);
  const [pattern, setPattern] = useState<number[]>([]);
  const [selectedTiles, setSelectedTiles] =
    useState<number[]>([]);

  const [score, setScore] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [wrongRounds, setWrongRounds] = useState(0);

  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);

  const [lastCorrect, setLastCorrect] =
    useState<boolean | null>(null);

  const [lastPoints, setLastPoints] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const [xpEarned, setXpEarned] = useState(0);
  const [dailyCompleted, setDailyCompleted] =
    useState(false);

  const showTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const answerTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const intervalRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  /*
   * Today's Daily Challenge
   */
  const dailyChallenge = getDailyChallenge();

  const isDailyChallenge =
    dailyChallenge.game === "pattern-recall";

  /*
   * Automatically select today's Daily Challenge
   * difficulty when the game is opened through:
   *
   * /games/pattern-recall?daily=true&difficulty=hard
   *
   * We use window.location instead of useSearchParams()
   * so Next.js 16 can still prerender this page normally.
   */
  useEffect(() => {
    if (!isDailyChallenge) {
      return;
    }

    const params = new URLSearchParams(
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
      urlDifficulty === dailyChallenge.difficulty
    ) {
      setDifficulty(dailyChallenge.difficulty);
    }
  }, [
    isDailyChallenge,
    dailyChallenge.difficulty,
  ]);

  const config = DIFFICULTIES[difficulty];

  function clearTimers() {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (answerTimeoutRef.current) {
      clearTimeout(answerTimeoutRef.current);
      answerTimeoutRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  function getTilesForRound(
    roundNumber = round
  ) {
    const increase = Math.floor(
      (roundNumber - 1) / 2
    );

    return Math.min(
      config.maxTiles,
      config.startTiles + increase
    );
  }

  function generatePattern(
    roundNumber = round
  ) {
    const totalTiles =
      config.gridSize * config.gridSize;

    const tileCount =
      getTilesForRound(roundNumber);

    const newPattern: number[] = [];

    while (newPattern.length < tileCount) {
      const randomTile = Math.floor(
        Math.random() * totalTiles
      );

      if (!newPattern.includes(randomTile)) {
        newPattern.push(randomTile);
      }
    }

    return newPattern;
  }

  function startGame() {
    clearTimers();

    setRound(1);
    setScore(0);
    setCorrectRounds(0);
    setWrongRounds(0);
    setCombo(0);
    setBestCombo(0);
    setSelectedTiles([]);
    setLastCorrect(null);
    setLastPoints(0);
    setPattern([]);
    setTimeLeft(0);
    setXpEarned(0);
    setDailyCompleted(false);

    setGameState("showing");

    showPattern(1);
  }

  function showPattern(
    roundNumber: number
  ) {
    clearTimers();

    const totalTiles =
      config.gridSize * config.gridSize;

    const newPattern =
      generatePattern(roundNumber);

    setPattern(newPattern);
    setSelectedTiles([]);
    setGameState("showing");

    showTimeoutRef.current =
      setTimeout(() => {
        startAnswerPhase();
      }, config.displayTime);
  }

  function startAnswerPhase() {
    const answerTime = Math.max(
      3000,
      7000 - round * 200
    );

    setTimeLeft(answerTime);
    setGameState("playing");

    intervalRef.current =
      setInterval(() => {
        setTimeLeft((previous) =>
          Math.max(0, previous - 100)
        );
      }, 100);

    answerTimeoutRef.current =
      setTimeout(() => {
        finishRound([]);
      }, answerTime);
  }

  function toggleTile(index: number) {
    if (gameState !== "playing") {
      return;
    }

    setSelectedTiles((previous) => {
      if (previous.includes(index)) {
        return previous.filter(
          (tile) => tile !== index
        );
      }

      if (previous.length >= pattern.length) {
        return previous;
      }

      return [...previous, index];
    });
  }

  function arraysMatch(
    first: number[],
    second: number[]
  ) {
    if (first.length !== second.length) {
      return false;
    }

    const sortedFirst = [...first].sort(
      (a, b) => a - b
    );

    const sortedSecond = [...second].sort(
      (a, b) => a - b
    );

    return sortedFirst.every(
      (value, index) =>
        value === sortedSecond[index]
    );
  }

  function submitPattern() {
    if (gameState !== "playing") {
      return;
    }

    finishRound(selectedTiles);
  }

  function finishRound(answer: number[]) {
    clearTimers();

    const isCorrect = arraysMatch(
      answer,
      pattern
    );

    let nextScore = score;
    let nextCombo = combo;
    let points = 0;

    if (isCorrect) {
      nextCombo = combo + 1;

      const basePoints =
        pattern.length * 10;

      const comboBonus =
        Math.floor(nextCombo / 3) * 5;

      points = Math.min(
        40,
        basePoints + comboBonus
      );

      nextScore = score + points;

      setCorrectRounds(
        (previous) => previous + 1
      );

      setBestCombo((previous) =>
        Math.max(previous, nextCombo)
      );
    } else {
      nextCombo = 0;
      points = -5;

      nextScore = Math.max(
        0,
        score - 5
      );

      setWrongRounds(
        (previous) => previous + 1
      );
    }

    setScore(nextScore);
    setCombo(nextCombo);
    setLastCorrect(isCorrect);
    setLastPoints(points);
    setSelectedTiles(answer);
    setGameState("feedback");
  }

  function continueGame() {
    if (round >= config.rounds) {
      finishGame();
      return;
    }

    const nextRound = round + 1;

    setRound(nextRound);

    showPattern(nextRound);
  }

  function finishGame() {
    clearTimers();

    const totalRounds =
      correctRounds + wrongRounds;

    const accuracy =
      totalRounds > 0
        ? Math.round(
            (correctRounds / totalRounds) * 100
          )
        : 0;

    const scoreBonus = Math.min(
      50,
      Math.floor(score / 30)
    );

    const comboBonus =
      bestCombo >= 7
        ? 20
        : bestCombo >= 4
          ? 10
          : 0;

    /*
     * Normal Pattern Recall XP.
     */
    const baseTotalXP =
      config.baseXP +
      scoreBonus +
      comboBonus;

    /*
     * Daily Challenge completion.
     *
     * completeDailyChallenge() itself awards
     * the +50 Daily Challenge XP.
     */
    const completedDaily =
      isDailyChallenge
        ? completeDailyChallenge(
            "pattern-recall"
          )
        : false;

    /*
     * Daily Challenge gives +10 score.
     */
    const finalScore =
      score +
      (completedDaily
        ? DAILY_CHALLENGE_BONUS_POINTS
        : 0);

    /*
     * Only display the Daily Challenge +50 XP here.
     *
     * completeDailyChallenge() already adds the
     * actual +50 XP to progress.
     */
    const finalDisplayedXP =
      baseTotalXP +
      (completedDaily ? 50 : 0);

    setXpEarned(finalDisplayedXP);
    setDailyCompleted(completedDaily);

    recordGame(
      finalScore,
      baseTotalXP
    );

    unlockGameAchievement(
      "pattern-master"
    );

    console.log(
      "Pattern Recall result:",
      {
        score,
        finalScore,
        correctRounds,
        wrongRounds,
        accuracy,
        bestCombo,
        baseTotalXP,
        dailyCompleted: completedDaily,
        finalDisplayedXP,
      }
    );

    setGameState("finished");
  }

  const totalTiles =
    config.gridSize * config.gridSize;

  const currentAnswerTime = Math.max(
    3000,
    7000 - round * 200
  );

  const timePercentage = Math.max(
    0,
    Math.min(
      100,
      (timeLeft / currentAnswerTime) * 100
    )
  );

  if (gameState === "finished") {
    const totalRounds =
      correctRounds + wrongRounds;

    const accuracy =
      totalRounds > 0
        ? Math.round(
            (correctRounds / totalRounds) * 100
          )
        : 0;

    const scoreBonus = Math.min(
      50,
      Math.floor(score / 30)
    );

    const comboBonus =
      bestCombo >= 7
        ? 20
        : bestCombo >= 4
          ? 10
          : 0;

    const totalXP =
      config.baseXP +
      scoreBonus +
      comboBonus;

    let performance =
      "Keep training that memory.";

    if (accuracy >= 90) {
      performance =
        "Your visual memory is cracked. 🔥";
    } else if (accuracy >= 75) {
      performance =
        "Excellent pattern recognition! 🧠";
    } else if (accuracy >= 60) {
      performance =
        "Solid memory run. ⚡";
    } else if (accuracy >= 40) {
      performance =
        "The patterns got you this time. 👀";
    }

    return (
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto flex min-h-[85vh] max-w-3xl items-center justify-center">
          <section className="mp-card mp-fade-up w-full rounded-3xl p-6 text-center sm:p-10">
            <div className="mb-3 text-6xl">
              🟦
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/40">
              Pattern Recall
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
                  {dailyCompleted && (
                    <span className="ml-1 text-sm text-purple-300">
                      +10
                    </span>
                  )}
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
                  +{xpEarned || totalXP}
                </div>

                <div className="mt-1 text-xs font-bold uppercase tracking-wider text-white/40">
                  XP
                </div>
              </div>
            </div>

            {dailyCompleted && (
              <div className="mt-5 rounded-2xl border border-purple-300/15 bg-purple-300/5 p-4">
                <div className="text-lg">
                  🎯
                </div>

                <p className="mt-1 text-sm font-black text-purple-200">
                  Daily Challenge Complete!
                </p>

                <p className="mt-1 text-xs leading-5 text-white/40">
                  +50 XP and +10 bonus score
                  have been added.
                </p>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/2.5 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">
                  Correct Rounds
                </span>

                <strong className="text-green-300">
                  {correctRounds}
                </strong>
              </div>

              <div className="mt-2 flex justify-between text-sm">
                <span className="text-white/50">
                  Missed Rounds
                </span>

                <strong className="text-red-300">
                  {wrongRounds}
                </strong>
              </div>

              <div className="mt-2 flex justify-between text-sm">
                <span className="text-white/50">
                  Difficulty
                </span>

                <strong className="capitalize">
                  {difficulty}
                </strong>
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
              {lastCorrect ? "🧠" : "💥"}
            </div>

            <h1
              className={`mt-4 text-4xl font-black ${
                lastCorrect
                  ? "text-green-300"
                  : "text-red-300"
              }`}
            >
              {lastCorrect
                ? "Pattern Matched!"
                : "Pattern Missed!"}
            </h1>

            <p className="mt-3 text-white/50">
              {lastCorrect
                ? `+${lastPoints} points`
                : "The pattern didn't match."}
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-3xl border border-white/10 bg-white/2.5 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                Correct Pattern
              </p>

              <div
                className="mx-auto mt-5 grid max-w-60 gap-2"
                style={{
                  gridTemplateColumns: `repeat(${config.gridSize}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({
                  length: totalTiles,
                }).map((_, index) => {
                  const active =
                    pattern.includes(index);

                  return (
                    <div
                      key={index}
                      className={`aspect-square rounded-lg border ${
                        active
                          ? "border-cyan-300/50 bg-cyan-300/70 shadow-[0_0_20px_rgba(103,232,249,0.25)]"
                          : "border-white/5 bg-white/2.5"
                      }`}
                    />
                  );
                })}
              </div>
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
                : "Next Pattern →"}
            </button>
          </section>
        </div>
      </main>
    );
  }

  if (
    gameState === "showing" ||
    gameState === "playing"
  ) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex items-center justify-between">
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

              <div className="text-xs capitalize text-white/40">
                {difficulty}
              </div>
            </div>
          </div>

          {isDailyChallenge && (
            <div className="mb-5 rounded-2xl border border-purple-300/15 bg-purple-300/5 px-4 py-3 text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300/70">
                🎯 Daily Challenge
              </p>

              <p className="mt-1 text-sm font-black text-white/80">
                {dailyChallenge.title} ·{" "}
                {dailyChallenge.difficulty.toUpperCase()}
              </p>
            </div>
          )}

          <section className="mp-card rounded-3xl p-5 sm:p-8">
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
                  {gameState === "showing"
                    ? "Memorize"
                    : "Time"}
                </div>

                <div className="mt-1 text-2xl font-black">
                  {gameState === "showing"
                    ? "👀"
                    : `${(
                        timeLeft / 1000
                      ).toFixed(1)}`}
                </div>
              </div>
            </div>

            {gameState === "playing" && (
              <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
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
            )}

            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/30">
                {gameState === "showing"
                  ? "Memorize the pattern"
                  : "Recreate the pattern"}
              </p>

              <p className="mt-2 text-sm text-white/40">
                {pattern.length} tiles
              </p>
            </div>

            <div
              className="mx-auto mt-8 grid max-w-105 gap-2 sm:gap-3"
              style={{
                gridTemplateColumns: `repeat(${config.gridSize}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({
                length: totalTiles,
              }).map((_, index) => {
                const isPatternTile =
                  pattern.includes(index);

                const isSelected =
                  selectedTiles.includes(index);

                const isShowing =
                  gameState === "showing";

                return (
                  <button
                    key={index}
                    disabled={isShowing}
                    onClick={() =>
                      toggleTile(index)
                    }
                    aria-label={`Tile ${
                      index + 1
                    }`}
                    className={`aspect-square rounded-xl border transition-all duration-150 ${
                      isShowing
                        ? isPatternTile
                          ? "scale-95 border-cyan-300/50 bg-cyan-300 shadow-[0_0_30px_rgba(103,232,249,0.35)]"
                          : "border-white/10 bg-white/[0.035]"
                        : isSelected
                          ? "scale-95 border-cyan-300/60 bg-cyan-300/60 shadow-[0_0_25px_rgba(103,232,249,0.25)]"
                          : "border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/8 active:scale-95"
                    }`}
                  />
                );
              })}
            </div>

            {gameState === "showing" ? (
              <div className="mt-8 text-center">
                <p className="text-sm font-bold text-cyan-300">
                  🧠 Lock it in...
                </p>

                <p className="mt-2 text-xs text-white/30">
                  The pattern is about to disappear.
                </p>
              </div>
            ) : (
              <div className="mt-8 text-center">
                <p className="text-sm text-white/40">
                  Select exactly{" "}
                  <strong className="text-white">
                    {pattern.length}
                  </strong>{" "}
                  tiles.
                </p>

                <button
                  onClick={submitPattern}
                  disabled={
                    selectedTiles.length !==
                    pattern.length
                  }
                  className="mp-button mt-5 w-full bg-white px-6 py-4 text-black disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto sm:min-w-55"
                >
                  ✓ Lock Pattern
                </button>
              </div>
            )}
          </section>
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
              🟦
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/30">
              MindPlay Game #10
            </p>

            <h1 className="mt-3 text-5xl font-black">
              Pattern{" "}
              <span className="mp-gradient-text">
                Recall
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/55">
              Memorize the highlighted tiles,
              then recreate the exact pattern
              after they disappear.
            </p>
          </div>

          {isDailyChallenge && (
            <div className="mt-6 rounded-2xl border border-purple-300/15 bg-purple-300/5 p-4 text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300/70">
                🎯 Today&apos;s Daily Challenge
              </p>

              <p className="mt-1 text-sm font-black text-white">
                Pattern Recall ·{" "}
                {dailyChallenge.difficulty.toUpperCase()}
              </p>

              <p className="mt-1 text-xs text-white/35">
                Difficulty automatically selected
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {(
              Object.keys(
                DIFFICULTIES
              ) as Difficulty[]
            ).map((level) => {
              const item =
                DIFFICULTIES[level];

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
                    {item.gridSize}×
                    {item.gridSize} ·{" "}
                    {item.rounds} rounds
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/2.5 p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-black text-cyan-300">
                  🧠
                </div>

                <div className="mt-1 text-xs uppercase tracking-wider text-white/30">
                  Memory
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-yellow-300">
                  🔥
                </div>

                <div className="mt-1 text-xs uppercase tracking-wider text-white/30">
                  Combos
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-purple-300">
                  ⚡
                </div>

                <div className="mt-1 text-xs uppercase tracking-wider text-white/30">
                  Speed
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="mp-button mt-8 w-full bg-white px-6 py-5 text-lg text-black"
          >
            🟦 Start Pattern Recall
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