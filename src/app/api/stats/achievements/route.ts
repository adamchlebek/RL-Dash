import {
    getHighestPoints,
    getLowestPoints,
    getMostDemos,
    getMostForfeits,
    getLongestWinStreak,
    getLongestLossStreak
} from '@/lib/stats';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
    try {
        const [
            highestPoints,
            lowestPoints,
            mostDemos,
            mostForfeits,
            longestWinStreak,
            longestLossStreak
        ] = await Promise.all([
            getHighestPoints(),
            getLowestPoints(),
            getMostDemos(),
            getMostForfeits(),
            getLongestWinStreak(),
            getLongestLossStreak()
        ]);

        return NextResponse.json({
            highestPoints,
            lowestPoints,
            mostDemos,
            mostForfeits,
            longestWinStreak,
            longestLossStreak
        });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
    }
}
