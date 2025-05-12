import { getBest3sTeam, getBest2sTeam, getWorst3sTeam, getWorst2sTeam } from '@/lib/stats';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
    try {
        const [best3sTeam, best2sTeam, worst3sTeam, worst2sTeam] = await Promise.all([
            getBest3sTeam(),
            getBest2sTeam(),
            getWorst3sTeam(),
            getWorst2sTeam()
        ]);

        return NextResponse.json({
            best3sTeam,
            best2sTeam,
            worst3sTeam,
            worst2sTeam
        });
    } catch (error) {
        console.error('Error fetching team stats:', error);
        return NextResponse.json({ error: 'Failed to fetch team stats' }, { status: 500 });
    }
}
