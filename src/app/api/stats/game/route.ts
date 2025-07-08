import { NextResponse } from 'next/server';
import {
    getBiggestWinDeficit,
    getLongestGame,
    getHighestScoringGame,
    getMostGoalsInGame,
    getMostAssistsInGame,
    getMostSavesInGame,
    getMostShotsInGame
} from '@/lib/stats';

export async function GET(): Promise<NextResponse> {
    try {
        const [
            biggestWinDeficit,
            longestGame,
            highestScoringGame,
            mostGoalsInGame,
            mostAssistsInGame,
            mostSavesInGame,
            mostShotsInGame
        ] = await Promise.all([
            getBiggestWinDeficit(),
            getLongestGame(),
            getHighestScoringGame(),
            getMostGoalsInGame(),
            getMostAssistsInGame(),
            getMostSavesInGame(),
            getMostShotsInGame()
        ]);

        return NextResponse.json({
            biggestWinDeficit,
            longestGame,
            highestScoringGame,
            mostGoalsInGame,
            mostAssistsInGame,
            mostSavesInGame,
            mostShotsInGame
        });
    } catch (error) {
        console.error('Error fetching game stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch game stats' },
            { status: 500 }
        );
    }
}
