"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import GameDailyChallenge from "@/components/GameDailyChallenge";
import GameShell from "@/components/GameShell";

import {
  DAILY_CHALLENGE_BONUS_POINTS,
  getDailyChallenge,
  completeDailyChallenge,
} from "@/lib/dailyChallenge";

import { recordGame } from "@/lib/progress";
import { unlockGameAchievement } from "@/lib/achievements";

type Player = "X" | "O";
type Cell = Player | null;
type Difficulty = "easy" | "normal" | "hard";

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const DIFFICULTIES = {
  easy: {
    label: "Easy",
    description: "Casual AI",
    icon: "🌱",
    winXP: 20,
    drawXP: 15,
    lossXP: 10,
  },

  normal: {
    label: "Normal",
    description: "Smart AI",
    icon: "⚡",
    winXP: 30,
    drawXP: 20,
    lossXP: 10,
  },

  hard: {
    label: "Hard",
    description: "Unbeatable",
    icon: "🔥",
    winXP: 40,
    drawXP: 25,
    lossXP: 10,
  },
};

function getWinner(board: Cell[]) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;

    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return {
        winner: board[a] as Player,
        line,
      };
    }
  }

  if (board.every((cell) => cell !== null)) {
    return {
      winner: "draw" as const,
      line: [],
    };
  }

  return null;
}

function getEmptyCells(board: Cell[]) {
  return board
    .map((cell, index) =>
      cell === null ? index : null
    )
    .filter(
      (index): index is number =>
        index !== null
    );
}

function getRandomMove(board: Cell[]) {
  const emptyCells =
    getEmptyCells(board);

  if (emptyCells.length === 0) {
    return null;
  }

  return emptyCells[
    Math.floor(
      Math.random() * emptyCells.length
    )
  ];
}

function getWinningMove(
  board: Cell[],
  player: Player
) {
  const emptyCells =
    getEmptyCells(board);

  for (const index of emptyCells) {
    const testBoard = [...board];

    testBoard[index] = player;

    const result =
      getWinner(testBoard);

    if (result?.winner === player) {
      return index;
    }
  }

  return null;
}

function getNormalMove(
  board: Cell[],
  ai: Player,
  human: Player
) {
  const winningMove =
    getWinningMove(
      board,
      ai
    );

  if (winningMove !== null) {
    return winningMove;
  }

  const blockingMove =
    getWinningMove(
      board,
      human
    );

  if (blockingMove !== null) {
    return blockingMove;
  }

  if (
    board[4] === null &&
    Math.random() > 0.2
  ) {
    return 4;
  }

  const corners = [
    0,
    2,
    6,
    8,
  ].filter(
    (index) => board[index] === null
  );

  if (
    corners.length > 0 &&
    Math.random() > 0.3
  ) {
    return corners[
      Math.floor(
        Math.random() *
          corners.length
      )
    ];
  }

  return getRandomMove(board);
}

function minimax(
  board: Cell[],
  depth: number,
  maximizing: boolean,
  ai: Player,
  human: Player
): number {
  const result =
    getWinner(board);

  if (result?.winner === ai) {
    return 10 - depth;
  }

  if (result?.winner === human) {
    return depth - 10;
  }

  if (result?.winner === "draw") {
    return 0;
  }

  const emptyCells =
    getEmptyCells(board);

  if (maximizing) {
    let bestScore = -Infinity;

    for (const index of emptyCells) {
      const newBoard = [
        ...board,
      ];

      newBoard[index] = ai;

      const score = minimax(
        newBoard,
        depth + 1,
        false,
        ai,
        human
      );

      bestScore = Math.max(
        bestScore,
        score
      );
    }

    return bestScore;
  }

  let bestScore = Infinity;

  for (const index of emptyCells) {
    const newBoard = [
      ...board,
    ];

    newBoard[index] = human;

    const score = minimax(
      newBoard,
      depth + 1,
      true,
      ai,
      human
    );

    bestScore = Math.min(
      bestScore,
      score
    );
  }

  return bestScore;
}

