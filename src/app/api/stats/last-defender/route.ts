import { NextResponse } from 'next/server';
import { getLastDefenderStats } from '@/lib/advancedStats';

export async function GET(): Promise<NextResponse> {
    try {
        const stats = await getLastDefenderStats();
        return NextResponse.json(stats);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch last defender stats' }, { status: 500 });
    }
}
