import { NextResponse } from 'next/server';
import { getGameDetails } from '@/lib/gameDetails';

export const GET = async (
    req: Request,
    { params }: { params: { id: string } }
): Promise<NextResponse> => {
    try {
        const gameDetails = await getGameDetails(params.id);
        return NextResponse.json(gameDetails);
    } catch (error) {
        console.error('Failed to fetch game details:', error);
        return NextResponse.json({ error: 'Failed to fetch game details' }, { status: 500 });
    }
}
