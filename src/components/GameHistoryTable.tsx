'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { Calendar, Trophy, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { GameDetailsModal } from './GameDetailsModal';
import { GameHistoryResult } from '@/models/stats';

interface GameHistoryTableProps {
    games: GameHistoryResult[];
    highlightPlayerId?: string;
}

const ITEMS_PER_PAGE = 10;

const GameHistoryTable: FC<GameHistoryTableProps> = ({ games }): React.ReactElement => {
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const totalPages = Math.ceil(games.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentGames = games.slice(startIndex, endIndex);

    const handlePrevPage = (): void => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    };

    const handleNextPage = (): void => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    };

    return (
        <div className="rounded-xl border border-border bg-background/50 p-6 backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border text-left">
                            <th className="pb-4 font-medium text-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Date</span>
                                </div>
                            </th>
                            <th className="pb-4 font-medium text-foreground">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Time</span>
                                </div>
                            </th>
                            <th className="pb-4 font-medium text-foreground">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4" />
                                    <span>Score</span>
                                </div>
                            </th>
                            <th className="pb-4 font-medium text-foreground">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Players</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentGames.map((game) => {
                            const date = new Date(game.date);
                            const formattedDate = date.toLocaleDateString();
                            const formattedTime = date.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            });

                            return (
                                <tr
                                    key={game.id}
                                    className="cursor-pointer border-b border-border transition-colors hover:bg-background/70"
                                    onClick={() => setSelectedGameId(game.id)}
                                >
                                    <td className="px-4 py-4">{formattedDate}</td>
                                    <td className="px-4 py-4">{formattedTime}</td>
                                    <td className="px-4 py-4">
                                        <span className="text-green-400">{game.score.split('-')[0]}</span>
                                        <span className="mx-1 text-muted">-</span>
                                        <span className="text-red-400">{game.score.split('-')[1]}</span>
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
                                            <span className="text-muted">vs</span>
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
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-muted hover:text-foreground disabled:opacity-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </button>
                    <span className="text-sm text-muted">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-muted hover:text-foreground disabled:opacity-50"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {selectedGameId && (
                <GameDetailsModal
                    gameId={selectedGameId}
                    isOpen={!!selectedGameId}
                    onClose={() => setSelectedGameId(null)}
                />
            )}
        </div>
    );
};

export default GameHistoryTable;
