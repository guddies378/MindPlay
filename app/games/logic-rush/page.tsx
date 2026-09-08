"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  completeDailyChallenge,
  DAILY_CHALLENGE_BONUS_POINTS,
  getDailyChallenge,
} from "@/lib/dailyChallenge";
import {
  recordGame,
  unlockGameAchievement,
} from "@/lib/progress";

type Difficulty = "Easy" | "Normal" | "Hard";
type GameState =
  | "menu"
  | "playing"
  | "feedback"
  | "finished";

type Puzzle = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type DifficultyConfig = {
  rounds: number;
  baseXP: number;
  timeLimit: number;
};

const DIFFICULTIES: Record<
  Difficulty,
  DifficultyConfig
> = {
  Easy: {
    rounds: 8,
    baseXP: 20,
    timeLimit: 20,
  },
  Normal: {
    rounds: 10,
    baseXP: 35,
    timeLimit: 15,
  },
  Hard: {
    rounds: 12,
    baseXP: 50,
    timeLimit: 10,
  },
};

const PUZZLES: Record<Difficulty, Puzzle[]> = {
  Easy: [
    {
      question:
        "What comes next? 2, 4, 6, 8, ?",
      options: ["9", "10", "11", "12"],
      answer: 1,
      explanation:
        "The numbers increase by 2 each time.",
    },
    {
      question:
        "What comes next? 5, 10, 15, 20, ?",
      options: ["22", "23", "25", "30"],
      answer: 2,
      explanation:
        "Each number increases by 5.",
    },
    {
      question:
        "Which number does NOT belong?",
      options: ["2", "4", "7", "8"],
      answer: 2,
      explanation:
        "2, 4, and 8 are even. 7 is odd.",
    },
    {
      question:
        "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops Lazzies?",
      options: [
        "Yes",
        "No",
        "Impossible",
        "Only sometimes",
      ],
      answer: 0,
      explanation:
        "If A belongs to B and B belongs to C, A belongs to C.",
    },
    {
      question:
        "A clock shows 3:00. What angle is between the hands?",
      options: [
        "45°",
        "60°",
        "90°",
        "180°",
      ],
      answer: 2,
      explanation:
        "At 3:00 the hands form a right angle.",
    },
    {
      question:
        "Which is the smallest?",
      options: [
        "0.5",
        "0.05",
        "0.15",
        "0.25",
      ],
      answer: 1,
      explanation:
        "0.05 is smaller than all the other values.",
    },
    {
      question:
        "What comes next? 1, 3, 5, 7, ?",
      options: ["8", "9", "10", "11"],
      answer: 1,
      explanation:
        "The sequence increases by 2.",
    },
    {
      question:
        "If you have 3 apples and take away 2, how many do you have?",
      options: ["1", "2", "3", "5"],
      answer: 1,
      explanation:
        "You took 2 apples, so you have the 2 apples you took.",
    },
    {
      question:
        "Which shape has the most sides?",
      options: [
        "Triangle",
        "Square",
        "Pentagon",
        "Circle",
      ],
      answer: 2,
      explanation:
        "A pentagon has 5 sides.",
    },
    {
      question:
        "What is half of 18?",
      options: ["6", "8", "9", "12"],
      answer: 2,
      explanation:
        "18 divided by 2 is 9.",
    },
  ],

  Normal: [
    {
      question:
        "What comes next? 3, 6, 12, 24, ?",
      options: ["36", "42", "48", "54"],
      answer: 2,
      explanation:
        "Each number is multiplied by 2.",
    },
    {
      question:
        "What comes next? 2, 6, 12, 20, ?",
      options: ["28", "30", "32", "36"],
      answer: 1,
      explanation:
        "The differences are +4, +6, +8, so the next is +10.",
    },
    {
      question:
        "A farmer has 10 sheep. All but 3 run away. How many remain?",
      options: ["3", "7", "10", "0"],
      answer: 0,
      explanation:
        "\"All but 3\" means 3 sheep remain.",
    },
    {
      question:
        "Which number replaces ? 4, 9, 16, 25, ?",
      options: ["30", "32", "36", "49"],
      answer: 2,
      explanation:
        "These are squares: 2², 3², 4², 5², 6².",
    },
    {
      question:
        "If yesterday was Monday, what day is tomorrow?",
      options: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
      ],
      answer: 2,
      explanation:
        "If yesterday was Monday, today is Tuesday and tomorrow is Wednesday.",
    },
    {
      question:
        "Which number is the odd one out?",
      options: ["16", "25", "36", "48"],
      answer: 3,
      explanation:
        "16, 25, and 36 are perfect squares. 48 is not.",
    },
    {
      question:
        "What comes next? 1, 1, 2, 3, 5, 8, ?",
      options: ["11", "12", "13", "15"],
      answer: 2,
      explanation:
        "Each number is the sum of the previous two.",
    },
    {
      question:
        "A bat and ball cost $1.10 total. The bat costs $1 more than the ball. How much is the ball?",
      options: [
        "$0.05",
        "$0.10",
        "$0.15",
        "$0.20",
      ],
      answer: 0,
      explanation:
        "The ball costs $0.05 and the bat costs $1.05.",
    },
    {
      question:
        "If 5 machines make 5 items in 5 minutes, how long do 100 machines take to make 100 items?",
      options: [
        "5 minutes",
        "20 minutes",
        "100 minutes",
        "500 minutes",
      ],
      answer: 0,
      explanation:
        "Each machine makes one item in 5 minutes.",
    },
    {
      question:
        "What comes next? 81, 27, 9, 3, ?",
      options: ["0", "1", "2", "6"],
      answer: 1,
      explanation:
        "Each number is divided by 3.",
    },
    {
      question:
        "Which word does NOT belong?",
      options: [
        "Apple",
        "Banana",
        "Carrot",
        "Mango",
      ],
      answer: 2,
      explanation:
        "Carrot is a vegetable; the others are fruits.",
    },
    {
      question:
        "A train travels 60 km in 1 hour. How far does it travel in 3 hours?",
      options: [
        "120 km",
        "150 km",
        "180 km",
        "240 km",
      ],
      answer: 2,
      explanation:
        "60 × 3 = 180 km.",
    },
  ],

  Hard: [
    {
      question:
        "What comes next? 2, 3, 5, 9, 17, ?",
      options: ["25", "31", "33", "35"],
      answer: 2,
      explanation:
        "Each term is multiplied by 2, then 1 is added.",
    },
    {
      question:
        "What comes next? 1, 4, 10, 22, 46, ?",
      options: ["82", "90", "94", "96"],
      answer: 2,
      explanation:
        "Each term is multiplied by 2 and then 2 is added.",
    },
    {
      question:
        "You have 8 identical-looking balls. One is heavier. What is the minimum number of balance-scale weighings needed to guarantee finding it?",
      options: ["1", "2", "3", "4"],
      answer: 2,
      explanation:
        "Split into groups and use a maximum of 3 weighings to guarantee the answer.",
    },
    {
      question:
        "A clock gains 5 minutes every hour. If it is correct at noon, what will it show at 6 PM?",
      options: [
        "6:05 PM",
        "6:15 PM",
        "6:30 PM",
        "7:00 PM",
      ],
      answer: 2,
      explanation:
        "It gains 5 minutes × 6 hours = 30 minutes.",
    },
    {
      question:
        "What number replaces ? 3, 8, 15, 24, 35, ?",
      options: ["42", "46", "48", "50"],
      answer: 2,
      explanation:
        "The pattern is n² − 1: 2²−1, 3²−1, 4²−1, etc.",
    },
    {
      question:
        "A room has 4 corners. A cat sits in each corner. Each cat sees 3 cats. How many cats are there?",
      options: ["4", "8", "12", "16"],
      answer: 0,
      explanation:
        "There is one cat in each of the 4 corners.",
    },
    {
      question:
        "What comes next? 7, 10, 16, 28, 52, ?",
      options: ["76", "88", "100", "104"],
      answer: 3,
      explanation:
        "The differences double: +3, +6, +12, +24, then +48.",
    },
    {
      question:
        "A father is 4 times as old as his son. In 20 years, he will be twice as old. How old is the son now?",
      options: ["5", "10", "15", "20"],
      answer: 1,
      explanation:
        "If the son is 10, father is 40. In 20 years they are 30 and 60.",
    },
    {
      question:
        "Which number should replace ? 121, 144, 169, ?",
      options: ["181", "196", "200", "225"],
      answer: 1,
      explanation:
        "These are 11², 12², 13², so the next is 14² = 196.",
    },
    {
      question:
        "If some A are B, and all B are C, which statement must be true?",
      options: [
        "All A are C",
        "Some A are C",
        "No A are C",
        "All C are A",
      ],
      answer: 1,
      explanation:
        "The A that are B must also be C.",
    },
    {
      question:
        "You overtake the person in 2nd place during a race. What position are you in?",
      options: [
        "1st",
        "2nd",
        "3rd",
        "Depends",
      ],
      answer: 1,
      explanation:
        "You take the position of the person you overtook: 2nd.",
    },
    {
      question:
        "What comes next? 4, 7, 13, 25, 49, ?",
      options: ["73", "81", "97", "101"],
      answer: 2,
      explanation:
        "Each number is multiplied by 2 and then 1 is subtracted.",
    },
  ],
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j =
      Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [
      copy[j],
      copy[i],
    ];
  }

  return copy;
}

