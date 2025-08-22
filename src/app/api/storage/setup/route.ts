import { NextResponse } from 'next/server';
import { createStorageBucket } from '@/lib/storage';

export async function POST(): Promise<NextResponse> {
    try {
        await createStorageBucket();
        return NextResponse.json({ 
            message: 'Storage bucket created successfully',
            bucket: 'replays' 
        });
    } catch (error) {
        console.error('Error creating storage bucket:', error);
        return NextResponse.json(
            { error: 'Failed to create storage bucket' },
            { status: 500 }
        );
    }
}
