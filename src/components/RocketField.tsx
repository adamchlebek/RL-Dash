import React, { useEffect, useState } from 'react';

interface PlayerPosition {
    name: string;
    defensiveThirdPercent: number;
    neutralThirdPercent: number;
    offensiveThirdPercent: number;
    avgDistanceToBall: number;
    avgSpeed: number;
    timeSupersonic: number;
}

export function RocketField(): React.ReactElement {
    const [players, setPlayers] = useState<PlayerPosition[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await fetch('/api/positioning');
                if (!response.ok) throw new Error('Failed to fetch players');
                const data = await response.json();
                setPlayers(data);
            } catch (error) {
                console.error('Error fetching players:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlayers();
    }, []);

    if (isLoading) {
        return <div className="text-muted py-8 text-center">Loading...</div>;
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => (
                <div key={player.name} className="rounded-xl bg-black/40 p-6 backdrop-blur-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <h3 className="text-xl font-bold text-orange-400">{player.name}</h3>
                    </div>

                    <div className="relative h-[200px] w-full">
                        <div className="absolute inset-0 overflow-hidden rounded-lg bg-gradient-to-r from-gray-900 to-gray-800">
                            {/* Field Lines */}
                            <div className="absolute inset-0">
                                {/* Center Line */}
                                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-600/30" />
                                {/* Center Circle */}
                                <div className="absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gray-600/30" />
                                {/* Third Lines */}
                                <div className="absolute top-0 bottom-0 left-1/3 w-px bg-gray-600/30" />
                                <div className="absolute top-0 bottom-0 left-2/3 w-px bg-gray-600/30" />
                            </div>

                            {/* Goals */}
                            <div className="absolute top-1/2 left-0 h-16 w-4 -translate-y-1/2 rounded-r-lg bg-blue-500/20" />
                            <div className="absolute top-1/2 right-0 h-16 w-4 -translate-y-1/2 rounded-l-lg bg-orange-500/20" />

                            {/* Positioning Zones */}
                            <div className="absolute inset-0 grid grid-cols-3 gap-px">
                                <div className="relative bg-blue-500/40">
                                    <div className="absolute inset-x-0 top-1/4 flex items-center justify-center">
                                        <div className="rounded-full bg-black/60 px-2 py-0.5">
                                            <span className="font-mono text-xs text-blue-400">
                                                {player.defensiveThirdPercent}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-2 flex items-center justify-center">
                                        <span className="text-xs font-medium text-blue-300">Defensive</span>
                                    </div>
                                </div>
                                <div className="relative bg-yellow-500/40">
                                    <div className="absolute inset-x-0 top-1/4 flex items-center justify-center">
                                        <div className="rounded-full bg-black/60 px-2 py-0.5">
                                            <span className="font-mono text-xs text-yellow-400">
                                                {player.neutralThirdPercent}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-2 flex items-center justify-center">
                                        <span className="text-xs font-medium text-yellow-300">Neutral</span>
                                    </div>
                                </div>
                                <div className="relative bg-red-500/40">
                                    <div className="absolute inset-x-0 top-1/4 flex items-center justify-center">
                                        <div className="rounded-full bg-black/60 px-2 py-0.5">
                                            <span className="font-mono text-xs text-red-400">
                                                {player.offensiveThirdPercent}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-2 flex items-center justify-center">
                                        <span className="text-xs font-medium text-red-300">Offensive</span>
                                    </div>
                                </div>
                            </div>

                            {/* Player Position Indicator */}
                            <div
                                className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-500"
                                style={{
                                    left: `${(player.defensiveThirdPercent * 16.5 + player.neutralThirdPercent * 50 + player.offensiveThirdPercent * 83.5) / 100}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
