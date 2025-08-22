import { NextResponse } from 'next/server';
import { prisma, withRetry } from '@/lib/prisma';

export async function POST(): Promise<NextResponse> {
    try {
        const replays = await withRetry(async () => {
            return prisma.replay.findMany({
                select: { id: true, title: true }
            });
        });

        if (replays.length === 0) {
            return NextResponse.json({ message: 'No replays found to reprocess' });
        }

        let successCount = 0;
        let failureCount = 0;
        const failures: string[] = [];

        for (const replay of replays) {
            try {
                const relatedEntities = await withRetry(async () => {
                    return prisma.replay.findUnique({
                        where: { id: replay.id },
                        select: {
                            blueTeamId: true,
                            orangeTeamId: true
                        }
                    });
                });

                if (!relatedEntities) {
                    failures.push(`${replay.id}: Failed to retrieve related entities`);
                    failureCount++;
                    continue;
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

                const allPlayers = [...blueTeam, ...orangeTeam];

                await withRetry(async () => {
                    return prisma.$transaction(async (tx) => {
                        for (const player of allPlayers) {
                            await tx.player.update({
                                where: { id: player.id },
                                data: {
                                    blueReplays: { disconnect: { id: replay.id } },
                                    orangeReplays: { disconnect: { id: replay.id } }
                                }
                            });
                        }
                    });
                });

                for (const player of allPlayers) {
                    try {
                        await prisma.player.delete({
                            where: { id: player.id }
                        });
                    } catch (e) {
                        console.log(`Could not delete player ${player.id}, may be referenced by other replays: ${e}`);
                    }
                }

                const teamsToDelete: string[] = [];
                if (relatedEntities.blueTeamId) {
                    teamsToDelete.push(relatedEntities.blueTeamId);
                }
                if (relatedEntities.orangeTeamId) {
                    teamsToDelete.push(relatedEntities.orangeTeamId);
                }

                for (const teamId of teamsToDelete) {
                    try {
                        await prisma.team.delete({
                            where: { id: teamId }
                        });
                    } catch (e) {
                        console.log(`Could not delete team ${teamId}, may be referenced by other replays: ${e}`);
                    }
                }

                await withRetry(async () => {
                    return prisma.replay.update({
                        where: { id: replay.id },
                        data: {
                            status: 'processing',
                            processedAt: null,
                            title: replay.title,
                            blueTeamId: null,
                            orangeTeamId: null
                        }
                    });
                });

                successCount++;
                console.log(`Reprocessed replay ${replay.id} | Title: ${replay.title}`);
            } catch (error) {
                failures.push(`${replay.id}: ${error}`);
                failureCount++;
                console.error(`Error reprocessing replay ${replay.id}:`, error);
            }
        }

        await prisma.player.deleteMany({
            where: { teamId: null }
        });

        return NextResponse.json({
            success: true,
            message: `Reprocessed ${successCount} replays successfully. ${failureCount} failed.`,
            successCount,
            failureCount,
            failures: failures.length > 0 ? failures : undefined
        });
    } catch (error) {
        console.error('Error reprocessing all replays:', error);
        return NextResponse.json(
            { error: 'Failed to reprocess replays', details: JSON.stringify(error) },
            { status: 500 }
        );
    }
}
