'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GameDetailsModal } from './GameDetailsModal';
import { GameHistoryResult } from '@/models/stats';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface GameHistoryTableProps {
    games: GameHistoryResult[];
    isLoading?: boolean;
    itemsPerPage?: number;
    highlightPlayerId?: string;
}

const GameHistoryTable: FC<GameHistoryTableProps> = ({
    games,
    isLoading = false,
    itemsPerPage = 10,
    highlightPlayerId
}): React.ReactElement => {
    const router = useRouter();
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const totalPages = Math.ceil(games.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentGames = games.slice(startIndex, endIndex);

    const handlePrevPage = (): void => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    };

    const handleNextPage = (): void => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    };

    const handleGameClick = (gameId: string): void => {
        router.push(`/games/${gameId}`);
    };

    return (
        <div className="border-border bg-background/50 overflow-hidden rounded-xl border shadow backdrop-blur-sm">
            <table className="divide-border min-w-full divide-y">
                <thead>
                    <tr className="bg-background/80">
                        <th className="text-muted px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                            Date
                        </th>
                        <th className="text-muted px-6 py-4 text-center text-xs font-semibold tracking-wider uppercase">
                            Match
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-border divide-y">
                    {isLoading ? (
                        <tr>
                            <td colSpan={2} className="text-muted px-6 py-8 text-center text-sm">
                                Loading games...
                            </td>
                        </tr>
                    ) : currentGames.length > 0 ? (
                        currentGames.map((game: GameHistoryResult) => {
                            const [blueScore, orangeScore] = game.score.split('-').map(Number);
                            const winningScore = Math.max(blueScore, orangeScore);
                            const losingScore = Math.min(blueScore, orangeScore);

                            return (
                                <tr
                                    key={game.id}
                                    className="hover:bg-muted/10 cursor-pointer transition-colors"
                                    onClick={() => handleGameClick(game.id)}
                                >
                                    <td className="px-6 py-4">
                                        {format(new Date(game.date), 'MMM dd, yyyy h:mm a')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex w-full items-center">
                                            <div
                                                className="flex flex-wrap justify-end gap-1"
                                                style={{ minWidth: 180 }}
                                            >
                                                {game.winningTeam.map((player: string) => (
                                                    <span
                                                        key={player}
                                                        className={`rounded-full px-2 py-0.5 text-xs ${
                                                            highlightPlayerId &&
                                                            player === highlightPlayerId
                                                                ? 'bg-green-500/50 text-green-300'
                                                                : 'bg-green-900/50 text-green-400'
                                                        }`}
                                                    >
                                                        {player}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex min-w-[120px] flex-1 items-center justify-center">
                                                <span className="font-medium text-green-400">
                                                    {winningScore}
                                                </span>
                                                <span className="text-muted mx-2">-</span>
                                                <span className="font-medium text-red-400">
                                                    {losingScore}
                                                </span>
                                            </div>
                                            <div
                                                className="flex flex-wrap justify-start gap-1"
                                                style={{ minWidth: 180 }}
                                            >
                                                {game.losingTeam.map((player: string) => (
                                                    <span
                                                        key={player}
                                                        className={`rounded-full px-2 py-0.5 text-xs ${
                                                            highlightPlayerId &&
                                                            player === highlightPlayerId
                                                                ? 'bg-red-500/50 text-red-300'
                                                                : 'bg-red-900/50 text-red-400'
                                                        }`}
                                                    >
                                                        {player}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={2} className="text-muted px-6 py-8 text-center text-sm">
                                No games found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {!isLoading && games.length > 0 && (
                <div className="border-border flex items-center justify-between border-t px-6 py-4">
                    <div className="text-muted text-sm">
                        Showing {startIndex + 1} to {Math.min(endIndex, games.length)} of{' '}
                        {games.length} games
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="border-border bg-background/50 text-muted hover:border-muted hover:text-foreground flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="border-border bg-background/50 text-muted hover:border-muted hover:text-foreground flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all disabled:opacity-50"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
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
