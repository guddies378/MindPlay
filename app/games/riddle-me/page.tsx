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
      question:
        "What has a head and a tail but no body?",
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
      answers: [
        "footsteps",
        "steps",
        "footprints",
      ],
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
      answers: [
        "hurricane",
        "a hurricane",
        "storm",
      ],
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
      answers: [
        "its lid",
        "the lid",
        "a lid",
      ],
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
      answers: [
        "conversation",
        "a conversation",
      ],
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
  previousQuestion?: string,
) {
  const available = RIDDLES[difficulty];

  let candidates = available;

  if (
    previousQuestion &&
    available.length > 1
  ) {
    candidates = available.filter(
      (riddle) =>
        riddle.question !== previousQuestion,
    );
  }

  return candidates[
    Math.floor(
      Math.random() * candidates.length,
    )
  ];
}

export default function RiddleMePage() {
  const [difficulty, setDifficulty] =
    useState<Difficulty>("normal");

  const [dailyMode, setDailyMode] =
    useState(false);

  const [riddle, setRiddle] =
    useState<Riddle>(() =>
      getRandomRiddle("normal"),
    );

  const [answer, setAnswer] = useState("");

  const [score, setScore] = useState(0);

  const [correct, setCorrect] = useState(0);

  const [wrong, setWrong] = useState(0);

  const [timeLeft, setTimeLeft] =
    useState(DIFFICULTIES.normal.time);

  const [started, setStarted] =
    useState(false);

  const [gameOver, setGameOver] =
    useState(false);

  const [feedback, setFeedback] =
    useState<
      "correct" | "wrong" | null
    >(null);

  const [showHint, setShowHint] =
    useState(false);

  const [xpEarned, setXpEarned] =
    useState<number | null>(null);

  const [
    dailyChallengeCompleted,
    setDailyChallengeCompleted,
  ] = useState(false);

  const dailyChallenge =
    getDailyChallenge();

  /*
   * Daily Challenge is only active when:
   *
   * 1. ?daily=true is present
   * 2. difficulty is valid
   * 3. this is today's selected game
   * 4. URL difficulty matches today's difficulty
   */
  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search,
    );

    const urlDaily =
      params.get("daily") === "true";

    const urlDifficulty =
      params.get("difficulty");

    const validDifficulty =
      urlDifficulty === "easy" ||
      urlDifficulty === "normal" ||
      urlDifficulty === "hard";

    if (
      urlDaily &&
      validDifficulty &&
      dailyChallenge.game === "riddle-me" &&
      urlDifficulty ===
        dailyChallenge.difficulty
    ) {
      const dailyTimer = setTimeout(() => {
        setDailyMode(true);
        setDifficulty(
          dailyChallenge.difficulty,
        );
        setRiddle(
          getRandomRiddle(
            dailyChallenge.difficulty,
          ),
        );
        setTimeLeft(
          DIFFICULTIES[
            dailyChallenge.difficulty
          ].time,
        );
      }, 0);

      return () => clearTimeout(dailyTimer);
    }
  }, [dailyChallenge.game, dailyChallenge.difficulty]);

  const startGame = (
    selectedDifficulty: Difficulty,
  ) => {
    const activeDifficulty =
      dailyMode &&
      dailyChallenge.game === "riddle-me"
        ? dailyChallenge.difficulty
        : selectedDifficulty;

    setDifficulty(activeDifficulty);

    setRiddle(
      getRandomRiddle(activeDifficulty),
    );

    setAnswer("");
    setScore(0);
    setCorrect(0);
    setWrong(0);

    setTimeLeft(
      DIFFICULTIES[activeDifficulty].time,
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
      const timeout =
        window.setTimeout(async () => {
          setGameOver(true);

          const baseXP =
            DIFFICULTIES[difficulty].xp;

          const scoreBonus = Math.min(
            30,
            Math.floor(score / 10),
          );

          const totalXP =
            baseXP + scoreBonus;

          /*
           * Only a genuine Daily Challenge
           * can claim the daily reward.
           */
          const dailyCompleted =
            dailyMode &&
            dailyChallenge.game ===
              "riddle-me"
              ? await completeDailyChallenge(
                  "riddle-me",
                )
              : false;

          setDailyChallengeCompleted(
            dailyCompleted,
          );

          const finalScore =
            score +
            (dailyCompleted
              ? DAILY_CHALLENGE_BONUS_POINTS
              : 0);

          const displayedXP =
            totalXP +
            (dailyCompleted
              ? dailyChallenge.rewardXP
              : 0);

          setScore(finalScore);

          setXpEarned(displayedXP);

          recordGame(
            finalScore,
            totalXP,
          );

          unlockGameAchievement(
            "riddle-solver",
          );
        }, 0);

      return () => {
        window.clearTimeout(timeout);
      };
    }

    const timer = window.setTimeout(() => {
      setTimeLeft(
        (previous) => previous - 1,
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
    dailyMode,
    dailyChallenge.game,
    dailyChallenge.rewardXP,
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

    const isCorrect =
      riddle.answers.some(
        (acceptedAnswer) =>
          normalizeAnswer(
            acceptedAnswer,
          ) === normalizedAnswer,
      );

    if (isCorrect) {
      setScore(
        (previous) => previous + 10,
      );

      setCorrect(
        (previous) => previous + 1,
      );

      setFeedback("correct");
      setShowHint(false);

      const currentQuestion =
        riddle.question;

      window.setTimeout(() => {
        const nextRiddle =
          getRandomRiddle(
            difficulty,
            currentQuestion,
          );

        setRiddle(nextRiddle);
        setAnswer("");
        setFeedback(null);
        setShowHint(false);
      }, 450);

      return;
    }

    setWrong(
      (previous) => previous + 1,
    );

    setFeedback("wrong");
    setAnswer("");

    window.setTimeout(() => {
      setFeedback(null);
    }, 600);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
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

  const difficultyLocked =
    dailyMode ||
    (started && !gameOver);

  return (
    <GameShell
      icon="🧩"
      category="Brain Challenge"
      title="Riddle"
      highlightedTitle="Me"
      description="Think outside the box. Solve as many riddles as you can before time runs out."
      maxWidth="lg"
    >
      <div className="mt-5 space-y-4 sm:mt-8 sm:space-y-6">
        {/* Daily Challenge */}

        <div className="mp-fade-up">
          <GameDailyChallenge
            gameId="riddle-me"
          />
        </div>

        {/* Difficulty */}

        <section className="mp-fade-up">
          <div className="mb-2 flex items-end justify-between px-1 sm:mb-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 sm:text-[10px]">
                Difficulty
              </p>

              <p className="mt-1 text-xs font-semibold text-white/60 sm:text-sm">
                {dailyMode
                  ? "Today&apos;s challenge difficulty."
                  : "Choose your challenge."}
              </p>
            </div>

            <span className="text-[9px] font-medium text-white/45 sm:text-[10px]">
              Base +{DIFFICULTIES[difficulty].xp} XP
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(
              Object.keys(
                DIFFICULTIES,
              ) as Difficulty[]
            ).map((level) => {
              const selected =
                difficulty === level;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    if (difficultyLocked) {
                      return;
                    }

                    setDifficulty(level);

                    setRiddle(
                      getRandomRiddle(level),
                    );

                    setTimeLeft(
                      DIFFICULTIES[level].time,
                    );

                    setAnswer("");
                    setFeedback(null);
                    setShowHint(false);
                  }}
                  disabled={difficultyLocked}
                  className={`group relative overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 sm:rounded-3xl sm:p-4 ${
                    selected
                      ? "border-cyan-300/25 bg-white/7.5 shadow-[0_12px_40px_rgba(34,211,238,0.06)]"
                      : "border-white/8 bg-white/2.5 hover:border-white/15 hover:bg-white/4.5"
                  } ${
                    difficultyLocked
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                >
                  {selected && (
                    <span className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/70 to-transparent" />
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xl transition-transform duration-300 sm:text-2xl ${
                        !difficultyLocked
                          ? "group-hover:scale-110"
                          : ""
                      }`}
                    >
                      {DIFFICULTIES[level].icon}
                    </span>

                    {selected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
                    )}
                  </div>

                  <p
                    className={`mt-2 text-xs font-black sm:text-sm ${
                      selected
                        ? "text-white"
                        : "text-white/55"
                    }`}
                  >
                    {DIFFICULTIES[level].label}
                  </p>

                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-[9px] font-medium text-white/45 sm:text-[10px]">
                      {DIFFICULTIES[level].time}s
                    </span>

                    <span
                      className={`text-[9px] font-bold sm:text-[10px] ${
                        selected
                          ? "text-cyan-300/70"
                          : "text-white/40"
                      }`}
                    >
                      +{DIFFICULTIES[level].xp}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {dailyMode && (
            <div className="mt-2 flex items-center justify-center gap-1 text-[9px] font-bold text-cyan-300/60 sm:text-[10px]">
              🎯 Daily Challenge ·{" "}
              {DIFFICULTIES[difficulty].label} 🔒
            </div>
          )}
        </section>

        {/* Stats */}

        <section className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/8 bg-white/2.5 sm:rounded-3xl">
          <div className="border-r border-white/6 px-3 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45 sm:text-[9px]">
              Score
            </p>

            <p className="mt-1 text-xl font-black tracking-tight text-cyan-300 sm:text-2xl">
              {score}
            </p>
          </div>

          <div className="border-r border-white/6 px-3 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45 sm:text-[9px]">
              Solved
            </p>

            <p className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
              {correct}
            </p>
          </div>

          <div className="px-3 py-3 text-center sm:px-5 sm:py-4">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45 sm:text-[9px]">
              Time
            </p>

            <p
              className={`mt-1 text-xl font-black tracking-tight tabular-nums sm:text-2xl ${
                timerDanger
                  ? "animate-pulse text-fuchsia-300"
                  : "text-white/65"
              }`}
            >
              {started
                ? timeLeft
                : DIFFICULTIES[difficulty].time}
              s
            </p>
          </div>
        </section>

        {/* Timer */}

        {started && !gameOver && (
          <section className="px-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/45">
                Time remaining
              </span>

              <span
                className={`text-[10px] font-black tabular-nums ${
                  timerDanger
                    ? "text-fuchsia-300"
                    : "text-white/65"
                }`}
              >
                {timeLeft}s
              </span>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-white/6">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  timerDanger
                    ? "bg-fuchsia-400"
                    : "bg-cyan-300"
                }`}
                style={{
                  width: `${Math.max(
                    0,
                    timerPercentage,
                  )}%`,
                }}
              />
            </div>
          </section>
        )}

        {/* Main Game Card */}

        <section
          className={`relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:rounded-4xl ${
            feedback === "correct"
              ? "mp-riddle-correct"
              : feedback === "wrong"
                ? "mp-riddle-wrong"
                : ""
          }`}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />

          {/* Decorative light */}

          <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-48 w-48 rounded-full bg-cyan-300/2.5 blur-3xl" />

          <div className="pointer-events-none absolute bottom-[-15%] right-[-10%] h-56 w-56 rounded-full bg-fuchsia-400/2.5 blur-3xl" />

          {/* Start */}

          {!started && !gameOver && (
            <div className="relative px-5 py-10 text-center sm:px-10 sm:py-16">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/15 bg-cyan-300/6 text-3xl shadow-[0_15px_50px_rgba(34,211,238,0.06)] sm:h-20 sm:w-20 sm:text-4xl">
                🧩
              </div>

              <p className="mt-6 text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300/55">
                {DIFFICULTIES[difficulty].label} Mode
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
                Think differently.
              </h2>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/55 sm:text-sm">
                Read carefully, spot the trick,
                and solve as many riddles as you
                can before time runs out.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <div className="rounded-full border border-white/7 bg-white/2.5 px-3.5 py-2 text-[10px] font-bold text-white/60">
                  {DIFFICULTIES[difficulty].time}s
                  timer
                </div>

                <div className="rounded-full border border-white/7 bg-white/2.5 px-3.5 py-2 text-[10px] font-bold text-white/60">
                  +{DIFFICULTIES[difficulty].xp}{" "}
                  base XP
                </div>

                <div className="rounded-full border border-white/7 bg-white/2.5 px-3.5 py-2 text-[10px] font-bold text-white/60">
                  +10 per solve
                </div>
              </div>

              {dailyMode && (
                <div className="mx-auto mt-5 w-fit rounded-full border border-purple-300/10 bg-purple-300/5 px-3.5 py-2 text-[10px] font-bold text-purple-200/60">
                  🎯 Today&apos;s Daily Challenge ·{" "}
                  {DIFFICULTIES[difficulty].label} 🔒
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  startGame(difficulty)
                }
                className="mp-button mt-7 rounded-full bg-white px-7 py-3 text-xs font-black text-black shadow-[0_12px_40px_rgba(255,255,255,0.08)] transition-all hover:bg-cyan-100 hover:shadow-[0_15px_45px_rgba(34,211,238,0.12)] sm:px-8 sm:py-3.5 sm:text-sm"
              >
                {dailyMode
                  ? "Start Daily Challenge"
                  : "Start challenge"}

                <span className="ml-2">
                  →
                </span>
              </button>
            </div>
          )}

          {/* Active Game */}

          {started && !gameOver && (
            <div className="relative px-4 py-6 sm:px-8 sm:py-9">
              <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/45">
                    Current riddle
                  </p>

                  <p className="mt-1 text-xs font-bold text-white/55 sm:text-sm">
                    Challenge #{correct + 1}
                  </p>
                </div>

                <div className="rounded-full border border-white/8 bg-white/2.5 px-3 py-1.5 text-[9px] font-black text-white/55 sm:text-[10px]">
                  +10 points
                </div>
              </div>

              {/* Riddle */}

              <div
                className={`relative flex min-h-[clamp(12rem,40dvh,20rem)] items-center justify-center overflow-hidden rounded-3xl border px-5 py-10 text-center transition-all duration-300 sm:min-h-[clamp(14rem,45dvh,24rem)] sm:rounded-[1.75rem] sm:px-10 ${
                  feedback === "correct"
                    ? "border-cyan-300/30 bg-cyan-300/4.5 shadow-[0_0_60px_rgba(34,211,238,0.06)]"
                    : feedback === "wrong"
                      ? "border-fuchsia-300/30 bg-fuchsia-300/4 shadow-[0_0_60px_rgba(217,70,239,0.05)]"
                      : "border-white/8 bg-black/10"
                }`}
              >
                <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-cyan-300/2.5 blur-3xl" />

                <div className="relative max-w-2xl">
                  <span className="mb-5 block text-2xl opacity-25 sm:text-3xl">
                    “
                  </span>

                  <p className="text-xl font-black leading-8 tracking-tight text-white sm:text-3xl sm:leading-10">
                    {riddle.question}
                  </p>

                  <span className="mt-5 block rotate-180 text-2xl opacity-25 sm:text-3xl">
                    “
                  </span>
                </div>

                {feedback === "correct" && (
                  <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/6 text-sm font-black text-cyan-300">
                    ✓
                  </div>
                )}

                {feedback === "wrong" && (
                  <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-fuchsia-300/20 bg-fuchsia-300/6 text-sm font-black text-fuchsia-300">
                    ×
                  </div>
                )}
              </div>

              {/* Feedback */}

              <div className="flex h-8 items-center justify-center pt-3">
                {feedback === "correct" && (
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
                    Correct · Nice thinking
                  </p>
                )}

                {feedback === "wrong" && (
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-300">
                    Not quite · Keep thinking
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
                    className="mx-auto flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold text-white/50 transition-all hover:bg-white/3 hover:text-cyan-200"
                  >
                    <span>💡</span>
                    Need a hint?
                  </button>
                ) : (
                  <div className="mx-auto max-w-xl rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.035] px-4 py-3 text-center text-xs leading-5 text-cyan-100/55">
                    <span className="mr-1">
                      💡
                    </span>
                    {riddle.hint}
                  </div>
                )}
              </div>

              {/* Answer */}

              <div className="mx-auto mt-5 flex w-full max-w-xl flex-col gap-2.5 sm:mt-6 sm:flex-row">
                <input
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus
                  value={answer}
                  onChange={(event) =>
                    setAnswer(
                      event.target.value,
                    )
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer..."
                  disabled={feedback !== null}
                  className={`h-14 min-h-14 min-w-0 flex-1 rounded-2xl border bg-black/15 px-4 text-center text-base font-black text-white outline-none transition-all placeholder:text-white/40 focus:bg-white/2.5 sm:h-15 sm:min-h-15 sm:px-5 sm:text-lg ${
                    feedback === "correct"
                      ? "border-cyan-300/35 shadow-[0_0_35px_rgba(34,211,238,0.06)]"
                      : feedback === "wrong"
                        ? "border-fuchsia-300/35 shadow-[0_0_35px_rgba(217,70,239,0.06)]"
                        : "border-white/9 focus:border-cyan-300/30"
                  }`}
                />

                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={
                    feedback !== null ||
                    answer.trim() === ""
                  }
                  className="mp-button h-14 rounded-2xl bg-white px-7 text-xs font-black text-black transition-all hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-35 sm:h-15"
                >
                  Check
                </button>
              </div>

              <p className="mt-3 text-center text-[9px] text-white/40 sm:text-[10px]">
                Press{" "}
                <span className="font-bold text-white/60">
                  Enter
                </span>{" "}
                to submit
              </p>
            </div>
          )}

          {/* Game Over */}

          {gameOver && (
            <div className="relative px-5 py-10 text-center sm:px-10 sm:py-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-300/15 bg-cyan-300/6 text-3xl shadow-[0_15px_50px_rgba(34,211,238,0.06)] sm:h-20 sm:w-20 sm:text-4xl">
                🧠
              </div>

              <p className="mt-6 text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300/55">
                {dailyMode
                  ? "Daily Challenge complete"
                  : "Challenge complete"}
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Time&apos;s up.
              </h2>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/55 sm:text-sm">
                You solved{" "}
                <span className="font-black text-white/75">
                  {correct}
                </span>{" "}
                riddles and earned{" "}
                <span className="font-black text-cyan-300">
                  {score}
                </span>{" "}
                points.
              </p>

              {/* Results */}

              <div className="mx-auto mt-7 grid max-w-lg grid-cols-3 overflow-hidden rounded-2xl border border-white/8 bg-white/2.5 sm:mt-9 sm:rounded-3xl">
                <div className="border-r border-white/6 px-3 py-4 sm:px-5 sm:py-5">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45 sm:text-[9px]">
                    Score
                  </p>

                  <p className="mt-1 text-xl font-black text-cyan-300 sm:text-2xl">
                    {score}
                  </p>
                </div>

                <div className="border-r border-white/6 px-3 py-4 sm:px-5 sm:py-5">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45 sm:text-[9px]">
                    Solved
                  </p>

                  <p className="mt-1 text-xl font-black sm:text-2xl">
                    {correct}
                  </p>
                </div>

                <div className="px-3 py-4 sm:px-5 sm:py-5">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45 sm:text-[9px]">
                    Wrong
                  </p>

                  <p className="mt-1 text-xl font-black text-white/65 sm:text-2xl">
                    {wrong}
                  </p>
                </div>
              </div>

              {/* XP */}

              <div className="mx-auto mt-3 max-w-lg rounded-2xl border border-cyan-300/12 bg-cyan-300/[0.035] px-5 py-4 sm:mt-4 sm:rounded-3xl sm:px-6 sm:py-5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300/50">
                  XP earned
                </p>

                <p className="mt-1 text-3xl font-black tracking-tight text-cyan-300 sm:text-4xl">
                  +{xpEarned ?? 0}
                </p>

                <p className="mt-1 text-[10px] text-white/45 sm:text-xs">
                  Added to your MindPlay progress
                </p>
              </div>

              {/* Daily Challenge Result */}

              {dailyChallengeCompleted && (
                <div className="mx-auto mt-3 max-w-lg rounded-2xl border border-purple-300/12 bg-purple-300/[0.035] px-4 py-4 sm:mt-4 sm:rounded-3xl">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-purple-300/70">
                    Daily Challenge
                  </p>

                  <p className="mt-1 text-sm font-black text-white/75">
                    +{dailyChallenge.rewardXP} XP ·
                    +{DAILY_CHALLENGE_BONUS_POINTS}{" "}
                    Score
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-white/45 sm:text-xs">
                    Today&apos;s challenge reward has
                    been added.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  startGame(difficulty)
                }
                className="mp-button mt-7 rounded-full bg-white px-7 py-3 text-xs font-black text-black shadow-[0_12px_40px_rgba(255,255,255,0.08)] transition-all hover:bg-cyan-100 sm:mt-9 sm:px-8 sm:py-3.5 sm:text-sm"
              >
                {dailyMode
                  ? "Play Daily Again"
                  : "Play again"}

                <span className="ml-2">
                  →
                </span>
              </button>
            </div>
          )}
        </section>

        {/* Tip */}

        <section className="mp-fade-up rounded-2xl border border-white/6 bg-white/[0.018] px-4 py-3.5 sm:rounded-3xl sm:px-5 sm:py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-sm">
              💡
            </span>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/50">
                Riddle tip
              </p>

              <p className="mt-1 text-[10px] leading-4 text-white/55 sm:text-xs sm:leading-5">
                Don&apos;t take every word literally.
                Riddles often use unexpected
                meanings, wordplay, or everyday
                objects in unusual ways.
              </p>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .mp-riddle-correct {
          animation: riddleCorrect 0.45s ease-out;
        }

        .mp-riddle-wrong {
          animation: riddleWrong 0.45s ease-out;
        }

        @keyframes riddleCorrect {
          0% {
            transform: scale(1);
          }

          45% {
            transform: scale(1.006);
          }

          100% {
            transform: scale(1);
          }
        }

        @keyframes riddleWrong {
          0%,
          100% {
            transform: translateX(0);
          }

          20% {
            transform: translateX(-4px);
          }

          40% {
            transform: translateX(4px);
          }

          60% {
            transform: translateX(-3px);
          }

          80% {
            transform: translateX(3px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mp-riddle-correct,
          .mp-riddle-wrong {
            animation: none;
          }
        }
      `}</style>
    </GameShell>
  );
}