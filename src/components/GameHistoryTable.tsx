'use client'

import { useState } from 'react'
import { Game } from '../models/game'
import { Crown } from 'lucide-react'
import Link from 'next/link'

type GameHistoryTableProps = {
  games: Game[]
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
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-400">
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-center py-3 px-4">Score</th>
              <th className="text-left py-3 px-4">Matchup</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {currentGames.map((game) => (
              <tr key={game.id} className="hover:bg-zinc-800/50">
                <td className="py-3 px-4">
                  <Link href={`/game/${game.id}`} className="hover:text-blue-400">
                    {new Date(game.date).toLocaleDateString()}
                  </Link>
                </td>
                <td className="py-3 px-4 text-center font-mono">{game.score}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {game.winner === 1 && <Crown className="w-3 h-3 text-yellow-400" />}
                      <div className="flex gap-1">
                        {game.team1.players.map((player) => (
                          <span key={player} className="bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-300 text-xs">
                            {player}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-zinc-500">vs</span>
                    <div className="flex items-center gap-1">
                      {game.winner === 2 && <Crown className="w-3 h-3 text-yellow-400" />}
                      <div className="flex gap-1">
                        {game.team2.players.map((player) => (
                          <span key={player} className="bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-300 text-xs">
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
        <div className="flex justify-center gap-2">
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