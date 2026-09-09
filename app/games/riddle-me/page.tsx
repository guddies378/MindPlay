"use client";

import { useEffect, useState } from "react";

import GameDailyChallenge from "@/components/GameDailyChallenge";
import GameShell from "@/components/GameShell";

import {
  recordGame,
  unlockGameAchievement,
} from "@/lib/progress";

import {
  completeDailyChallenge,
  DAILY_CHALLENGE_BONUS_POINTS,
  getDailyChallenge,
} from "@/lib/dailyChallenge";

type Difficulty = "easy" | "normal" | "hard";

type Riddle = {
  question: string;
  answers: string[];
  hint: string;
};

const RIDDLES: Record<Difficulty, Riddle[]> = {
  easy: [
    {
      question: "What has hands but cannot clap?",
      answers: ["clock"],
      hint: "You might find one on a wall.",
    },
    {
      question:
        "What has a face and two hands but no arms or legs?",
      answers: ["clock"],
      hint: "It tells you something important.",
    },
    {
      question: "What gets wetter the more it dries?",
      answers: ["towel"],
      hint: "You might use it after a shower.",
    },
    {
      question: "What has many teeth but cannot bite?",
      answers: ["comb"],
      hint: "You use it on your hair.",
    },
    {
      question: "What has one eye but cannot see?",
      answers: ["needle"],
      hint: "It can be used with thread.",
    },
    {
      question:
        "What can travel around the world while staying in one corner?",
      answers: ["stamp"],
      hint: "You might put it on an envelope.",
    },
    {
      question: "What has legs but cannot walk?",
      answers: ["table"],
      hint: "You might eat dinner on one.",
    },
    {
      question: "What has a neck but no head?",
      answers: ["bottle"],
      hint: "You might drink from one.",
    },
    {
      question: "What has ears but cannot hear?",
      answers: ["corn", "a corn"],
      hint: "You might eat it.",
    },
    {
      question:
        "What has a thumb and four fingers but is not alive?",
      answers: ["glove", "a glove"],
      hint: "You wear it on your hand.",
    },
    {
      question: "What has a tail but no body?",
      answers: ["coin", "a coin"],
      hint: "You might find it in your pocket.",
    },
    {
      question: "What has a head and a tail but no body?",
      answers: ["coin", "a coin"],
      hint: "It can be used to make a choice.",
    },
    {
      question: "What has a ring but no finger?",
      answers: ["phone", "telephone", "a phone"],
      hint: "You might hear it ringing.",
    },
    {
      question:
        "What has four legs and a seat but cannot sit?",
      answers: ["chair", "a chair"],
      hint: "You can sit on it.",
    },
    {
      question: "What can you catch but cannot throw?",
      answers: ["cold", "a cold"],
      hint: "You might get one when you're sick.",
    },
    {
      question: "What goes up but never comes down?",
      answers: ["age", "your age"],
      hint: "It increases every birthday.",
    },
    {
      question: "What has a bark but no bite?",
      answers: ["tree", "a tree"],
      hint: "You might find it in a forest.",
    },
    {
      question: "What has pages but is not a newspaper?",
      answers: ["book", "a book"],
      hint: "You can read it.",
    },
    {
      question: "What has a bed but never sleeps?",
      answers: ["river", "a river"],
      hint: "It flows through nature.",
    },
    {
      question: "What has a mouth but cannot eat?",
      answers: ["river", "a river"],
      hint: "It may flow toward the sea.",
    },
  ],

  normal: [
    {
      question:
        "The more you take, the more you leave behind. What are they?",
      answers: ["footsteps", "steps", "footprints"],
      hint: "Think about walking.",
    },
    {
      question:
        "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
      answers: ["echo"],
      hint: "You might hear me in a cave.",
    },
    {
      question:
        "What disappears as soon as you say its name?",
      answers: ["silence", "quiet"],
      hint: "Try not saying anything.",
    },
    {
      question:
        "I have cities but no houses, forests but no trees, and water but no fish. What am I?",
      answers: ["map", "a map"],
      hint: "You might use me to find your way.",
    },
    {
      question:
        "What belongs to you, but other people use it more than you do?",
      answers: ["name", "your name"],
      hint: "People use it when they talk to you.",
    },
    {
      question:
        "What can you catch but never throw?",
      answers: ["cold", "a cold"],
      hint: "You might get one when you're sick.",
    },
    {
      question:
        "What has words but never speaks?",
      answers: ["book", "a book"],
      hint: "You can read it.",
    },
    {
      question:
        "What has keys but cannot open locks?",
      answers: [
        "piano",
        "keyboard",
        "a piano",
        "a keyboard",
      ],
      hint: "You can play or type on it.",
    },
    {
      question:
        "What can run but never walks, has a mouth but never talks?",
      answers: ["river", "a river"],
      hint: "It moves through nature.",
    },
    {
      question:
        "What has an eye but cannot see, and is often found in a storm?",
      answers: ["hurricane", "a hurricane", "storm"],
      hint: "Look at the center of a powerful storm.",
    },
    {
      question:
        "What gets bigger the more you take away from it?",
      answers: ["hole", "a hole"],
      hint: "Digging can make one larger.",
    },
    {
      question:
        "What has many keys but cannot open a single lock?",
      answers: ["piano", "keyboard"],
      hint: "One makes music, the other helps you type.",
    },
    {
      question:
        "What can fill a room but takes up no space?",
      answers: ["light", "sunlight"],
      hint: "Turn on a lamp.",
    },
    {
      question:
        "What has a head, a tail, is brown, and has no legs?",
      answers: ["penny", "coin", "a penny"],
      hint: "You might find it in your wallet.",
    },
    {
      question:
        "What is full of holes but still holds water?",
      answers: ["sponge", "a sponge"],
      hint: "You might use it to clean dishes.",
    },
    {
      question:
        "What can be cracked, made, told, and played?",
      answers: ["joke", "a joke"],
      hint: "It can make people laugh.",
    },
    {
      question:
        "What has a neck but no head, two arms but no hands?",
      answers: ["shirt", "a shirt"],
      hint: "You wear it.",
    },
    {
      question:
        "What has no life but can die?",
      answers: ["battery", "a battery"],
      hint: "It powers your devices.",
    },
    {
      question:
        "What goes through cities and fields but never moves?",
      answers: ["road", "a road"],
      hint: "Cars travel on it.",
    },
    {
      question:
        "What has a bottom at the top?",
      answers: ["leg", "a leg"],
      hint: "Think about furniture.",
    },
  ],

  hard: [
    {
      question:
        "I am always in front of you but can never be seen. What am I?",
      answers: ["future", "the future"],
      hint: "It hasn't happened yet.",
    },
    {
      question:
        "What is something that you can never put in a saucepan?",
      answers: ["its lid", "the lid", "a lid"],
      hint: "Think about the object itself.",
    },
    {
      question:
        "I have branches, but no fruit, trunk, or leaves. What am I?",
      answers: ["bank", "a bank"],
      hint: "It can involve money.",
    },
    {
      question:
        "The person who makes it sells it. The person who buys it never uses it. The person who uses it never knows they're using it. What is it?",
      answers: [
        "coffin",
        "a coffin",
        "casket",
        "a casket",
      ],
      hint: "Think about something associated with death.",
    },
    {
      question:
        "What five-letter word becomes shorter when you add two letters to it?",
      answers: ["short"],
      hint: "The answer describes its own meaning.",
    },
    {
      question:
        "What can run but never walks, has a mouth but never talks, has a head but never weeps, and has a bed but never sleeps?",
      answers: ["river", "a river"],
      hint: "It moves through nature.",
    },
    {
      question:
        "I am taken from a mine and shut inside a wooden case, from which I am never released. What am I?",
      answers: [
        "pencil lead",
        "lead",
        "graphite",
      ],
      hint: "You use me to write.",
    },
    {
      question:
        "What is so fragile that saying its name breaks it?",
      answers: ["silence"],
      hint: "The answer is the absence of sound.",
    },
    {
      question:
        "The more there is, the less you see. What is it?",
      answers: ["darkness", "dark"],
      hint: "It happens when the lights go out.",
    },
    {
      question:
        "What can travel through glass without breaking it?",
      answers: ["light", "sunlight"],
      hint: "You see it through windows.",
    },
    {
      question:
        "I have no beginning, no end, and no middle. What am I?",
      answers: ["circle", "a circle"],
      hint: "Think about a shape.",
    },
    {
      question:
        "What word is pronounced wrong even when you say it correctly?",
      answers: ["wrong"],
      hint: "The answer is hidden in the question.",
    },
    {
      question:
        "What comes once in a minute, twice in a moment, but never in a thousand years?",
      answers: ["letter m", "m"],
      hint: "Look at the spelling of the words.",
    },
    {
      question:
        "What has 13 hearts but no other organs?",
      answers: [
        "deck of cards",
        "a deck of cards",
        "cards",
      ],
      hint: "You might use it to play games.",
    },
    {
      question:
        "What can you hold without ever touching it?",
      answers: ["conversation", "a conversation"],
      hint: "You can have one with another person.",
    },
    {
      question:
        "What is always coming but never arrives?",
      answers: ["tomorrow"],
      hint: "It becomes today when it arrives.",
    },
    {
      question:
        "What has many rings but no fingers?",
      answers: ["tree", "a tree"],
      hint: "You can use them to estimate its age.",
    },
    {
      question:
        "What gets sharper the more you use it?",
      answers: ["brain", "mind"],
      hint: "Thinking exercises can improve it.",
    },
    {
      question:
        "What can be seen once in a year, twice in a week, but never in a day?",
      answers: ["letter e", "e"],
      hint: "Look carefully at the spelling.",
    },
    {
      question:
        "I have keys but no locks, space but no room, and you can enter but cannot go inside. What am I?",
      answers: ["keyboard", "a keyboard"],
      hint: "You probably used one today.",
    },
  ],
};

