import { NextRequest, NextResponse } from 'next/server';
import { checkReplayStatus, fetchFullReplayData } from '@/lib/ballchasing';
import { prisma, checkDatabaseConnection } from '@/lib/prisma';
import { Replay, ReplayStatus } from '@/types';
import { BallchasingReplayResponse, Group, Team } from '@/types/ballchasing';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProcessingResult {
  id: string;
  ballchasingId: string;
  status: ReplayStatus;
  message?: string;
}

// Helper functions to create or update related entities
async function createOrUpdateTeam(teamData: any, color: string) {
  if (!teamData) return null;

  try {
    // Create a unique identifier for the team based on the replay and color
    const teamId = `${teamData.name || color}-${new Date().getTime()}`;
    
    // Core stats extraction
    const coreStats = teamData.stats?.core || {};
    const boostStats = teamData.stats?.boost || {};
    const movementStats = teamData.stats?.movement || {};
    const positioningStats = teamData.stats?.positioning || {};
    const demoStats = teamData.stats?.demo || {};
    const ballStats = teamData.stats?.ball || {};

    // Create the team
    const team = await prisma.team.create({
      data: {
        color: color,
        name: teamData.name || color,
        
        // Stats
        possessionTime: ballStats?.possession_time,
        timeInSide: ballStats?.time_in_side,
        
        // Core stats
        shots: coreStats?.shots,
        shotsAgainst: coreStats?.shots_against,
        goals: coreStats?.goals,
        goalsAgainst: coreStats?.goals_against,
        saves: coreStats?.saves,
        assists: coreStats?.assists,
        score: coreStats?.score,
        shootingPercentage: coreStats?.shooting_percentage,
        
        // Team boost stats
        boostBPM: boostStats?.bpm,
        boostBCPM: boostStats?.bcpm,
        boostAvgAmount: boostStats?.avg_amount,
        boostAmountCollected: boostStats?.amount_collected,
        boostAmountStolen: boostStats?.amount_stolen,
        boostAmountCollectedBig: boostStats?.amount_collected_big,
        boostAmountStolenBig: boostStats?.amount_stolen_big,
        boostAmountCollectedSmall: boostStats?.amount_collected_small,
        boostAmountStolenSmall: boostStats?.amount_stolen_small,
        boostCountCollectedBig: boostStats?.count_collected_big,
        boostCountStolenBig: boostStats?.count_stolen_big,
        boostCountCollectedSmall: boostStats?.count_collected_small,
        boostCountStolenSmall: boostStats?.count_stolen_small,
        boostAmountOverfill: boostStats?.amount_overfill,
        boostAmountOverfillStolen: boostStats?.amount_overfill_stolen,
        boostAmountUsedWhileSupersonic: boostStats?.amount_used_while_supersonic,
        boostTimeZeroBoost: boostStats?.time_zero_boost,
        boostTimeFullBoost: boostStats?.time_full_boost,
        boostTimeBoost0_25: boostStats?.time_boost_0_25,
        boostTimeBoost25_50: boostStats?.time_boost_25_50,
        boostTimeBoost50_75: boostStats?.time_boost_50_75,
        boostTimeBoost75_100: boostStats?.time_boost_75_100,
        
        // Team movement stats
        movementTotalDistance: movementStats?.total_distance,
        movementTimeSupersonicSpeed: movementStats?.time_supersonic_speed,
        movementTimeBoostSpeed: movementStats?.time_boost_speed,
        movementTimeSlowSpeed: movementStats?.time_slow_speed,
        movementTimeGround: movementStats?.time_ground,
        movementTimeLowAir: movementStats?.time_low_air,
        movementTimeHighAir: movementStats?.time_high_air,
        movementTimePowerslide: movementStats?.time_powerslide,
        movementCountPowerslide: movementStats?.count_powerslide,
        
        // Team positioning stats
        positioningTimeDefensiveThird: positioningStats?.time_defensive_third,
        positioningTimeNeutralThird: positioningStats?.time_neutral_third,
        positioningTimeOffensiveThird: positioningStats?.time_offensive_third,
        positioningTimeDefensiveHalf: positioningStats?.time_defensive_half,
        positioningTimeOffensiveHalf: positioningStats?.time_offensive_half,
        positioningTimeBehindBall: positioningStats?.time_behind_ball,
        positioningTimeInfrontBall: positioningStats?.time_infront_ball,
        
        // Team demo stats
        demoInflicted: demoStats?.inflicted,
        demoTaken: demoStats?.taken,
      }
    });

    // Create players for the team
    if (teamData.players && teamData.players.length > 0) {
      await Promise.all(
        teamData.players.map(async (playerData: any) => {
          // First, find or create the GlobalPlayer record
          if (playerData.id?.platform && playerData.id?.id) {
            try {
              // Check if a global player exists
              const existingGlobalPlayer = await prisma.globalPlayer.findUnique({
                where: {
                  platform_platformId: {
                    platform: playerData.id.platform,
                    platformId: playerData.id.id
                  }
                }
              });
              
              if (existingGlobalPlayer) {
                // Update if name changed
                if (existingGlobalPlayer.name !== playerData.name) {
                  await prisma.globalPlayer.update({
                    where: { id: existingGlobalPlayer.id },
                    data: { name: playerData.name }
                  });
                }
              } else {
                // Create new global player
                await prisma.globalPlayer.create({
                  data: {
                    platform: playerData.id.platform,
                    platformId: playerData.id.id,
                    name: playerData.name
                  }
                });
              }
            } catch (error) {
              console.error('Error creating/updating global player:', error);
            }
          }

          // Create the camera first if it exists
          let cameraId = null;
          if (playerData.camera) {
            const camera = await prisma.camera.create({
              data: {
                fov: playerData.camera.fov,
                height: playerData.camera.height,
                pitch: playerData.camera.pitch,
                distance: playerData.camera.distance,
                stiffness: playerData.camera.stiffness,
                swivelSpeed: playerData.camera.swivel_speed,
                transitionSpeed: playerData.camera.transition_speed
              }
            });
            cameraId = camera.id;
          }

          // Player core stats extraction
          const coreStats = playerData.stats?.core || {};
          const boostStats = playerData.stats?.boost || {};
          const movementStats = playerData.stats?.movement || {};
          const positioningStats = playerData.stats?.positioning || {};
          const demoStats = playerData.stats?.demo || {};

          // Create the player
          await prisma.player.create({
            data: {
              platform: playerData.id?.platform,
              platformId: playerData.id?.id,
              name: playerData.name,
              car: playerData.car_name,
              steeringSensitivity: playerData.steering_sensitivity,
              
              // Connect to team and camera
              team: { connect: { id: team.id } },
              camera: cameraId ? { connect: { id: cameraId } } : undefined,
              
              // Player core stats
              score: coreStats?.score,
              goals: coreStats?.goals,
              saves: coreStats?.saves,
              assists: coreStats?.assists,
              shots: coreStats?.shots,
              
              // Player boost stats
              boostBPM: boostStats?.bpm,
              boostBCPM: boostStats?.bcpm,
              boostAvgAmount: boostStats?.avg_amount,
              boostAmountCollected: boostStats?.amount_collected,
              boostAmountStolen: boostStats?.amount_stolen,
              boostAmountCollectedBig: boostStats?.amount_collected_big,
              boostAmountStolenBig: boostStats?.amount_stolen_big,
              boostAmountCollectedSmall: boostStats?.amount_collected_small,
              boostAmountStolenSmall: boostStats?.amount_stolen_small,
              boostCountCollectedBig: boostStats?.count_collected_big,
              boostCountStolenBig: boostStats?.count_stolen_big,
              boostCountCollectedSmall: boostStats?.count_collected_small,
              boostCountStolenSmall: boostStats?.count_stolen_small,
              boostAmountOverfill: boostStats?.amount_overfill,
              boostAmountOverfillStolen: boostStats?.amount_overfill_stolen,
              boostAmountUsedWhileSupersonic: boostStats?.amount_used_while_supersonic,
              boostTimeZeroBoost: boostStats?.time_zero_boost,
              boostTimeFullBoost: boostStats?.time_full_boost,
              boostTimeBoost0_25: boostStats?.time_boost_0_25,
              boostTimeBoost25_50: boostStats?.time_boost_25_50,
              boostTimeBoost50_75: boostStats?.time_boost_50_75,
              boostTimeBoost75_100: boostStats?.time_boost_75_100,
              
              // Player movement stats
              movementTotalDistance: movementStats?.total_distance,
              movementTimeSupersonicSpeed: movementStats?.time_supersonic_speed,
              movementTimeBoostSpeed: movementStats?.time_boost_speed,
              movementTimeSlowSpeed: movementStats?.time_slow_speed,
              movementTimeGround: movementStats?.time_ground,
              movementTimeLowAir: movementStats?.time_low_air,
              movementTimeHighAir: movementStats?.time_high_air,
              movementTimePowerslide: movementStats?.time_powerslide,
              movementCountPowerslide: movementStats?.count_powerslide,
              
              // Player positioning stats
              positioningTimeDefensiveThird: positioningStats?.time_defensive_third,
              positioningTimeNeutralThird: positioningStats?.time_neutral_third,
              positioningTimeOffensiveThird: positioningStats?.time_offensive_third,
              positioningTimeDefensiveHalf: positioningStats?.time_defensive_half,
              positioningTimeOffensiveHalf: positioningStats?.time_offensive_half,
              positioningTimeBehindBall: positioningStats?.time_behind_ball,
              positioningTimeInfrontBall: positioningStats?.time_infront_ball,
              
              // Player demo stats
              demoInflicted: demoStats?.inflicted,
              demoTaken: demoStats?.taken,
            }
          });
        })
      );
    }

    return team;
  } catch (error) {
    console.error('Error creating team:', error);
    return null;
  }
}

