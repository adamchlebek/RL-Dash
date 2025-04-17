import { NextResponse } from 'next/server';
import { getGameHistory } from '@/lib/stats';

export async function GET(): Promise<NextResponse> {
    try {
        const games = await getGameHistory();
        return NextResponse.json(games);
    } catch (error) {
        console.error('Error fetching game history:', error);
        return NextResponse.json({ error: 'Failed to fetch game history' }, { status: 500 });
    }
}
