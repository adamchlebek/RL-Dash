import { NextResponse } from 'next/server';
import { checkReplayStatus, fetchFullReplayData } from '@/lib/ballchasing';
import { prisma, withRetry, checkDatabaseConnection } from '@/lib/prisma';
import { createOrUpdateTeam } from '@/lib/teams';
import { TeamData, PlayerData, ProcessingResult } from '@/models/ballchaser';
import { createOrUpdateGroup } from '@/lib/groups';
import { createOrUpdateUploader } from '@/lib/uploaders';
import { createPlayerFromData } from '@/lib/players';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(): Promise<NextResponse> {
    try {
        // Verify authorization (optional - you can add a token check here)
        // const authHeader = request.headers.get('authorization');
        // if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        // Check database connection
        const isDbConnected = await checkDatabaseConnection();

        if (!isDbConnected) {
            return NextResponse.json(
                {
                    error: 'Database connection failed',
                    message: 'Unable to poll for replay status updates'
                },
                { status: 503 }
            );
        }

        // Find all replays with 'processing' status
        const processingReplays = await withRetry(() =>
            prisma.replay.findMany({
                where: {
                    status: {
                        in: ['processing', 'reprocessing']
                    }
                }
            })
        );

        if (processingReplays.length === 0) {
            return NextResponse.json({ message: 'No processing replays found' });
        }

        const results = await Promise.all(
            processingReplays.map(async (replay): Promise<ProcessingResult> => {
                try {
                    const status = await checkReplayStatus(replay.ballchasingId);

                    // Only update if status is explicitly "ok" (processed) or "failed"
                    // Keep as "processing" if the status is "pending"
                    if (status === 'ok') {
                        try {
                            const fullReplayData = await fetchFullReplayData(replay.ballchasingId);
                            const isReprocessing = false; // Never reprocessing in this route

                            // Process Blue Team
                            const blueTeam = await createOrUpdateTeam(
                                fullReplayData.blue as unknown as TeamData,
                                'blue',
                                isReprocessing
                            );

                            // Process Orange Team
                            const orangeTeam = await createOrUpdateTeam(
                                fullReplayData.orange as unknown as TeamData,
                                'orange',
                                isReprocessing
                            );

                            // Process Uploader
                            const uploader = await createOrUpdateUploader({
                                id: fullReplayData.uploader.steam_id,
                                name: fullReplayData.uploader.name,
                                steamId: fullReplayData.uploader.steam_id,
                                profileUrl: fullReplayData.uploader.profile_url,
                                avatar: fullReplayData.uploader.avatar
                            });

                            // Create blue team players
                            if (blueTeam && fullReplayData.blue?.players) {
                                console.log(`Creating players for blue team`);
                                for (const playerData of fullReplayData.blue
                                    .players as PlayerData[]) {
                                    try {
                                        await createPlayerFromData(playerData, blueTeam);
                                    } catch (error) {
                                        console.error(
                                            `Error creating blue team player ${playerData.name}:`,
                                            error
                                        );
                                    }
                                }
                            }

                            // Create orange team players (similar to blue team)
                            if (orangeTeam && fullReplayData.orange?.players) {
                                console.log(`Creating players for orange team`);
                                for (const playerData of fullReplayData.orange
                                    .players as PlayerData[]) {
                                    try {
                                        await createPlayerFromData(playerData, orangeTeam);
                                    } catch (error) {
                                        console.error(
                                            `Error creating orange team player ${playerData.name}:`,
                                            error
                                        );
                                    }
                                }
                            }

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
                                    // If title had reprocessing marker, remove it; otherwise use fullReplayData's title
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
                                    created: fullReplayData.created
                                        ? new Date(fullReplayData.created)
                                        : undefined,
                                    // Connect relationships
                                    uploader: uploader
                                        ? { connect: { id: uploader.id } }
                                        : undefined,
                                    blueTeam: blueTeam
                                        ? { connect: { id: blueTeam.id } }
                                        : undefined,
                                    orangeTeam: orangeTeam
                                        ? { connect: { id: orangeTeam.id } }
                                        : undefined,
                                    groups: {
                                        connect: groups
                                            .filter((g) => g !== null)
                                            .map((g) => ({ id: g!.id }))
                                    }
                                }
                            });

                            // Cleanup orphaned players
                            await prisma.player.deleteMany({
                                where: {
                                    teamId: null
                                }
                            });

                            return {
                                id: replay.id,
                                ballchasingId: replay.ballchasingId,
                                status: 'completed'
                            };
                        } catch (error) {
                            console.error(`Error processing completed replay ${replay.id}:`, error);

                            // Check if the error is a rate limit error
                            if (error instanceof Error && error.message.includes('429')) {
                                console.warn(
                                    `Rate limit hit for replay ${replay.id}, keeping as processing`
                                );

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
                                processedAt: null
                            }
                        });

                        return {
                            id: replay.id,
                            ballchasingId: replay.ballchasingId,
                            status: 'failed'
                        };
                    }

                    // If status is 'pending', keep it as 'processing' in our system
                    return {
                        id: replay.id,
                        ballchasingId: replay.ballchasingId,
                        status: 'processing'
                    };
                } catch (error) {
                    console.error(`Error processing replay ${replay.id}:`, error);

                    // If error was due to rate limiting, keep as processing
                    if (error instanceof Error && error.message.includes('429')) {
                        console.warn(
                            `Rate limit hit for replay ${replay.id}, keeping as processing`
                        );

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
                            processedAt: null
                        }
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

        const processed = results.filter((r: ProcessingResult) => r.status !== 'processing').length;
        const rateLimited = results.filter((r: ProcessingResult) =>
            r.message?.includes('Rate limit')
        ).length;

        return NextResponse.json({
            processed,
            rateLimited,
            results
        });
    } catch (error) {
        console.error('Error polling replay status:', error);
        return NextResponse.json(
            {
                error: 'Failed to poll replay status',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
