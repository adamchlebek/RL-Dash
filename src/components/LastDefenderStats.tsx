import React, { useState, useEffect } from 'react';

interface PlayerLastDefenderStats {
    name: string;
    totalGoalsConceded: number;
    goalsAsLastDefender: number;
}

export function LastDefenderStats(): React.ReactElement {
    const [players, setPlayers] = useState<PlayerLastDefenderStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/stats/last-defender');
                const data = await response.json();
                setPlayers(data);
            } catch (error) {
                console.error('Error fetching last defender stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="group relative">
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-900/20 to-red-800/20" />
                        <div className="relative p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="h-6 w-32 animate-pulse rounded bg-red-400/20" />
                                <div className="h-12 w-12 animate-pulse rounded-full bg-red-400/20" />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <div className="h-4 w-24 animate-pulse rounded bg-red-400/20" />
                                    <div className="h-4 w-8 animate-pulse rounded bg-red-400/20" />
                                </div>

                                <div className="flex justify-between">
                                    <div className="h-4 w-32 animate-pulse rounded bg-red-400/20" />
                                    <div className="h-4 w-8 animate-pulse rounded bg-red-400/20" />
                                </div>

                                <div className="space-y-2">
                                    <div className="h-2 overflow-hidden rounded-full bg-red-900/20">
                                        <div className="h-full w-1/2 animate-pulse rounded-full bg-red-400/20" />
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <div className="h-8 w-8 animate-pulse rounded-full bg-red-400/20" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {players.map((player) => {
                const percentage =
                    player.totalGoalsConceded > 0
                        ? (player.goalsAsLastDefender / player.totalGoalsConceded) * 100
                        : 0;

                return (
                    <div key={player.name} className="group relative">
                        <div className="absolute inset-0 transform rounded-lg bg-gradient-to-br from-red-900/20 to-red-800/20 transition-all duration-300 group-hover:scale-105" />
                        <div className="relative p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-red-400">
                                    {player.name}
                                </h3>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-400/20">
                                    <span className="text-lg font-bold text-red-400">
                                        {percentage.toFixed(0)}%
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Goals Conceded</span>
                                    <span className="font-medium text-red-400">
                                        {player.totalGoalsConceded}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Goals as Last Defender
                                    </span>
                                    <span className="font-medium text-red-400">
                                        {player.goalsAsLastDefender}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="h-2 overflow-hidden rounded-full bg-red-900/20">
                                        <div
                                            className="h-full rounded-full bg-red-400 transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-400/30">
                                        <div
                                            className="h-6 w-6 rounded-full border-2 border-red-400"
                                            style={{
                                                background: `conic-gradient(from 0deg, red ${percentage}%, transparent ${percentage}%)`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
