import { NextRequest, NextResponse } from 'next/server';
import { getGameDetails } from '@/lib/gameDetails';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id } = await context.params;

    try {
        const gameDetails = await getGameDetails(id);
        return NextResponse.json(gameDetails);
    } catch (error) {
        console.error('Failed to fetch game details:', error);
        return NextResponse.json({ error: 'Failed to fetch game details' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id } = await context.params;

    const { password } = await req.json();

    const correctPassword = await prisma.edgeConfig.findFirst({
        where: {
            key: 'delete_password'
        }
    });

    const correctPasswordValue: {
        value: string;
    } = correctPassword?.value as {
        value: string;
    };

    if (password !== correctPasswordValue.value) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }  

    try {
        const replay = await prisma.replay.findUnique({
            where: { id },
            include: {
                blueTeam: {
                    include: {
                        players: true
                    }
                },
                orangeTeam: {
                    include: {
                        players: true
                    }
                }
            }
        });

        if (!replay) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        await prisma.$transaction(async (tx) => {
            if (replay.blueTeam) {
                await tx.player.deleteMany({
                    where: { teamId: replay.blueTeam.id }
                });
                await tx.team.delete({
                    where: { id: replay.blueTeam.id }
                });
            }

            if (replay.orangeTeam) {
                await tx.player.deleteMany({
                    where: { teamId: replay.orangeTeam.id }
                });
                await tx.team.delete({
                    where: { id: replay.orangeTeam.id }
                });
            }

            await tx.replay.delete({
                where: { id }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete game:', error);
        return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
    }
}