const DIFFICULTIES = {
  easy: {
    label: "Easy",
    xp: 20,
    time: 30,
    icon: "🌱",
  },
  normal: {
    label: "Normal",
    xp: 35,
    time: 45,
    icon: "⚡",
  },
  hard: {
    label: "Hard",
    xp: 50,
    time: 60,
    icon: "🔥",
  },
};

function normalizeAnswer(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[.,!?'"’]/g, "")
    .replace(/\s+/g, " ");
}

function getRandomRiddle(
  difficulty: Difficulty,
  previousQuestion?: string
) {
  const available = RIDDLES[difficulty];

  let candidates = available;

  if (previousQuestion && available.length > 1) {
    candidates = available.filter(
      (riddle) =>
        riddle.question !== previousQuestion
    );
  }

  return candidates[
    Math.floor(Math.random() * candidates.length)
  ];
}

export default function RiddleMePage() {
  const [difficulty, setDifficulty] =
    useState<Difficulty>("normal");

  const [riddle, setRiddle] = useState<Riddle>(() =>
    getRandomRiddle("normal")
  );

  const [answer, setAnswer] = useState("");

  const [score, setScore] = useState(0);

  const [correct, setCorrect] = useState(0);

  const [wrong, setWrong] = useState(0);

  const [timeLeft, setTimeLeft] = useState(
    DIFFICULTIES.normal.time
  );

  const [started, setStarted] = useState(false);

  const [gameOver, setGameOver] = useState(false);

  const [feedback, setFeedback] = useState<
    "correct" | "wrong" | null
  >(null);

  const [showHint, setShowHint] = useState(false);

  const [xpEarned, setXpEarned] =
    useState<number | null>(null);

  const [
    dailyChallengeCompleted,
    setDailyChallengeCompleted,
  ] = useState(false);

  const dailyChallenge = getDailyChallenge();

  const isDailyChallenge =
    dailyChallenge.game === "riddle-me";

  const startGame = (
    selectedDifficulty: Difficulty
  ) => {
    setDifficulty(selectedDifficulty);

    setRiddle(
      getRandomRiddle(selectedDifficulty)
    );

    setAnswer("");
    setScore(0);
    setCorrect(0);
    setWrong(0);

    setTimeLeft(
      DIFFICULTIES[selectedDifficulty].time
    );

    setStarted(true);
    setGameOver(false);
    setFeedback(null);
    setShowHint(false);
    setXpEarned(null);
    setDailyChallengeCompleted(false);
  };

  useEffect(() => {
    if (!started || gameOver) {
      return;
    }

    if (timeLeft <= 0) {
      setGameOver(true);

      const baseXP =
        DIFFICULTIES[difficulty].xp;

      const scoreBonus = Math.min(
        30,
        Math.floor(score / 10)
      );

      const totalXP =
        baseXP + scoreBonus;

      /*
       * Daily Challenge
       *
       * completeDailyChallenge() handles:
       * +50 XP
       * once-per-day protection
       */
      const dailyCompleted =
        completeDailyChallenge("riddle-me");

      setDailyChallengeCompleted(
        dailyCompleted
      );

      /*
       * Daily Challenge gives +10 score.
       */
      const finalScore =
        score +
        (dailyCompleted
          ? DAILY_CHALLENGE_BONUS_POINTS
          : 0);

      /*
       * completeDailyChallenge()
       * already adds the +50 XP.
       *
       * recordGame() therefore receives
       * only the normal game XP.
       */
      const displayedXP =
        totalXP +
        (dailyCompleted ? 50 : 0);

      setScore(finalScore);

      setXpEarned(displayedXP);

      recordGame(
        finalScore,
        totalXP
      );

      unlockGameAchievement(
        "riddle-solver"
      );

      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft(
        (previous) => previous - 1
      );
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    started,
    gameOver,
    timeLeft,
    difficulty,
    score,
  ]);

  const submitAnswer = () => {
    if (
      !started ||
      gameOver ||
      answer.trim() === ""
    ) {
      return;
    }

    const normalizedAnswer =
      normalizeAnswer(answer);

    const isCorrect = riddle.answers.some(
      (acceptedAnswer) =>
        normalizeAnswer(acceptedAnswer) ===
        normalizedAnswer
    );

    if (isCorrect) {
      setScore(
        (previous) => previous + 10
      );

      setCorrect(
        (previous) => previous + 1
      );

      setFeedback("correct");
      setShowHint(false);

      const currentQuestion =
        riddle.question;

      window.setTimeout(() => {
        const nextRiddle =
          getRandomRiddle(
            difficulty,
            currentQuestion
          );

        setRiddle(nextRiddle);
        setAnswer("");
        setFeedback(null);
        setShowHint(false);
      }, 450);

      return;
    }

    setWrong(
      (previous) => previous + 1
    );

    setFeedback("wrong");
    setAnswer("");

    window.setTimeout(() => {
      setFeedback(null);
    }, 600);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      submitAnswer();
    }
  };

  const timerPercentage =
    (timeLeft /
      DIFFICULTIES[difficulty].time) *
    100;

  const timerDanger =
    timeLeft <= 5 && started;

  /*
   * Prevent changing difficulty while
   * a game is currently running.
   */
  const difficultyLocked =
    started && !gameOver;

  return (
    <GameShell
      icon="🧩"
      category="Brain Challenge"
      title="Riddle"
      highlightedTitle="Me"
      description="Think outside the box. Solve as many riddles as you can before time runs out."
      maxWidth="lg"
    >
      {/* Daily Challenge */}

      <GameDailyChallenge
        gameId="riddle-me"
      />

      {/* Difficulty */}

      <div className="mx-auto mt-8 max-w-2xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
            Difficulty
          </p>

          <p className="text-xs text-white/30">
            Base XP{" "}
            <span className="font-bold text-cyan-300">
              +{DIFFICULTIES[difficulty].xp}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {(
            Object.keys(
              DIFFICULTIES
            ) as Difficulty[]
          ).map((level) => {
            const active =
              difficulty === level;

            return (
              <button
                key={level}
                type="button"
                onClick={() =>
                  setDifficulty(level)
                }
                disabled={difficultyLocked}
                className={[
                  "group rounded-2xl border p-3 text-left transition-all duration-200 sm:p-4",
                  active
                    ? "border-cyan-300/30 bg-cyan-300/8 shadow-[0_0_30px_rgba(103,232,249,0.05)]"
                    : "border-white/10 bg-white/[0.035] hover:-translate-y-0.5 hover:bg-white/6",
                  difficultyLocked
                    ? "cursor-not-allowed opacity-50"
                    : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">
                    {DIFFICULTIES[level].icon}
                  </span>

                  {active && (
                    <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                  )}
                </div>

                <p
                  className={[
                    "mt-2 text-sm font-black",
                    active
                      ? "text-cyan-200"
                      : "text-white/70",
                  ].join(" ")}
                >
                  {DIFFICULTIES[level].label}
                </p>

                <p className="mt-1 text-xs text-white/30">
                  {DIFFICULTIES[level].time}s
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}

      <div className="mx-auto mt-5 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
        <div className="mp-card rounded-2xl p-3 text-center sm:p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 sm:text-xs">
            Score
          </p>

          <p className="mt-1 text-xl font-black text-cyan-300 sm:text-2xl">
            {score}
          </p>
        </div>

        <div className="mp-card rounded-2xl p-3 text-center sm:p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 sm:text-xs">
            Solved
          </p>

          <p className="mt-1 text-xl font-black text-emerald-300 sm:text-2xl">
            {correct}
          </p>
        </div>

        <div className="mp-card rounded-2xl p-3 text-center sm:p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 sm:text-xs">
            Time
          </p>

          <p
            className={[
              "mt-1 text-xl font-black transition-colors sm:text-2xl",
              timerDanger
                ? "animate-pulse text-red-300"
                : "text-white",
            ].join(" ")}
          >
            {started
              ? timeLeft
              : DIFFICULTIES[difficulty].time}
            s
          </p>
        </div>
      </div>

      {/* Timer */}

      {started && !gameOver && (
        <div className="mx-auto mt-4 max-w-2xl">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className={[
                "h-full rounded-full transition-all duration-1000",
                timerDanger
                  ? "bg-red-400"
                  : "bg-linear-to-r from-cyan-400 via-purple-400 to-fuchsia-400",
              ].join(" ")}
              style={{
                width: `${Math.max(
                  0,
                  timerPercentage
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Game Card */}

      <div className="mp-card mp-fade-up mx-auto mt-6 max-w-2xl rounded-4xl p-5 shadow-2xl sm:mt-8 sm:p-8">
        {/* Start */}

        {!started && !gameOver && (
          <div className="py-8 text-center sm:py-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/4 text-5xl">
              🧠
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-cyan-300/50">
              {DIFFICULTIES[difficulty].label} Mode
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Ready to get tricky?
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
              Solve as many riddles as possible
              before the clock hits zero.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/40">
                {DIFFICULTIES[difficulty].time}s timer
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/40">
                +{DIFFICULTIES[difficulty].xp} base XP
              </div>
            </div>

            {isDailyChallenge && (
              <div className="mx-auto mt-4 w-fit rounded-xl border border-purple-300/10 bg-purple-300/5 px-3 py-2 text-xs font-bold text-purple-200/60">
                🎯 Today&apos;s Daily Challenge
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                startGame(difficulty)
              }
              className="mp-button mt-7 rounded-2xl bg-white px-7 py-3.5 text-sm font-black text-[#080b14] shadow-lg hover:bg-cyan-100"
            >
              Start Game
              <span className="ml-2">→</span>
            </button>
          </div>
        )}

        {/* Active Game */}

        {started && !gameOver && (
          <div className="text-center">
            <div className="mb-5 flex items-center justify-between">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
                  Current Challenge
                </p>

                <p className="mt-1 text-sm font-bold text-white/60">
                  Riddle #{correct + 1}
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-bold text-white/40">
                +10 points
              </div>
            </div>

            {/* Question */}

            <div
              className={[
                "relative flex min-h-56 items-center justify-center overflow-hidden rounded-3xl border px-6 py-10 transition-all duration-200 sm:min-h-64 sm:px-10",
                feedback === "correct"
                  ? "border-emerald-300/30 bg-emerald-300/8 shadow-[0_0_50px_rgba(52,211,153,0.08)]"
                  : feedback === "wrong"
                    ? "border-red-300/30 bg-red-300/8 shadow-[0_0_50px_rgba(248,113,113,0.08)]"
                    : "border-white/10 bg-black/10",
              ].join(" ")}
            >
              <div className="pointer-events-none absolute left-0 top-0 h-24 w-24 rounded-full bg-cyan-300/4 blur-2xl" />

              <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 rounded-full bg-purple-300/4 blur-2xl" />

              {feedback === "correct" && (
                <div className="absolute right-5 top-5 text-xl">
                  ✓
                </div>
              )}

              {feedback === "wrong" && (
                <div className="absolute right-5 top-5 text-xl">
                  ✕
                </div>
              )}

              <p className="relative text-lg font-bold leading-8 text-white sm:text-2xl sm:leading-9">
                {riddle.question}
              </p>
            </div>

            {/* Feedback */}

            <div className="h-8 pt-3">
              {feedback === "correct" && (
                <p className="text-sm font-black text-emerald-300">
                  ✨ Correct! Nice one.
                </p>
              )}

              {feedback === "wrong" && (
                <p className="text-sm font-black text-red-300">
                  Not quite. Try the next one!
                </p>
              )}
            </div>

            {/* Hint */}

            <div className="mt-2">
              {!showHint ? (
                <button
                  type="button"
                  onClick={() =>
                    setShowHint(true)
                  }
                  className="rounded-full px-4 py-2 text-xs font-bold text-white/35 transition hover:bg-white/4 hover:text-cyan-200"
                >
                  💡 Need a hint?
                </button>
              ) : (
                <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/4 px-4 py-3 text-sm text-cyan-100/60">
                  <span className="mr-1">
                    💡
                  </span>

                  {riddle.hint}
                </div>
              )}
            </div>

            {/* Answer */}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                autoFocus
                value={answer}
                onChange={(event) =>
                  setAnswer(
                    event.target.value
                  )
                }
                onKeyDown={handleKeyDown}
                placeholder="Type your answer..."
                disabled={
                  feedback !== null
                }
                className={[
                  "min-w-0 flex-1 rounded-2xl border bg-white/[0.035] px-5 py-4 text-center text-base font-bold text-white outline-none transition placeholder:text-white/20 focus:border-cyan-300/30 focus:bg-white/5 sm:text-lg",
                  feedback === "correct"
                    ? "border-emerald-300/30"
                    : feedback === "wrong"
                      ? "border-red-300/30"
                      : "border-white/10",
                ].join(" ")}
              />

              <button
                type="button"
                onClick={submitAnswer}
                disabled={
                  feedback !== null ||
                  answer.trim() === ""
                }
                className="mp-button rounded-2xl bg-white px-7 py-4 text-sm font-black text-[#080b14] hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Check
              </button>
            </div>

            <p className="mt-4 text-[11px] text-white/25">
              Press{" "}
              <span className="font-bold text-white/45">
                Enter
              </span>{" "}
              to submit
            </p>
          </div>
        )}

        {/* Game Over */}

        {gameOver && (
          <div className="py-5 text-center sm:py-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-yellow-300/10 bg-yellow-300/5 text-5xl">
              🏆
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300/60">
              Challenge Complete
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Time&apos;s up!
            </h2>

            <p className="mt-2 text-sm text-white/40">
              You solved{" "}
              <span className="font-black text-white">
                {correct}
              </span>{" "}
              riddles.
            </p>

            {/* Result stats */}

            <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/25">
                  Score
                </p>

                <p className="mt-1 text-2xl font-black text-cyan-300">
                  {score}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/25">
                  Solved
                </p>

                <p className="mt-1 text-2xl font-black text-emerald-300">
                  {correct}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/25">
                  Wrong
                </p>

                <p className="mt-1 text-2xl font-black text-red-300">
                  {wrong}
                </p>
              </div>
            </div>

            {/* XP */}

            <div className="mt-4 overflow-hidden rounded-2xl border border-cyan-300/15 bg-cyan-300/4 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-cyan-300/50">
                XP Earned
              </p>

              <p className="mt-1 text-3xl font-black text-cyan-300">
                +{xpEarned ?? 0} XP
              </p>

              <p className="mt-1 text-xs text-white/30">
                Added to your MindPlay progress
              </p>
            </div>

            {/* Daily Challenge Result */}

            {dailyChallengeCompleted && (
              <div className="mt-4 rounded-2xl border border-purple-300/15 bg-purple-300/4 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-purple-300/70">
                  Daily Challenge
                </p>

                <p className="mt-1 text-sm font-black text-white/80">
                  +50 XP · +10 Score
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Today&apos;s challenge reward has been added.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                startGame(difficulty)
              }
              className="mp-button mt-6 rounded-2xl bg-white px-7 py-3.5 text-sm font-black text-[#080b14] hover:bg-cyan-100"
            >
              Play Again

              <span className="ml-2">
                →
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Tip */}

      <div className="mp-card mx-auto mt-6 max-w-2xl rounded-2xl p-5">
        <div className="flex gap-3">
          <span className="text-xl">
            💡
          </span>

          <div>
            <p className="text-sm font-black text-white/80">
              Riddle tip
            </p>

            <p className="mt-1 text-sm leading-6 text-white/35">
              Don&apos;t take every word literally.
              Riddles often use unexpected
              meanings, wordplay, or everyday
              objects in unusual ways.
            </p>
          </div>
        </div>
      </div>
    </GameShell>
  );
}