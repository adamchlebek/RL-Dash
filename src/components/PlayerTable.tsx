'use client';

import { Player } from '../models/player';
import { Goal, Trophy, Crosshair, Target, Bomb, Gamepad2, Percent, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

type PlayerTableProps = {
    players: Player[];
};

type SortField =
    | 'name'
    | 'gamesPlayed'
    | 'winRate'
    | 'goals'
    | 'goalsPerGame'
    | 'assists'
    | 'shots'
    | 'shootingPct'
    | 'demos';
type SortDirection = 'asc' | 'desc';

export function PlayerTable({ players }: PlayerTableProps): React.ReactElement {
    const [sortField, setSortField] = useState<SortField>('gamesPlayed');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const handleSort = (field: SortField) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedPlayers = [...players].sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'gamesPlayed':
                comparison = a.gamesPlayed - b.gamesPlayed;
                break;
            case 'winRate':
                const winRateA = a.gamesPlayed > 0 ? a.wins / a.gamesPlayed : 0;
                const winRateB = b.gamesPlayed > 0 ? b.wins / b.gamesPlayed : 0;
                comparison = winRateA - winRateB;
                break;
            case 'goals':
                comparison = a.goals - b.goals;
                break;
            case 'goalsPerGame':
                const gpgA = a.gamesPlayed > 0 ? a.goals / a.gamesPlayed : 0;
                const gpgB = b.gamesPlayed > 0 ? b.goals / b.gamesPlayed : 0;
                comparison = gpgA - gpgB;
                break;
            case 'assists':
                comparison = a.assists - b.assists;
                break;
            case 'shots':
                comparison = a.shots - b.shots;
                break;
            case 'shootingPct':
                const shotPctA = a.shots > 0 ? (a.goals / a.shots) * 100 : 0;
                const shotPctB = b.shots > 0 ? (b.goals / b.shots) * 100 : 0;
                comparison = shotPctA - shotPctB;
                break;
            case 'demos':
                comparison = a.demos - b.demos;
                break;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    const getSortIndicator = (field: SortField) => {
        if (field !== sortField) return null;
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    return (
        <div className="rounded-xl border border-border bg-background/50 p-6 backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border text-left">
                            <th
                                className="cursor-pointer pb-4 font-medium text-foreground"
                                onClick={() => handleSort('name')}
                            >
                                Player {getSortIndicator('name')}
                            </th>
                            <th
                                className="cursor-pointer pb-4 font-medium text-foreground"
                                onClick={() => handleSort('gamesPlayed')}
                            >
                                <div className="flex items-center gap-1">
                                    <Gamepad2 className="h-4 w-4" />
                                    <span>Games {getSortIndicator('gamesPlayed')}</span>
                                </div>
                            </th>
                            <th
                                className="cursor-pointer pb-4 font-medium text-foreground"
                                onClick={() => handleSort('winRate')}
                            >
                                <div className="flex items-center gap-1">
                                    <Trophy className="h-4 w-4" />
                                    <span>W/L {getSortIndicator('winRate')}</span>
                                </div>
                            </th>
                            <th
                                className="cursor-pointer pb-4 font-medium text-foreground"
                                onClick={() => handleSort('goals')}
                            >
                                <div className="flex items-center gap-1">
                                    <Goal className="h-4 w-4" />
                                    <span>Goals {getSortIndicator('goals')}</span>
                                </div>
                            </th>
                            <th
                                className="cursor-pointer pb-4 font-medium text-foreground"
                                onClick={() => handleSort('goalsPerGame')}
                            >
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>GPG {getSortIndicator('goalsPerGame')}</span>
                                </div>
                            </th>
                            <th
                                className="cursor-pointer pb-4 font-medium text-foreground"
                                onClick={() => handleSort('assists')}
                            >
                                <div className="flex items-center gap-1">
                                    <Crosshair className="h-4 w-4" />
                                    <span>Assists {getSortIndicator('assists')}</span>
                                </div>
                            </th>
                            <th
                                className="cursor-pointer pb-4 font-medium text-foreground"
                                onClick={() => handleSort('shots')}
                            >
                                <div className="flex items-center gap-1">
                                    <Target className="h-4 w-4" />
                                    <span>Shots {getSortIndicator('shots')}</span>
                                </div>
                            </th>
                            <th
                                className="cursor-pointer pb-4 font-medium text-foreground"
                                onClick={() => handleSort('shootingPct')}
                            >
                                <div className="flex items-center gap-1">
                                    <Percent className="h-4 w-4" />
                                    <span>Shot% {getSortIndicator('shootingPct')}</span>
                                </div>
                            </th>
                            <th
                                className="cursor-pointer pb-4 font-medium text-foreground"
                                onClick={() => handleSort('demos')}
                            >
                                <div className="flex items-center gap-1">
                                    <Bomb className="h-4 w-4" />
                                    <span>Demos {getSortIndicator('demos')}</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPlayers.map((player) => {
                            const winRate =
                                player.gamesPlayed > 0
                                    ? ((player.wins / player.gamesPlayed) * 100).toFixed(1)
                                    : '0.0';

                            const goalsPerGame =
                                player.gamesPlayed > 0
                                    ? (player.goals / player.gamesPlayed).toFixed(2)
                                    : '0.00';

                            const shootingPercentage =
                                player.shots > 0
                                    ? ((player.goals / player.shots) * 100).toFixed(1)
                                    : '0.0';

                            return (
                                <tr
                                    key={player.name}
                                    className="border-b border-border transition-colors last:border-0 hover:bg-background/70"
                                >
                                    <td className="px-4 py-4 font-medium">
                                        <Link
                                            href={`/players/${player.id}`}
                                            className="transition-colors hover:text-foreground"
                                        >
                                            {player.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-4">{player.gamesPlayed}</td>
                                    <td className="px-4 py-4">
                                        <span className="text-green-400">{player.wins}</span>
                                        <span className="mx-1 text-muted">/</span>
                                        <span className="text-red-400">{player.losses}</span>
                                        <span className="ml-2 text-muted">({winRate}%)</span>
                                    </td>
                                    <td className="px-4 py-4">{player.goals}</td>
                                    <td className="px-4 py-4">{goalsPerGame}</td>
                                    <td className="px-4 py-4">{player.assists}</td>
                                    <td className="px-4 py-4">{player.shots}</td>
                                    <td className="px-4 py-4">{shootingPercentage}%</td>
                                    <td className="px-4 py-4">{player.demos}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
