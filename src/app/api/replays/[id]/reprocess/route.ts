import { NextRequest, NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id } = await context.params;

    try {
        // First, confirm the replay exists
        const replayExists = await withRetry(async () => {
            return prisma.replay.findUnique({
                where: { id },
                select: { id: true, title: true }
            });
        });

        if (!replayExists) {
            return NextResponse.json({ error: 'Replay not found' }, { status: 404 });
        }

        // Find all related entities we need to clean up
        const relatedEntities = await withRetry(async () => {
            return prisma.replay.findUnique({
                where: { id },
                select: {
                    blueTeamId: true,
                    orangeTeamId: true
                }
            });
        });

        if (!relatedEntities) {
            return NextResponse.json(
                { error: 'Failed to retrieve related entities' },
                { status: 500 }
            );
        }

        const blueTeam = await withRetry(async () => {
            return prisma.player.findMany({
                where: { teamId: relatedEntities.blueTeamId }
            });
        });

        const orangeTeam = await withRetry(async () => {
            return prisma.player.findMany({
                where: { teamId: relatedEntities.orangeTeamId }
            });
        });

        console.log(`Reprocessing replay ${id} | Title: ${replayExists.title}`);
        console.log(
            `Found related entities: ${JSON.stringify({
                blueTeamId: relatedEntities.blueTeamId,
                orangeTeamId: relatedEntities.orangeTeamId,
                bluePlayers: blueTeam.length,
                orangePlayers: orangeTeam.length
            })}`
        );

        // // Step 1: Disconnect players from the replay (without deleting replay)
        console.log(`Step 1: Disconnecting players from replay ${id}`);
        await withRetry(async () => {
            return prisma.replay.update({
                where: { id },
                data: {
                    bluePlayers: {
                        disconnect: blueTeam.map((p) => ({ id: p.id }))
                    },
                    orangePlayers: {
                        disconnect: orangeTeam.map((p) => ({ id: p.id }))
                    }
                }
            });
        });

        // Step 2: Collect all player IDs
        const playerIds = [...blueTeam.map((p) => p.id), ...orangeTeam.map((p) => p.id)];

        // Step 3: Delete players
        if (playerIds.length > 0) {
            console.log(`Step 3: Deleting ${playerIds.length} players`);
            await withRetry(async () => {
                return prisma.player.deleteMany({
                    where: {
                        id: { in: playerIds }
                    }
                });
            });
        }

        // Step 4: Handle teams - try to delete but continue if they're referenced elsewhere
        const teamsToDelete = [];

        if (relatedEntities.blueTeamId) {
            teamsToDelete.push(relatedEntities.blueTeamId);
        }

        if (relatedEntities.orangeTeamId) {
            teamsToDelete.push(relatedEntities.orangeTeamId);
        }

        if (teamsToDelete.length > 0) {
            console.log(`Step 4: Attempting to delete ${teamsToDelete.length} teams`);

            for (const teamId of teamsToDelete) {
                try {
                    await prisma.team.delete({
                        where: { id: teamId }
                    });
                } catch (e) {
                    console.log(
                        `Could not delete team ${teamId}, may be referenced by other replays: ${e}`
                    );
                }
            }
        }

        // Step 5: Reset the replay status and nullify team references
        console.log(`Step 5: Resetting replay status to 'processing'`);
        await withRetry(async () => {
            return prisma.replay.update({
                where: { id },
                data: {
                    status: 'processing',
                    processedAt: null,
                    title: replayExists.title,
                    blueTeamId: null,
                    orangeTeamId: null
                }
            });
        });

        // Cleanup orphaned players
        await prisma.player.deleteMany({
            where: {
                teamId: null
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Replay marked for reprocessing. Related entities were cleaned up.',
            status: 'reprocessing'
        });
    } catch (error) {
        console.error('Error reprocessing replay:', error);
        return NextResponse.json(
            { error: 'Failed to reprocess replay', details: JSON.stringify(error) },
            { status: 500 }
        );
    }
}
