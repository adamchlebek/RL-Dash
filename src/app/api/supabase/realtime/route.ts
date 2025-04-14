import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { data, error } = await supabase
      .from('Replay')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Supabase connection error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Supabase connection established' });
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Supabase' },
      { status: 500 }
    );
  }
} 