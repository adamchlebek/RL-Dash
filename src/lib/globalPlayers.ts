import { GlobalPlayer } from '@prisma/client';
import { prisma } from './prisma';

export async function getGlobalPlayers(): Promise<GlobalPlayer[]> {
    return await prisma.globalPlayer.findMany();
}
