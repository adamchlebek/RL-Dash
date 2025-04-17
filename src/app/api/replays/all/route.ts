import { NextResponse } from 'next/server';
import { getReplayService } from '@/lib/replayService';

export async function GET(): Promise<NextResponse> {
    try {
        const replays = await getReplayService.getAllReplays();
        return NextResponse.json(replays);
    } catch (error) {
        console.error('Error fetching replays:', error);
        return NextResponse.json({ error: 'Failed to fetch replays' }, { status: 500 });
    }
}
