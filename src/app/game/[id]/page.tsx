'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import GameOverview from './GameOverview';

export default function GamePage() {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="container mx-auto space-y-6 p-4">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
            </Link>

            <GameOverview gameId={id} />
        </div>
    );
}
