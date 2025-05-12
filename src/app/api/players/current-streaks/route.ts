import { getPlayerStats } from '@/lib/stats';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
    const players = await getPlayerStats();
    const streaks = Object.fromEntries(
        players.map((player) => [
            player.id,
            {
                streak: player.currentStreak,
                isWinning: player.isWinningStreak
            }
        ])
    );

    return NextResponse.json(streaks);
}
