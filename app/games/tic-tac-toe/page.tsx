"use client";

import { useEffect, useState } from "react";

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
  const emptyCells = getEmptyCells(board);

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
  const emptyCells = getEmptyCells(board);

  for (const index of emptyCells) {
    const testBoard = [...board];

    testBoard[index] = player;

    const result = getWinner(testBoard);

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
  const winningMove = getWinningMove(
    board,
    ai
  );

  if (winningMove !== null) {
    return winningMove;
  }

  const blockingMove = getWinningMove(
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

  const corners = [0, 2, 6, 8].filter(
    (index) => board[index] === null
  );

  if (
    corners.length > 0 &&
    Math.random() > 0.3
  ) {
    return corners[
      Math.floor(
        Math.random() * corners.length
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
  const result = getWinner(board);

  if (result?.winner === ai) {
    return 10 - depth;
  }

  if (result?.winner === human) {
    return depth - 10;
  }

  if (result?.winner === "draw") {
    return 0;
  }

  const emptyCells = getEmptyCells(board);

  if (maximizing) {
    let bestScore = -Infinity;

    for (const index of emptyCells) {
      const newBoard = [...board];

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
    const newBoard = [...board];

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
  const emptyCells = getEmptyCells(board);

  if (emptyCells.length === 0) {
    return null;
  }

  let bestScore = -Infinity;
  let bestMove = emptyCells[0];

  for (const index of emptyCells) {
    const newBoard = [...board];

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
  const [board, setBoard] = useState<Cell[]>(
    Array(9).fill(null)
  );

  const [humanPlayer, setHumanPlayer] =
    useState<Player>("X");

  const [currentPlayer, setCurrentPlayer] =
    useState<Player>("X");

  const [difficulty, setDifficulty] =
    useState<Difficulty>("normal");

  const [winner, setWinner] = useState<
    Player | "draw" | null
  >(null);

  const [winningLine, setWinningLine] =
    useState<number[]>([]);

  const [thinking, setThinking] =
    useState(false);

  const [dailyChallengeCompleted, setDailyChallengeCompleted] =
    useState(false);

  const [scores, setScores] = useState({
    player: 0,
    ai: 0,
    draws: 0,
  });

  function resetBoard(
    selectedPlayer: Player = humanPlayer
  ) {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine([]);
    setThinking(false);
    setCurrentPlayer("X");
    setHumanPlayer(selectedPlayer);
    setDailyChallengeCompleted(false);
  }

  function finishGame(
    result: Player | "draw",
    line: number[]
  ) {
    setWinner(result);
    setWinningLine(line);

    setScores((previous) => {
      if (result === "draw") {
        return {
          ...previous,
          draws: previous.draws + 1,
        };
      }

      if (result === humanPlayer) {
        return {
          ...previous,
          player:
            previous.player + 1,
        };
      }

      return {
        ...previous,
        ai: previous.ai + 1,
      };
    });

    let xp = 10;

    if (result === humanPlayer) {
      xp =
        DIFFICULTIES[difficulty].winXP;
    } else if (result === "draw") {
      xp =
        DIFFICULTIES[difficulty].drawXP;
    } else {
      xp =
        DIFFICULTIES[difficulty].lossXP;
    }

    const dailyCompleted =
      completeDailyChallenge("tic-tac-toe");

    if (dailyCompleted) {
      setDailyChallengeCompleted(true);
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
  }

  function handlePlayerMove(
    index: number
  ) {
    if (board[index] !== null) {
      return;
    }

    if (winner !== null) {
      return;
    }

    if (thinking) {
      return;
    }

    if (currentPlayer !== humanPlayer) {
      return;
    }

    const newBoard = [...board];

    newBoard[index] = humanPlayer;

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

    setCurrentPlayer(aiPlayer);
  }

  const aiPlayer: Player =
    humanPlayer === "X" ? "O" : "X";

  function makeAIMove() {
    let move: number | null = null;

    if (difficulty === "easy") {
      move = getRandomMove(board);
    }

    if (difficulty === "normal") {
      move = getNormalMove(
        board,
        aiPlayer,
        humanPlayer
      );
    }

    if (difficulty === "hard") {
      move = getHardMove(
        board,
        aiPlayer,
        humanPlayer
      );
    }

    if (move === null) {
      return;
    }

    const newBoard = [...board];

    newBoard[move] = aiPlayer;

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

    setCurrentPlayer(humanPlayer);
  }

  useEffect(() => {
    if (currentPlayer !== aiPlayer) {
      return;
    }

    if (winner !== null) {
      return;
    }

    setThinking(true);

    const timeout =
      window.setTimeout(() => {
        makeAIMove();
        setThinking(false);
      }, 550);

    return () =>
      window.clearTimeout(timeout);
  }, [
    currentPlayer,
    aiPlayer,
    winner,
    board,
  ]);

  function getStatus() {
    if (winner === humanPlayer) {
      return "🎉 You win!";
    }

    if (winner === aiPlayer) {
      return "🤖 AI wins!";
    }

    if (winner === "draw") {
      return "🤝 Draw game!";
    }

    if (thinking) {
      return "🤔 AI is thinking...";
    }

    return `Your turn · ${humanPlayer}`;
  }

  const gameFinished =
    winner !== null;

  const isDailyChallengeGame =
    getDailyChallenge().game ===
    "tic-tac-toe";

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

      {/* Scoreboard */}

      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
        <div className="mp-card rounded-2xl p-3 text-center sm:p-4">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs">
              ❌
            </span>

            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 sm:text-xs">
              You
            </p>
          </div>

          <p className="mt-1 text-xl font-black text-cyan-300 sm:text-2xl">
            {scores.player}
          </p>
        </div>

        <div className="mp-card rounded-2xl p-3 text-center sm:p-4">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs">
              🤝
            </span>

            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 sm:text-xs">
              Draws
            </p>
          </div>

          <p className="mt-1 text-xl font-black text-white sm:text-2xl">
            {scores.draws}
          </p>
        </div>

        <div className="mp-card rounded-2xl p-3 text-center sm:p-4">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs">
              🤖
            </span>

            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 sm:text-xs">
              AI
            </p>
          </div>

          <p className="mt-1 text-xl font-black text-fuchsia-300 sm:text-2xl">
            {scores.ai}
          </p>
        </div>
      </div>

      {/* Status */}

      <div className="mt-5 text-center">
        <div
          className={[
            "inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-black transition-all",
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
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-purple-300" />
          )}

          {getStatus()}
        </div>
      </div>

      {/* Game Board */}

      <div className="mp-card mp-fade-up mx-auto mt-6 max-w-2xl rounded-4xl p-4 shadow-2xl sm:mt-8 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
              Battle Board
            </p>

            <p className="mt-1 text-sm font-bold text-white/60">
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

          <div className="rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-bold text-white/35">
            {DIFFICULTIES[difficulty].icon}{" "}
            {DIFFICULTIES[difficulty].label}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {board.map((cell, index) => {
            const winning =
              winningLine.includes(index);

            const playable =
              cell === null &&
              winner === null &&
              !thinking &&
              currentPlayer ===
                humanPlayer;

            return (
              <button
                key={index}
                onClick={() =>
                  handlePlayerMove(index)
                }
                disabled={!playable}
                aria-label={`Cell ${
                  index + 1
                }`}
                className={[
                  "group relative aspect-square overflow-hidden rounded-3xl border transition-all duration-200",
                  winning
                    ? "scale-[0.97] border-cyan-300/40 bg-cyan-300/12 shadow-[0_0_35px_rgba(103,232,249,0.12)]"
                    : "border-white/10 bg-white/[0.035]",
                  playable
                    ? "cursor-pointer hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/[0.07] active:scale-95"
                    : "cursor-default",
                ].join(" ")}
              >
                <span className="absolute left-3 top-3 text-[9px] font-black text-white/10 sm:text-[10px]">
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </span>

                {cell ? (
                  <span
                    className={[
                      "relative z-10 text-5xl font-black transition-transform duration-200 sm:text-6xl",
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
                    <span className="text-2xl font-black text-white/0 transition group-hover:text-cyan-300/20">
                      +
                    </span>
                  )
                )}

                {winning && (
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-cyan-300/60">
                    Winner
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Board footer */}

        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-white/25">
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

      {/* Controls */}

      <div className="mx-auto mt-6 max-w-2xl space-y-5">
        {/* Difficulty */}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
              Difficulty
            </p>

            <p className="text-xs text-white/30">
              Current{" "}
              <span className="font-bold text-cyan-300">
                {DIFFICULTIES[difficulty].label}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(Object.keys(
              DIFFICULTIES
            ) as Difficulty[]).map(
              (level) => {
                const active =
                  difficulty === level;

                return (
                  <button
                    key={level}
                    onClick={() => {
                      setDifficulty(
                        level
                      );
                    }}
                    className={[
                      "group rounded-2xl border p-3 text-left transition-all duration-200 sm:p-4",
                      active
                        ? "border-cyan-300/30 bg-cyan-300/8 shadow-[0_0_30px_rgba(103,232,249,0.05)]"
                        : "border-white/10 bg-white/[0.035] hover:-translate-y-0.5 hover:bg-white/6",
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

                    <p className="mt-1 text-[11px] text-white/30">
                      {
                        DIFFICULTIES[
                          level
                        ].description
                      }
                    </p>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Symbol */}

        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-white/30">
            Choose your symbol
          </p>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={() =>
                resetBoard("X")
              }
              className={[
                "rounded-2xl border p-4 transition-all duration-200",
                humanPlayer ===
                "X"
                  ? "border-cyan-300/30 bg-cyan-300/8"
                  : "border-white/10 bg-white/[0.035] hover:bg-white/6",
              ].join(" ")}
            >
              <span className="text-2xl font-black text-cyan-300">
                X
              </span>

              <span className="ml-2 text-sm font-black text-white/70">
                Play as X
              </span>
            </button>

            <button
              onClick={() =>
                resetBoard("O")
              }
              className={[
                "rounded-2xl border p-4 transition-all duration-200",
                humanPlayer ===
                "O"
                  ? "border-fuchsia-300/30 bg-fuchsia-300/8"
                  : "border-white/10 bg-white/[0.035] hover:bg-white/6",
              ].join(" ")}
            >
              <span className="text-2xl font-black text-fuchsia-300">
                O
              </span>

              <span className="ml-2 text-sm font-black text-white/70">
                Play as O
              </span>
            </button>
          </div>
        </div>

        {/* Restart */}

        <button
          onClick={() =>
            resetBoard()
          }
          className="mp-button w-full rounded-2xl bg-white py-4 text-sm font-black text-[#080b14] hover:bg-cyan-100"
        >
          {gameFinished
            ? "🎮 Play Again"
            : "↻ Restart Game"}
        </button>
      </div>

      {/* Daily Challenge Result */}

      {dailyChallengeCompleted &&
        isDailyChallengeGame && (
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-purple-300/15 bg-purple-300/4 p-4">
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="rounded-xl border border-purple-300/10 bg-purple-300/5 px-3 py-2 font-black text-purple-200/80">
                🎯 Daily Challenge Complete
              </span>

              <span className="rounded-xl border border-cyan-300/10 bg-cyan-300/5 px-3 py-2 font-black text-cyan-300">
                +50 XP
              </span>

              <span className="rounded-xl border border-white/6 bg-white/3 px-3 py-2 font-black text-white/40">
                +10 score
              </span>
            </div>
          </div>
        )}

      {/* Tip */}

      <div className="mp-card mx-auto mt-6 max-w-2xl rounded-2xl p-5">
        <div className="flex gap-3">
          <span className="text-xl">
            🧠
          </span>

          <div>
            <p className="text-sm font-black text-white/80">
              Strategy tip
            </p>

            <p className="mt-1 text-sm leading-6 text-white/35">
              Don't only think about your
              next move. Look for the move
              that gives you the best position
              on the next turn.
            </p>
          </div>
        </div>
      </div>

      {/* Daily Challenge Start Badge */}

      {isDailyChallengeGame &&
        !dailyChallengeCompleted &&
        !gameFinished && (
          <div className="mx-auto mt-4 flex w-fit flex-wrap items-center justify-center gap-2 rounded-full border border-purple-300/15 bg-purple-300/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-purple-200/70">
            🎯 Daily Challenge

            <span className="text-purple-200/40">
              •
            </span>

            +50 XP

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
      `}</style>
    </GameShell>
  );
}