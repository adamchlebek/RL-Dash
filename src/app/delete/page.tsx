'use client';

import { useEffect, useState } from 'react';
import { GameHistoryResult } from '@/models/stats';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function DeletePage(): React.ReactElement {
    const [games, setGames] = useState<GameHistoryResult[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [gameToDelete, setGameToDelete] = useState<GameHistoryResult | null>(null);
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchGames = async (): Promise<void> => {
            try {
                const response = await fetch('/api/stats/games');
                if (!response.ok) throw new Error('Failed to fetch games');
                const data = await response.json();
                setGames(data);
            } catch (error) {
                console.error('Error fetching games:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    const handleDelete = async (gameId: string): Promise<void> => {
        if (!password) {
            setError('Please enter a password');
            return;
        }
        try {
            const response = await fetch(`/api/game/${gameId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete game');
            }
            setGames(games.filter(game => game.id !== gameId));
            setGameToDelete(null);
            setPassword('');
            setError('');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete game');
        }
    };

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-4 text-2xl font-bold">Delete Games</h1>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {games.map((game) => (
                    <div key={game.id} className="flex flex-col rounded-lg border p-3">
                        <div className="mb-1 flex justify-between">
                            <span className="text-sm text-gray-500">{new Date(game.date).toLocaleDateString()}</span>
                            <span className="font-semibold">{game.score}</span>
                        </div>
                        <div className="mb-1 text-sm">
                            <span className="text-green-600">W: </span>
                            {game.winningTeam.join(', ')}
                        </div>
                        <div className="mb-1 text-sm">
                            <span className="text-red-600">L: </span>
                            {game.losingTeam.join(', ')}
                        </div>
                        <button
                            onClick={() => setGameToDelete(game)}
                            className="mt-1 cursor-pointer rounded bg-red-500 px-2 py-1 text-sm text-white hover:bg-red-600"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            <Dialog open={gameToDelete !== null} onOpenChange={() => setGameToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground">Are you sure you want to delete this game?</p>
                    {error && (
                        <div className="mb-2 rounded-lg bg-red-100 p-2 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError('');
                        }}
                        placeholder="Enter delete password"
                        className="mt-2 rounded-lg border p-2"
                    />
                    <div className="mt-4 flex justify-end gap-4">
                        <button
                            onClick={() => setGameToDelete(null)}
                            className="rounded-lg bg-zinc-700 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => gameToDelete && handleDelete(gameToDelete.id)}
                            className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
                        >
                            Delete
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 