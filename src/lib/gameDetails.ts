import { prisma } from './prisma';

type GameDetailsResult = {
    id: string;
    date: string;
    map: string;
    duration: string;
    teamSize: number;
    overtime: boolean;
    overtimeSeconds: number;
    teams: {
        blue: TeamDetails;
        orange: TeamDetails;
    };
};

type TeamDetails = {
    name: string | null;
    score: number;
    goals: number;
    shots: number;
    saves: number;
    assists: number;
    shootingPercentage: number;
    possession: number;
    players: PlayerDetails[];
    stats: {
        boost: BoostStats;
        movement: MovementStats;
        positioning: PositioningStats;
        demos: DemoStats;
    };
};

type PlayerDetails = {
    name: string;
    score: number;
    goals: number;
    assists: number;
    saves: number;
    shots: number;
    shootingPercentage: number;
    mvp: boolean;
    stats: {
        boost: BoostStats;
        movement: MovementStats;
        positioning: PositioningStats;
        demos: DemoStats;
    };
};

type BoostStats = {
    bpm: number;
    amountCollected: number;
    amountStolen: number;
    timeEmpty: number;
    timeFull: number;
};

type MovementStats = {
    avgSpeed: number;
    totalDistance: number;
    timeSupersonic: number;
    timeOnGround: number;
    timeInAir: number;
};

type PositioningStats = {
    avgDistanceToBall: number;
    timeDefensiveHalf: number;
    timeOffensiveHalf: number;
    timeBehindBall: number;
    timeInfrontBall: number;
};

type DemoStats = {
    inflicted: number;
    taken: number;
};

type RawTeam = {
    name: string | null;
    score: number | null;
    goals: number | null;
    shots: number | null;
    saves: number | null;
    assists: number | null;
    shootingPercentage: number | null;
    possessionTime: number | null;
    players: RawPlayer[];
    boostBPM: number | null;
    boostAmountCollected: number | null;
    boostAmountStolen: number | null;
    boostTimeZeroBoost: number | null;
    boostTimeFullBoost: number | null;
    movementAvgSpeed: number | null;
    movementTotalDistance: number | null;
    movementTimeSupersonicSpeed: number | null;
    movementTimeGround: number | null;
    movementTimeLowAir: number | null;
    movementTimeHighAir: number | null;
    positioningAvgDistanceToBall: number | null;
    positioningTimeDefensiveHalf: number | null;
    positioningTimeOffensiveHalf: number | null;
    positioningTimeBehindBall: number | null;
    positioningTimeInfrontBall: number | null;
    demoInflicted: number | null;
    demoTaken: number | null;
};

type RawPlayer = {
    name: string;
    globalPlayer: { name: string } | null;
    score: number | null;
    goals: number | null;
    assists: number | null;
    saves: number | null;
    shots: number | null;
    shootingPercentage: number | null;
    mvp: boolean | null;
    boostBPM: number | null;
    boostAmountCollected: number | null;
    boostAmountStolen: number | null;
    boostTimeZeroBoost: number | null;
    boostTimeFullBoost: number | null;
    movementAvgSpeed: number | null;
    movementTotalDistance: number | null;
    movementTimeSupersonicSpeed: number | null;
    movementTimeGround: number | null;
    movementTimeLowAir: number | null;
    movementTimeHighAir: number | null;
    positioningAvgDistanceToBall: number | null;
    positioningTimeDefensiveHalf: number | null;
    positioningTimeOffensiveHalf: number | null;
    positioningTimeBehindBall: number | null;
    positioningTimeInfrontBall: number | null;
    demoInflicted: number | null;
    demoTaken: number | null;
};

const calculateAirTime = (lowAir: number | null, highAir: number | null): number => {
    return (lowAir || 0) + (highAir || 0);
};

const calculateShootingPercentage = (goals: number | null, shots: number | null): number => {
    if (!goals || !shots) return 0;
    return goals / shots;
};

const calculatePossessionPercentage = (
    teamTime: number | null,
    opposingTeamTime: number | null
): number => {
    if (!teamTime || !opposingTeamTime) return 0;
    const totalTime = teamTime + opposingTeamTime;
    if (totalTime === 0) return 0;
    return teamTime / totalTime;
};

const convertUnitsToMiles = (units: number): number => {
    // Field is 512 units = 200 meters
    const metersPerUnit = 200 / 512;
    const meters = units * metersPerUnit;
    const miles = meters / 1609.34;
    return miles;
};

