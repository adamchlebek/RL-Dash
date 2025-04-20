'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { Calendar, Trophy, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
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
        <div className="border-border bg-background/50 rounded-xl border p-6 backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-border border-b text-left">
                            <th className="text-foreground pb-4 font-medium">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Date</span>
                                </div>
                            </th>
                            <th className="text-foreground pb-4 font-medium">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Time</span>
                                </div>
                            </th>
                            <th className="text-foreground pb-4 text-center font-medium">
                                <div className="flex items-center justify-center gap-2">
                                    <Trophy className="h-4 w-4" />
                                    <span>Match Result</span>
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
                                    className="border-border hover:bg-background/70 cursor-pointer border-b transition-colors"
                                    onClick={() => setSelectedGameId(game.id)}
                                >
                                    <td className="px-4 py-4">{formattedDate}</td>
                                    <td className="px-4 py-4">{formattedTime}</td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="bg-background/80 inline-flex items-center gap-2 rounded-lg p-2 shadow-sm">
                                            <div className="flex min-w-[100px] flex-col items-center">
                                                <span className="text-lg font-bold text-green-400">
                                                    {Math.max(
                                                        Number(game.score.split('-')[0]),
                                                        Number(game.score.split('-')[1])
                                                    )}
                                                </span>
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {[...game.winningTeam]
                                                        .sort((a, b) => a.localeCompare(b))
                                                        .map((player) => (
                                                            <span
                                                                key={player}
                                                                className="rounded-full bg-green-900/50 px-2 py-0.5 text-xs text-green-400"
                                                            >
                                                                {player}
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-muted text-sm">vs</span>
                                                <div className="bg-border mx-2 h-full w-[1px]" />
                                            </div>
                                            <div className="flex min-w-[100px] flex-col items-center">
                                                <span className="text-lg font-bold text-red-400">
                                                    {Math.min(
                                                        Number(game.score.split('-')[0]),
                                                        Number(game.score.split('-')[1])
                                                    )}
                                                </span>
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {[...game.losingTeam]
                                                        .sort((a, b) => a.localeCompare(b))
                                                        .map((player) => (
                                                            <span
                                                                key={player}
                                                                className="rounded-full bg-red-900/50 px-2 py-0.5 text-xs text-red-400"
                                                            >
                                                                {player}
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="border-border mt-4 flex items-center justify-between pt-4">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="border-border text-muted hover:border-muted hover:text-foreground flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </button>
                    <span className="text-muted text-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="border-border text-muted hover:border-muted hover:text-foreground flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-50"
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
