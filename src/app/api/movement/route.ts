import { getPlayerMovementStats } from '@/lib/advancedStats';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
    try {
        const stats = await getPlayerMovementStats();
        return NextResponse.json(stats);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch movement stats' }, { status: 500 });
    }
} 