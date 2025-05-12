'use client';

import { useState, useEffect } from 'react';
import { GameHistoryResult } from '@/models/stats';
import GameHistoryTable from '@/components/GameHistoryTable';

export default function GamesPage(): React.ReactElement {
    const [games, setGames] = useState<GameHistoryResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchGames = async (): Promise<void> => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/stats/games');
                if (!response.ok) throw new Error('Failed to fetch games');
                const data = await response.json();
                setGames(data);
            } catch (error) {
                console.error('Error fetching games:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGames();
    }, []);

    return (
        <div className="bg-background text-foreground min-h-screen p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <h1 className="mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                    Games
                </h1>

                <GameHistoryTable games={games} isLoading={isLoading} />
            </div>
        </div>
    );
}
