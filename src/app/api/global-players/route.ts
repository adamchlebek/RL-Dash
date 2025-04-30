import { getGlobalPlayers } from '@/lib/globalPlayers';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
    try {
        const players = await getGlobalPlayers();
        return NextResponse.json(players);
    } catch (error) {
        console.error('Error fetching global players:', error);
        return NextResponse.json({ error: 'Failed to fetch global players' }, { status: 500 });
    }
}
