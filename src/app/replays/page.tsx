'use client';

import { useEffect, useState } from 'react';
import ReplayUpload from './upload';
import { useReplaySubscription } from '@/lib/useReplaySubscription';
import type { Replay } from '@prisma/client';
import { ReplayList } from './components/ReplayList';
import { Settings } from 'lucide-react';
import Link from 'next/link';

export default function ReplayPage(): React.ReactElement {
    const [replays, setReplays] = useState<Replay[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchReplays = async (): Promise<void> => {
        const response = await fetch('/api/replays/all');
        const data = await response.json();

        if (Array.isArray(data)) {
            setReplays(data);
        }
        setIsLoading(false);
    };

    const handleReprocess = async (replayId: string, ballchasingId: string): Promise<void> => {
        try {
            const response = await fetch(`/api/replays/${replayId}/reprocess`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ballchasingId })
            });

            if (!response.ok) {
                throw new Error('Failed to reprocess replay');
            }

            setReplays((prev) =>
                prev.map((replay) =>
                    replay.id === replayId ? { ...replay, status: 'processing' } : replay
                )
            );
        } catch (error) {
            console.error('Error reprocessing replay:', error);
        }
    };

    useEffect(() => {
        fetchReplays();
    }, []);

    useReplaySubscription(fetchReplays);

    return (
        <div className="min-h-screen bg-background p-8 text-foreground">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                            Upload Replays
                        </h1>
                        <p className="text-muted">
                            Upload your Rocket League replay files to analyze your performance
                        </p>
                    </div>
                    <Link
                        href="/settings"
                        className="rounded-full p-2 transition-colors hover:bg-muted/10"
                    >
                        <Settings className="h-6 w-6" />
                    </Link>
                </div>

                <ReplayUpload onUploadComplete={fetchReplays} />

                <div className="mt-8">
                    <h2 className="mb-4 text-2xl font-semibold text-foreground">All Replays</h2>
                    <ReplayList
                        replays={replays}
                        isLoading={isLoading}
                        onReprocess={handleReprocess}
                        onRefresh={fetchReplays}
                    />
                </div>
            </div>
        </div>
    );
}
