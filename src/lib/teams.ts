import { prisma } from "@/lib/prisma";
import { TeamData } from "@/models/ballchaser";
import { Team } from "@prisma/client";
import { createPlayerFromData } from "./players";

export async function createOrUpdateTeam(
  teamData: TeamData,
  color: string,
  isReprocessing = false,
  existingTeamId?: string,
): Promise<Team | null> {
  if (!teamData) return null;

  try {
    // If reprocessing and we have an existing team ID, use it
    let team: Team | null = null;
    if (isReprocessing && existingTeamId) {
      team = await prisma.team.findUnique({
        where: { id: existingTeamId },
        include: { players: true },
      });

      if (team) {
        // Update the team stats but keep existing players
        await prisma.team.update({
          where: { id: team.id },
          data: {
            // Update with new stats
            possessionTime: teamData.stats?.ball?.possession_time as
              | number
              | null,
            timeInSide: teamData.stats?.ball?.time_in_side as number | null,
            shots: teamData.stats?.core?.shots as number | null,
            shotsAgainst: teamData.stats?.core?.shots_against as number | null,
            goals: teamData.stats?.core?.goals as number | null,
            goalsAgainst: teamData.stats?.core?.goals_against as number | null,
            saves: teamData.stats?.core?.saves as number | null,
            assists: teamData.stats?.core?.assists as number | null,
            score: teamData.stats?.core?.score as number | null,
            shootingPercentage: teamData.stats?.core?.shooting_percentage as
              | number
              | null,
            boostBPM: teamData.stats?.boost?.bpm as number | null,
            boostBCPM: teamData.stats?.boost?.bcpm as number | null,
            boostAvgAmount: teamData.stats?.boost?.avg_amount as number | null,
            boostAmountCollected: teamData.stats?.boost?.amount_collected as
              | number
              | null,
            boostAmountStolen: teamData.stats?.boost?.amount_stolen as
              | number
              | null,
            boostAmountCollectedBig: teamData.stats?.boost
              ?.amount_collected_big as number | null,
            boostAmountStolenBig: teamData.stats?.boost?.amount_stolen_big as
              | number
              | null,
            boostAmountCollectedSmall: teamData.stats?.boost
              ?.amount_collected_small as number | null,
            boostAmountStolenSmall: teamData.stats?.boost
              ?.amount_stolen_small as number | null,
            boostCountCollectedBig: teamData.stats?.boost
              ?.count_collected_big as number | null,
            boostCountStolenBig: teamData.stats?.boost?.count_stolen_big as
              | number
              | null,
            boostCountCollectedSmall: teamData.stats?.boost
              ?.count_collected_small as number | null,
            boostCountStolenSmall: teamData.stats?.boost?.count_stolen_small as
              | number
              | null,
            boostAmountOverfill: teamData.stats?.boost?.amount_overfill as
              | number
              | null,
            boostAmountOverfillStolen: teamData.stats?.boost
              ?.amount_overfill_stolen as number | null,
            boostAmountUsedWhileSupersonic: teamData.stats?.boost
              ?.amount_used_while_supersonic as number | null,
            boostTimeZeroBoost: teamData.stats?.boost?.time_zero_boost as
              | number
              | null,
            boostTimeFullBoost: teamData.stats?.boost?.time_full_boost as
              | number
              | null,
            boostPercentZeroBoost: teamData.stats?.boost?.percent_zero_boost as
              | number
              | null,
            boostPercentFullBoost: teamData.stats?.boost?.percent_full_boost as
              | number
              | null,
            boostTimeBoost0_25: teamData.stats?.boost?.time_boost_0_25 as
              | number
              | null,
            boostTimeBoost25_50: teamData.stats?.boost?.time_boost_25_50 as
              | number
              | null,
            boostTimeBoost50_75: teamData.stats?.boost?.time_boost_50_75 as
              | number
              | null,
            boostTimeBoost75_100: teamData.stats?.boost?.time_boost_75_100 as
              | number
              | null,
            boostPercentBoost0_25: teamData.stats?.boost?.percent_boost_0_25 as
              | number
              | null,
            boostPercentBoost25_50: teamData.stats?.boost
              ?.percent_boost_25_50 as number | null,
            boostPercentBoost50_75: teamData.stats?.boost
              ?.percent_boost_50_75 as number | null,
            boostPercentBoost75_100: teamData.stats?.boost
              ?.percent_boost_75_100 as number | null,
            movementAvgSpeed: teamData.stats?.movement?.avg_speed as
              | number
              | null,
            movementTotalDistance: teamData.stats?.movement?.total_distance as
              | number
              | null,
            movementTimeSupersonicSpeed: teamData.stats?.movement
              ?.time_supersonic_speed as number | null,
            movementTimeBoostSpeed: teamData.stats?.movement
              ?.time_boost_speed as number | null,
            movementTimeSlowSpeed: teamData.stats?.movement?.time_slow_speed as
              | number
              | null,
            movementTimeGround: teamData.stats?.movement?.time_ground as
              | number
              | null,
            movementTimeLowAir: teamData.stats?.movement?.time_low_air as
              | number
              | null,
            movementTimeHighAir: teamData.stats?.movement?.time_high_air as
              | number
              | null,
            movementTimePowerslide: teamData.stats?.movement
              ?.time_powerslide as number | null,
            movementCountPowerslide: teamData.stats?.movement
              ?.count_powerslide as number | null,
            movementAvgPowerslideDuration: teamData.stats?.movement
              ?.avg_powerslide_duration as number | null,
            movementAvgSpeedPercentage: teamData.stats?.movement
              ?.avg_speed_percentage as number | null,
            movementPercentSlowSpeed: teamData.stats?.movement
              ?.percent_slow_speed as number | null,
            movementPercentBoostSpeed: teamData.stats?.movement
              ?.percent_boost_speed as number | null,
            movementPercentSupersonicSpeed: teamData.stats?.movement
              ?.percent_supersonic_speed as number | null,
            movementPercentGround: teamData.stats?.movement?.percent_ground as
              | number
              | null,
            movementPercentLowAir: teamData.stats?.movement?.percent_low_air as
              | number
              | null,
            movementPercentHighAir: teamData.stats?.movement
              ?.percent_high_air as number | null,
            positioningAvgDistanceToBall: teamData.stats?.positioning
              ?.avg_distance_to_ball as number | null,
            positioningAvgDistanceToBallPossession: teamData.stats?.positioning
              ?.avg_distance_to_ball_possession as number | null,
            positioningAvgDistanceToBallNoPossession: teamData.stats
              ?.positioning?.avg_distance_to_ball_no_possession as
              | number
              | null,
            positioningAvgDistanceToMates: teamData.stats?.positioning
              ?.avg_distance_to_mates as number | null,
            positioningTimeDefensiveThird: teamData.stats?.positioning
              ?.time_defensive_third as number | null,
            positioningTimeNeutralThird: teamData.stats?.positioning
              ?.time_neutral_third as number | null,
            positioningTimeOffensiveThird: teamData.stats?.positioning
              ?.time_offensive_third as number | null,
            positioningTimeDefensiveHalf: teamData.stats?.positioning
              ?.time_defensive_half as number | null,
            positioningTimeOffensiveHalf: teamData.stats?.positioning
              ?.time_offensive_half as number | null,
            positioningTimeBehindBall: teamData.stats?.positioning
              ?.time_behind_ball as number | null,
            positioningTimeInfrontBall: teamData.stats?.positioning
              ?.time_infront_ball as number | null,
            positioningTimeMostBack: teamData.stats?.positioning
              ?.time_most_back as number | null,
            positioningTimeMostForward: teamData.stats?.positioning
              ?.time_most_forward as number | null,
            positioningTimeClosestToBall: teamData.stats?.positioning
              ?.time_closest_to_ball as number | null,
            positioningTimeFarthestFromBall: teamData.stats?.positioning
              ?.time_farthest_from_ball as number | null,
            positioningPercentDefensiveThird: teamData.stats?.positioning
              ?.percent_defensive_third as number | null,
            positioningPercentOffensiveThird: teamData.stats?.positioning
              ?.percent_offensive_third as number | null,
            positioningPercentNeutralThird: teamData.stats?.positioning
              ?.percent_neutral_third as number | null,
            positioningPercentDefensiveHalf: teamData.stats?.positioning
              ?.percent_defensive_half as number | null,
            positioningPercentOffensiveHalf: teamData.stats?.positioning
              ?.percent_offensive_half as number | null,
            positioningPercentBehindBall: teamData.stats?.positioning
              ?.percent_behind_ball as number | null,
            positioningPercentInfrontBall: teamData.stats?.positioning
              ?.percent_infront_ball as number | null,
            positioningPercentMostBack: teamData.stats?.positioning
              ?.percent_most_back as number | null,
            positioningPercentMostForward: teamData.stats?.positioning
              ?.percent_most_forward as number | null,
            positioningPercentClosestToBall: teamData.stats?.positioning
              ?.percent_closest_to_ball as number | null,
            positioningPercentFarthestFromBall: teamData.stats?.positioning
              ?.percent_farthest_from_ball as number | null,
            goalsAgainstWhileLastDefender: teamData.stats?.positioning
              ?.goals_against_while_last_defender as number | null,
            demoInflicted: teamData.stats?.demo?.inflicted as number | null,
            demoTaken: teamData.stats?.demo?.taken as number | null,
          },
        });

        // Delete existing players
        await prisma.player.deleteMany({
          where: { teamId: team.id },
        });

        // Create players for the team if they exist
        if (teamData.players && teamData.players.length > 0) {
          await Promise.all(
            teamData.players.map(async (playerData) => {
              return await createPlayerFromData(playerData, team!);
            }),
          );
        }

        return team;
      }
    }

    // Create team with all stats
    team = await prisma.team.create({
      data: {
        color,
        name: teamData.name as string | null,
        possessionTime: teamData.stats?.ball?.possession_time as number | null,
        timeInSide: teamData.stats?.ball?.time_in_side as number | null,
        shots: teamData.stats?.core?.shots as number | null,
        shotsAgainst: teamData.stats?.core?.shots_against as number | null,
        goals: teamData.stats?.core?.goals as number | null,
        goalsAgainst: teamData.stats?.core?.goals_against as number | null,
        saves: teamData.stats?.core?.saves as number | null,
        assists: teamData.stats?.core?.assists as number | null,
        score: teamData.stats?.core?.score as number | null,
        shootingPercentage: teamData.stats?.core?.shooting_percentage as
          | number
          | null,
        boostBPM: teamData.stats?.boost?.bpm as number | null,
        boostBCPM: teamData.stats?.boost?.bcpm as number | null,
        boostAvgAmount: teamData.stats?.boost?.avg_amount as number | null,
        boostAmountCollected: teamData.stats?.boost?.amount_collected as
          | number
          | null,
        boostAmountStolen: teamData.stats?.boost?.amount_stolen as
          | number
          | null,
        boostAmountCollectedBig: teamData.stats?.boost?.amount_collected_big as
          | number
          | null,
        boostAmountStolenBig: teamData.stats?.boost?.amount_stolen_big as
          | number
          | null,
        boostAmountCollectedSmall: teamData.stats?.boost
          ?.amount_collected_small as number | null,
        boostAmountStolenSmall: teamData.stats?.boost?.amount_stolen_small as
          | number
          | null,
        boostCountCollectedBig: teamData.stats?.boost?.count_collected_big as
          | number
          | null,
        boostCountStolenBig: teamData.stats?.boost?.count_stolen_big as
          | number
          | null,
        boostCountCollectedSmall: teamData.stats?.boost
          ?.count_collected_small as number | null,
        boostCountStolenSmall: teamData.stats?.boost?.count_stolen_small as
          | number
          | null,
        boostAmountOverfill: teamData.stats?.boost?.amount_overfill as
          | number
          | null,
        boostAmountOverfillStolen: teamData.stats?.boost
          ?.amount_overfill_stolen as number | null,
        boostAmountUsedWhileSupersonic: teamData.stats?.boost
          ?.amount_used_while_supersonic as number | null,
        boostTimeZeroBoost: teamData.stats?.boost?.time_zero_boost as
          | number
          | null,
        boostTimeFullBoost: teamData.stats?.boost?.time_full_boost as
          | number
          | null,
        boostPercentZeroBoost: teamData.stats?.boost?.percent_zero_boost as
          | number
          | null,
        boostPercentFullBoost: teamData.stats?.boost?.percent_full_boost as
          | number
          | null,
        boostTimeBoost0_25: teamData.stats?.boost?.time_boost_0_25 as
          | number
          | null,
        boostTimeBoost25_50: teamData.stats?.boost?.time_boost_25_50 as
          | number
          | null,
        boostTimeBoost50_75: teamData.stats?.boost?.time_boost_50_75 as
          | number
          | null,
        boostTimeBoost75_100: teamData.stats?.boost?.time_boost_75_100 as
          | number
          | null,
        boostPercentBoost0_25: teamData.stats?.boost?.percent_boost_0_25 as
          | number
          | null,
        boostPercentBoost25_50: teamData.stats?.boost?.percent_boost_25_50 as
          | number
          | null,
        boostPercentBoost50_75: teamData.stats?.boost?.percent_boost_50_75 as
          | number
          | null,
        boostPercentBoost75_100: teamData.stats?.boost?.percent_boost_75_100 as
          | number
          | null,
        movementAvgSpeed: teamData.stats?.movement?.avg_speed as number | null,
        movementTotalDistance: teamData.stats?.movement?.total_distance as
          | number
          | null,
        movementTimeSupersonicSpeed: teamData.stats?.movement
          ?.time_supersonic_speed as number | null,
        movementTimeBoostSpeed: teamData.stats?.movement?.time_boost_speed as
          | number
          | null,
        movementTimeSlowSpeed: teamData.stats?.movement?.time_slow_speed as
          | number
          | null,
        movementTimeGround: teamData.stats?.movement?.time_ground as
          | number
          | null,
        movementTimeLowAir: teamData.stats?.movement?.time_low_air as
          | number
          | null,
        movementTimeHighAir: teamData.stats?.movement?.time_high_air as
          | number
          | null,
        movementTimePowerslide: teamData.stats?.movement?.time_powerslide as
          | number
          | null,
        movementCountPowerslide: teamData.stats?.movement?.count_powerslide as
          | number
          | null,
        movementAvgPowerslideDuration: teamData.stats?.movement
          ?.avg_powerslide_duration as number | null,
        movementAvgSpeedPercentage: teamData.stats?.movement
          ?.avg_speed_percentage as number | null,
        movementPercentSlowSpeed: teamData.stats?.movement
          ?.percent_slow_speed as number | null,
        movementPercentBoostSpeed: teamData.stats?.movement
          ?.percent_boost_speed as number | null,
        movementPercentSupersonicSpeed: teamData.stats?.movement
          ?.percent_supersonic_speed as number | null,
        movementPercentGround: teamData.stats?.movement?.percent_ground as
          | number
          | null,
        movementPercentLowAir: teamData.stats?.movement?.percent_low_air as
          | number
          | null,
        movementPercentHighAir: teamData.stats?.movement?.percent_high_air as
          | number
          | null,
        positioningAvgDistanceToBall: teamData.stats?.positioning
          ?.avg_distance_to_ball as number | null,
        positioningAvgDistanceToBallPossession: teamData.stats?.positioning
          ?.avg_distance_to_ball_possession as number | null,
        positioningAvgDistanceToBallNoPossession: teamData.stats?.positioning
          ?.avg_distance_to_ball_no_possession as number | null,
        positioningAvgDistanceToMates: teamData.stats?.positioning
          ?.avg_distance_to_mates as number | null,
        positioningTimeDefensiveThird: teamData.stats?.positioning
          ?.time_defensive_third as number | null,
        positioningTimeNeutralThird: teamData.stats?.positioning
          ?.time_neutral_third as number | null,
        positioningTimeOffensiveThird: teamData.stats?.positioning
          ?.time_offensive_third as number | null,
        positioningTimeDefensiveHalf: teamData.stats?.positioning
          ?.time_defensive_half as number | null,
        positioningTimeOffensiveHalf: teamData.stats?.positioning
          ?.time_offensive_half as number | null,
        positioningTimeBehindBall: teamData.stats?.positioning
          ?.time_behind_ball as number | null,
        positioningTimeInfrontBall: teamData.stats?.positioning
          ?.time_infront_ball as number | null,
        positioningTimeMostBack: teamData.stats?.positioning?.time_most_back as
          | number
          | null,
        positioningTimeMostForward: teamData.stats?.positioning
          ?.time_most_forward as number | null,
        positioningTimeClosestToBall: teamData.stats?.positioning
          ?.time_closest_to_ball as number | null,
        positioningTimeFarthestFromBall: teamData.stats?.positioning
          ?.time_farthest_from_ball as number | null,
        positioningPercentDefensiveThird: teamData.stats?.positioning
          ?.percent_defensive_third as number | null,
        positioningPercentOffensiveThird: teamData.stats?.positioning
          ?.percent_offensive_third as number | null,
        positioningPercentNeutralThird: teamData.stats?.positioning
          ?.percent_neutral_third as number | null,
        positioningPercentDefensiveHalf: teamData.stats?.positioning
          ?.percent_defensive_half as number | null,
        positioningPercentOffensiveHalf: teamData.stats?.positioning
          ?.percent_offensive_half as number | null,
        positioningPercentBehindBall: teamData.stats?.positioning
          ?.percent_behind_ball as number | null,
        positioningPercentInfrontBall: teamData.stats?.positioning
          ?.percent_infront_ball as number | null,
        positioningPercentMostBack: teamData.stats?.positioning
          ?.percent_most_back as number | null,
        positioningPercentMostForward: teamData.stats?.positioning
          ?.percent_most_forward as number | null,
        positioningPercentClosestToBall: teamData.stats?.positioning
          ?.percent_closest_to_ball as number | null,
        positioningPercentFarthestFromBall: teamData.stats?.positioning
          ?.percent_farthest_from_ball as number | null,
        goalsAgainstWhileLastDefender: teamData.stats?.positioning
          ?.goals_against_while_last_defender as number | null,
        demoInflicted: teamData.stats?.demo?.inflicted as number | null,
        demoTaken: teamData.stats?.demo?.taken as number | null,
      },
    });

    // Create players for the team if they exist
    if (teamData.players && teamData.players.length > 0) {
      await Promise.all(
        teamData.players.map(async (playerData) => {
          return await createPlayerFromData(playerData, team!);
        }),
      );
    }

    return team;
  } catch (error) {
    console.error("Error creating team:", error);
    return null;
  }
}
