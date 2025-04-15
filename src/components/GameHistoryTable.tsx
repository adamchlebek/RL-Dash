"use client";

import { useState } from "react";
import type { FC } from "react";
import { GameHistory } from "../data/dummyData";
import { Calendar, Trophy, Users } from "lucide-react";
import Link from "next/link";

interface GameHistoryTableProps {
  games: GameHistory[];
}

const GameHistoryTable: FC<GameHistoryTableProps> = ({ games }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 10;
  const totalPages = Math.ceil(games.length / gamesPerPage);

  const currentGames = games.slice(
    (currentPage - 1) * gamesPerPage,
    currentPage * gamesPerPage,
  );

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-zinc-700">
              <th className="pb-4 font-medium text-zinc-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Date</span>
                </div>
              </th>
              <th className="pb-4 font-medium text-zinc-300">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>Score</span>
                </div>
              </th>
              <th className="pb-4 font-medium text-zinc-300">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Matchup</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentGames.map((game) => (
              <tr
                key={game.id}
                className="border-b border-zinc-700 last:border-0 hover:bg-zinc-700/50 transition-colors"
              >
                <td className="py-4 px-4 text-zinc-300">
                  {new Date(game.date).toLocaleDateString()}
                </td>
                <td className="py-4 px-4">
                  <Link href={`/game/${game.id}`} className="block">
                    <span className="font-mono text-zinc-300">
                      {game.score}
                    </span>
                  </Link>
                </td>
                <td className="py-4 px-4">
                  <Link href={`/game/${game.id}`} className="block">
                    <div className="flex items-center gap-2">
                      {game.winningTeam.map((player) => (
                        <span
                          key={player}
                          className="bg-green-900/50 px-3 py-1 rounded-full text-green-400"
                        >
                          {player}
                        </span>
                      ))}
                      <span className="text-zinc-500">vs</span>
                      {game.losingTeam.map((player) => (
                        <span
                          key={player}
                          className="bg-red-900/50 px-3 py-1 rounded-full text-red-400"
                        >
                          {player}
                        </span>
                      ))}
                    </div>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default GameHistoryTable;
