'use client';

import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';

interface GameStats {
    total: number;
    processing: number;
    failed: number;
}

export function GameStatsBadges(): React.ReactElement {
    const [stats, setStats] = useState<GameStats>({
        total: 0,
        processing: 0,
        failed: 0
    });

    useEffect(() => {
        const fetchStats = async (): Promise<void> => {
            try {
                const [gamesResponse, processingResponse, failedResponse] = await Promise.all([
                    fetch('/api/stats/games'),
                    fetch('/api/replays/poll'),
                    fetch('/api/replays/failed')
                ]);

                const games = await gamesResponse.json();
                const { processingCount } = await processingResponse.json();
                const { failedCount } = await failedResponse.json();

                setStats({
                    total: games.length,
                    processing: processingCount,
                    failed: failedCount
                });
            } catch (error) {
                console.error('Error fetching game stats:', error);
            }
        };

        fetchStats();
        
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex gap-2">
            {stats.total > 0 && (
                <Badge color="blue" size="sm">
                    Total Games: {stats.total}
                </Badge>
            )}
            {stats.processing > 0 && (
                <Badge color="yellow" size="sm">
                    Processing: {stats.processing}
                </Badge>
            )}
            {stats.failed > 0 && (
                <Badge color="red" size="sm">
                    Failed: {stats.failed}
                </Badge>
            )}
        </div>
    );
} 