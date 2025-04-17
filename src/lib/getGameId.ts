import { prisma } from './prisma';

export async function getGameIdFromInstance(instanceId: string): Promise<string | null> {
    const instance = await prisma.player.findUnique({
        where: { id: instanceId },
        select: {
            team: {
                include: {
                    blueReplays: {
                        select: {
                            id: true
                        }
                    },
                    orangeReplays: {
                        select: {
                            id: true
                        }
                    }
                }
            }
        }
    });

    if (!instance) {
        return null;
    }

    return instance.team?.blueReplays[0]?.id || instance.team?.orangeReplays[0]?.id || null;
}
