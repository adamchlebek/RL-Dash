import React, { useEffect, useState } from 'react';

interface PlayerPosition {
    name: string;
    behindBallPercent: number;
    lastBackPercent: number;
    closestToBallPercent: number;
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
        return <div className="text-muted text-center py-8">Loading...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {players.map(player => (
                <div key={player.name} className="bg-black/40 backdrop-blur-sm rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <h3 className="text-xl font-bold text-orange-400">{player.name}</h3>
                    </div>

                    <div className="relative h-[200px] w-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg overflow-hidden">
                            {/* Field Lines */}
                            <div className="absolute inset-0">
                                {/* Center Line */}
                                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-600/30" />
                                {/* Center Circle */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-gray-600/30 rounded-full" />
                                {/* Third Lines */}
                                <div className="absolute top-0 bottom-0 left-1/3 w-px bg-gray-600/30" />
                                <div className="absolute top-0 bottom-0 left-2/3 w-px bg-gray-600/30" />
                            </div>

                            {/* Goals */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-16 w-4 bg-blue-500/20 rounded-r-lg" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-16 w-4 bg-orange-500/20 rounded-l-lg" />

                            {/* Positioning Zones */}
                            <div className="absolute inset-0 grid grid-cols-3 gap-px">
                                <div className="relative bg-orange-500/40">
                                    <div className="absolute inset-x-0 top-1/4 flex items-center justify-center">
                                        <div className="bg-black/60 px-2 py-0.5 rounded-full">
                                            <span className="text-orange-400 font-mono text-xs">
                                                {player.behindBallPercent}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative bg-orange-400/35">
                                    <div className="absolute inset-x-0 top-1/4 flex items-center justify-center">
                                        <div className="bg-black/60 px-2 py-0.5 rounded-full">
                                            <span className="text-orange-400 font-mono text-xs">
                                                {player.lastBackPercent}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative bg-orange-300/30">
                                    <div className="absolute inset-x-0 top-1/4 flex items-center justify-center">
                                        <div className="bg-black/60 px-2 py-0.5 rounded-full">
                                            <span className="text-orange-400 font-mono text-xs">
                                                {player.closestToBallPercent}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Player Position Indicator */}
                            <div 
                                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-500"
                                style={{ 
                                    left: `${(100 - player.behindBallPercent)}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
} 