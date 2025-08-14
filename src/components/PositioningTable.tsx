import { MapPin, ArrowUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PlayerPositioningStats {
    name: string;
    defensiveThirdPercent: number;
    neutralThirdPercent: number;
    offensiveThirdPercent: number;
    avgDistanceToBall: number;
    avgSpeed: number;
    timeSupersonic: number;
}

type SortField = keyof PlayerPositioningStats;
type SortDirection = 'asc' | 'desc';

export function PositioningTable(): React.ReactElement {
    const [stats, setStats] = useState<PlayerPositioningStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortField, setSortField] = useState<SortField>('avgSpeed');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/positioning');
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

    const handleSort = (field: SortField) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedStats = [...stats].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        const modifier = sortDirection === 'asc' ? 1 : -1;
        return aValue > bValue ? modifier : -modifier;
    });

    return (
        <div>
            <h2 className="text-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                <MapPin className="h-6 w-6 text-blue-400" />
                Player Positioning
            </h2>
            <div className="border-border bg-background/50 overflow-x-auto rounded-xl border backdrop-blur-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-border text-muted border-b">
                            <th
                                className="hover:text-foreground cursor-pointer p-4 text-left"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-2">
                                    Player
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                            <th
                                className="hover:text-foreground cursor-pointer p-4 text-left"
                                onClick={() => handleSort('defensiveThirdPercent')}
                            >
                                <div className="flex items-center gap-2">
                                    Defensive Third %
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                            <th
                                className="hover:text-foreground cursor-pointer p-4 text-left"
                                onClick={() => handleSort('neutralThirdPercent')}
                            >
                                <div className="flex items-center gap-2">
                                    Neutral Third %
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                            <th
                                className="hover:text-foreground cursor-pointer p-4 text-left"
                                onClick={() => handleSort('offensiveThirdPercent')}
                            >
                                <div className="flex items-center gap-2">
                                    Offensive Third %
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                            <th
                                className="hover:text-foreground cursor-pointer p-4 text-left"
                                onClick={() => handleSort('avgDistanceToBall')}
                            >
                                <div className="flex items-center gap-2">
                                    Avg Distance
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                            <th
                                className="hover:text-foreground cursor-pointer p-4 text-left"
                                onClick={() => handleSort('avgSpeed')}
                            >
                                <div className="flex items-center gap-2">
                                    Avg Speed
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                            <th
                                className="hover:text-foreground cursor-pointer p-4 text-left"
                                onClick={() => handleSort('timeSupersonic')}
                            >
                                <div className="flex items-center gap-2">
                                    Time Supersonic %
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="text-muted p-8 text-center">
                                    Loading...
                                </td>
                            </tr>
                        ) : (
                            sortedStats.map((stat, index) => (
                                <tr
                                    key={stat.name}
                                    className={`border-border hover:bg-muted/5 ${
                                        index !== stats.length - 1 ? 'border-b' : ''
                                    }`}
                                >
                                    <td className="p-4 font-medium">{stat.name}</td>
                                    <td className="p-4">{stat.defensiveThirdPercent}%</td>
                                    <td className="p-4">{stat.neutralThirdPercent}%</td>
                                    <td className="p-4">{stat.offensiveThirdPercent}%</td>
                                    <td className="p-4">{stat.avgDistanceToBall}</td>
                                    <td className="p-4">{stat.avgSpeed}</td>
                                    <td className="p-4">{stat.timeSupersonic}%</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
