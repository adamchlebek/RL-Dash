import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

// Use service role key for server-side operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(): Promise<NextResponse> {
    try {
        // Debug: Check if environment variables are loaded
        console.log('Environment check:', {
            hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            urlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20)
        });

        // Test using Prisma instead of direct Supabase queries to bypass RLS issues
        const replayCount = await prisma.replay.count();
        
        // Also test Supabase auth (which should work with service role)
        const { error: authError } = await supabaseAdmin.auth.getUser();
        
        return NextResponse.json({
            success: true,
            message: 'Database connection established via Prisma',
            replayCount,
            authTest: authError ? 'Auth failed' : 'Auth works',
            note: 'Using Prisma to avoid RLS permission issues'
        });
    } catch (error) {
        console.error('Error testing Supabase connection:', error);
        return NextResponse.json({ error: 'Failed to connect to Supabase' }, { status: 500 });
    }
}

export async function GET(): Promise<Response> {
    try {
        // Handling logic here if needed

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error setting up realtime subscription:', error);
        return new Response(JSON.stringify({ error: 'Failed to set up realtime subscription' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
