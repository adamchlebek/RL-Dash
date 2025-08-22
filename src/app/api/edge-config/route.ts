import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { action, key, value } = body;

        if (!action || !key) {
            return NextResponse.json(
                { error: 'Missing required fields: action and key' },
                { status: 400 }
            );
        }

        if (action === 'get') {
            try {
                const config = await prisma.edgeConfig.findUnique({
                    where: { key }
                });

                if (config) {
                    return NextResponse.json(config.value);
                }

                // Return default values for known keys
                const defaultValue = getDefaultValue(key);
                return NextResponse.json({ value: defaultValue });
            } catch (error) {
                console.error('Error getting edge config:', error);
                // Return default value if database fails
                const defaultValue = getDefaultValue(key);
                return NextResponse.json({ value: defaultValue });
            }
        }

        if (action === 'set') {
            if (!value) {
                return NextResponse.json(
                    { error: 'Missing value for set action' },
                    { status: 400 }
                );
            }

            await prisma.edgeConfig.upsert({
                where: { key },
                update: { value },
                create: { key, value }
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Edge config API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function getDefaultValue(key: string): boolean | number {
    switch (key) {
        case 'polling_enabled':
            return true;
        case 'check_private_matches':
            return true;
        case 'polling_interval':
            return 30;
        default:
            return true;
    }
}
