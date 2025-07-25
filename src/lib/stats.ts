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

function getBestTeam(teamStats: Map<string, TeamStat>, teamSize: number): TeamResult {
    let bestTeam: TeamResult = {
        key: '',
        winRate: 0,
        wins: 0,
        losses: 0,
        playerIds: [],
        goalDiff: 0
    };

    for (const [key, stats] of teamStats.entries()) {
        const minGames = teamSize === 2 ? 10 : 5;

        const totalGames = stats.wins + stats.losses;
        
        if (totalGames < minGames) continue;
        
        const winRate = stats.wins / totalGames;
        const goalDiff = stats.goalsScored - stats.goalsConceded;

        if (winRate > bestTeam.winRate || (winRate === bestTeam.winRate && totalGames > (bestTeam.wins + bestTeam.losses))) {
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

function getWorstTeam(teamStats: Map<string, TeamStat>, teamSize: number): TeamResult {
    let worstTeam: TeamResult = {
        key: '',
        winRate: 1,
        wins: 0,
        losses: 0,
        playerIds: [],
        goalDiff: 0
    };

    const minGames = teamSize === 2 ? 10 : 5;

    for (const [key, stats] of teamStats.entries()) {
        const totalGames = stats.wins + stats.losses;
        if (totalGames < minGames) continue;

        const winRate = stats.wins / totalGames;
        const goalDiff = stats.goalsScored - stats.goalsConceded;

        if (winRate < worstTeam.winRate) {
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
    const bestTeam = getBestTeam(teamStats, 3);

    return {
        value: `${bestTeam.wins}/${bestTeam.losses}`,
        players: bestTeam.playerIds,
        isTeamVsTeam: false
    };
}

export async function getBest2sTeam(): Promise<StatValue> {
    const matches = await getTeamMatches(2);
    const teamStats = processMatches(matches);
    const bestTeam = getBestTeam(teamStats, 2);

    return {
        value: `${bestTeam.wins}/${bestTeam.losses}`,
        players: bestTeam.playerIds,
        isTeamVsTeam: false
    };
}

export async function getWorst3sTeam(): Promise<StatValue> {
    const matches = await getTeamMatches(3);
    const teamStats = processMatches(matches);
    const worstTeam = getWorstTeam(teamStats, 3);

    return {
        value: `${worstTeam.wins}/${worstTeam.losses}`,
        players: worstTeam.playerIds,
        isTeamVsTeam: false
    };
}

export async function getWorst2sTeam(): Promise<StatValue> {
    const matches = await getTeamMatches(2);
    const teamStats = processMatches(matches);
    const worstTeam = getWorstTeam(teamStats, 2);

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
        id: '',
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

            const bluePlayers = match.blueTeam.players.map((p) => p.globalPlayer?.name || p.name);
            const orangePlayers = match.orangeTeam.players.map(
                (p) => p.globalPlayer?.name || p.name
            );

            biggestDeficit = {
                id: match.id,
                value: diff,
                winnerGoals: blueWon ? blueGoals : orangeGoals,
                loserGoals: blueWon ? orangeGoals : blueGoals,
                winningTeam: blueWon ? bluePlayers : orangePlayers,
                losingTeam: blueWon ? orangePlayers : bluePlayers
            };
        }
    }

    const winningTeamDisplay = biggestDeficit.winningTeam.join(' & ');
    const losingTeamDisplay = biggestDeficit.losingTeam.join(' & ');

    return {
        gameId: biggestDeficit.id,
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

    const bluePlayers =
        longestMatch.blueTeam?.players.map((p) => p.globalPlayer?.name || p.name) || [];
    const orangePlayers =
        longestMatch.orangeTeam?.players.map((p) => p.globalPlayer?.name || p.name) || [];

    const blueTeamDisplay = bluePlayers.join(' & ');
    const orangeTeamDisplay = orangePlayers.join(' & ');

    const blueGoals = longestMatch.blueTeam?.goals || 0;
    const orangeGoals = longestMatch.orangeTeam?.goals || 0;
    const winningTeam = blueGoals > orangeGoals ? 0 : 1;

    return {
        gameId: longestMatch.id,
        value: formattedDuration,
        players: [blueTeamDisplay, orangeTeamDisplay],
        winningTeam,
        isTeamVsTeam: true
    };
}

export async function getHighestScoringGame(): Promise<StatValue> {
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
    });

    let highestScoring = {
        id: '',
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
                id: match.id,
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
        gameId: highestScoring.id,
        value: `${highestScoring.blueGoals}-${highestScoring.orangeGoals}`,
        players: [blueTeamDisplay, orangeTeamDisplay],
        winningTeam,
        isTeamVsTeam: true
    };
}

// Individual Stats
export async function getHighestPoints(): Promise<StatValue> {
    const player = await prisma.player.findFirst({
        select: {
            name: true,
            score: true,
            globalPlayer: {
                select: {
                    name: true
                }
            },
            teamId: true
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

    if (!player) {
        return {
            value: '0',
            players: ['Unknown'],
            isTeamVsTeam: false
        };
    }

    const replay = await prisma.replay.findFirst({
        where: {
            OR: [{ blueTeamId: player.teamId }, { orangeTeamId: player.teamId }]
        },
        select: {
            id: true
        }
    });

    const playerName = player.globalPlayer?.name || player.name;

    return {
        gameId: replay?.id,
        value: String(player.score),
        players: [playerName],
        isTeamVsTeam: false
    };
}

export async function getLowestPoints(): Promise<StatValue> {
    const player = await prisma.player.findFirst({
        select: {
            name: true,
            score: true,
            globalPlayer: {
                select: {
                    name: true
                }
            },
            teamId: true
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

    if (!player) {
        return {
            value: '0',
            players: ['Unknown'],
            isTeamVsTeam: false
        };
    }

    const replay = await prisma.replay.findFirst({
        where: {
            OR: [{ blueTeamId: player.teamId }, { orangeTeamId: player.teamId }]
        },
        select: {
            id: true
        }
    });

    const playerName = player.globalPlayer?.name || player.name;

    return {
        gameId: replay?.id,
        value: String(player.score),
        players: [playerName],
        isTeamVsTeam: false
    };
}

export async function getMostDemos(): Promise<StatValue> {
    const player = await prisma.player.findFirst({
        select: {
            name: true,
            demoInflicted: true,
            globalPlayer: {
                select: {
                    name: true
                }
            },
            teamId: true
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

    if (!player) {
        return {
            value: '0',
            players: ['Unknown'],
            isTeamVsTeam: false
        };
    }

    const replay = await prisma.replay.findFirst({
        where: {
            OR: [{ blueTeamId: player.teamId }, { orangeTeamId: player.teamId }]
        },
        select: {
            id: true
        }
    });

    const playerName = player.globalPlayer?.name || player.name;

    return {
        gameId: replay?.id,
        value: String(player.demoInflicted),
        players: [playerName],
        isTeamVsTeam: false
    };
}

export async function getMostForfeits(): Promise<StatValue> {
    const players = await prisma.globalPlayer.findMany({
        select: {
            name: true,
            forfeitCount: true
        },
        orderBy: {
            forfeitCount: 'desc'
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

    const maxForfeits = players[0].forfeitCount;
    const tiedPlayers = players.filter((p) => p.forfeitCount === maxForfeits).map((p) => p.name);

    return {
        gameId: undefined,
        value: String(maxForfeits),
        players: tiedPlayers,
        isTeamVsTeam: false
    };
}

export async function getLongestWinStreak(): Promise<StatValue> {
    const replays = await prisma.replay.findMany({
        where: {
            status: 'completed',
            AND: [{ blueTeam: { isNot: null } }, { orangeTeam: { isNot: null } }]
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
                            name: true,
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
        },
        orderBy: {
            date: 'asc'
        }
    });

    const playerStreaks = new Map<
        string,
        { currentStreak: number; maxStreak: number; name: string }
    >();
    let longestStreak = { playerId: '', streak: 0, name: '' };

    for (const replay of replays) {
        if (!replay.blueTeam || !replay.orangeTeam) continue;

        const blueWon = (replay.blueTeam.goals || 0) > (replay.orangeTeam.goals || 0);

        for (const player of replay.blueTeam.players) {
            if (!player.globalPlayer) continue;

            const stats = playerStreaks.get(player.globalPlayer.id) || {
                currentStreak: 0,
                maxStreak: 0,
                name: player.globalPlayer.name
            };

            if (blueWon) {
                stats.currentStreak++;
                stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);

                if (stats.maxStreak > longestStreak.streak) {
                    longestStreak = {
                        playerId: player.globalPlayer.id,
                        streak: stats.maxStreak,
                        name: player.globalPlayer.name
                    };
                }
            } else {
                stats.currentStreak = 0;
            }

            playerStreaks.set(player.globalPlayer.id, stats);
        }

        for (const player of replay.orangeTeam.players) {
            if (!player.globalPlayer) continue;

            const stats = playerStreaks.get(player.globalPlayer.id) || {
                currentStreak: 0,
                maxStreak: 0,
                name: player.globalPlayer.name
            };

            if (!blueWon) {
                stats.currentStreak++;
                stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);

                if (stats.maxStreak > longestStreak.streak) {
                    longestStreak = {
                        playerId: player.globalPlayer.id,
                        streak: stats.maxStreak,
                        name: player.globalPlayer.name
                    };
                }
            } else {
                stats.currentStreak = 0;
            }

            playerStreaks.set(player.globalPlayer.id, stats);
        }
    }

    return {
        value: String(longestStreak.streak),
        players: [longestStreak.name],
        isTeamVsTeam: false
    };
}

export async function getLongestLossStreak(): Promise<StatValue> {
    const replays = await prisma.replay.findMany({
        where: {
            status: 'completed',
            AND: [{ blueTeam: { isNot: null } }, { orangeTeam: { isNot: null } }]
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
                            name: true,
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
        },
        orderBy: {
            date: 'asc'
        }
    });

    const playerStreaks = new Map<
        string,
        { currentStreak: number; maxStreak: number; name: string }
    >();
    let longestStreak = { playerId: '', streak: 0, name: '' };

    for (const replay of replays) {
        if (!replay.blueTeam || !replay.orangeTeam) continue;

        const blueWon = (replay.blueTeam.goals || 0) > (replay.orangeTeam.goals || 0);

        for (const player of replay.blueTeam.players) {
            if (!player.globalPlayer) continue;

            const stats = playerStreaks.get(player.globalPlayer.id) || {
                currentStreak: 0,
                maxStreak: 0,
                name: player.globalPlayer.name
            };

            if (!blueWon) {
                stats.currentStreak++;
                stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);

                if (stats.maxStreak > longestStreak.streak) {
                    longestStreak = {
                        playerId: player.globalPlayer.id,
                        streak: stats.maxStreak,
                        name: player.globalPlayer.name
                    };
                }
            } else {
                stats.currentStreak = 0;
            }

            playerStreaks.set(player.globalPlayer.id, stats);
        }

        for (const player of replay.orangeTeam.players) {
            if (!player.globalPlayer) continue;

            const stats = playerStreaks.get(player.globalPlayer.id) || {
                currentStreak: 0,
                maxStreak: 0,
                name: player.globalPlayer.name
            };

            if (blueWon) {
                stats.currentStreak++;
                stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);

                if (stats.maxStreak > longestStreak.streak) {
                    longestStreak = {
                        playerId: player.globalPlayer.id,
                        streak: stats.maxStreak,
                        name: player.globalPlayer.name
                    };
                }
            } else {
                stats.currentStreak = 0;
            }

            playerStreaks.set(player.globalPlayer.id, stats);
        }
    }

    return {
        value: String(longestStreak.streak),
        players: [longestStreak.name],
        isTeamVsTeam: false
    };
}

export async function getMostGoalsInGame(): Promise<StatValue> {
    const player = await prisma.player.findFirst({
        select: {
            name: true,
            goals: true,
            globalPlayer: {
                select: {
                    name: true
                }
            },
            teamId: true
        },
        where: {
            goals: {
                not: null
            }
        },
        orderBy: {
            goals: 'desc'
        }
    });

    if (!player) {
        return {
            value: '0',
            players: ['Unknown'],
            isTeamVsTeam: false
        };
    }

    const replay = await prisma.replay.findFirst({
        where: {
            OR: [{ blueTeamId: player.teamId }, { orangeTeamId: player.teamId }]
        },
        select: {
            id: true
        }
    });

    const playerName = player.globalPlayer?.name || player.name;

    return {
        gameId: replay?.id,
        value: String(player.goals),
        players: [playerName],
        isTeamVsTeam: false
    };
}

export async function getMostAssistsInGame(): Promise<StatValue> {
    const player = await prisma.player.findFirst({
        select: {
            name: true,
            assists: true,
            globalPlayer: {
                select: {
                    name: true
                }
            },
            teamId: true
        },
        where: {
            assists: {
                not: null
            }
        },
        orderBy: {
            assists: 'desc'
        }
    });

    if (!player) {
        return {
            value: '0',
            players: ['Unknown'],
            isTeamVsTeam: false
        };
    }

    const replay = await prisma.replay.findFirst({
        where: {
            OR: [{ blueTeamId: player.teamId }, { orangeTeamId: player.teamId }]
        },
        select: {
            id: true
        }
    });

    const playerName = player.globalPlayer?.name || player.name;

    return {
        gameId: replay?.id,
        value: String(player.assists),
        players: [playerName],
        isTeamVsTeam: false
    };
}

export async function getMostSavesInGame(): Promise<StatValue> {
    const player = await prisma.player.findFirst({
        select: {
            name: true,
            saves: true,
            globalPlayer: {
                select: {
                    name: true
                }
            },
            teamId: true
        },
        where: {
            saves: {
                not: null
            }
        },
        orderBy: {
            saves: 'desc'
        }
    });

    if (!player) {
        return {
            value: '0',
            players: ['Unknown'],
            isTeamVsTeam: false
        };
    }

    const replay = await prisma.replay.findFirst({
        where: {
            OR: [{ blueTeamId: player.teamId }, { orangeTeamId: player.teamId }]
        },
        select: {
            id: true
        }
    });

    const playerName = player.globalPlayer?.name || player.name;

    return {
        gameId: replay?.id,
        value: String(player.saves),
        players: [playerName],
        isTeamVsTeam: false
    };
}

export async function getMostShotsInGame(): Promise<StatValue> {
    const player = await prisma.player.findFirst({
        select: {
            name: true,
            shots: true,
            globalPlayer: {
                select: {
                    name: true
                }
            },
            teamId: true
        },
        where: {
            shots: {
                not: null
            }
        },
        orderBy: {
            shots: 'desc'
        }
    });

    if (!player) {
        return {
            value: '0',
            players: ['Unknown'],
            isTeamVsTeam: false
        };
    }

    const replay = await prisma.replay.findFirst({
        where: {
            OR: [{ blueTeamId: player.teamId }, { orangeTeamId: player.teamId }]
        },
        select: {
            id: true
        }
    });

    const playerName = player.globalPlayer?.name || player.name;

    return {
        gameId: replay?.id,
        value: String(player.shots),
        players: [playerName],
        isTeamVsTeam: false
    };
}

export async function getPlayerDemoStats(): Promise<{ playerName: string; demosGiven: number; demosReceived: number }[]> {
    const replays = await prisma.replay.findMany({
        where: {
            status: 'completed',
            date: { not: null },
            AND: [{ blueTeam: { isNot: null } }, { orangeTeam: { isNot: null } }]
        },
        select: {
            id: true,
            ballchasingId: true,
            blueTeam: {
                select: {
                    players: {
                        select: {
                            name: true,
                            demoInflicted: true,
                            demoTaken: true,
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
                    players: {
                        select: {
                            name: true,
                            demoInflicted: true,
                            demoTaken: true,
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

    const uniqueReplays = Array.from(
        new Map(replays.map((replay) => [replay.ballchasingId, replay])).values()
    );

    const demoStatsMap = new Map<string, { demosGiven: number; demosReceived: number }>();

    uniqueReplays.forEach((replay) => {
        if (!replay.blueTeam || !replay.orangeTeam) return;

        replay.blueTeam.players.forEach((player) => {
            if (!player.globalPlayer) return;

            const playerName = player.globalPlayer.name;
            const currentStats = demoStatsMap.get(playerName) || { demosGiven: 0, demosReceived: 0 };
            
            currentStats.demosGiven += player.demoInflicted || 0;
            currentStats.demosReceived += player.demoTaken || 0;
            
            demoStatsMap.set(playerName, currentStats);
        });

        replay.orangeTeam.players.forEach((player) => {
            if (!player.globalPlayer) return;

            const playerName = player.globalPlayer.name;
            const currentStats = demoStatsMap.get(playerName) || { demosGiven: 0, demosReceived: 0 };
            
            currentStats.demosGiven += player.demoInflicted || 0;
            currentStats.demosReceived += player.demoTaken || 0;
            
            demoStatsMap.set(playerName, currentStats);
        });
    });

    return Array.from(demoStatsMap.entries())
        .map(([playerName, stats]) => ({
            playerName,
            demosGiven: stats.demosGiven,
            demosReceived: stats.demosReceived
        }))
        .filter((stats) => stats.demosGiven > 0 || stats.demosReceived > 0)
        .sort((a, b) => (b.demosGiven + b.demosReceived) - (a.demosGiven + a.demosReceived));
}

// Get player statistics across all games
export async function getPlayerStats(): Promise<PlayerStatsResult[]> {
    const [replays, globalPlayers] = await Promise.all([
        prisma.replay.findMany({
            where: {
                status: 'completed',
                date: { not: null },
                AND: [{ blueTeam: { isNot: null } }, { orangeTeam: { isNot: null } }]
            },
            select: {
                id: true,
                date: true,
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
            },
            orderBy: {
                date: 'desc'
            }
        }),
        prisma.globalPlayer.findMany({
            select: {
                id: true,
                name: true,
                forfeitCount: true
            }
        })
    ]);

    const uniqueReplays = Array.from(
        new Map(replays.map((replay) => [replay.ballchasingId, replay])).values()
    );

    const playerStatsMap = new Map<string, PlayerStats>();
    const playerFirstSeen = new Map<string, Date>();
    const playerLatestGame = new Map<string, Date>();
    const playerGameResults = new Map<string, { date: Date; won: boolean }[]>();

    uniqueReplays.forEach((replay) => {
        if (!replay.blueTeam || !replay.orangeTeam || !replay.date) return;

        const date = new Date(replay.date);
        const blueWon = (replay.blueTeam.goals || 0) > (replay.orangeTeam.goals || 0);

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
                losses: 0,
                avgPointsPerGame: 0,
                nukes: 0
            };

            if (!playerFirstSeen.has(player.globalPlayer.id)) {
                playerFirstSeen.set(player.globalPlayer.id, date);
            }
            playerLatestGame.set(player.globalPlayer.id, date);

            stats.gamesPlayed++;
            stats.totalGoals += player.goals || 0;
            stats.totalAssists += player.assists || 0;
            stats.totalSaves += player.saves || 0;
            stats.totalShots += player.shots || 0;
            stats.totalDemos += player.demoInflicted || 0;
            stats.totalScore += player.score || 0;
            stats.totalBoost += player.boostAvgAmount || 0;
            stats.avgPointsPerGame =
                stats.gamesPlayed > 0 ? stats.totalScore / stats.gamesPlayed : 0;
            if (blueWon) stats.wins++;
            else stats.losses++;
            if ((player.score || 0) >= 1000) stats.nukes++;

            playerStatsMap.set(player.globalPlayer.id, stats);

            const results = playerGameResults.get(player.globalPlayer.id) || [];
            results.push({ date, won: blueWon });
            playerGameResults.set(player.globalPlayer.id, results);
        });

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
                losses: 0,
                avgPointsPerGame: 0,
                nukes: 0
            };

            if (!playerFirstSeen.has(player.globalPlayer.id)) {
                playerFirstSeen.set(player.globalPlayer.id, date);
            }
            playerLatestGame.set(player.globalPlayer.id, date);

            stats.gamesPlayed++;
            stats.totalGoals += player.goals || 0;
            stats.totalAssists += player.assists || 0;
            stats.totalSaves += player.saves || 0;
            stats.totalShots += player.shots || 0;
            stats.totalDemos += player.demoInflicted || 0;
            stats.totalScore += player.score || 0;
            stats.totalBoost += player.boostAvgAmount || 0;
            stats.avgPointsPerGame =
                stats.gamesPlayed > 0 ? stats.totalScore / stats.gamesPlayed : 0;
            if (!blueWon) stats.wins++;
            else stats.losses++;
            if ((player.score || 0) >= 1000) stats.nukes++;

            playerStatsMap.set(player.globalPlayer.id, stats);

            const results = playerGameResults.get(player.globalPlayer.id) || [];
            results.push({ date, won: !blueWon });
            playerGameResults.set(player.globalPlayer.id, results);
        });
    });

    globalPlayers.forEach((player) => {
        const stats = playerStatsMap.get(player.id) || {
            id: player.id,
            name: player.name,
            totalGoals: 0,
            totalAssists: 0,
            totalSaves: 0,
            totalShots: 0,
            totalDemos: 0,
            totalScore: 0,
            totalBoost: 0,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            avgPointsPerGame: 0,
            nukes: 0
        };

        stats.gamesPlayed += player.forfeitCount || 0;
        stats.losses += player.forfeitCount || 0;
        playerStatsMap.set(player.id, stats);
    });

    return Array.from(playerStatsMap.values())
        .map((stats) => {
            const results = playerGameResults.get(stats.id) || [];
            let currentStreak = 0;
            let isWinningStreak = false;

            if (results.length > 0) {
                const mostRecentResult = results[0];
                isWinningStreak = mostRecentResult.won;
                currentStreak = 1;

                for (let i = 1; i < results.length; i++) {
                    if (results[i].won === isWinningStreak) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }

                if (!isWinningStreak) {
                    currentStreak = -currentStreak;
                }
            }

            return {
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
                losses: stats.losses,
                avgPointsPerGame: stats.avgPointsPerGame,
                firstSeen: playerFirstSeen.get(stats.id) || new Date(),
                latestGame: playerLatestGame.get(stats.id) || new Date(),
                currentStreak,
                isWinningStreak,
                nukes: stats.nukes
            };
        })
        .sort((a, b) => b.totalScore - a.totalScore);
}

export async function getGameHistory(playerId?: string): Promise<GameHistoryResult[]> {
    const games = await prisma.replay.findMany({
        where: {
            status: 'completed',
            AND: [
                { blueTeam: { isNot: null } },
                { orangeTeam: { isNot: null } },
                playerId
                    ? {
                          OR: [
                              {
                                  blueTeam: {
                                      players: {
                                          some: {
                                              globalPlayer: {
                                                  id: playerId
                                              }
                                          }
                                      }
                                  }
                              },
                              {
                                  orangeTeam: {
                                      players: {
                                          some: {
                                              globalPlayer: {
                                                  id: playerId
                                              }
                                          }
                                      }
                                  }
                              }
                          ]
                      }
                    : {}
            ]
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
