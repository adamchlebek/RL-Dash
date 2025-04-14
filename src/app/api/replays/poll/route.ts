import { NextRequest, NextResponse } from 'next/server';
import { checkReplayStatus } from '@/lib/ballchasing';
import { prisma } from '@/lib/prisma';
import { Replay } from '@/types';

export const runtime = 'edge';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Find all replays with 'processing' status
    const processingReplays = await prisma.replay.findMany({
      where: { status: 'processing' },
    });
    
    if (processingReplays.length === 0) {
      return NextResponse.json({ message: 'No processing replays found' });
    }
    
    const results = await Promise.all(
      processingReplays.map(async (replay: Replay) => {
        const status = await checkReplayStatus(replay.ballchasingId);
        
        if (status !== 'pending') {
          await prisma.replay.update({
            where: { id: replay.id },
            data: {
              status: status === 'processed' ? 'completed' : 'failed',
              processedAt: status === 'processed' ? new Date() : null,
            },
          });
          
          return {
            id: replay.id,
            ballchasingId: replay.ballchasingId,
            status: status === 'processed' ? 'completed' : 'failed',
          };
        }
        
        return {
          id: replay.id,
          ballchasingId: replay.ballchasingId,
          status: 'processing',
        };
      })
    );
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error polling replay status:', error);
    return NextResponse.json(
      { error: 'Failed to poll replay status' },
      { status: 500 }
    );
  }
} 