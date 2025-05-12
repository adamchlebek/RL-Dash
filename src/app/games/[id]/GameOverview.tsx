import React from 'react';
import { getGameDetails } from '@/lib/gameDetails';
import { useEffect, useState } from 'react';
import { APICache } from '@/lib/cache';

type Props = {
    gameId: string;
};

type GameHistoryItem = {
    id: string;
    date: string;
    score: string;
    winningTeam: string[];
    losingTeam: string[];
};

export default function GameOverview({ gameId }: Props) {
    const [gameDetails, setGameDetails] = useState<Awaited<
        ReturnType<typeof getGameDetails>
    > | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [, setGameHistory] = useState<GameHistoryItem[]>([]);

    useEffect(() => {
        async function fetchGameDetails() {
            try {
                // Check cache first
                const cachedData = APICache.get<Awaited<ReturnType<typeof getGameDetails>>>(
                    `game-${gameId}`
                );
                if (cachedData) {
                    setGameDetails(cachedData);
                    setLoading(false);
                    return;
                }

                // Fetch from API if not in cache
                const response = await fetch(`/api/game/${gameId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch game details');
                }
                const details = await response.json();

                // Cache the response
                APICache.set(`game-${gameId}`, details);
                setGameDetails(details);
            } catch (error) {
                console.error('Failed to load game details:', error);
            } finally {
                setLoading(false);
            }
        }

        async function fetchGameHistory() {
            try {
                // Check cache first
                const cachedHistory = APICache.get<GameHistoryItem[]>('game-history');
                if (cachedHistory) {
                    setGameHistory(cachedHistory);
                    return;
                }

                // Fetch from API if not in cache
                const response = await fetch('/api/games');
                if (!response.ok) {
                    throw new Error('Failed to fetch game history');
                }
                const history = await response.json();

                // Cache the response
                APICache.set('game-history', history);
                setGameHistory(history);
            } catch (error) {
                console.error('Failed to load game history:', error);
            }
        }

        fetchGameDetails();
        fetchGameHistory();
    }, [gameId]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!gameDetails) {
        return <div className="py-8 text-center text-zinc-400">Failed to load game details</div>;
    }

    const formatTime = (seconds: number): string => {
        return `${Math.floor(seconds)}s`;
    };

    const formatPercentage = (value: number): string => {
        return `${Math.round(value * 100)}%`;
    };

    const formatDistance = (miles: number): string => {
        return `${miles.toFixed(1)} mi`;
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <h3 className="mb-2 text-lg font-semibold">Game Info</h3>
                        <div className="space-y-1 text-sm">
                            <p>File Name: {gameDetails.fileName}</p>
                            <p>Map: {gameDetails.map}</p>
                            <p>Duration: {gameDetails.duration}</p>
                            <p>
                                Team Size: {gameDetails.teamSize}v{gameDetails.teamSize}
                            </p>
                            {gameDetails.overtime && (
                                <p>Overtime: {formatTime(gameDetails.overtimeSeconds)}</p>
                            )}
                        </div>
                    </div>

                    <div className="col-span-2">
                        <h3 className="mb-2 text-lg font-semibold">Score Overview</h3>
                        <div className="flex items-center justify-between">
                            <div className="text-blue-400">
                                <p className="text-2xl font-bold">{gameDetails.teams.blue.goals}</p>
                                <p className="text-sm">Blue Team</p>
                            </div>
                            <div className="font-mono text-4xl">vs</div>
                            <div className="text-orange-400">
                                <p className="text-2xl font-bold">
                                    {gameDetails.teams.orange.goals}
                                </p>
                                <p className="text-sm">Orange Team</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {['blue', 'orange'].map((team) => {
                const teamData = gameDetails.teams[team as keyof typeof gameDetails.teams];
                const isBlue = team === 'blue';
                const bgColor = isBlue ? 'bg-blue-900/20' : 'bg-orange-900/20';
                const textColor = isBlue ? 'text-blue-400' : 'text-orange-400';

                return (
                    <div
                        key={team}
                        className={`${bgColor} rounded-xl border border-zinc-700/50 p-6 backdrop-blur-sm`}
                    >
                        <h3 className={`text-xl font-bold ${textColor} mb-4`}>
                            {isBlue ? 'Blue Team' : 'Orange Team'} Stats
                        </h3>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div>
                                <h4 className="mb-3 text-lg font-semibold">Team Overview</h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-2xl font-bold">{teamData.goals}</p>
                                        <p className="text-sm text-zinc-400">Goals</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{teamData.shots}</p>
                                        <p className="text-sm text-zinc-400">Shots</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {formatPercentage(teamData.shootingPercentage)}
                                        </p>
                                        <p className="text-sm text-zinc-400">Shooting %</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{teamData.saves}</p>
                                        <p className="text-sm text-zinc-400">Saves</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{teamData.assists}</p>
                                        <p className="text-sm text-zinc-400">Assists</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {formatPercentage(teamData.possession)}
                                        </p>
                                        <p className="text-sm text-zinc-400">Possession</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-3 text-lg font-semibold">Advanced Stats</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h5 className="mb-2 font-medium">Boost</h5>
                                        <div className="space-y-1 text-sm">
                                            <p>BPM: {Math.round(teamData.stats.boost.bpm)}</p>
                                            <p>Collected: {teamData.stats.boost.amountCollected}</p>
                                            <p>Stolen: {teamData.stats.boost.amountStolen}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="mb-2 font-medium">Movement & Demos</h5>
                                        <div className="space-y-1 text-sm">
                                            <p>
                                                Distance:{' '}
                                                {formatDistance(
                                                    teamData.stats.movement.totalDistance
                                                )}
                                            </p>
                                            <p>
                                                Supersonic Time:{' '}
                                                {formatTime(teamData.stats.movement.timeSupersonic)}
                                            </p>
                                            <p>Demos: {teamData.stats.demos.inflicted}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                <h4 className="mb-3 text-lg font-semibold">Players</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-zinc-700 text-left">
                                                <th className="pb-2 font-medium text-zinc-300">
                                                    Player
                                                </th>
                                                <th className="pb-2 font-medium text-zinc-300">
                                                    Score
                                                </th>
                                                <th className="pb-2 font-medium text-zinc-300">
                                                    Goals
                                                </th>
                                                <th className="pb-2 font-medium text-zinc-300">
                                                    Assists
                                                </th>
                                                <th className="pb-2 font-medium text-zinc-300">
                                                    Saves
                                                </th>
                                                <th className="pb-2 font-medium text-zinc-300">
                                                    Shots
                                                </th>
                                                <th className="pb-2 font-medium text-zinc-300">
                                                    Demos
                                                </th>
                                                <th className="pb-2 font-medium text-zinc-300">
                                                    Boost
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teamData.players.map((player) => (
                                                <tr
                                                    key={player.name}
                                                    className="border-b border-zinc-700/50"
                                                >
                                                    <td className="py-2">
                                                        <div className="flex items-center gap-2">
                                                            {player.name}
                                                            {player.mvp && (
                                                                <span className="text-xs text-yellow-500">
                                                                    MVP
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-2">{player.score}</td>
                                                    <td className="py-2">{player.goals}</td>
                                                    <td className="py-2">{player.assists}</td>
                                                    <td className="py-2">{player.saves}</td>
                                                    <td className="py-2">{player.shots}</td>
                                                    <td className="py-2">
                                                        {player.stats.demos.inflicted}
                                                    </td>
                                                    <td className="py-2">
                                                        {Math.round(player.stats.boost.bpm)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
