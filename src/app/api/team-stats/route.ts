import { NextRequest, NextResponse } from 'next/server';
import { getTeamMatchupStats } from '@/lib/teamStats';

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const searchParams = request.nextUrl.searchParams;
        const team1 = JSON.parse(searchParams.get('team1') || '[]');
        const team2 = JSON.parse(searchParams.get('team2') || '[]');

        if (!team1.length || !team2.length) {
            return NextResponse.json({ error: 'Both teams are required' }, { status: 400 });
        }

        if (team1.length !== team2.length) {
            return NextResponse.json({ error: 'Teams must be the same size' }, { status: 400 });
        }

        const stats = await getTeamMatchupStats(team1, team2);
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error calculating team stats:', error);
        return NextResponse.json({ error: 'Failed to calculate team stats' }, { status: 500 });
    }
}