function difficultyToKey(
  difficulty: Difficulty
) {
  return difficulty;
}

export default function LogicRushPage() {
  const [difficulty, setDifficulty] =
    useState<Difficulty>("Normal");

  const [gameState, setGameState] =
    useState<GameState>("menu");

  const [round, setRound] =
    useState(1);

  const [score, setScore] =
    useState(0);

  const [correct, setCorrect] =
    useState(0);

  const [combo, setCombo] =
    useState(0);

  const [bestCombo, setBestCombo] =
    useState(0);

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null);

  const [lastCorrect, setLastCorrect] =
    useState<boolean | null>(null);

  const [finalXP, setFinalXP] =
    useState(0);

  const [dailyBonusEarned, setDailyBonusEarned] =
    useState(false);

  const [questionSet, setQuestionSet] =
    useState<Puzzle[]>([]);

  const config =
    DIFFICULTIES[difficulty];

  const currentPuzzle =
    questionSet[round - 1];

  const dailyChallenge =
    getDailyChallenge();

  const isDailyChallenge =
    dailyChallenge.game === "logic-rush";

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
      const mappedDifficulty =
        urlDifficulty === "easy"
          ? "Easy"
          : urlDifficulty === "normal"
            ? "Normal"
            : "Hard";

      setDifficulty(
        mappedDifficulty
      );
    }
  }, [
    isDailyChallenge,
    dailyChallenge.difficulty,
  ]);

  useEffect(() => {
    if (gameState !== "playing") {
      return;
    }

    if (timeLeft <= 0) {
      handleAnswer(null);
      return;
    }

    const timer =
      window.setTimeout(() => {
        setTimeLeft(
          (current) => current - 1
        );
      }, 1000);

    return () =>
      window.clearTimeout(timer);
  }, [
    gameState,
    timeLeft,
  ]);

  function startGame() {
    const puzzles = shuffle(
      PUZZLES[
        difficultyToKey(difficulty)
      ]
    ).slice(0, config.rounds);

    setQuestionSet(puzzles);
    setRound(1);
    setScore(0);
    setCorrect(0);
    setCombo(0);
    setBestCombo(0);
    setSelectedAnswer(null);
    setLastCorrect(null);
    setFinalXP(0);
    setDailyBonusEarned(false);
    setTimeLeft(
      config.timeLimit
    );
    setGameState("playing");
  }

  function handleAnswer(
    answerIndex: number | null
  ) {
    if (gameState !== "playing") {
      return;
    }

    if (!currentPuzzle) {
      return;
    }

    const isCorrect =
      answerIndex !== null &&
      answerIndex ===
        currentPuzzle.answer;

    setSelectedAnswer(
      answerIndex
    );

    setLastCorrect(
      isCorrect
    );

    if (isCorrect) {
      const nextCombo =
        combo + 1;

      const multiplier =
        Math.min(
          2,
          1 +
            Math.floor(
              nextCombo / 3
            ) *
              0.25
        );

      const timeBonus =
        Math.max(
          0,
          timeLeft * 2
        );

      const points =
        Math.round(
          (50 + timeBonus) *
            multiplier
        );

      setScore(
        (current) =>
          current + points
      );

      setCorrect(
        (current) =>
          current + 1
      );

      setCombo(nextCombo);

      setBestCombo(
        (current) =>
          Math.max(
            current,
            nextCombo
          )
      );
    } else {
      setScore(
        (current) =>
          Math.max(
            0,
            current - 10
          )
      );

      setCombo(0);
    }

    setGameState(
      "feedback"
    );
  }

  function nextRound() {
    if (
      round >= config.rounds
    ) {
      finishGame();
      return;
    }

    setRound(
      (current) =>
        current + 1
    );

    setSelectedAnswer(null);
    setLastCorrect(null);

    setTimeLeft(
      config.timeLimit
    );

    setGameState(
      "playing"
    );
  }

  function finishGame() {
    /*
     * The score state already contains
     * all normal round points and penalties.
     *
     * Daily Challenge gives +10 score.
     */
    const dailyCompleted =
      isDailyChallenge &&
      completeDailyChallenge(
        "logic-rush"
      );

    const finalScore =
      score +
      (dailyCompleted
        ? DAILY_CHALLENGE_BONUS_POINTS
        : 0);

    const scoreBonus =
      Math.min(
        50,
        Math.floor(
          finalScore / 50
        )
      );

    let comboBonus = 0;

    if (bestCombo >= 8) {
      comboBonus = 20;
    } else if (bestCombo >= 5) {
      comboBonus = 10;
    }

    /*
     * completeDailyChallenge()
     * already adds +50 XP.
     *
     * Therefore recordGame() receives
     * only the normal XP.
     */
    const baseXP =
      config.baseXP +
      scoreBonus +
      comboBonus;

    const displayXP =
      baseXP +
      (dailyCompleted
        ? 50
        : 0);

    setFinalXP(displayXP);

    setDailyBonusEarned(
      dailyCompleted
    );

    recordGame(
      finalScore,
      baseXP
    );

    unlockGameAchievement(
      "riddle-solver"
    );

    setGameState(
      "finished"
    );
  }

  function playAgain() {
    startGame();
  }

  const accuracy =
    config.rounds > 0
      ? Math.round(
          (correct /
            config.rounds) *
            100
        )
      : 0;

  const multiplier =
    Math.min(
      2,
      1 +
        Math.floor(
          combo / 3
        ) *
          0.25
    );

  const timerPercentage =
    config.timeLimit > 0
      ? (timeLeft /
          config.timeLimit) *
        100
      : 0;

  const timerMessage =
    useMemo(() => {
      if (timeLeft <= 3) {
        return "HURRY!";
      }

      if (timeLeft <= 7) {
        return "THINK FAST";
      }

      return "SOLVE IT";
    }, [timeLeft]);

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/games"
            className="text-sm font-bold text-white/50 transition hover:text-white"
          >
            ← Arcade
          </Link>

          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
              MindPlay
            </p>

            <p className="text-xs text-white/40">
              Logic Rush
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">
            🧠
          </div>

          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300/60">
            Logic Game
          </p>

          <h1 className="text-3xl font-black sm:text-4xl">
            Logic Rush
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/50">
            Solve fast. Build your combo.
            Don&apos;t let the clock win.
          </p>

          {isDailyChallenge && (
            <div className="mx-auto mt-5 inline-flex rounded-full border border-yellow-300/20 bg-yellow-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-yellow-300">
              🏆 Daily Challenge
            </div>
          )}
        </div>

        {/* MENU */}
        {gameState === "menu" && (
          <section className="mp-card rounded-3xl p-6 sm:p-8">

            <div className="mb-7 text-center">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-white/40">
                Choose difficulty
              </p>

              <div className="grid grid-cols-3 gap-2">
                {(
                  Object.keys(
                    DIFFICULTIES
                  ) as Difficulty[]
                ).map((level) => {
                  const active =
                    difficulty ===
                    level;

                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() =>
                        setDifficulty(
                          level
                        )
                      }
                      className={`rounded-2xl border px-3 py-4 text-sm font-black transition ${
                        active
                          ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200"
                          : "border-white/10 bg-white/3 text-white/50 hover:bg-white/6 hover:text-white"
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {isDailyChallenge && (
              <div className="mb-6 rounded-2xl border border-yellow-300/15 bg-yellow-300/5 p-4 text-center">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300/70">
                  🏆 Daily Challenge
                </p>

                <p className="mt-2 text-sm text-white/50">
                  Today&apos;s Logic Rush
                  challenge is{" "}
                  <strong className="text-yellow-300">
                    {dailyChallenge.difficulty}
                  </strong>
                  .
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Complete it for +10 score
                  and +50 XP.
                </p>
              </div>
            )}

            <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/4 p-4 text-center">
                <p className="text-xs text-white/40">
                  Rounds
                </p>

                <p className="mt-1 text-xl font-black">
                  {config.rounds}
                </p>
              </div>

              <div className="rounded-2xl bg-white/4 p-4 text-center">
                <p className="text-xs text-white/40">
                  Time
                </p>

                <p className="mt-1 text-xl font-black">
                  {config.timeLimit}s
                </p>
              </div>

              <div className="col-span-2 rounded-2xl bg-white/4 p-4 text-center sm:col-span-1">
                <p className="text-xs text-white/40">
                  Base XP
                </p>

                <p className="mt-1 text-xl font-black text-cyan-300">
                  +{config.baseXP}
                </p>
              </div>
            </div>

            <div className="mb-7 rounded-2xl border border-white/10 bg-white/2.5 p-5">
              <p className="text-sm font-black">
                How to play
              </p>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-white/50">
                <li>
                  • Read the puzzle carefully.
                </li>

                <li>
                  • Choose the correct answer.
                </li>

                <li>
                  • Faster answers earn more
                  points.
                </li>

                <li>
                  • Build combos for bigger
                  multipliers.
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="mp-button w-full bg-white px-6 py-4 text-sm text-black hover:opacity-90"
            >
              Start Logic Rush
            </button>
          </section>
        )}

        {/* GAME */}
        {gameState !== "menu" &&
          gameState !== "finished" && (
            <>
              {/* Stats */}
              <div className="mb-5 grid grid-cols-3 gap-2">
                <div className="mp-card rounded-2xl p-3 text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/35">
                    Round
                  </p>

                  <p className="mt-1 font-black">
                    {round}/
                    {config.rounds}
                  </p>
                </div>

                <div className="mp-card rounded-2xl p-3 text-center">
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/35">
                    Score
                  </p>

                  <p className="mt-1 font-black">
                    {score}
                  </p>
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

              {/* Timer */}
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span
                    className={`font-black tracking-wider ${
                      timeLeft <= 3
                        ? "text-fuchsia-300"
                        : "text-white/40"
                    }`}
                  >
                    {timerMessage}
                  </span>

                  <span className="font-black text-white/60">
                    {timeLeft}s
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/6">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      timeLeft <= 3
                        ? "bg-fuchsia-300"
                        : "bg-cyan-300"
                    }`}
                    style={{
                      width: `${Math.max(
                        0,
                        timerPercentage
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              {gameState ===
                "playing" &&
                currentPuzzle && (
                  <section className="mp-card rounded-3xl p-6 sm:p-8">
                    <div className="mb-8">
                      <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                        Logic Puzzle
                      </p>

                      <h2 className="text-xl font-black leading-8 sm:text-2xl">
                        {
                          currentPuzzle.question
                        }
                      </h2>
                    </div>

                    <div className="grid gap-3">
                      {currentPuzzle.options.map(
                        (
                          option,
                          index
                        ) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              handleAnswer(
                                index
                              )
                            }
                            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/3 p-4 text-left transition hover:border-cyan-300/30 hover:bg-cyan-300/6"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/6 text-sm font-black text-white/50 transition group-hover:bg-cyan-300/10 group-hover:text-cyan-200">
                              {String.fromCharCode(
                                65 +
                                  index
                              )}
                            </span>

                            <span className="text-sm font-bold text-white/75 group-hover:text-white">
                              {option}
                            </span>
                          </button>
                        )
                      )}
                    </div>

                    <p className="mt-6 text-center text-xs text-white/25">
                      Trust your first
                      instinct.
                    </p>
                  </section>
                )}

              {/* Feedback */}
              {gameState ===
                "feedback" &&
                currentPuzzle && (
                  <section className="mp-card rounded-3xl p-6 sm:p-8">
                    <div className="text-center">
                      <div className="text-5xl">
                        {lastCorrect
                          ? "🔥"
                          : "💥"}
                      </div>

                      <h2
                        className={`mt-4 text-2xl font-black ${
                          lastCorrect
                            ? "text-cyan-300"
                            : "text-fuchsia-300"
                        }`}
                      >
                        {lastCorrect
                          ? "Correct!"
                          : selectedAnswer ===
                              null
                            ? "Time's Up!"
                            : "Not Quite!"}
                      </h2>

                      {lastCorrect && (
                        <p className="mt-2 text-sm text-white/45">
                          Combo:{" "}
                          {combo}× ·
                          Multiplier:{" "}
                          {multiplier.toFixed(
                            2
                          )}×
                        </p>
                      )}
                    </div>

                    <div className="my-7 rounded-2xl bg-white/4 p-5">
                      <p className="mb-2 text-xs font-black uppercase tracking-wider text-white/35">
                        Correct answer
                      </p>

                      <p className="text-lg font-black text-cyan-200">
                        {
                          currentPuzzle
                            .options[
                            currentPuzzle
                              .answer
                          ]
                        }
                      </p>

                      <p className="mt-4 text-sm leading-6 text-white/50">
                        {
                          currentPuzzle.explanation
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={nextRound}
                      className="mp-button w-full bg-white py-4 text-sm text-black hover:opacity-90"
                    >
                      {round >=
                      config.rounds
                        ? "See Results"
                        : "Next Puzzle →"}
                    </button>
                  </section>
                )}
            </>
          )}

        {/* RESULTS */}
        {gameState ===
          "finished" && (
          <section className="mp-card rounded-3xl p-6 sm:p-8">
            <div className="text-center">
              <div className="text-6xl">
                🧠
              </div>

              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-cyan-300/60">
                {dailyBonusEarned
                  ? "Daily Challenge Complete"
                  : "Challenge Complete"}
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Logic Rush Complete
              </h2>

              <p className="mt-2 text-sm text-white/45">
                You made it through the
                entire logic gauntlet.
              </p>
            </div>

            {dailyBonusEarned && (
              <div className="mx-auto mt-6 max-w-md rounded-2xl border border-yellow-300/15 bg-yellow-300/5 p-4 text-center">
                <p className="text-sm font-black text-yellow-300">
                  🏆 Daily Challenge
                  Bonus
                </p>

                <p className="mt-1 text-xs text-white/40">
                  +10 score · +50 XP
                </p>
              </div>
            )}

            <div className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-white/4 p-4 text-center">
                <p className="text-xs text-white/40">
                  Score
                </p>

                <p className="mt-1 text-2xl font-black">
                  {score}
                </p>
              </div>

              <div className="rounded-2xl bg-white/4 p-4 text-center">
                <p className="text-xs text-white/40">
                  Accuracy
                </p>

                <p className="mt-1 text-2xl font-black">
                  {accuracy}%
                </p>
              </div>

              <div className="rounded-2xl bg-white/4 p-4 text-center">
                <p className="text-xs text-white/40">
                  Best Combo
                </p>

                <p className="mt-1 text-2xl font-black">
                  {bestCombo}×
                </p>
              </div>

              <div className="rounded-2xl bg-white/4 p-4 text-center">
                <p className="text-xs text-white/40">
                  XP Earned
                </p>

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
                  ? "Your brain is operating at dangerous levels. 🧠🔥"
                  : accuracy >= 70
                    ? "Excellent logic. You handled the pressure. ⚡"
                    : accuracy >= 50
                      ? "Solid run. Your brain can go further. 💪"
                      : "The puzzles won this time. Run it back. 😈"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={playAgain}
                className="mp-button bg-white py-4 text-sm text-black hover:opacity-90"
              >
                Play Again
              </button>

              <Link
                href="/games"
                className="mp-button border border-white/10 bg-white/4 py-4 text-sm text-white/70 hover:bg-white/[0.07] hover:text-white"
              >
                Back to Arcade
              </Link>
            </div>
          </section>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-white/25">
            {difficulty} Mode · Speed matters
          </p>
        </div>
      </div>
    </main>
  );
}