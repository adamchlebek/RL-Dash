import { prisma } from '@/lib/prisma';
import { PlayerData } from '@/models/ballchaser';
import { Player, Team, Prisma } from '@prisma/client';

export async function createPlayerFromData(
    playerData: PlayerData,
    team: Team
): Promise<Player | null> {
    if (!playerData || !team) return null;

    try {
        // First, find or create the GlobalPlayer record
        const globalPlayer = await (async () => {
            if (playerData.id?.platform && playerData.id?.id) {
                try {
                    // Check if a global player exists
                    const existingGlobalPlayer = await prisma.globalPlayer.findUnique({
                        where: {
                            platform_platformId: {
                                platform: playerData.id.platform as string,
                                platformId: playerData.id.id as string
                            }
                        }
                    });

                    if (existingGlobalPlayer) {
                        // Update if name changed
                        if (existingGlobalPlayer.name !== playerData.name) {
                            return await prisma.globalPlayer.update({
                                where: { id: existingGlobalPlayer.id },
                                data: { name: playerData.name as string }
                            });
                        }
                        return existingGlobalPlayer;
                    } else {
                        // Create new global player
                        return await prisma.globalPlayer.create({
                            data: {
                                platform: playerData.id.platform as string,
                                platformId: playerData.id.id as string,
                                name: playerData.name as string
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error creating/updating global player:', error);
                }
            }
            return null;
        })();

        if (!globalPlayer) {
            console.error('Failed to create or find global player for:', playerData.name);
            return null;
        }

        // Extract stats from the player data
        const coreStats = playerData.stats?.core || {};
        const boostStats = playerData.stats?.boost || {};
        const movementStats = playerData.stats?.movement || {};
        const positioningStats = playerData.stats?.positioning || {};
        const demoStats = playerData.stats?.demo || {};

        // Create the player with all fields
        const playerCreateInput: Prisma.PlayerUncheckedCreateInput = {
            name: playerData.name as string,
            platform: playerData.id?.platform as string,
            platformId: playerData.id?.id as string,
            carName: playerData.car_name as string,
            carId: playerData.car_id as number,
            startTime: playerData.start_time as number,
            endTime: playerData.end_time as number,
            steeringSensitivity: playerData.steering_sensitivity as number,
            mvp: !!playerData.mvp,
            teamId: team.id,

            // Core stats
            score: coreStats.score as number,
            goals: coreStats.goals as number,
            assists: coreStats.assists as number,
            saves: coreStats.saves as number,
            shots: coreStats.shots as number,
            shotsAgainst: coreStats.shots_against as number,
            goalsAgainst: coreStats.goals_against as number,
            shootingPercentage: coreStats.shooting_percentage as number,

            // Boost stats
            boostBPM: boostStats.bpm as number,
            boostBCPM: boostStats.bcpm as number,
            boostAvgAmount: boostStats.avg_amount as number,
            boostAmountCollected: boostStats.amount_collected as number,
            boostAmountStolen: boostStats.amount_stolen as number,
            boostAmountCollectedBig: boostStats.amount_collected_big as number,
            boostAmountStolenBig: boostStats.amount_stolen_big as number,
            boostAmountCollectedSmall: boostStats.amount_collected_small as number,
            boostAmountStolenSmall: boostStats.amount_stolen_small as number,
            boostCountCollectedBig: boostStats.count_collected_big as number,
            boostCountStolenBig: boostStats.count_stolen_big as number,
            boostCountCollectedSmall: boostStats.count_collected_small as number,
            boostCountStolenSmall: boostStats.count_stolen_small as number,
            boostAmountOverfill: boostStats.amount_overfill as number,
            boostAmountOverfillStolen: boostStats.amount_overfill_stolen as number,
            boostAmountUsedWhileSupersonic: boostStats.amount_used_while_supersonic as number,
            boostTimeZeroBoost: boostStats.time_zero_boost as number,
            boostTimeFullBoost: boostStats.time_full_boost as number,
            boostPercentZeroBoost: boostStats.percent_zero_boost as number,
            boostPercentFullBoost: boostStats.percent_full_boost as number,
            boostTimeBoost0_25: boostStats.time_boost_0_25 as number,
            boostTimeBoost25_50: boostStats.time_boost_25_50 as number,
            boostTimeBoost50_75: boostStats.time_boost_50_75 as number,
            boostTimeBoost75_100: boostStats.time_boost_75_100 as number,
            boostPercentBoost0_25: boostStats.percent_boost_0_25 as number,
            boostPercentBoost25_50: boostStats.percent_boost_25_50 as number,
            boostPercentBoost50_75: boostStats.percent_boost_50_75 as number,
            boostPercentBoost75_100: boostStats.percent_boost_75_100 as number,

            // Movement stats
            movementAvgSpeed: movementStats.avg_speed as number,
            movementTotalDistance: movementStats.total_distance as number,
            movementTimeSupersonicSpeed: movementStats.time_supersonic_speed as number,
            movementTimeBoostSpeed: movementStats.time_boost_speed as number,
            movementTimeSlowSpeed: movementStats.time_slow_speed as number,
            movementTimeGround: movementStats.time_ground as number,
            movementTimeLowAir: movementStats.time_low_air as number,
            movementTimeHighAir: movementStats.time_high_air as number,
            movementTimePowerslide: movementStats.time_powerslide as number,
            movementCountPowerslide: movementStats.count_powerslide as number,
            movementAvgPowerslideDuration: movementStats.avg_powerslide_duration as number,
            movementAvgSpeedPercentage: movementStats.avg_speed_percentage as number,
            movementPercentSlowSpeed: movementStats.percent_slow_speed as number,
            movementPercentBoostSpeed: movementStats.percent_boost_speed as number,
            movementPercentSupersonicSpeed: movementStats.percent_supersonic_speed as number,
            movementPercentGround: movementStats.percent_ground as number,
            movementPercentLowAir: movementStats.percent_low_air as number,
            movementPercentHighAir: movementStats.percent_high_air as number,

            // Positioning stats
            positioningAvgDistanceToBall: positioningStats.avg_distance_to_ball as number,
            positioningAvgDistanceToBallPossession:
                positioningStats.avg_distance_to_ball_possession as number,
            positioningAvgDistanceToBallNoPossession:
                positioningStats.avg_distance_to_ball_no_possession as number,
            positioningAvgDistanceToMates: positioningStats.avg_distance_to_mates as number,
            positioningTimeDefensiveThird: positioningStats.time_defensive_third as number,
            positioningTimeNeutralThird: positioningStats.time_neutral_third as number,
            positioningTimeOffensiveThird: positioningStats.time_offensive_third as number,
            positioningTimeDefensiveHalf: positioningStats.time_defensive_half as number,
            positioningTimeOffensiveHalf: positioningStats.time_offensive_half as number,
            positioningTimeBehindBall: positioningStats.time_behind_ball as number,
            positioningTimeInfrontBall: positioningStats.time_infront_ball as number,
            positioningTimeMostBack: positioningStats.time_most_back as number,
            positioningTimeMostForward: positioningStats.time_most_forward as number,
            positioningTimeClosestToBall: positioningStats.time_closest_to_ball as number,
            positioningTimeFarthestFromBall: positioningStats.time_farthest_from_ball as number,
            positioningPercentDefensiveThird: positioningStats.percent_defensive_third as number,
            positioningPercentOffensiveThird: positioningStats.percent_offensive_third as number,
            positioningPercentNeutralThird: positioningStats.percent_neutral_third as number,
            positioningPercentDefensiveHalf: positioningStats.percent_defensive_half as number,
            positioningPercentOffensiveHalf: positioningStats.percent_offensive_half as number,
            positioningPercentBehindBall: positioningStats.percent_behind_ball as number,
            positioningPercentInfrontBall: positioningStats.percent_infront_ball as number,
            positioningPercentMostBack: positioningStats.percent_most_back as number,
            positioningPercentMostForward: positioningStats.percent_most_forward as number,
            positioningPercentClosestToBall: positioningStats.percent_closest_to_ball as number,
            positioningPercentFarthestFromBall:
                positioningStats.percent_farthest_from_ball as number,
            goalsAgainstWhileLastDefender:
                positioningStats.goals_against_while_last_defender as number,

            // Demo stats
            demoInflicted: demoStats.inflicted as number,
            demoTaken: demoStats.taken as number
        };

        const player = await prisma.player.create({
            data: playerCreateInput
        });

        return player;
    } catch (error) {
        console.error('Error creating player:', error);
        return null;
    }
}
