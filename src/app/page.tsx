'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatCard } from '../components/StatCard';
import { PlayerTable } from '../components/PlayerTable';
import { statIcons } from '../data/dummyData';
import { Trophy, User, Users, RefreshCw, Computer, MapPin, Shield, Building2, Bomb } from 'lucide-react';
import { useReplaySubscription } from '@/lib/useReplaySubscription';
import { StatsGrid } from '@/components/StatsGrid';
import { PositioningTable } from '@/components/PositioningTable';
import { RocketField } from '@/components/RocketField';
import { LastDefenderStats } from '@/components/LastDefenderStats';
import { GameStatsBadges } from '@/components/GameStatsBadges';
import { DemoStats } from '@/components/DemoStats';
import { StatValue } from '@/models/stats';

type TeamStats = {
    best3sTeam: StatValue;
    best2sTeam: StatValue;
    worst3sTeam: StatValue;
    worst2sTeam: StatValue;
};

type GameStats = {
    biggestWinDeficit: StatValue;
    longestGame: StatValue;
    highestScoringGame: StatValue;
    mostGoalsInGame: StatValue;
    mostAssistsInGame: StatValue;
    mostSavesInGame: StatValue;
    mostShotsInGame: StatValue;
};

type Achievements = {
    highestPoints: StatValue;
    lowestPoints: StatValue;
    mostDemos: StatValue;
    mostForfeits: StatValue;
    longestWinStreak: StatValue;
    longestLossStreak: StatValue;
};

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
    avgPointsPerGame: number;
    currentStreak: number;
    isWinningStreak: boolean;
    nukes: number;
};

