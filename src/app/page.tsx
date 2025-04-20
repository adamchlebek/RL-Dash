'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatCard } from '../components/StatCard';
import { PlayerTable } from '../components/PlayerTable';
import GameHistoryTable from '../components/GameHistoryTable';
import { statIcons } from '../data/dummyData';
import { Trophy, User, Users, History, RefreshCw, Computer } from 'lucide-react';
import { Stats } from '../models/player';
import { GameHistory } from '../models/game';
import { useReplaySubscription } from '@/lib/useReplaySubscription';

type PlayerStatsType = {
    id: string;
    name: string;
    totalGoals: number;
    totalAssists: number;
    totalSaves: number;
    totalShots: number;
    totalDemos: number;
    totalScore: number;
    avgBoost: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
};

export default function Home(): React.ReactElement {
    const [stats, setStats] = useState<Stats | null>(null);
    const [playerStats, setPlayerStats] = useState<PlayerStatsType[]>([]);
    const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [isPlayerLoading, setPlayerLoading] = useState<boolean>(true);
    const [isGameHistoryLoading, setGameHistoryLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const fetchStats = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await fetch('/api/stats');

            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }

            const statsData = await response.json();
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPlayerStats = useCallback(async (): Promise<void> => {
        try {
            setPlayerLoading(true);
            const response = await fetch('/api/stats/players');

            if (!response.ok) {
                throw new Error('Failed to fetch player stats');
            }

            const playerData = await response.json();
            setPlayerStats(playerData);
        } catch (error) {
            console.error('Error fetching player stats:', error);
        } finally {
            setPlayerLoading(false);
        }
    }, []);

    const fetchGameHistory = useCallback(async (): Promise<void> => {
        try {
            setGameHistoryLoading(true);
            const response = await fetch('/api/stats/games');

            if (!response.ok) {
                throw new Error('Failed to fetch game history');
            }

            const historyData = await response.json();
            setGameHistory(historyData);
        } catch (error) {
            console.error('Error fetching game history:', error);
        } finally {
            setGameHistoryLoading(false);
        }
    }, []);

    const handleRefresh = useCallback(async (): Promise<void> => {
        setIsRefreshing(true);

        await Promise.all([fetchStats(), fetchPlayerStats(), fetchGameHistory()]);

        setIsRefreshing(false);
    }, [fetchStats, fetchPlayerStats, fetchGameHistory]);

    useReplaySubscription(handleRefresh);

    useEffect(() => {
        handleRefresh();
    }, [handleRefresh]);

    return (
        <div className="bg-background text-foreground min-h-screen p-8">
            <div className="mx-auto max-w-7xl space-y-12">
                <div className="flex items-center justify-between">
                    <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                        Stats
                    </h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="border-border bg-background/50 text-muted hover:border-muted hover:text-foreground flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all disabled:opacity-50"
                        >
                            <span>Total Games: {gameHistory?.length || 0}</span>
                            <RefreshCw
                                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                            />
                        </button>
                    </div>
                </div>

                {!isLoading && stats && (
                    <>
                        <div>
                            <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                                <Trophy className="h-6 w-6 text-yellow-400" />
                                Team Stats
                            </h2>
                            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <StatCard
                                    label="Best 3s Team"
                                    value={stats.best3sTeam.value}
                                    players={stats.best3sTeam.players}
                                    icon={<statIcons.best3sTeam className="h-6 w-6" />}
                                    isTeam
                                />
                                <StatCard
                                    label="Best 2s Team"
                                    value={stats.best2sTeam.value}
                                    players={stats.best2sTeam.players}
                                    icon={<statIcons.best2sTeam className="h-6 w-6" />}
                                    isTeam
                                />
                                <StatCard
                                    label="Worst 3s Team"
                                    value={stats.worst3sTeam.value}
                                    players={stats.worst3sTeam.players}
                                    icon={<statIcons.worst3sTeam className="h-6 w-6" />}
                                    isTeam
                                    isWorst
                                />
                                <StatCard
                                    label="Worst 2s Team"
                                    value={stats.worst2sTeam.value}
                                    players={stats.worst2sTeam.players}
                                    icon={<statIcons.worst2sTeam className="h-6 w-6" />}
                                    isTeam
                                    isWorst
                                />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                                <Computer className="h-6 w-6 text-yellow-400" />
                                Game Stats
                            </h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <StatCard
                                    label="Biggest Win Deficit"
                                    gameId={stats.biggestWinDeficit.gameId}
                                    value={stats.biggestWinDeficit.value}
                                    players={stats.biggestWinDeficit.players}
                                    winningTeam={stats.biggestWinDeficit.winningTeam}
                                    icon={<statIcons.biggestWinDeficit className="h-6 w-6" />}
                                    isMatchup
                                />
                                <StatCard
                                    label="Longest Game"
                                    gameId={stats.longestGame.gameId}
                                    value={stats.longestGame.value}
                                    players={stats.longestGame.players}
                                    winningTeam={stats.longestGame.winningTeam}
                                    icon={<statIcons.longestGame className="h-6 w-6" />}
                                    isMatchup
                                />
                                <StatCard
                                    label="Highest Scoring Game"
                                    gameId={stats.highestScoringGame.gameId}
                                    value={stats.highestScoringGame.value}
                                    players={stats.highestScoringGame.players}
                                    winningTeam={stats.highestScoringGame.winningTeam}
                                    icon={<statIcons.highestScoringGame className="h-6 w-6" />}
                                    isMatchup
                                />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                                <Users className="h-6 w-6 text-blue-400" />
                                Individual Achievements
                            </h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <StatCard
                                    label="Highest Points"
                                    gameId={stats.highestPoints.gameId}
                                    value={Number(stats.highestPoints.value).toLocaleString()}
                                    players={stats.highestPoints.players}
                                    icon={<statIcons.highestPoints className="h-6 w-6" />}
                                    color="yellow"
                                />
                                <StatCard
                                    label="Lowest Points"
                                    gameId={stats.lowestPoints.gameId}
                                    value={Number(stats.lowestPoints.value).toLocaleString()}
                                    players={stats.lowestPoints.players}
                                    icon={<statIcons.lowestPoints className="h-6 w-6" />}
                                    color="red"
                                />
                                <StatCard
                                    label="Most Demos (single game)"
                                    gameId={stats.mostDemos.gameId}
                                    value={Number(stats.mostDemos.value).toLocaleString()}
                                    players={stats.mostDemos.players}
                                    icon={<statIcons.mostDemos className="h-6 w-6" />}
                                    color="green"
                                />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                                <User className="h-6 w-6 text-blue-400" />
                                Player Stats
                            </h2>
                            {!isPlayerLoading ? (
                                <PlayerTable
                                    players={playerStats.map((player) => ({
                                        id: player.id,
                                        name: player.name,
                                        goals: player.totalGoals,
                                        assists: player.totalAssists,
                                        shots: player.totalShots,
                                        demos: player.totalDemos,
                                        gamesPlayed: player.gamesPlayed,
                                        wins: player.wins,
                                        losses: player.losses
                                    }))}
                                />
                            ) : (
                                <div className="border-border bg-background/50 rounded-xl border p-6 backdrop-blur-sm">
                                    <div className="text-muted py-8 text-center">
                                        Loading player statistics...
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                                <History className="h-6 w-6 text-blue-400" />
                                Game History
                            </h2>
                            {!isGameHistoryLoading ? (
                                <GameHistoryTable games={gameHistory} />
                            ) : (
                                <div className="border-border bg-background/50 rounded-xl border p-6 backdrop-blur-sm">
                                    <div className="text-muted py-8 text-center">
                                        Loading game history...
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