export async function getGameDetails(gameId: string): Promise<GameDetailsResult> {
    const game = await prisma.replay.findUnique({
        where: { id: gameId },
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
        }
    });

    if (!game || !game.blueTeam || !game.orangeTeam) {
        throw new Error('Game not found');
    }

    const formatTeam = (team: RawTeam, opposingTeam: RawTeam): TeamDetails => {
        return {
            name: team.name,
            score: team.score || 0,
            goals: team.goals || 0,
            shots: team.shots || 0,
            saves: team.saves || 0,
            assists: team.assists || 0,
            shootingPercentage: calculateShootingPercentage(team.goals, team.shots),
            possession: calculatePossessionPercentage(
                team.possessionTime,
                opposingTeam.possessionTime
            ),
            players: team.players.map(
                (player: RawPlayer): PlayerDetails => ({
                    name: player.globalPlayer?.name || player.name,
                    score: player.score || 0,
                    goals: player.goals || 0,
                    assists: player.assists || 0,
                    saves: player.saves || 0,
                    shots: player.shots || 0,
                    shootingPercentage: calculateShootingPercentage(player.goals, player.shots),
                    mvp: player.mvp || false,
                    stats: {
                        boost: {
                            bpm: player.boostBPM || 0,
                            amountCollected: player.boostAmountCollected || 0,
                            amountStolen: player.boostAmountStolen || 0,
                            timeEmpty: player.boostTimeZeroBoost || 0,
                            timeFull: player.boostTimeFullBoost || 0
                        },
                        movement: {
                            avgSpeed: 0,
                            totalDistance: convertUnitsToMiles(player.movementTotalDistance || 0),
                            timeSupersonic: player.movementTimeSupersonicSpeed || 0,
                            timeOnGround: player.movementTimeGround || 0,
                            timeInAir: calculateAirTime(
                                player.movementTimeLowAir,
                                player.movementTimeHighAir
                            )
                        },
                        positioning: {
                            avgDistanceToBall: player.positioningAvgDistanceToBall || 0,
                            timeDefensiveHalf: player.positioningTimeDefensiveHalf || 0,
                            timeOffensiveHalf: player.positioningTimeOffensiveHalf || 0,
                            timeBehindBall: player.positioningTimeBehindBall || 0,
                            timeInfrontBall: player.positioningTimeInfrontBall || 0
                        },
                        demos: {
                            inflicted: player.demoInflicted || 0,
                            taken: player.demoTaken || 0
                        }
                    }
                })
            ),
            stats: {
                boost: {
                    bpm: team.boostBPM || 0,
                    amountCollected: team.boostAmountCollected || 0,
                    amountStolen: team.boostAmountStolen || 0,
                    timeEmpty: team.boostTimeZeroBoost || 0,
                    timeFull: team.boostTimeFullBoost || 0
                },
                movement: {
                    avgSpeed: 0,
                    totalDistance: convertUnitsToMiles(team.movementTotalDistance || 0),
                    timeSupersonic: team.movementTimeSupersonicSpeed || 0,
                    timeOnGround: team.movementTimeGround || 0,
                    timeInAir: calculateAirTime(team.movementTimeLowAir, team.movementTimeHighAir)
                },
                positioning: {
                    avgDistanceToBall: team.positioningAvgDistanceToBall || 0,
                    timeDefensiveHalf: team.positioningTimeDefensiveHalf || 0,
                    timeOffensiveHalf: team.positioningTimeOffensiveHalf || 0,
                    timeBehindBall: team.positioningTimeBehindBall || 0,
                    timeInfrontBall: team.positioningTimeInfrontBall || 0
                },
                demos: {
                    inflicted: team.demoInflicted || 0,
                    taken: team.demoTaken || 0
                }
            }
        };
    };

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return {
        id: game.id,
        date: game.date?.toISOString() || new Date().toISOString(),
        map: game.mapName || 'Unknown Map',
        duration: formatDuration(game.duration || 0),
        teamSize: game.teamSize || 0,
        overtime: game.overtime || false,
        overtimeSeconds: game.overtimeSeconds || 0,
        teams: {
            blue: formatTeam(game.blueTeam, game.orangeTeam),
            orange: formatTeam(game.orangeTeam, game.blueTeam)
        }
    };
}
