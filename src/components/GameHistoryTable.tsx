'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { GameHistory } from '../data/dummyData';
import { Calendar, Trophy, Users, Clock } from 'lucide-react';
import { GameDetailsModal } from './GameDetailsModal';

interface GameHistoryTableProps {
    games: GameHistory[];
}

const GameHistoryTable: FC<GameHistoryTableProps> = ({ games }): React.ReactNode => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
    const gamesPerPage = 10;
    const totalPages = Math.ceil(games.length / gamesPerPage);

    const currentGames = games.slice((currentPage - 1) * gamesPerPage, currentPage * gamesPerPage);

    return (
        <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-700 text-left">
                            <th className="pb-4 font-medium text-zinc-300">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Date</span>
                                </div>
                            </th>
                            <th className="pb-4 font-medium text-zinc-300">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Time</span>
                                </div>
                            </th>
                            <th className="pb-4 font-medium text-zinc-300">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4" />
                                    <span>Score</span>
                                </div>
                            </th>
                            <th className="pb-4 font-medium text-zinc-300">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Matchup</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentGames.map((game) => (
                            <tr
                                key={game.id}
                                onClick={() => setSelectedGameId(game.id)}
                                className="border-b border-zinc-700 transition-colors last:border-0 hover:bg-zinc-700/50 cursor-pointer"
                            >
                                <td className="px-4 py-4 text-zinc-300">
                                    {new Date(game.date).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-4 text-zinc-300">
                                    {new Date(game.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-4 py-4">
                                    <span className="font-mono text-zinc-300">
                                        {game.score}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        {[...game.winningTeam]
                                            .sort((a, b) => a.localeCompare(b))
                                            .map((player) => (
                                                <span
                                                    key={player}
                                                    className="rounded-full bg-green-900/50 px-3 py-1 text-green-400"
                                                >
                                                    {player}
                                                </span>
                                            ))}
                                        <span className="text-zinc-500">vs</span>
                                        {[...game.losingTeam]
                                            .sort((a, b) => a.localeCompare(b))
                                            .map((player) => (
                                                <span
                                                    key={player}
                                                    className="rounded-full bg-red-900/50 px-3 py-1 text-red-400"
                                                >
                                                    {player}
                                                </span>
                                            ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded bg-zinc-800 px-3 py-1 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded bg-zinc-800 px-3 py-1 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            <GameDetailsModal
                gameId={selectedGameId || ''}
                isOpen={!!selectedGameId}
                onClose={() => setSelectedGameId(null)}
            />
        </div>
    );
};

export default GameHistoryTable;
