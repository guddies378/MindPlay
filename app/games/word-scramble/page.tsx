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

type WordItem = {
  word: string;
  hint: string;
};

const WORDS: Record<Difficulty, WordItem[]> = {
  easy: [
    { word: "APPLE", hint: "A common fruit" },
    { word: "HOUSE", hint: "A place where people live" },
    { word: "WATER", hint: "You drink it" },
    { word: "MUSIC", hint: "You listen to it" },
    { word: "CLOUD", hint: "You see it in the sky" },
    { word: "PIZZA", hint: "A popular food" },
    { word: "PLANT", hint: "It grows from the ground" },
    { word: "TRAIN", hint: "A vehicle that runs on tracks" },
    { word: "BEACH", hint: "A sandy place near the ocean" },
    { word: "PHONE", hint: "You use it to call people" },
  ],

  normal: [
    { word: "PLANET", hint: "Earth is one" },
    { word: "JUNGLE", hint: "A dense tropical forest" },
    { word: "ROCKET", hint: "It travels into space" },
    { word: "PUZZLE", hint: "Something you solve" },
    { word: "CASTLE", hint: "A large fortified building" },
    { word: "GUITAR", hint: "A musical instrument" },
    { word: "CAMERA", hint: "Used to take pictures" },
    { word: "DESERT", hint: "A very dry environment" },
    { word: "DRAGON", hint: "A mythical creature" },
    { word: "BASKET", hint: "Used to carry or hold things" },
    { word: "FOREST", hint: "A large area filled with trees" },
    { word: "THUNDER", hint: "A loud sound during storms" },
  ],

  hard: [
    { word: "ADVENTURE", hint: "An exciting experience" },
    { word: "CHOCOLATE", hint: "A sweet treat" },
    { word: "KNOWLEDGE", hint: "What you gain from learning" },
    { word: "CHALLENGE", hint: "Something difficult to overcome" },
    { word: "COMPUTER", hint: "A machine used for digital tasks" },
    { word: "GALAXY", hint: "A huge collection of stars" },
    {
      word: "MYSTERY",
      hint: "Something difficult to explain or solve",
    },
    {
      word: "LIGHTNING",
      hint: "A bright flash during a storm",
    },
    {
      word: "CREATIVE",
      hint: "Having new and imaginative ideas",
    },
    {
      word: "LANGUAGE",
      hint: "Used by people to communicate",
    },
    {
      word: "TREASURE",
      hint: "Something valuable that may be hidden",
    },
    {
      word: "EXPLORER",
      hint: "Someone who discovers new places",
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

function shuffleLetters(word: string): string {
  const original = word.split("");

  if (original.length <= 1) {
    return word;
  }

  const shuffled = [...original];
  let attempts = 0;

  do {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(
        Math.random() * (i + 1)
      );

      [shuffled[i], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[i],
      ];
    }

    attempts += 1;

    if (attempts > 20) {
      break;
    }
  } while (shuffled.join("") === word);

  return shuffled.join("");
}

function getRandomWord(
  difficulty: Difficulty,
  previousWord?: string
): WordItem {
  const availableWords = WORDS[difficulty];

  let candidates = availableWords;

  if (previousWord && availableWords.length > 1) {
    candidates = availableWords.filter(
      (item) => item.word !== previousWord
    );
  }

  return candidates[
    Math.floor(Math.random() * candidates.length)
  ];
}

function createRound(
  difficulty: Difficulty,
  previousWord?: string
) {
  const wordItem = getRandomWord(
    difficulty,
    previousWord
  );

  return {
    wordItem,
    scrambled: shuffleLetters(wordItem.word),
  };
}

export default function WordScramblePage() {
  const dailyChallenge = getDailyChallenge();

  const [dailyMode, setDailyMode] = useState(false);

  const [difficulty, setDifficulty] =
    useState<Difficulty>("normal");

  const [word, setWord] = useState<WordItem>(() =>
    getRandomWord("normal")
  );

  const [scrambled, setScrambled] = useState(() =>
    shuffleLetters(word.word)
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

  const [xpEarned, setXpEarned] = useState<
    number | null
  >(null);

  const [dailyChallengeCompleted, setDailyChallengeCompleted] =
    useState(false);

  /*
   * Detect Daily Challenge mode from the URL.
   *
   * Normal:
   * /games/word-scramble
   *
   * Daily Challenge:
   * /games/word-scramble?daily=true&difficulty=hard
   *
   * Daily mode is only enabled when the URL matches
   * today's actual challenge.
   */
  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
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
      dailyChallenge.game === "word-scramble" &&
      urlDifficulty === dailyChallenge.difficulty
    ) {
      const dailyTimer = setTimeout(() => {
        setDailyMode(true);
        setDifficulty(
          dailyChallenge.difficulty
        );
      }, 0);

      return () => clearTimeout(dailyTimer);
    }
  }, [dailyChallenge]);

  const difficultyLocked =
    dailyMode ||
    (started && !gameOver);

  const startGame = (
    selectedDifficulty: Difficulty
  ) => {
    /*
     * Daily Challenge difficulty cannot be changed.
     */
    if (
      dailyMode &&
      selectedDifficulty !==
        dailyChallenge.difficulty
    ) {
      return;
    }

    const round = createRound(
      selectedDifficulty
    );

    setDifficulty(selectedDifficulty);
    setWord(round.wordItem);
    setScrambled(round.scrambled);
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

  /*
   * Timer
   */
  useEffect(() => {
    if (!started || gameOver) {
      return;
    }

    if (timeLeft <= 0) {
      const timer = window.setTimeout(() => {
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
         * Daily Challenge bonus is only awarded
         * when the game was actually launched
         * through Daily Challenge mode.
         */
        const dailyCompleted =
          dailyMode &&
          dailyChallenge.game ===
            "word-scramble"
            ? completeDailyChallenge(
                "word-scramble"
              )
            : false;

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
         * completeDailyChallenge() already adds
         * the Daily Challenge XP.
         *
         * recordGame() receives only normal
         * game XP.
         */
        const displayedXP =
          totalXP +
          (dailyCompleted
            ? dailyChallenge.rewardXP
            : 0);

        setScore(finalScore);
        setXpEarned(displayedXP);

        recordGame(
          finalScore,
          totalXP
        );

        unlockGameAchievement(
          "word-wizard"
        );
      }, 0);

      return () => {
        window.clearTimeout(timer);
      };
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
    dailyMode,
    dailyChallenge,
  ]);

  const submitAnswer = () => {
    if (
      !started ||
      gameOver ||
      feedback !== null ||
      answer.trim() === ""
    ) {
      return;
    }

    const normalizedAnswer =
      answer
        .trim()
        .toUpperCase();

    if (
      normalizedAnswer ===
      word.word
    ) {
      setScore(
        (previous) =>
          previous + 10
      );

      setCorrect(
        (previous) =>
          previous + 1
      );

      setFeedback("correct");
      setShowHint(false);

      const currentWord =
        word.word;

      window.setTimeout(() => {
        const nextRound =
          createRound(
            difficulty,
            currentWord
          );

        setWord(
          nextRound.wordItem
        );

        setScrambled(
          nextRound.scrambled
        );

        setAnswer("");
        setFeedback(null);
        setShowHint(false);
      }, 400);

      return;
    }

    setWrong(
      (previous) =>
        previous + 1
    );

    setFeedback("wrong");
    setAnswer("");

    window.setTimeout(() => {
      setFeedback(null);
    }, 500);
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

  return (
    <GameShell
      icon="🔤"
      category="Word Challenge"
      title="Word"
      highlightedTitle="Scramble"
      description="Rearrange the letters and uncover the hidden word."
      maxWidth="lg"
    >
      {/* Daily Challenge */}

      <GameDailyChallenge
        gameId="word-scramble"
      />

      {/* Difficulty */}

      <div className="mx-auto mt-4 max-w-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
              {dailyMode
                ? "Daily difficulty"
                : "Difficulty"}
            </p>

            <p className="mt-1 text-[11px] font-medium text-white/35">
              {dailyMode
                ? "Today's difficulty is locked."
                : "Higher difficulty, higher reward."}
            </p>
          </div>

          <p className="text-xs text-white/50">
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
                disabled={
                  difficultyLocked
                }
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
                    {
                      DIFFICULTIES[
                        level
                      ].icon
                    }
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
                  {
                    DIFFICULTIES[
                      level
                    ].label
                  }
                </p>

                <p className="mt-1 text-xs text-white/50">
                  {DIFFICULTIES[level].time}{" "}
                  seconds
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}

      <div className="mx-auto mt-5 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
        <div className="mp-card rounded-2xl p-3 text-center sm:p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50 sm:text-xs">
            Score
          </p>

          <p className="mt-1 text-xl font-black text-cyan-300 sm:text-2xl">
            {score}
          </p>
        </div>

        <div className="mp-card rounded-2xl p-3 text-center sm:p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50 sm:text-xs">
            Solved
          </p>

          <p className="mt-1 text-xl font-black text-emerald-300 sm:text-2xl">
            {correct}
          </p>
        </div>

        <div className="mp-card rounded-2xl p-3 text-center sm:p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/50 sm:text-xs">
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
              : DIFFICULTIES[
                  difficulty
                ].time}
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

      <div className="mp-card mp-fade-up mx-auto mt-4 max-w-2xl rounded-4xl p-5 shadow-2xl sm:mt-4 sm:p-8">
        {/* Start Screen */}

        {!started &&
          !gameOver && (
            <div className="py-8 text-center sm:py-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/4 text-5xl">
                🔀
              </div>

              <p className="mt-4 text-xs font-black uppercase tracking-[0.25em] text-cyan-300/50">
                {
                  DIFFICULTIES[
                    difficulty
                  ].label
                }{" "}
                Mode
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Unscramble the word
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">
                Rearrange the letters
                before time runs out.
                Solve as many words as
                you can.
              </p>

              <div className="mx-auto mt-4 grid max-w-sm grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-lg font-black text-cyan-300">
                    +{DIFFICULTIES[difficulty].xp}{" "}
                    XP
                  </p>

                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/45">
                    Base XP
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-lg font-black text-white">
                    {DIFFICULTIES[difficulty].time}
                    s
                  </p>

                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/45">
                    Timer
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-lg font-black text-fuchsia-300">
                    +XP
                  </p>

                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/45">
                    Reward
                  </p>
                </div>
              </div>

              {dailyMode && (
                <div className="mx-auto mt-4 w-fit rounded-xl border border-purple-300/10 bg-purple-300/5 px-3 py-2 text-xs font-bold text-purple-200/60">
                  🎯 Daily Challenge ·{" "}
                  {dailyChallenge.difficulty.toUpperCase()}{" "}
                  🔒
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  startGame(
                    difficulty
                  )
                }
                className="mp-button mt-4 rounded-2xl bg-white px-7 py-3.5 text-sm font-black text-[#080b14] shadow-lg hover:bg-cyan-100"
              >
                {dailyMode
                  ? "Start Daily Challenge"
                  : "Start Game"}

                <span className="ml-2">
                  →
                </span>
              </button>
            </div>
          )}

        {/* Active Game */}

        {started &&
          !gameOver && (
            <div className="text-center">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                    Word Puzzle
                  </p>

                  <p className="mt-1 text-sm font-bold text-white/60">
                    What word is this?
                  </p>
                </div>

                <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-bold text-white/60">
                  {dailyMode
                    ? `Daily · ${DIFFICULTIES[difficulty].label} 🔒`
                    : "+10 points"}
                </div>
              </div>

              {/* Scrambled Word */}

              <div
                className={[
                  "relative flex min-h-36 items-center justify-center overflow-hidden rounded-4xl border px-4 transition-all duration-200 sm:min-h-44",
                  feedback ===
                  "correct"
                    ? "border-emerald-300/40 bg-emerald-300/10 shadow-[0_0_40px_rgba(52,211,153,0.08)]"
                    : feedback ===
                        "wrong"
                      ? "border-red-300/40 bg-red-300/10 shadow-[0_0_40px_rgba(248,113,113,0.08)]"
                      : "border-white/10 bg-white/2.5",
                ].join(" ")}
              >
                <div className="absolute left-4 top-4 text-[10px] font-black uppercase tracking-widest text-white/15">
                  Unscramble
                </div>

                <div
                  className={[
                    "max-w-full break-all text-3xl font-black tracking-[0.18em] transition-all duration-200 sm:text-4xl md:text-5xl",
                    feedback ===
                    "correct"
                      ? "text-emerald-200"
                      : feedback ===
                          "wrong"
                        ? "text-red-200"
                        : "text-cyan-200",
                  ].join(" ")}
                >
                  {scrambled}
                </div>

                {feedback ===
                  "correct" && (
                  <div className="absolute right-4 top-4 text-lg text-emerald-300">
                    ✓
                  </div>
                )}

                {feedback ===
                  "wrong" && (
                  <div className="absolute right-4 top-4 text-lg text-red-300">
                    ✕
                  </div>
                )}
              </div>

              {/* Feedback */}

              <div className="h-9 pt-4">
                {feedback ===
                  "correct" && (
                  <p className="text-sm font-black text-emerald-300">
                    ✨ Correct! +10
                  </p>
                )}

                {feedback ===
                  "wrong" && (
                  <p className="text-sm font-black text-red-300">
                    Not quite — try the next one!
                  </p>
                )}
              </div>

              {/* Hint */}

              <div className="mt-3">
                {!showHint ? (
                  <button
                    type="button"
                    onClick={() =>
                      setShowHint(
                        true
                      )
                    }
                    className="mp-button rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-white/65 hover:bg-white/[0.07] hover:text-white/70"
                  >
                    💡 Need a hint?
                  </button>
                ) : (
                  <div className="rounded-2xl border border-cyan-300/10 bg-cyan-300/4 px-4 py-3 text-sm text-white/55">
                    <span className="mr-2">
                      💡
                    </span>

                    {word.hint}
                  </div>
                )}
              </div>

              {/* Answer */}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  autoFocus
                  value={answer}
                  onChange={(event) =>
                    setAnswer(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  placeholder="Type the word..."
                  disabled={
                    feedback !== null
                  }
                  className={[
                    "min-w-0 flex-1 rounded-2xl border bg-black/20 px-5 py-4 text-center text-lg font-black uppercase outline-none transition",
                    "placeholder:40",
                    "focus:border-cyan-300/30 focus:bg-black/30",
                    feedback ===
                    "correct"
                      ? "border-emerald-300/30"
                      : feedback ===
                          "wrong"
                        ? "border-red-300/30"
                        : "border-white/10",
                  ].join(" ")}
                />

                <button
                  type="button"
                  onClick={
                    submitAnswer
                  }
                  disabled={
                    feedback !== null ||
                    answer.trim() ===
                      ""
                  }
                  className="mp-button rounded-2xl bg-white px-6 py-4 text-sm font-black text-[#080b14] hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Check
                </button>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/45">
                <span>
                  +10 points
                </span>

                <span>•</span>

                <span>
                  Press Enter to check
                </span>

                <span>•</span>

                <span>
                  No penalty for wrong
                  answers
                </span>
              </div>
            </div>
          )}

        {/* Game Over */}

        {gameOver && (
          <div className="py-5 text-center sm:py-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-yellow-300/10 bg-yellow-300/5 text-5xl">
              🏆
            </div>

            <p className="mt-4 text-xs font-black uppercase tracking-[0.25em] text-fuchsia-300/60">
              {dailyMode
                ? "Daily Challenge Complete"
                : "Challenge Complete"}
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Time&apos;s up!
            </h2>

            <p className="mt-2 text-sm text-white/60">
              You solved{" "}
              <span className="font-black text-white">
                {correct}
              </span>{" "}
              words.
            </p>

            {/* Results */}

            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/45">
                  Score
                </p>

                <p className="mt-1 text-2xl font-black text-cyan-300">
                  {score}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/45">
                  Solved
                </p>

                <p className="mt-1 text-2xl font-black text-emerald-300">
                  {correct}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-white/45">
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

              <p className="mt-1 text-xs text-white/50">
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
                  +{dailyChallenge.rewardXP}{" "}
                  XP · +10 Score
                </p>

                <p className="mt-1 text-xs text-white/50">
                  Today&apos;s challenge
                  reward has been added.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                startGame(
                  difficulty
                )
              }
              className="mp-button mt-4 rounded-2xl bg-white px-7 py-3.5 text-sm font-black text-[#080b14] hover:bg-cyan-100"
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

      <div className="mp-card mx-auto mt-4 max-w-2xl rounded-2xl p-5">
        <div className="flex gap-3">
          <span className="text-xl">
            💡
          </span>

          <div>
            <p className="text-sm font-black text-white/80">
              Word tip
            </p>

            <p className="mt-1 text-sm leading-6 text-white/55">
              Look for common letter
              combinations first. Words
              often reveal themselves once
              you spot the beginning or
              ending.
            </p>
          </div>
        </div>
      </div>
    </GameShell>
  );
}