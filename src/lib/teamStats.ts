import { prisma } from './prisma';

interface TeamStats {
    wins: number;
    losses: number;
    winRate: number;
    totalGoals: number;
    recentPerformance: ('W' | 'L')[];
}

interface MatchHistory {
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

interface Player {
    id: string;
    name: string;
}

interface ReplayPlayer {
    id: string;
    name: string;
    platformId: string;
    team?: {
        color: string;
        goals?: number;
    };
    globalPlayer: {
        platformId: string;
        name: string;
    };
}

export async function getTeamMatchupStats(
    team1Players: Player[],
    team2Players: Player[]
): Promise<TeamMatchupStats> {
    const teamSize = team1Players.length;
    const team1PlayerIds = team1Players.filter(p => p.id !== 'wildcard').map(p => p.id);
    const team2PlayerIds = team2Players.filter(p => p.id !== 'wildcard').map(p => p.id);

    const allPlayerIds = [...team1PlayerIds, ...team2PlayerIds];

    const replays = await prisma.replay.findMany({
        where: {
            teamSize,
            AND: allPlayerIds.map(id => ({
                OR: [
                    { blueTeam: { players: { some: { platformId: id } } } },
                    { orangeTeam: { players: { some: { platformId: id } } } }
                ]
            }))
        },
        include: {
            blueTeam: {
                include: {
                    players: {
                        include: {
                            globalPlayer: true
                        }
                    }
                }
            },
            orangeTeam: {
                include: {
                    players: {
                        include: {
                            globalPlayer: true
                        }
                    }
                }
            }
        },
        orderBy: {
            date: 'desc'
        }
    });

    const filteredReplays = replays.filter(replay => {
        const blueTeamPlayerIds = replay.blueTeam?.players.map(p => p.platformId) || [];
        const orangeTeamPlayerIds = replay.orangeTeam?.players.map(p => p.platformId) || [];

        const team1AllInBlue = team1PlayerIds.every(id => blueTeamPlayerIds.includes(id));
        const team1AllInOrange = team1PlayerIds.every(id => orangeTeamPlayerIds.includes(id));
        const team2AllInBlue = team2PlayerIds.every(id => blueTeamPlayerIds.includes(id));
        const team2AllInOrange = team2PlayerIds.every(id => orangeTeamPlayerIds.includes(id));

        return (team1AllInBlue && team2AllInOrange) || (team1AllInOrange && team2AllInBlue);
    });

    const matchResults = filteredReplays.map(replay => {
        const blueTeamPlayerIds = replay.blueTeam?.players.map(p => p.platformId) || [];
        
        // Check if team1 is blue by seeing if ALL team1 players are in blue team
        const team1IsBlue = team1PlayerIds.every(id => blueTeamPlayerIds.includes(id));
        
        const team1Score = team1IsBlue ? replay.blueTeam?.goals : replay.orangeTeam?.goals;
        const team2Score = team1IsBlue ? replay.orangeTeam?.goals : replay.blueTeam?.goals;

        return {
            team1Score: team1Score || 0,
            team2Score: team2Score || 0,
            date: replay.date,
            team1Players: team1IsBlue ? replay.blueTeam?.players || [] : replay.orangeTeam?.players || [],
            team2Players: team1IsBlue ? replay.orangeTeam?.players || [] : replay.blueTeam?.players || []
        };
    });

    const team1Stats: TeamStats = {
        wins: matchResults.filter(m => m.team1Score > m.team2Score).length,
        losses: matchResults.filter(m => m.team1Score < m.team2Score).length,
        winRate: 0,
        totalGoals: matchResults.reduce((sum, m) => sum + m.team1Score, 0),
        recentPerformance: matchResults
            .slice(0, 5)
            .map(m => (m.team1Score > m.team2Score ? 'W' : 'L'))
    };

    const team2Stats: TeamStats = {
        wins: matchResults.filter(m => m.team2Score > m.team1Score).length,
        losses: matchResults.filter(m => m.team2Score < m.team1Score).length,
        winRate: 0,
        totalGoals: matchResults.reduce((sum, m) => sum + m.team2Score, 0),
        recentPerformance: matchResults
            .slice(0, 5)
            .map(m => (m.team2Score > m.team1Score ? 'W' : 'L'))
    };

    team1Stats.winRate = team1Stats.wins / (team1Stats.wins + team1Stats.losses) * 100 || 0;
    team2Stats.winRate = team2Stats.wins / (team2Stats.wins + team2Stats.losses) * 100 || 0;

    const matchHistory: MatchHistory[] = matchResults.slice(0, 10).map(match => ({
        winner: match.team1Score > match.team2Score ? 1 : 2,
        score: `${match.team1Score}-${match.team2Score}`,
        date: match.date ? new Date(match.date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }) : '',
        team1: match.team1Players.map((p: ReplayPlayer) => p.globalPlayer.name),
        team2: match.team2Players.map((p: ReplayPlayer) => p.globalPlayer.name),
        originalTeam1: team1Players.map(p => ({ id: p.id, name: p.name })),
        originalTeam2: team2Players.map(p => ({ id: p.id, name: p.name }))
    }));

    return {
        team1Stats,
        team2Stats,
        matchHistory
    };
}
