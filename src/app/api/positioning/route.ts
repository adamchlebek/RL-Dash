import { NextResponse } from 'next/server';
import { getPlayerPositioningStats } from '@/lib/advancedStats';

export async function GET() {
    try {
        const stats = await getPlayerPositioningStats();
        return NextResponse.json(stats);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch positioning stats' }, { status: 500 });
    }
} 