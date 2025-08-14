import { NextResponse } from 'next/server';
import {
    getBiggestWinDeficit,
    getLongestGame,
    getHighestScoringGame,
    getMostGoalsInGame,
    getMostAssistsInGame,
    getMostSavesInGame,
    getMostShotsInGame,
    getMostTotalShotsInGame,
    getMostTotalSavesInGame,
    getMostTotalDemosInGame
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
            mostShotsInGame,
            mostTotalShotsInGame,
            mostTotalSavesInGame,
            mostTotalDemosInGame
        ] = await Promise.all([
            getBiggestWinDeficit(),
            getLongestGame(),
            getHighestScoringGame(),
            getMostGoalsInGame(),
            getMostAssistsInGame(),
            getMostSavesInGame(),
            getMostShotsInGame(),
            getMostTotalShotsInGame(),
            getMostTotalSavesInGame(),
            getMostTotalDemosInGame()
        ]);

        return NextResponse.json({
            biggestWinDeficit,
            longestGame,
            highestScoringGame,
            mostGoalsInGame,
            mostAssistsInGame,
            mostSavesInGame,
            mostShotsInGame,
            mostTotalShotsInGame,
            mostTotalSavesInGame,
            mostTotalDemosInGame
        });
    } catch (error) {
        console.error('Error fetching game stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch game stats' },
            { status: 500 }
        );
    }
}