async function createOrUpdateUploader(uploaderData: any) {
  if (!uploaderData) return null;

  try {
    // Check if uploader already exists by steamId
    const existingUploader = await prisma.uploader.findFirst({
      where: { steamId: uploaderData.steam_id }
    });

    if (existingUploader) {
      // Update existing uploader
      return await prisma.uploader.update({
        where: { id: existingUploader.id },
        data: {
          name: uploaderData.name || existingUploader.name,
          profileUrl: uploaderData.profile_url || existingUploader.profileUrl,
          avatar: uploaderData.avatar || existingUploader.avatar,
        }
      });
    } else {
      // Create new uploader
      return await prisma.uploader.create({
        data: {
          steamId: uploaderData.steam_id,
          name: uploaderData.name,
          profileUrl: uploaderData.profile_url,
          avatar: uploaderData.avatar,
        }
      });
    }
  } catch (error) {
    console.error('Error creating/updating uploader:', error);
    return null;
  }
}

async function createOrUpdateGroup(groupData: any) {
  if (!groupData) return null;

  try {
    // Check if group already exists by ballchasingId
    const existingGroup = await prisma.replayGroup.findUnique({
      where: { ballchasingId: groupData.id }
    });

    if (existingGroup) {
      // Group already exists, return it
      return existingGroup;
    } else {
      // Create new group
      return await prisma.replayGroup.create({
        data: {
          ballchasingId: groupData.id,
          name: groupData.name,
          link: groupData.link,
        }
      });
    }
  } catch (error) {
    console.error('Error creating/updating group:', error);
    return null;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authorization (optional - you can add a token check here)
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // Check database connection
    const isDbConnected = await checkDatabaseConnection();
    
    if (!isDbConnected) {
      return NextResponse.json({ 
        error: 'Database connection failed', 
        message: 'Unable to poll for replay status updates' 
      }, { status: 503 });
    }
    
    // Find all replays with 'processing' status
    const processingReplays = await prisma.replay.findMany({
      where: { status: 'processing' },
    });
    
    if (processingReplays.length === 0) {
      return NextResponse.json({ message: 'No processing replays found' });
    }
    
    const results = await Promise.all(
      processingReplays.map(async (replay: Replay): Promise<ProcessingResult> => {
        try {
          const status = await checkReplayStatus(replay.ballchasingId);
          
          // Only update if status is explicitly "ok" (processed) or "failed"
          // Keep as "processing" if the status is "pending" 
          if (status === 'ok') {
            try {
              // Fetch the complete replay data from Ballchasing API using the shared function
              // This now uses the rate-limited function from ballchasing.ts
              const fullReplayData = await fetchFullReplayData(replay.ballchasingId);
              
              // Create teams, players, cameras, and uploader if they don't exist
              // Process Blue Team
              const blueTeam = await createOrUpdateTeam(fullReplayData.blue, 'blue');
              
              // Process Orange Team
              const orangeTeam = await createOrUpdateTeam(fullReplayData.orange, 'orange');
              
              // Process Uploader
              const uploader = await createOrUpdateUploader(fullReplayData.uploader);
              
              // Process Groups
              const groups = await Promise.all(
                (fullReplayData.groups || []).map(async (group) => {
                  return await createOrUpdateGroup(group);
                })
              );
              
              // Update the replay with all of the data and relationships
              await prisma.replay.update({
                where: { id: replay.id },
                data: {
                  status: 'completed',
                  processedAt: new Date(),
                  // Extract relevant fields from the full data
                  rocketLeagueId: fullReplayData.rocket_league_id,
                  matchGuid: fullReplayData.match_guid,
                  title: fullReplayData.title,
                  mapCode: fullReplayData.map_code,
                  mapName: fullReplayData.map_name,
                  matchType: fullReplayData.match_type,
                  teamSize: fullReplayData.team_size,
                  playlistId: fullReplayData.playlist_id,
                  playlistName: fullReplayData.playlist_name,
                  duration: fullReplayData.duration,
                  overtime: fullReplayData.overtime,
                  overtimeSeconds: fullReplayData.overtime_seconds,
                  season: fullReplayData.season,
                  seasonType: fullReplayData.season_type,
                  date: new Date(fullReplayData.date),
                  dateHasTimezone: fullReplayData.date_has_timezone,
                  visibility: fullReplayData.visibility,
                  link: fullReplayData.link,
                  // Connect relationships
                  uploader: uploader ? { connect: { id: uploader.id } } : undefined,
                  blueTeam: blueTeam ? { connect: { id: blueTeam.id } } : undefined,
                  orangeTeam: orangeTeam ? { connect: { id: orangeTeam.id } } : undefined,
                  groups: {
                    connect: groups.filter(g => g !== null).map(g => ({ id: g!.id }))
                  }
                },
              });
              
              return {
                id: replay.id,
                ballchasingId: replay.ballchasingId,
                status: 'completed',
              };
            } catch (error) {
              console.error(`Error processing completed replay ${replay.id}:`, error);
              
              // Check if the error is a rate limit error
              if (error instanceof Error && error.message.includes('429')) {
                console.warn(`Rate limit hit for replay ${replay.id}, keeping as processing`);
                
                return {
                  id: replay.id,
                  ballchasingId: replay.ballchasingId,
                  status: 'processing',
                  message: 'Rate limit exceeded, will retry later'
                };
              }
              
              // If processing the complete data fails for non-rate limit reasons, still mark as completed
              await prisma.replay.update({
                where: { id: replay.id },
                data: {
                  status: 'completed',
                  processedAt: new Date()
                }
              });
              
              return {
                id: replay.id,
                ballchasingId: replay.ballchasingId,
                status: 'completed',
                message: 'Marked as completed despite processing error'
              };
            }
          } else if (status === 'failed') {
            await prisma.replay.update({
              where: { id: replay.id },
              data: {
                status: 'failed',
                processedAt: null,
              },
            });
            
            return {
              id: replay.id,
              ballchasingId: replay.ballchasingId,
              status: 'failed',
            };
          }
          
          // If status is 'pending', keep it as 'processing' in our system
          return {
            id: replay.id,
            ballchasingId: replay.ballchasingId,
            status: 'processing',
          };
        } catch (error) {
          console.error(`Error processing replay ${replay.id}:`, error);
          
          // If error was due to rate limiting, keep as processing
          if (error instanceof Error && error.message.includes('429')) {
            console.warn(`Rate limit hit for replay ${replay.id}, keeping as processing`);
            
            return {
              id: replay.id,
              ballchasingId: replay.ballchasingId,
              status: 'processing',
              message: 'Rate limit exceeded, will retry later'
            };
          }
          
          // For all other errors, mark as failed
          await prisma.replay.update({
            where: { id: replay.id },
            data: {
              status: 'failed',
              processedAt: null,
            },
          });
          
          return {
            id: replay.id,
            ballchasingId: replay.ballchasingId,
            status: 'failed',
            message: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );
    
    const processed = results.filter(r => r.status !== 'processing').length;
    const rateLimited = results.filter(r => r.message?.includes('Rate limit')).length;
    
    return NextResponse.json({ 
      processed,
      rateLimited,
      results 
    });
  } catch (error) {
    console.error('Error polling replay status:', error);
    return NextResponse.json(
      { error: 'Failed to poll replay status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 