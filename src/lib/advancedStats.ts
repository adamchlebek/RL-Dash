import { prisma } from './prisma';

interface PlayerPosition {
    name: string;
    behindBallPercent: number;
    lastBackPercent: number;
    closestToBallPercent: number;
    avgDistanceToBall: number;
    avgSpeed: number;
    timeSupersonic: number;
}

interface PlayerMovementStats {
    name: string;
    movementPercentGround: number;
    movementPercentLowAir: number;
    movementPercentHighAir: number;
    boostPercent0_25: number;
    boostPercent25_50: number;
    boostPercent50_75: number;
    boostPercent75_100: number;
}

interface PlayerLastDefenderStats {
    name: string;
    totalGoalsConceded: number;
    goalsAsLastDefender: number;
    totalSaves: number;
}

export const getLastDefenderStats = async (): Promise<PlayerLastDefenderStats[]> => {
    try {
        const players = await prisma.player.groupBy({
            by: ['platformId', 'platform'],
            _sum: {
                goalsAgainst: true,
                goalsAgainstWhileLastDefender: true,
                saves: true
            }
        });

        const stats = await Promise.all(
            players.map(async (stat) => {
                const globalPlayer = await prisma.globalPlayer.findUnique({
                    where: {
                        platform_platformId: {
                            platform: stat.platform,
                            platformId: stat.platformId
                        }
                    },
                    select: {
                        name: true
                    }
                });

                if (!globalPlayer) return null;

                return {
                    name: globalPlayer.name,
                    totalGoalsConceded: stat._sum.goalsAgainst || 0,
                    goalsAsLastDefender: stat._sum.goalsAgainstWhileLastDefender || 0,
                    totalSaves: stat._sum.saves || 0
                };
            })
        );

        return stats
            .filter((stat): stat is PlayerLastDefenderStats => stat !== null)
            .sort((a, b) => {
                const aPercent = a.totalGoalsConceded > 0 ? (a.goalsAsLastDefender / a.totalGoalsConceded) * 100 : 0;
                const bPercent = b.totalGoalsConceded > 0 ? (b.goalsAsLastDefender / b.totalGoalsConceded) * 100 : 0;
                
                return bPercent - aPercent;
            });
    } catch (error) {
        throw error;
    }
};

export const getPlayerPositioningStats = async (): Promise<PlayerPosition[]> => {
    try {
        const stats = await prisma.player.groupBy({
            by: ['platformId', 'platform'],
            _avg: {
                positioningPercentBehindBall: true,
                positioningPercentMostBack: true,
                positioningPercentClosestToBall: true,
                positioningAvgDistanceToBall: true,
                movementAvgSpeed: true,
                movementPercentSupersonicSpeed: true
            }
        });

        const players = await Promise.all(
            stats.map(async (stat) => {
                const globalPlayer = await prisma.globalPlayer.findUnique({
                    where: {
                        platform_platformId: {
                            platform: stat.platform,
                            platformId: stat.platformId
                        }
                    },
                    select: {
                        name: true
                    }
                });

                return {
                    name: globalPlayer?.name || stat.platformId,
                    behindBallPercent: Math.round(stat._avg.positioningPercentBehindBall || 0),
                    lastBackPercent: Math.round(stat._avg.positioningPercentMostBack || 0),
                    closestToBallPercent: Math.round(
                        stat._avg.positioningPercentClosestToBall || 0
                    ),
                    avgDistanceToBall: Math.round(stat._avg.positioningAvgDistanceToBall || 0),
                    avgSpeed: Math.round(stat._avg.movementAvgSpeed || 0),
                    timeSupersonic: Math.round(stat._avg.movementPercentSupersonicSpeed || 0)
                };
            })
        );

        return players;
    } catch (error) {
        throw error;
    }
};

export const getPlayerMovementStats = async (): Promise<PlayerMovementStats[]> => {
    try {
        const stats = await prisma.player.groupBy({
            by: ['platformId', 'platform'],
            _avg: {
                movementPercentGround: true,
                movementPercentLowAir: true,
                movementPercentHighAir: true,
                boostPercentBoost0_25: true,
                boostPercentBoost25_50: true,
                boostPercentBoost50_75: true,
                boostPercentBoost75_100: true
            }
        });

        const players = await Promise.all(
            stats.map(async (stat) => {
                try {
                    const globalPlayer = await prisma.globalPlayer.findUnique({
                        where: {
                            platform_platformId: {
                                platform: stat.platform,
                                platformId: stat.platformId
                            }
                        },
                        select: {
                            name: true
                        }
                    });

                    return {
                        name: globalPlayer?.name || stat.platformId,
                        movementPercentGround: Math.round(stat._avg?.movementPercentGround || 0),
                        movementPercentLowAir: Math.round(stat._avg?.movementPercentLowAir || 0),
                        movementPercentHighAir: Math.round(stat._avg?.movementPercentHighAir || 0),
                        boostPercent0_25: Math.round(stat._avg?.boostPercentBoost0_25 || 0),
                        boostPercent25_50: Math.round(stat._avg?.boostPercentBoost25_50 || 0),
                        boostPercent50_75: Math.round(stat._avg?.boostPercentBoost50_75 || 0),
                        boostPercent75_100: Math.round(stat._avg?.boostPercentBoost75_100 || 0)
                    };
                } catch (error) {
                    throw error;
                }
            })
        );

        return players;
    } catch (error) {
        throw error;
    }
};
