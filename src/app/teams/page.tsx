'use client';

import { useState, useEffect } from 'react';
import TeamSelector from '@/components/teams/TeamSelector';
import TeamBuilder from '@/components/teams/TeamBuilder';
import { GlobalPlayer } from '@prisma/client';
import { RefreshCw } from 'lucide-react';

interface TeamStats {
    wins: number;
    losses: number;
    winRate: number;
    totalGoals: number;
    recentPerformance: ('W' | 'L')[];
}

interface MatchHistory {
    id: string;
    winner: 1 | 2;
    score: string;
    date: string;
    team1: string[];
    team2: string[];
    originalTeam1: { id: string; name: string }[];
    originalTeam2: { id: string; name: string }[];
}

interface TeamMatchupStats {
    team1Stats: TeamStats;
    team2Stats: TeamStats;
    matchHistory: MatchHistory[];
}

export default function TeamsPage(): React.ReactElement {
    const [selectedTeamSize, setSelectedTeamSize] = useState<2 | 3 | null>(null);
    const [players, setPlayers] = useState<GlobalPlayer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isCalculated, setIsCalculated] = useState(false);
    const [teamStats, setTeamStats] = useState<TeamMatchupStats | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        const fetchPlayers = async (): Promise<void> => {
            try {
                const response = await fetch('/api/global-players');
                const data = await response.json();
                setPlayers(data);
            } catch (error) {
                console.error('Error fetching players:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, []);

    const handleReset = (): void => {
        setIsCalculated(false);
        setSelectedTeamSize(null);
        setTeamStats(null);
    };

    const handleCalculate = async (team1: { id: string; name: string }[], team2: { id: string; name: string }[]): Promise<void> => {
        try {
            setIsCalculating(true);
            const params = new URLSearchParams({
                team1: JSON.stringify(team1),
                team2: JSON.stringify(team2)
            });

            const response = await fetch(`/api/team-stats?${params}`);
            const stats = await response.json();

            if (!response.ok) {
                throw new Error(stats.error || 'Failed to fetch team stats');
            }

            setTeamStats(stats);
            setIsCalculated(true);
        } catch (error) {
            console.error('Error calculating team stats:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    if (loading) {
        return <div className="container mx-auto px-4 py-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="relative mb-12">
                <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                    Teams
                </h1>
                <button
                    onClick={handleReset}
                    className="border-border bg-background/50 text-muted hover:border-muted hover:text-foreground absolute top-0 right-0 flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all disabled:opacity-50"
                >
                    <RefreshCw className="h-4 w-4" />
                    Reset All
                </button>
            </div>

            {(!isCalculated) && (
                <TeamSelector onSelect={setSelectedTeamSize} selected={selectedTeamSize} />
            )}

            {selectedTeamSize && (
                <TeamBuilder
                    teamSize={selectedTeamSize}
                    players={players}
                    onCalculate={handleCalculate}
                    isCalculated={isCalculated}
                    teamStats={teamStats}
                    isCalculating={isCalculating}
                />
            )}
        </div>
    );
}
