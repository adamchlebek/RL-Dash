import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(): Promise<NextResponse> {
    try {
        const count = await prisma.replay.count({
            where: { status: 'failed' }
        });

        return NextResponse.json({ failedCount: count });
    } catch (error) {
        console.error('Error checking failed replays:', error);
        return NextResponse.json(
            {
                error: 'Failed to check failed replays',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
