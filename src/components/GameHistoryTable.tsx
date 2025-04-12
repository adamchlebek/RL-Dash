'use client'

import { useState } from 'react'
import { GameHistory } from '../data/dummyData'
import { Crown } from 'lucide-react'

interface GameHistoryTableProps {
  games: GameHistory[]
}

export default function GameHistoryTable({ games }: GameHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const gamesPerPage = 10
  const totalPages = Math.ceil(games.length / gamesPerPage)

  const currentGames = games.slice(
    (currentPage - 1) * gamesPerPage,
    currentPage * gamesPerPage
  )

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-zinc-700">
              <th className="pb-4 font-medium text-zinc-300">Date</th>
              <th className="pb-4 font-medium text-zinc-300">Score</th>
              <th className="pb-4 font-medium text-zinc-300">Matchup</th>
            </tr>
          </thead>
          <tbody>
            {currentGames.map((game, index) => (
              <tr key={index} className="border-b border-zinc-700 last:border-0 hover:bg-zinc-700/50 transition-colors">
                <td className="py-4">
                  {new Date(game.date).toLocaleDateString()}
                </td>
                <td className="py-4 font-mono">{game.score}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        {game.winningTeam.map((player) => (
                          <span key={player} className="flex items-center gap-1 bg-green-900/50 px-2 py-1 rounded-full text-sm">
                            <Crown className="w-3 h-3" />
                            {player}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-zinc-500">vs</span>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        {game.losingTeam.map((player) => (
                          <span key={player} className="bg-red-900/50 px-2 py-1 rounded-full text-sm">
                            {player}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-zinc-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
} 