import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
    return NextResponse.json({ message: 'Please use specific stat endpoints' }, { status: 400 });
}