export default function Home(): React.ReactElement {
    const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
    const [gameStats, setGameStats] = useState<GameStats | null>(null);
    const [achievements, setAchievements] = useState<Achievements | null>(null);
    const [playerStats, setPlayerStats] = useState<PlayerStatsType[]>([]);
    const [isTeamLoading, setTeamLoading] = useState<boolean>(true);
    const [isGameLoading, setGameLoading] = useState<boolean>(true);
    const [isAchievementsLoading, setAchievementsLoading] = useState<boolean>(true);
    const [isPlayerLoading, setPlayerLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const fetchTeamStats = useCallback(async (): Promise<void> => {
        try {
            setTeamLoading(true);
            const response = await fetch('/api/stats/team');
            if (!response.ok) throw new Error('Failed to fetch team stats');
            const data = await response.json();
            setTeamStats(data);
        } catch (error) {
            console.error('Error fetching team stats:', error);
        } finally {
            setTeamLoading(false);
        }
    }, []);

    const fetchGameStats = useCallback(async (): Promise<void> => {
        try {
            setGameLoading(true);
            const response = await fetch('/api/stats/game');
            if (!response.ok) throw new Error('Failed to fetch game stats');
            const data = await response.json();
            setGameStats(data);
        } catch (error) {
            console.error('Error fetching game stats:', error);
        } finally {
            setGameLoading(false);
        }
    }, []);

    const fetchAchievements = useCallback(async (): Promise<void> => {
        try {
            setAchievementsLoading(true);
            const response = await fetch('/api/stats/achievements');
            if (!response.ok) throw new Error('Failed to fetch achievements');
            const data = await response.json();
            setAchievements(data);
        } catch (error) {
            console.error('Error fetching achievements:', error);
        } finally {
            setAchievementsLoading(false);
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

    const handleRefresh = useCallback(async (): Promise<void> => {
        setIsRefreshing(true);
        await Promise.all([
            fetchTeamStats(),
            fetchGameStats(),
            fetchAchievements(),
            fetchPlayerStats()
        ]);
        setIsRefreshing(false);
    }, [fetchTeamStats, fetchGameStats, fetchAchievements, fetchPlayerStats]);

    useReplaySubscription(handleRefresh);

    useEffect(() => {
        handleRefresh();
    }, [handleRefresh]);

    return (
        <div className="bg-background text-foreground min-h-screen p-8">
            <div className="mx-auto max-w-[90rem] space-y-12">
                <div className="flex items-center justify-between">
                    <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                        Stats
                    </h1>
                    <div className="flex items-center gap-4">
                        {/* <TeamSizeFilter /> */}
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="border-border bg-background/50 text-muted hover:border-muted hover:text-foreground flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                            />
                        </button>
                    </div>
                </div>

                <div>
                    <div className="-mt-2 mb-4">
                        <GameStatsBadges />
                    </div>
                    <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                        <Trophy className="h-6 w-6 text-yellow-400" />
                        Team Stats
                    </h2>
                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label="Best 3s Team"
                            value={teamStats?.best3sTeam.value || ''}
                            players={teamStats?.best3sTeam.players || []}
                            icon={<statIcons.best3sTeam className="h-6 w-6" />}
                            isTeam
                            isLoading={isTeamLoading}
                        />
                        <StatCard
                            label="Best 2s Team"
                            value={teamStats?.best2sTeam.value || ''}
                            players={teamStats?.best2sTeam.players || []}
                            icon={<statIcons.best2sTeam className="h-6 w-6" />}
                            isTeam
                            isLoading={isTeamLoading}
                        />
                        <StatCard
                            label="Worst 3s Team"
                            value={teamStats?.worst3sTeam.value || ''}
                            players={teamStats?.worst3sTeam.players || []}
                            icon={<statIcons.worst3sTeam className="h-6 w-6" />}
                            isTeam
                            isWorst
                            isLoading={isTeamLoading}
                        />
                        <StatCard
                            label="Worst 2s Team"
                            value={teamStats?.worst2sTeam.value || ''}
                            players={teamStats?.worst2sTeam.players || []}
                            icon={<statIcons.worst2sTeam className="h-6 w-6" />}
                            isTeam
                            isWorst
                            isLoading={isTeamLoading}
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
                            gameId={gameStats?.biggestWinDeficit.gameId}
                            value={gameStats?.biggestWinDeficit.value || ''}
                            players={gameStats?.biggestWinDeficit.players || []}
                            winningTeam={gameStats?.biggestWinDeficit.winningTeam}
                            icon={<statIcons.biggestWinDeficit className="h-6 w-6" />}
                            isMatchup
                            isLoading={isGameLoading}
                        />
                        <StatCard
                            label="Longest Game"
                            gameId={gameStats?.longestGame.gameId}
                            value={gameStats?.longestGame.value || ''}
                            players={gameStats?.longestGame.players || []}
                            winningTeam={gameStats?.longestGame.winningTeam}
                            icon={<statIcons.longestGame className="h-6 w-6" />}
                            isMatchup
                            isLoading={isGameLoading}
                        />
                        <StatCard
                            label="Highest Scoring Game"
                            gameId={gameStats?.highestScoringGame.gameId}
                            value={gameStats?.highestScoringGame.value || ''}
                            players={gameStats?.highestScoringGame.players || []}
                            winningTeam={gameStats?.highestScoringGame.winningTeam}
                            icon={<statIcons.highestScoringGame className="h-6 w-6" />}
                            isMatchup
                            isLoading={isGameLoading}
                        />
                    </div>
                </div>

                <div>
                    <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                        <Building2 className="h-6 w-6 text-blue-400" />
                        Individual Game Stats
                    </h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                            label="Most Goals in a Game"
                            gameId={gameStats?.mostGoalsInGame.gameId}
                            value={Number(gameStats?.mostGoalsInGame.value || 0).toLocaleString()}
                            players={gameStats?.mostGoalsInGame.players || []}
                            icon={<statIcons.mostGoals className="h-6 w-6" />}
                            color="yellow"
                            isLoading={isGameLoading}
                        />
                        <StatCard
                            label="Most Assists in a Game"
                            gameId={gameStats?.mostAssistsInGame.gameId}
                            value={Number(gameStats?.mostAssistsInGame.value || 0).toLocaleString()}
                            players={gameStats?.mostAssistsInGame.players || []}
                            icon={<statIcons.mostAssists className="h-6 w-6" />}
                            color="yellow"
                            isLoading={isGameLoading}
                        />
                        <StatCard
                            label="Most Saves in a Game"
                            gameId={gameStats?.mostSavesInGame.gameId}
                            value={Number(gameStats?.mostSavesInGame.value || 0).toLocaleString()}
                            players={gameStats?.mostSavesInGame.players || []}
                            icon={<statIcons.mostSaves className="h-6 w-6" />}
                            color="yellow"
                            isLoading={isGameLoading}
                        />
                        <StatCard
                            label="Most Shots in a Game"
                            gameId={gameStats?.mostShotsInGame.gameId}
                            value={Number(gameStats?.mostShotsInGame.value || 0).toLocaleString()}
                            players={gameStats?.mostShotsInGame.players || []}
                            icon={<statIcons.mostShots className="h-6 w-6" />}
                            color="yellow"
                            isLoading={isGameLoading}
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
                            gameId={achievements?.highestPoints.gameId}
                            value={Number(achievements?.highestPoints.value || 0).toLocaleString()}
                            players={achievements?.highestPoints.players || []}
                            icon={<statIcons.highestPoints className="h-6 w-6" />}
                            color="yellow"
                            isLoading={isAchievementsLoading}
                        />
                        <StatCard
                            label="Lowest Points"
                            gameId={achievements?.lowestPoints.gameId}
                            value={Number(achievements?.lowestPoints.value || 0).toLocaleString()}
                            players={achievements?.lowestPoints.players || []}
                            icon={<statIcons.lowestPoints className="h-6 w-6" />}
                            color="pink"
                            isLoading={isAchievementsLoading}
                        />
                        <StatCard
                            label="Most Demos (single game)"
                            gameId={achievements?.mostDemos.gameId}
                            value={Number(achievements?.mostDemos.value || 0).toLocaleString()}
                            players={achievements?.mostDemos.players || []}
                            icon={<statIcons.mostDemos className="h-6 w-6" />}
                            color="orange"
                            isLoading={isAchievementsLoading}
                        />
                        <StatCard
                            label="Longest Win Streak"
                            value={Number(
                                achievements?.longestWinStreak.value || 0
                            ).toLocaleString()}
                            players={achievements?.longestWinStreak.players || []}
                            icon={<statIcons.longestWinStreak className="h-6 w-6" />}
                            color="green"
                            isLoading={isAchievementsLoading}
                        />
                        <StatCard
                            label="Longest Loss Streak"
                            value={Number(
                                achievements?.longestLossStreak.value || 0
                            ).toLocaleString()}
                            players={achievements?.longestLossStreak.players || []}
                            icon={<statIcons.longestLossStreak className="h-6 w-6" />}
                            color="red"
                            isLoading={isAchievementsLoading}
                        />
                        <StatCard
                            label="Most Forfeits"
                            value={Number(achievements?.mostForfeits.value || 0).toLocaleString()}
                            players={achievements?.mostForfeits.players || []}
                            icon={<statIcons.mostForfeits className="h-6 w-6" />}
                            color="blue"
                            isLoading={isAchievementsLoading}
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
                                saves: player.totalSaves,
                                assists: player.totalAssists,
                                shots: player.totalShots,
                                demos: player.totalDemos,
                                gamesPlayed: player.gamesPlayed,
                                wins: player.wins,
                                losses: player.losses,
                                avgPointsPerGame: player.avgPointsPerGame,
                                currentStreak: player.currentStreak,
                                isWinningStreak: player.isWinningStreak,
                                nukes: player.nukes
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

                <div className="w-full">
                    <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                        <Bomb className="h-6 w-6 text-orange-400" />
                        Demo Statistics
                    </h2>
                    <DemoStats />
                </div>

                <PositioningTable />
                <StatsGrid />

                <div className="w-full">
                    <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                        <MapPin className="h-6 w-6 text-green-400" />
                        Field Positioning Map
                    </h2>
                    <RocketField />
                </div>

                <div className="w-full">
                    <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                        <Shield className="h-6 w-6 text-red-400" />
                        Goals Conceded as Last Defender
                    </h2>
                    <div className="rounded-lg border border-red-800/30 bg-gradient-to-br from-red-900/20 to-red-800/20 p-6">
                        <LastDefenderStats />
                    </div>
                </div>
            </div>
        </div>
    );
}
