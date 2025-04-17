import { NextRequest, NextResponse } from 'next/server';
import { getGameDetails } from '@/lib/gameDetails';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id } = await context.params;

    try {
        const gameDetails = await getGameDetails(id);
        return NextResponse.json(gameDetails);
    } catch (error) {
        console.error('Failed to fetch game details:', error);
        return NextResponse.json({ error: 'Failed to fetch game details' }, { status: 500 });
    }
}
