'use client';

import { useState, useEffect } from 'react';

type DemoStats = {
    playerName: string;
    demosGiven: number;
    demosReceived: number;
};

export function DemoStats(): React.ReactElement {
    const [demoStats, setDemoStats] = useState<DemoStats[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchDemoStats = async (): Promise<void> => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/stats/demos');
                if (!response.ok) throw new Error('Failed to fetch demo stats');
                const data = await response.json();
                setDemoStats(data);
            } catch (error) {
                console.error('Error fetching demo stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDemoStats();
    }, []);

    if (isLoading) {
        return (
            <div className="border-border bg-background/50 rounded-xl border p-6 backdrop-blur-sm">
                <div className="text-muted py-8 text-center">
                    Loading demo statistics...
                </div>
            </div>
        );
    }

    const sortedDemoStats = [...demoStats].sort((a, b) => {
        const totalA = a.demosGiven + a.demosReceived;
        const totalB = b.demosGiven + b.demosReceived;
        const givenPercentageA = totalA > 0 ? (a.demosGiven / totalA) * 100 : 0;
        const givenPercentageB = totalB > 0 ? (b.demosGiven / totalB) * 100 : 0;
        return givenPercentageB - givenPercentageA;
    });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedDemoStats.map((player) => {
                    const total = player.demosGiven + player.demosReceived;
                    const givenPercentage = total > 0 ? (player.demosGiven / total) * 100 : 0;
                    const receivedPercentage = total > 0 ? (player.demosReceived / total) * 100 : 0;

                    // Create conic gradient for pie chart
                    const pieChartStyle = {
                        background: `conic-gradient(
                            #3b82f6 0deg ${givenPercentage * 3.6}deg,
                            #f97316 ${givenPercentage * 3.6}deg 360deg
                        )`
                    };

                    return (
                        <div key={player.playerName} className="border-border bg-background/50 rounded-xl border p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-semibold mb-4 text-center">{player.playerName}</h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="relative w-32 h-32">
                                        <div 
                                            className="w-full h-full rounded-full"
                                            style={pieChartStyle}
                                        />
                                        <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center">
                                            <div className="text-center">
                                                <div className={`text-lg font-bold ${givenPercentage > 50 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {givenPercentage.toFixed(0)}%
                                                </div>
                                                <div className="text-xs text-muted-foreground">given</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span>Demos Given: {player.demosGiven}</span>
                                        </div>
                                        <span className="text-muted-foreground">{givenPercentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                            <span>Demos Received: {player.demosReceived}</span>
                                        </div>
                                        <span className="text-muted-foreground">{receivedPercentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {demoStats.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    No demo statistics available
                </div>
            )}
        </div>
    );
} 