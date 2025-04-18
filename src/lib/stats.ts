import { prisma } from './prisma';
import {
    StatValue,
    TeamStat,
    TeamResult,
    ReplayData,
    PlayerStats,
    PlayerStatsResult,
    GameHistoryResult
} from '../models/stats';

async function getTeamMatches(teamSize: number): Promise<ReplayData[]> {
    return await prisma.replay.findMany({
        where: {
            teamSize
        },
        select: {
            blueTeam: {
                select: {
                    goals: true,
                    players: {
                        select: {
                            name: true,
                            globalPlayer: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            },
            orangeTeam: {
                select: {
                    goals: true,
                    players: {
                        select: {
                            name: true,
                            globalPlayer: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}

function processMatches(matches: ReplayData[]): Map<string, TeamStat> {
    const teamStats = new Map<string, TeamStat>();

    for (const match of matches) {
        if (!match.blueTeam || !match.orangeTeam) continue;

        const blueGoals = match.blueTeam.goals || 0;
        const orangeGoals = match.orangeTeam.goals || 0;
        const blueWon = blueGoals > orangeGoals;

        const bluePlayers = match.blueTeam.players
            .map((p) => p.globalPlayer?.name || p.name)
            .sort();

        const orangePlayers = match.orangeTeam.players
            .map((p) => p.globalPlayer?.name || p.name)
            .sort();

        const blueKey = bluePlayers.join('|');
        if (!teamStats.has(blueKey)) {
            teamStats.set(blueKey, {
                wins: 0,
                losses: 0,
                playerIds: bluePlayers,
                goalsScored: 0,
                goalsConceded: 0
            });
        }
        const blueStats = teamStats.get(blueKey)!;
        if (blueWon) blueStats.wins++;
        else blueStats.losses++;
        blueStats.goalsScored += blueGoals;
        blueStats.goalsConceded += orangeGoals;

        const orangeKey = orangePlayers.join('|');
        if (!teamStats.has(orangeKey)) {
            teamStats.set(orangeKey, {
                wins: 0,
                losses: 0,
                playerIds: orangePlayers,
                goalsScored: 0,
                goalsConceded: 0
            });
        }
        const orangeStats = teamStats.get(orangeKey)!;
        if (!blueWon) orangeStats.wins++;
        else orangeStats.losses++;
        orangeStats.goalsScored += orangeGoals;
        orangeStats.goalsConceded += blueGoals;
    }

    return teamStats;
}

function getBestTeam(teamStats: Map<string, TeamStat>): TeamResult {
    let bestTeam: TeamResult = {
        key: '',
        winRate: 0,
        wins: 0,
        losses: 0,
        playerIds: [],
        goalDiff: 0
    };

    for (const [key, stats] of teamStats.entries()) {
        const winRate = stats.wins / (stats.wins + stats.losses);
        const goalDiff = stats.goalsScored - stats.goalsConceded;

        if (
            stats.wins > bestTeam.wins ||
            (stats.wins === bestTeam.wins && stats.losses < bestTeam.losses) ||
            (stats.wins === bestTeam.wins &&
                stats.losses === bestTeam.losses &&
                goalDiff > bestTeam.goalDiff)
        ) {
            bestTeam = {
                key,
                winRate,
                wins: stats.wins,
                losses: stats.losses,
                playerIds: stats.playerIds,
                goalDiff
            };
        }
    }

    return bestTeam;
}

function getWorstTeam(teamStats: Map<string, TeamStat>): TeamResult {
    let worstTeam: TeamResult = {
        key: '',
        winRate: 1,
        wins: 0,
        losses: 0,
        playerIds: [],
        goalDiff: 0
    };

    for (const [key, stats] of teamStats.entries()) {
        const winRate = stats.wins / (stats.wins + stats.losses);
        const goalDiff = stats.goalsScored - stats.goalsConceded;

        if (
            stats.wins < worstTeam.wins ||
            (stats.wins === worstTeam.wins && stats.losses > worstTeam.losses) ||
            (stats.wins === worstTeam.wins &&
                stats.losses === worstTeam.losses &&
                goalDiff < worstTeam.goalDiff)
        ) {
            worstTeam = {
                key,
                winRate,
                wins: stats.wins,
                losses: stats.losses,
                playerIds: stats.playerIds,
                goalDiff
            };
        }
    }

    return worstTeam;
}

// Team Stats
export async function getBest3sTeam(): Promise<StatValue> {
    const matches = await getTeamMatches(3);
    const teamStats = processMatches(matches);
    const bestTeam = getBestTeam(teamStats);

    return {
        value: `${bestTeam.wins}/${bestTeam.losses}`,
        players: bestTeam.playerIds,
        isTeamVsTeam: false
    };
}

export async function getBest2sTeam(): Promise<StatValue> {
    const matches = await getTeamMatches(2);
    const teamStats = processMatches(matches);
    const bestTeam = getBestTeam(teamStats);

    return {
        value: `${bestTeam.wins}/${bestTeam.losses}`,
        players: bestTeam.playerIds,
        isTeamVsTeam: false
    };
}

export async function getWorst3sTeam(): Promise<StatValue> {
    const matches = await getTeamMatches(3);
    const teamStats = processMatches(matches);
    const worstTeam = getWorstTeam(teamStats);

    return {
        value: `${worstTeam.wins}/${worstTeam.losses}`,
        players: worstTeam.playerIds,
        isTeamVsTeam: false
    };
}

export async function getWorst2sTeam(): Promise<StatValue> {
    const matches = await getTeamMatches(2);
    const teamStats = processMatches(matches);
    const worstTeam = getWorstTeam(teamStats);

    return {
        value: `${worstTeam.wins}/${worstTeam.losses}`,
        players: worstTeam.playerIds,
        isTeamVsTeam: false
    };
}

// Matchup Stats
export async function getBiggestWinDeficit(): Promise<StatValue> {
    // Get matches with the largest goal differential
    const matchesWithDeficit = await prisma.replay.findMany({
        select: {
            id: true,
            blueTeam: {
                select: {
                    goals: true,
                    players: {
                        select: {
                            name: true,
                            globalPlayer: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            },
            orangeTeam: {
                select: {
                    goals: true,
                    players: {
                        select: {
                            name: true,
                            globalPlayer: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        },
        where: {
            blueTeam: { isNot: null },
            orangeTeam: { isNot: null }
        },
        orderBy: [
            {
                id: 'asc'
            }
        ]
    });

    let biggestDeficit = {
        value: 0,
        winnerGoals: 0,
        loserGoals: 0,
        winningTeam: [] as string[],
        losingTeam: [] as string[]
    };

    for (const match of matchesWithDeficit) {
        if (!match.blueTeam || !match.orangeTeam) continue;

        const blueGoals = match.blueTeam.goals || 0;
        const orangeGoals = match.orangeTeam.goals || 0;
        const diff = Math.abs(blueGoals - orangeGoals);

        if (diff > biggestDeficit.value) {
            const blueWon = blueGoals > orangeGoals;

            // Get player names
            const bluePlayers = match.blueTeam.players.map((p) => p.globalPlayer?.name || p.name);
            const orangePlayers = match.orangeTeam.players.map(
                (p) => p.globalPlayer?.name || p.name
            );

            biggestDeficit = {
                value: diff,
                winnerGoals: blueWon ? blueGoals : orangeGoals,
                loserGoals: blueWon ? orangeGoals : blueGoals,
                winningTeam: blueWon ? bluePlayers : orangePlayers,
                losingTeam: blueWon ? orangePlayers : bluePlayers
            };
        }
    }

    // Format the output for display
    const winningTeamDisplay = biggestDeficit.winningTeam.join(' & ');
    const losingTeamDisplay = biggestDeficit.losingTeam.join(' & ');

    return {
        value: `${biggestDeficit.winnerGoals}-${biggestDeficit.loserGoals}`,
        players: [winningTeamDisplay, losingTeamDisplay],
        winningTeam: 0,
        isTeamVsTeam: true
    };
}

export async function getLongestGame(): Promise<StatValue> {
    const longestMatch = await prisma.replay.findFirst({
        select: {
            id: true,
            duration: true,
            blueTeam: {
                select: {
                    goals: true,
                    players: {
                        select: {
                            name: true,
                            globalPlayer: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            },
            orangeTeam: {
                select: {
                    goals: true,
                    players: {
                        select: {
                            name: true,
                            globalPlayer: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        },
        where: {
            blueTeam: { isNot: null },
            orangeTeam: { isNot: null },
            duration: { not: null }
        },
        orderBy: {
            duration: 'desc'
        }
    });

    if (!longestMatch || !longestMatch.duration) {
        return {
            value: '0:00',
            players: ['N/A', 'N/A'],
            isTeamVsTeam: true
        };
    }

    const minutes = Math.floor(longestMatch.duration / 60);
    const seconds = longestMatch.duration % 60;
    const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const bluePlayers = longestMatch.blueTeam?.players.map((p) => p.globalPlayer?.name || p.name) || [];
    const orangePlayers = longestMatch.orangeTeam?.players.map((p) => p.globalPlayer?.name || p.name) || [];

    const blueTeamDisplay = bluePlayers.join(' & ');
    const orangeTeamDisplay = orangePlayers.join(' & ');

    const blueGoals = longestMatch.blueTeam?.goals || 0;
    const orangeGoals = longestMatch.orangeTeam?.goals || 0;
    const winningTeam = blueGoals > orangeGoals ? 0 : 1;

    return {
        value: formattedDuration,
        players: [blueTeamDisplay, orangeTeamDisplay],
        winningTeam,
        isTeamVsTeam: true
    };
}

export async function getHighestScoringGame(): Promise<StatValue> {
    // Get matches with the highest combined scores
    // To calculate this in the database, we'd need raw SQL, but we can
    // optimize by at least selecting only what we need
    const matches = await prisma.replay.findMany({
        select: {
            id: true,
            blueTeam: {
                select: {
                    goals: true,
                    players: {
                        select: {
                            name: true,
                            globalPlayer: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            },
            orangeTeam: {
                select: {
                    goals: true,
                    players: {
                        select: {
                            name: true,
                            globalPlayer: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        },
        where: {
            blueTeam: { isNot: null },
            orangeTeam: { isNot: null }
        }
        // Can't order by combined goals in Prisma directly, so we'll process in memory
    });

    let highestScoring = {
        totalGoals: 0,
        blueGoals: 0,
        orangeGoals: 0,
        bluePlayers: [] as string[],
        orangePlayers: [] as string[]
    };

    for (const match of matches) {
        // Skip invalid matches
        if (!match.blueTeam || !match.orangeTeam) continue;

        const blueGoals = match.blueTeam.goals || 0;
        const orangeGoals = match.orangeTeam.goals || 0;
        const totalGoals = blueGoals + orangeGoals;

        if (totalGoals > highestScoring.totalGoals) {
            // Get player names
            const bluePlayers = match.blueTeam.players.map((p) => p.globalPlayer?.name || p.name);
            const orangePlayers = match.orangeTeam.players.map(
                (p) => p.globalPlayer?.name || p.name
            );

            highestScoring = {
                totalGoals,
                blueGoals,
                orangeGoals,
                bluePlayers,
                orangePlayers
            };
        }
    }

    const blueTeamDisplay = highestScoring.bluePlayers.join(' & ');
    const orangeTeamDisplay = highestScoring.orangePlayers.join(' & ');
    const winningTeam = highestScoring.blueGoals > highestScoring.orangeGoals ? 0 : 1;

    return {
        value: `${highestScoring.blueGoals}-${highestScoring.orangeGoals}`,
        players: [blueTeamDisplay, orangeTeamDisplay],
        winningTeam,
        isTeamVsTeam: true
    };
}

// Individual Stats
export async function getHighestPoints(): Promise<StatValue> {
    const players = await prisma.player.findMany({
        select: {
            name: true,
            score: true,
            globalPlayer: {
                select: {
                    name: true
                }
            }
        },
        where: {
            score: {
                not: null
            }
        },
        orderBy: {
            score: 'desc'
        },
        take: 10
    });

    if (players.length === 0) {
        return {
            value: '0',
            players: ['Unknown'],
            isTeamVsTeam: false
        };
    }

    const maxScore = players[0].score || 0;
    const topScorePlayers = players.filter(player => player.score === maxScore);
    const playerNames = [...new Set(topScorePlayers.map(player => player.globalPlayer?.name || player.name))];

    return {
        value: String(maxScore),
        players: playerNames,
        isTeamVsTeam: false
    };
}

export async function getLowestPoints(): Promise<StatValue> {
    const players = await prisma.player.findMany({
        select: {
            name: true,
            score: true,
            globalPlayer: {
                select: {
                    name: true
                }
            }
        },
        where: {
            score: {
                not: null
            }
        },
        orderBy: {
            score: 'asc'
        },
        take: 10
    });

    if (players.length === 0) {
        return {
            value: '0',
            players: ['Unknown'],
            isTeamVsTeam: false
        };
    }

    const minScore = players[0].score || 0;
    const bottomScorePlayers = players.filter(player => player.score === minScore);
    const playerNames = [...new Set(bottomScorePlayers.map(player => player.globalPlayer?.name || player.name))];

    return {
        value: String(minScore),
        players: playerNames,
        isTeamVsTeam: false
    };
}

export async function getMostDemos(): Promise<StatValue> {
    const players = await prisma.player.findMany({
        select: {
            name: true,
            demoInflicted: true,
            globalPlayer: {
                select: {
                    name: true
                }
            }
        },
        where: {
            demoInflicted: {
                not: null
            }
        },
        orderBy: {
            demoInflicted: 'desc'
        },
        take: 10
    });

    if (players.length === 0) {
        return {
            value: '0',
            players: ['Unknown'],
            isTeamVsTeam: false
        };
    }

    const maxDemos = players[0].demoInflicted || 0;
    const topDemoPlayers = players.filter(player => player.demoInflicted === maxDemos);
    const playerNames = [...new Set(topDemoPlayers.map(player => player.globalPlayer?.name || player.name))];

    return {
        value: String(maxDemos),
        players: playerNames,
        isTeamVsTeam: false
    };
}

// Get player statistics across all games
export async function getPlayerStats(): Promise<PlayerStatsResult[]> {
    const replays = await prisma.replay.findMany({
        where: {
            status: 'completed',
            AND: [{ blueTeam: { isNot: null } }, { orangeTeam: { isNot: null } }]
        },
        select: {
            id: true,
            ballchasingId: true,
            blueTeam: {
                select: {
                    goals: true,
                    players: {
                        select: {
                            goals: true,
                            assists: true,
                            saves: true,
                            shots: true,
                            score: true,
                            demoInflicted: true,
                            boostAvgAmount: true,
                            globalPlayer: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            },
            orangeTeam: {
                select: {
                    goals: true,
                    players: {
                        select: {
                            goals: true,
                            assists: true,
                            saves: true,
                            shots: true,
                            score: true,
                            demoInflicted: true,
                            boostAvgAmount: true,
                            globalPlayer: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Deduplicate replays based on ballchasing ID
    const uniqueReplays = Array.from(
        new Map(replays.map((replay) => [replay.ballchasingId, replay])).values()
    );

    // Initialize stats map for each player
    const playerStatsMap = new Map<string, PlayerStats>();

    // Process each unique replay
    uniqueReplays.forEach((replay) => {
        if (!replay.blueTeam || !replay.orangeTeam) return;

        const blueWon = (replay.blueTeam.goals || 0) > (replay.orangeTeam.goals || 0);

        // Process blue team players
        replay.blueTeam.players.forEach((player) => {
            if (!player.globalPlayer) return;

            const stats = playerStatsMap.get(player.globalPlayer.id) || {
                id: player.globalPlayer.id,
                name: player.globalPlayer.name,
                totalGoals: 0,
                totalAssists: 0,
                totalSaves: 0,
                totalShots: 0,
                totalDemos: 0,
                totalScore: 0,
                totalBoost: 0,
                gamesPlayed: 0,
                wins: 0,
                losses: 0
            };

            stats.gamesPlayed++;
            stats.totalGoals += player.goals || 0;
            stats.totalAssists += player.assists || 0;
            stats.totalSaves += player.saves || 0;
            stats.totalShots += player.shots || 0;
            stats.totalDemos += player.demoInflicted || 0;
            stats.totalScore += player.score || 0;
            stats.totalBoost += player.boostAvgAmount || 0;
            if (blueWon) stats.wins++;
            else stats.losses++;

            playerStatsMap.set(player.globalPlayer.id, stats);
        });

        // Process orange team players
        replay.orangeTeam.players.forEach((player) => {
            if (!player.globalPlayer) return;

            const stats = playerStatsMap.get(player.globalPlayer.id) || {
                id: player.globalPlayer.id,
                name: player.globalPlayer.name,
                totalGoals: 0,
                totalAssists: 0,
                totalSaves: 0,
                totalShots: 0,
                totalDemos: 0,
                totalScore: 0,
                totalBoost: 0,
                gamesPlayed: 0,
                wins: 0,
                losses: 0
            };

            stats.gamesPlayed++;
            stats.totalGoals += player.goals || 0;
            stats.totalAssists += player.assists || 0;
            stats.totalSaves += player.saves || 0;
            stats.totalShots += player.shots || 0;
            stats.totalDemos += player.demoInflicted || 0;
            stats.totalScore += player.score || 0;
            stats.totalBoost += player.boostAvgAmount || 0;
            if (!blueWon) stats.wins++;
            else stats.losses++;

            playerStatsMap.set(player.globalPlayer.id, stats);
        });
    });

    // Convert map to array and format the results
    return Array.from(playerStatsMap.values())
        .map((stats) => ({
            id: stats.id,
            name: stats.name,
            totalGoals: stats.totalGoals,
            totalAssists: stats.totalAssists,
            totalSaves: stats.totalSaves,
            totalShots: stats.totalShots,
            totalDemos: stats.totalDemos,
            totalScore: stats.totalScore,
            avgBoost: stats.gamesPlayed > 0 ? stats.totalBoost / stats.gamesPlayed : 0,
            gamesPlayed: stats.gamesPlayed,
            wins: stats.wins,
            losses: stats.losses
        }))
        .sort((a, b) => b.totalScore - a.totalScore);
}

// Get all stats at once
export async function getAllStats() {
    const [
        best3sTeam,
        best2sTeam,
        worst3sTeam,
        worst2sTeam,
        biggestWinDeficit,
        longestGame,
        highestScoringGame,
        highestPoints,
        lowestPoints,
        mostDemos
    ] = await Promise.all([
        getBest3sTeam(),
        getBest2sTeam(),
        getWorst3sTeam(),
        getWorst2sTeam(),
        getBiggestWinDeficit(),
        getLongestGame(),
        getHighestScoringGame(),
        getHighestPoints(),
        getLowestPoints(),
        getMostDemos()
    ]);

    // Add placeholder values for stats we don't calculate yet
    const fastestGoal: StatValue = {
        value: '0 mph',
        players: ['N/A'],
        isTeamVsTeam: false
    };

    const slowestGoal: StatValue = {
        value: '0 mph',
        players: ['N/A'],
        isTeamVsTeam: false
    };

    return {
        best3sTeam,
        best2sTeam,
        worst3sTeam,
        worst2sTeam,
        biggestWinDeficit,
        longestGame,
        highestScoringGame,
        highestPoints,
        lowestPoints,
        mostDemos,
        fastestGoal,
        slowestGoal
    };
}

export async function getGameHistory(): Promise<GameHistoryResult[]> {
    const games = await prisma.replay.findMany({
        where: {
            status: 'completed'
        },
        select: {
            id: true,
            date: true,
            blueTeam: {
                select: {
                    goals: true,
                    players: {
                        select: {
                            name: true,
                            globalPlayer: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            },
            orangeTeam: {
                select: {
                    goals: true,
                    players: {
                        select: {
                            name: true,
                            globalPlayer: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            date: 'desc'
        }
    });

    return games.map((game) => {
        const blueGoals = game.blueTeam?.goals || 0;
        const orangeGoals = game.orangeTeam?.goals || 0;
        const blueWon = blueGoals > orangeGoals;

        const bluePlayers = game.blueTeam?.players.map((p) => p.globalPlayer?.name || p.name) || [];
        const orangePlayers =
            game.orangeTeam?.players.map((p) => p.globalPlayer?.name || p.name) || [];

        return {
            id: game.id,
            date: game.date?.toISOString() || new Date().toISOString(),
            score: `${blueGoals}-${orangeGoals}`,
            winningTeam: blueWon ? bluePlayers : orangePlayers,
            losingTeam: blueWon ? orangePlayers : bluePlayers
        };
    });
}
