import { NextResponse } from 'next/server';
import { getPlayerDemoStats } from '@/lib/stats';

export async function GET(): Promise<NextResponse> {
    try {
        const demoStats = await getPlayerDemoStats();
        return NextResponse.json(demoStats);
    } catch (error) {
        console.error('Error fetching demo stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch demo stats' },
            { status: 500 }
        );
    }
} 