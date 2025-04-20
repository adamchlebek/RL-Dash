import { Rocket, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PlayerStats {
    name: string;
    movementPercentGround: number;
    movementPercentLowAir: number;
    movementPercentHighAir: number;
    boostPercent0_25: number;
    boostPercent25_50: number;
    boostPercent50_75: number;
    boostPercent75_100: number;
}

export function StatsGrid(): React.ReactElement {
    const [stats, setStats] = useState<PlayerStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/movement');
                if (!response.ok) throw new Error('Failed to fetch stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
                <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                    <Rocket className="h-6 w-6 text-red-400" />
                    Aerial Control
                </h2>
                <div className="border-border bg-background/50 space-y-4 rounded-xl border p-6 backdrop-blur-sm">
                    {isLoading ? (
                        <div className="text-muted py-8 text-center">Loading...</div>
                    ) : (
                        stats.map((stat) => (
                            <div key={stat.name} className="space-y-2">
                                <div className="text-foreground font-semibold">{stat.name}</div>
                                <div className="flex h-3 w-full overflow-hidden rounded-full">
                                    <div
                                        className="bg-blue-500"
                                        style={{ width: `${stat.movementPercentGround}%` }}
                                    />
                                    <div
                                        className="bg-purple-500"
                                        style={{ width: `${stat.movementPercentLowAir}%` }}
                                    />
                                    <div
                                        className="bg-pink-500"
                                        style={{ width: `${stat.movementPercentHighAir}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted">
                                        Ground ({stat.movementPercentGround}%)
                                    </span>
                                    <span className="text-muted">
                                        Low Air ({stat.movementPercentLowAir}%)
                                    </span>
                                    <span className="text-muted">
                                        High Air ({stat.movementPercentHighAir}%)
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                    <Zap className="h-6 w-6 text-yellow-400" />
                    Boost Distribution
                </h2>
                <div className="border-border bg-background/50 space-y-4 rounded-xl border p-6 backdrop-blur-sm">
                    {isLoading ? (
                        <div className="text-muted py-8 text-center">Loading...</div>
                    ) : (
                        stats.map((stat) => (
                            <div key={stat.name} className="space-y-2">
                                <div className="text-foreground font-semibold">{stat.name}</div>
                                <div className="flex h-3 w-full overflow-hidden rounded-full">
                                    <div
                                        className="bg-red-500"
                                        style={{ width: `${stat.boostPercent0_25}%` }}
                                    />
                                    <div
                                        className="bg-orange-500"
                                        style={{ width: `${stat.boostPercent25_50}%` }}
                                    />
                                    <div
                                        className="bg-yellow-500"
                                        style={{ width: `${stat.boostPercent50_75}%` }}
                                    />
                                    <div
                                        className="bg-green-500"
                                        style={{ width: `${stat.boostPercent75_100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted">
                                        0-25% ({stat.boostPercent0_25}%)
                                    </span>
                                    <span className="text-muted">
                                        25-50% ({stat.boostPercent25_50}%)
                                    </span>
                                    <span className="text-muted">
                                        50-75% ({stat.boostPercent50_75}%)
                                    </span>
                                    <span className="text-muted">
                                        75-100% ({stat.boostPercent75_100}%)
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
