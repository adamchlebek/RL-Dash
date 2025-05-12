import { getBiggestWinDeficit, getLongestGame, getHighestScoringGame } from '@/lib/stats';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
    try {
        const [biggestWinDeficit, longestGame, highestScoringGame] = await Promise.all([
            getBiggestWinDeficit(),
            getLongestGame(),
            getHighestScoringGame()
        ]);

        return NextResponse.json({
            biggestWinDeficit,
            longestGame,
            highestScoringGame
        });
    } catch (error) {
        console.error('Error fetching game stats:', error);
        return NextResponse.json({ error: 'Failed to fetch game stats' }, { status: 500 });
    }
}