function getHardMove(
  board: Cell[],
  ai: Player,
  human: Player
) {
  const emptyCells =
    getEmptyCells(board);

  if (emptyCells.length === 0) {
    return null;
  }

  let bestScore = -Infinity;
  let bestMove =
    emptyCells[0];

  for (const index of emptyCells) {
    const newBoard = [
      ...board,
    ];

    newBoard[index] = ai;

    const score = minimax(
      newBoard,
      0,
      false,
      ai,
      human
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
}

export default function TicTacToePage() {
  const [
    board,
    setBoard,
  ] = useState<Cell[]>(
    Array(9).fill(null)
  );

  const [
    humanPlayer,
    setHumanPlayer,
  ] = useState<Player>("X");

  const [
    currentPlayer,
    setCurrentPlayer,
  ] = useState<Player>("X");

  const [
    difficulty,
    setDifficulty,
  ] = useState<Difficulty>(
    "normal"
  );

  const [
    dailyMode,
    setDailyMode,
  ] = useState(false);

  const [
    winner,
    setWinner,
  ] = useState<
    Player | "draw" | null
  >(null);

  const [
    winningLine,
    setWinningLine,
  ] = useState<number[]>([]);

  const [
    thinking,
    setThinking,
  ] = useState(false);

  const [
    dailyChallengeCompleted,
    setDailyChallengeCompleted,
  ] = useState(false);

  const [
    gameXP,
    setGameXP,
  ] = useState(0);

  const [
    scores,
    setScores,
  ] = useState({
    player: 0,
    ai: 0,
    draws: 0,
  });

  const dailyChallenge =
    getDailyChallenge();

  /*
   * Detect Daily Challenge mode.
   *
   * The Daily Challenge URL contains:
   *
   * ?daily=true&difficulty=easy
   * ?daily=true&difficulty=normal
   * ?daily=true&difficulty=hard
   *
   * We verify that the URL difficulty
   * matches today's actual challenge.
   */
  useEffect(() => {
    const params =
      new URLSearchParams(
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
      dailyChallenge.game ===
        "tic-tac-toe" &&
      urlDifficulty ===
        dailyChallenge.difficulty
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

  const gameInProgress =
    board.some(
      (cell) => cell !== null
    ) &&
    winner === null;

  function resetBoard(
    selectedPlayer: Player = humanPlayer
  ) {
    setBoard(
      Array(9).fill(null)
    );

    setWinner(null);

    setWinningLine([]);

    setThinking(false);

    setCurrentPlayer("X");

    setHumanPlayer(
      selectedPlayer
    );

    setDailyChallengeCompleted(
      false
    );

    setGameXP(0);
  }

  const finishGame =
    useCallback(
      async (
        result:
          | Player
          | "draw",
        line: number[]
      ) => {
        setWinner(result);

        setWinningLine(line);

        setScores(
          (previous) => {
            if (
              result === "draw"
            ) {
              return {
                ...previous,
                draws:
                  previous.draws +
                  1,
              };
            }

            if (
              result ===
              humanPlayer
            ) {
              return {
                ...previous,
                player:
                  previous.player +
                  1,
              };
            }

            return {
              ...previous,
              ai:
                previous.ai +
                1,
            };
          }
        );

        let xp = 10;

        if (
          result ===
          humanPlayer
        ) {
          xp =
            DIFFICULTIES[
              difficulty
            ].winXP;
        } else if (
          result === "draw"
        ) {
          xp =
            DIFFICULTIES[
              difficulty
            ].drawXP;
        } else {
          xp =
            DIFFICULTIES[
              difficulty
            ].lossXP;
        }

        setGameXP(xp);

        /*
         * Only complete the daily challenge
         * when the game was opened through
         * the valid Daily Challenge URL.
         */
        const dailyCompleted =
          dailyMode &&
          dailyChallenge.game ===
            "tic-tac-toe"
            ? await completeDailyChallenge(
                "tic-tac-toe"
              )
            : false;

        if (dailyCompleted) {
          setDailyChallengeCompleted(
            true
          );
        }

        const baseScore =
          result === humanPlayer
            ? 100
            : result === "draw"
              ? 50
              : 25;

        const finalScore =
          baseScore +
          (dailyCompleted
            ? DAILY_CHALLENGE_BONUS_POINTS
            : 0);

        recordGame(
          finalScore,
          xp
        );

        unlockGameAchievement(
          "strategy-master"
        );
      },
      [
        dailyChallenge.game,
        dailyMode,
        difficulty,
        humanPlayer,
      ]
    );

  function handlePlayerMove(
    index: number
  ) {
    if (
      board[index] !== null
    ) {
      return;
    }

    if (winner !== null) {
      return;
    }

    if (thinking) {
      return;
    }

    if (
      currentPlayer !==
      humanPlayer
    ) {
      return;
    }

    const newBoard = [
      ...board,
    ];

    newBoard[index] =
      humanPlayer;

    setBoard(newBoard);

    const result =
      getWinner(newBoard);

    if (result) {
      finishGame(
        result.winner,
        result.line
      );

      return;
    }

    setCurrentPlayer(
      aiPlayer
    );
  }

  const aiPlayer: Player =
    humanPlayer === "X"
      ? "O"
      : "X";

  const makeAIMove =
    useCallback(() => {
      let move:
        | number
        | null = null;

      if (
        difficulty === "easy"
      ) {
        move =
          getRandomMove(board);
      }

      if (
        difficulty === "normal"
      ) {
        move =
          getNormalMove(
            board,
            aiPlayer,
            humanPlayer
          );
      }

      if (
        difficulty === "hard"
      ) {
        move =
          getHardMove(
            board,
            aiPlayer,
            humanPlayer
          );
      }

      if (move === null) {
        return;
      }

      const newBoard = [
        ...board,
      ];

      newBoard[move] =
        aiPlayer;

      setBoard(newBoard);

      const result =
        getWinner(newBoard);

      if (result) {
        finishGame(
          result.winner,
          result.line
        );

        return;
      }

      setCurrentPlayer(
        humanPlayer
      );
    }, [
      aiPlayer,
      board,
      difficulty,
      finishGame,
      humanPlayer,
    ]);

  useEffect(() => {
    if (
      currentPlayer !==
      aiPlayer
    ) {
      return;
    }

    if (winner !== null) {
      return;
    }

    const timeout =
      window.setTimeout(
        () => {
          setThinking(true);

          makeAIMove();

          setThinking(false);
        },
        550
      );

    return () =>
      window.clearTimeout(
        timeout
      );
  }, [
    currentPlayer,
    aiPlayer,
    winner,
    makeAIMove,
  ]);

  function getStatus() {
    if (
      winner === humanPlayer
    ) {
      return "🎉 You win!";
    }

    if (
      winner === aiPlayer
    ) {
      return "🤖 AI wins!";
    }

    if (
      winner === "draw"
    ) {
      return "🤝 Draw game!";
    }

    if (thinking) {
      return "🤔 AI is thinking...";
    }

    return `Your turn · ${humanPlayer}`;
  }

  function changeDifficulty(
    level: Difficulty
  ) {
    if (dailyMode) {
      return;
    }

    if (gameInProgress) {
      return;
    }

    setDifficulty(level);
  }

  const gameFinished =
    winner !== null;

  const isDailyChallengeGame =
    dailyMode &&
    dailyChallenge.game ===
      "tic-tac-toe";

  const baseScore =
    winner === humanPlayer
      ? 100
      : winner === "draw"
        ? 50
        : 25;

  return (
    <GameShell
      icon="❌⭕"
      category="Strategy Challenge"
      title="Tic-Tac-"
      highlightedTitle="Toe"
      description="Think ahead, make your move, and outsmart the AI."
    >
      {/* Daily Challenge */}

      <GameDailyChallenge
        gameId="tic-tac-toe"
      />

      {/* Difficulty */}

      <div className="mx-auto mt-3 w-full max-w-2xl">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 sm:text-xs">
            Difficulty
          </p>

          <p className="text-[10px] text-white/50 sm:text-xs">
            Current{" "}
            <span className="font-bold text-cyan-300">
              {
                DIFFICULTIES[
                  difficulty
                ].label
              }
            </span>
          </p>
        </div>

        {dailyMode && (
          <div className="mb-2 rounded-2xl border border-cyan-300/15 bg-cyan-300/6 px-4 py-2.5 text-center text-xs font-bold text-cyan-200">
            🎯 Daily Challenge ·{" "}
            <span className="capitalize">
              {difficulty}
            </span>{" "}
            🔒
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
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
                  changeDifficulty(
                    level
                  )
                }
                disabled={
                  gameInProgress ||
                  dailyMode
                }
                className={[
                  "rounded-2xl border p-2.5 text-left transition-all duration-200 sm:p-3",

                  active
                    ? "border-cyan-300/30 bg-cyan-300/8 shadow-[0_0_25px_rgba(103,232,249,0.05)]"
                    : "border-white/10 bg-white/[0.035] hover:bg-white/6",

                  gameInProgress ||
                  dailyMode
                    ? "cursor-not-allowed opacity-40"
                    : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg sm:text-xl">
                    {
                      DIFFICULTIES[
                        level
                      ].icon
                    }
                  </span>

                  {active && (
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />

                      {dailyMode && (
                        <span className="text-[9px] text-cyan-300">
                          🔒
                        </span>
                      )}
                    </span>
                  )}
                </div>

                <p
                  className={[
                    "mt-1.5 text-xs font-black sm:text-sm",
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

                <p className="mt-0.5 text-[9px] text-white/50 sm:text-[11px]">
                  {
                    DIFFICULTIES[
                      level
                    ].description
                  }
                </p>
              </button>
            );
          })}
        </div>

        {gameInProgress && (
          <p className="mt-1.5 text-center text-[9px] text-white/45 sm:text-[11px]">
            Difficulty is locked during
            the match.
          </p>
        )}
      </div>

      {/* Choose Symbol */}

      <div className="mx-auto mt-3 w-full max-w-2xl">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 sm:text-xs">
          Choose your symbol
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              if (gameInProgress) {
                return;
              }

              resetBoard("X");
            }}
            disabled={
              gameInProgress
            }
            className={[
              "rounded-2xl border p-2.5 transition-all duration-200 sm:p-3",

              humanPlayer === "X"
                ? "border-cyan-300/30 bg-cyan-300/8"
                : "border-white/10 bg-white/[0.035] hover:bg-white/6",

              gameInProgress
                ? "cursor-not-allowed opacity-40"
                : "",
            ].join(" ")}
          >
            <span className="text-xl font-black text-cyan-300 sm:text-2xl">
              X
            </span>

            <span className="ml-2 text-xs font-black text-white/70 sm:text-sm">
              Play as X
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (gameInProgress) {
                return;
              }

              resetBoard("O");
            }}
            disabled={
              gameInProgress
            }
            className={[
              "rounded-2xl border p-2.5 transition-all duration-200 sm:p-3",

              humanPlayer === "O"
                ? "border-fuchsia-300/30 bg-fuchsia-300/8"
                : "border-white/10 bg-white/[0.035] hover:bg-white/6",

              gameInProgress
                ? "cursor-not-allowed opacity-40"
                : "",
            ].join(" ")}
          >
            <span className="text-xl font-black text-fuchsia-300 sm:text-2xl">
              O
            </span>

            <span className="ml-2 text-xs font-black text-white/70 sm:text-sm">
              Play as O
            </span>
          </button>
        </div>

        {gameInProgress && (
          <p className="mt-1.5 text-center text-[9px] text-white/45 sm:text-[11px]">
            Your symbol is locked during
            the match.
          </p>
        )}
      </div>

      {/* Scoreboard */}

      <div className="mx-auto mt-3 grid w-full max-w-2xl grid-cols-3 gap-2">
        <div className="mp-card rounded-2xl p-2.5 text-center sm:p-3">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px]">
              ❌
            </span>

            <p className="text-[9px] font-black uppercase tracking-widest text-white/50 sm:text-[10px]">
              You
            </p>
          </div>

          <p className="mt-0.5 text-lg font-black text-cyan-300 sm:text-xl">
            {scores.player}
          </p>
        </div>

        <div className="mp-card rounded-2xl p-2.5 text-center sm:p-3">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px]">
              🤝
            </span>

            <p className="text-[9px] font-black uppercase tracking-widest text-white/50 sm:text-[10px]">
              Draws
            </p>
          </div>

          <p className="mt-0.5 text-lg font-black text-white sm:text-xl">
            {scores.draws}
          </p>
        </div>

        <div className="mp-card rounded-2xl p-2.5 text-center sm:p-3">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px]">
              🤖
            </span>

            <p className="text-[9px] font-black uppercase tracking-widest text-white/50 sm:text-[10px]">
              AI
            </p>
          </div>

          <p className="mt-0.5 text-lg font-black text-fuchsia-300 sm:text-xl">
            {scores.ai}
          </p>
        </div>
      </div>

      {/* Status */}

      <div className="mt-3 text-center">
        <div
          className={[
            "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black transition-all sm:px-5 sm:py-2 sm:text-sm",

            winner === humanPlayer
              ? "border-emerald-300/20 bg-emerald-300/8 text-emerald-300"
              : winner === aiPlayer
                ? "border-red-300/20 bg-red-300/8 text-red-300"
                : winner === "draw"
                  ? "border-yellow-300/20 bg-yellow-300/8 text-yellow-300"
                  : thinking
                    ? "border-purple-300/20 bg-purple-300/8 text-purple-300"
                    : "border-cyan-300/20 bg-cyan-300/8 text-cyan-200",
          ].join(" ")}
        >
          {thinking && (
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-purple-300 sm:h-2 sm:w-2" />
          )}

          {getStatus()}
        </div>
      </div>

      {/* Game Board */}

      <div className="mp-card mp-fade-up mx-auto mt-3 w-full max-w-2xl rounded-4xl p-3 shadow-2xl sm:p-4">
        <div className="mb-2.5 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/45 sm:text-[10px]">
              Battle Board
            </p>

            <p className="mt-0.5 text-[11px] font-bold text-white/60 sm:text-sm">
              You are{" "}
              <span
                className={
                  humanPlayer === "X"
                    ? "text-cyan-300"
                    : "text-fuchsia-300"
                }
              >
                {humanPlayer}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/4 px-2.5 py-1 text-[10px] font-bold text-white/55 sm:px-3 sm:py-1.5 sm:text-xs">
            {
              DIFFICULTIES[
                difficulty
              ].icon
            }{" "}
            {
              DIFFICULTIES[
                difficulty
              ].label
            }

            {dailyMode && (
              <span className="ml-0.5">
                🔒
              </span>
            )}
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-105 grid-cols-3 gap-2 sm:gap-2.5">
          {board.map(
            (cell, index) => {
              const winning =
                winningLine.includes(
                  index
                );

              const playable =
                cell === null &&
                winner === null &&
                !thinking &&
                currentPlayer ===
                  humanPlayer;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    handlePlayerMove(
                      index
                    )
                  }
                  disabled={!playable}
                  aria-label={`Cell ${
                    index + 1
                  }`}
                  className={[
                    "group relative aspect-square overflow-hidden rounded-2xl border transition-all duration-200 sm:rounded-3xl",

                    winning
                      ? "scale-[0.97] border-cyan-300/40 bg-cyan-300/12 shadow-[0_0_35px_rgba(103,232,249,0.12)]"
                      : "border-white/10 bg-white/[0.035]",

                    playable
                      ? "cursor-pointer hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.07] active:scale-95"
                      : "cursor-default",
                  ].join(" ")}
                >
                  <span className="absolute left-2 top-2 text-[7px] font-black text-white/10 sm:left-3 sm:top-3 sm:text-[9px]">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  {cell ? (
                    <span
                      className={[
                        "relative z-10 text-4xl font-black transition-transform duration-200 sm:text-6xl",
                        "animate-[ticPop_220ms_ease-out]",
                        cell === "X"
                          ? "text-cyan-300"
                          : "text-fuchsia-300",
                        winning
                          ? "scale-110"
                          : "group-hover:scale-105",
                      ].join(" ")}
                    >
                      {cell}
                    </span>
                  ) : (
                    playable && (
                      <span className="text-xl font-black text-white/0 transition group-hover:text-cyan-300/20 sm:text-2xl">
                        +
                      </span>
                    )
                  )}

                  {winning && (
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase tracking-widest text-cyan-300/60 sm:bottom-3 sm:text-[9px]">
                      Winner
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-white/45 sm:mt-4 sm:text-[11px]">
          <span>❌ X</span>

          <span>•</span>

          <span>⭕ O</span>

          <span>•</span>

          <span>
            {thinking
              ? "AI is thinking..."
              : "Make your move"}
          </span>
        </div>
      </div>

      {/* Restart */}

      <div className="mx-auto mt-3 w-full max-w-2xl">
        <button
          type="button"
          onClick={() =>
            resetBoard()
          }
          className="mp-button w-full rounded-2xl bg-white py-3.5 text-sm font-black text-[#080b14] hover:bg-cyan-100 sm:py-4"
        >
          {gameFinished
            ? "🎮 Play Again"
            : "↻ Restart Game"}
        </button>
      </div>

      {/* Game Result */}

      {gameFinished && (
        <div className="mx-auto mt-3 w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 sm:text-xs">
              Game Complete
            </p>

            <p
              className={[
                "mt-1.5 text-xl font-black sm:text-2xl",

                winner === humanPlayer
                  ? "text-emerald-300"
                  : winner === "draw"
                    ? "text-yellow-300"
                    : "text-red-300",
              ].join(" ")}
            >
              {winner === humanPlayer
                ? "🎉 You Win!"
                : winner === "draw"
                  ? "🤝 Draw Game!"
                  : "🤖 AI Wins!"}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-xl border border-cyan-300/10 bg-cyan-300/5 px-3 py-1.5 text-xs font-black text-cyan-300 sm:px-4 sm:py-2 sm:text-sm">
                +{gameXP} XP
              </span>

              <span className="rounded-xl border border-white/6 bg-white/3 px-3 py-1.5 text-xs font-black text-white/70 sm:px-4 sm:py-2 sm:text-sm">
                +{baseScore} score
              </span>
            </div>

            {dailyChallengeCompleted &&
              isDailyChallengeGame && (
                <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-xl border border-purple-300/10 bg-purple-300/5 px-2.5 py-1.5 text-[10px] font-black text-purple-200/80 sm:px-3 sm:text-xs">
                    🎯 Daily Challenge
                    Complete
                  </span>

                  <span className="rounded-xl border border-purple-300/10 bg-purple-300/5 px-2.5 py-1.5 text-[10px] font-black text-purple-200/70 sm:px-3 sm:text-xs">
                    +{dailyChallenge.rewardXP} Bonus XP
                  </span>

                  <span className="rounded-xl border border-white/6 bg-white/3 px-2.5 py-1.5 text-[10px] font-black text-white/60 sm:px-3 sm:text-xs">
                    +10 Bonus Score
                  </span>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Tip */}

      <div className="mp-card mx-auto mt-3 w-full max-w-2xl rounded-2xl p-4 sm:p-5">
        <div className="flex gap-3">
          <span className="text-lg sm:text-xl">
            🧠
          </span>

          <div>
            <p className="text-xs font-black text-white/80 sm:text-sm">
              Strategy tip
            </p>

            <p className="mt-1 text-xs leading-5 text-white/55 sm:text-sm sm:leading-6">
              Don&apos;t only think about your
              next move. Look for the move
              that gives you the best position
              on the next turn.
            </p>
          </div>
        </div>
      </div>

      {/* Daily Challenge Badge */}

      {isDailyChallengeGame &&
        !dailyChallengeCompleted &&
        !gameFinished && (
          <div className="mx-auto mt-3 flex w-fit flex-wrap items-center justify-center gap-2 rounded-full border border-purple-300/15 bg-purple-300/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-purple-200/70 sm:text-[10px]">
            🎯 Daily Challenge

            <span className="text-purple-200/40">
              •
            </span>

            +{dailyChallenge.rewardXP} XP

            <span className="text-purple-200/40">
              •
            </span>

            +10 score
          </div>
        )}

      <style jsx>{`
        @keyframes ticPop {
          0% {
            opacity: 0;
            transform: scale(0.4);
          }

          70% {
            opacity: 1;
            transform: scale(1.15);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          :global(.animate-pulse) {
            animation: none !important;
          }
        }
      `}</style>
    </GameShell>
  );
}