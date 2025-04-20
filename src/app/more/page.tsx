'use client';

import { MapPin, Shield } from 'lucide-react';
import { StatsGrid } from '@/components/StatsGrid';
import { PositioningTable } from '@/components/PositioningTable';
import { RocketField } from '@/components/RocketField';
import { LastDefenderStats } from '@/components/LastDefenderStats';

export default function MoreStatsPage(): React.ReactElement {
    return (
        <div className="bg-background text-foreground min-h-screen p-8">
            <div className="mx-auto max-w-7xl space-y-12">
                <div>
                    <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                        Advanced Stats
                    </h1>
                </div>

                <PositioningTable />
                <StatsGrid />

                <div className="w-full">
                    <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                        <MapPin className="h-6 w-6 text-green-400" />
                        Field Positioning Map
                    </h2>
                    <RocketField />
                </div>

                <div className="w-full">
                    <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                        <Shield className="h-6 w-6 text-red-400" />
                        Last Defender Goals
                    </h2>
                    <div className="rounded-lg border border-red-800/30 bg-gradient-to-br from-red-900/20 to-red-800/20 p-6">
                        <LastDefenderStats />
                    </div>
                </div>
            </div>
        </div>
    );
}
