import Link from 'next/link';
import { format } from 'date-fns';
import { getPlayerStats } from '@/lib/stats';

export const revalidate = 3600; // Revalidate every hour

export default async function PlayersPage(): Promise<React.ReactElement> {
    const players = await getPlayerStats();

    return (
        <div className="min-h-screen bg-background p-8 text-foreground">
            <div className="mx-auto max-w-7xl space-y-8">
                <h1 className="mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                    Players
                </h1>

                <div className="overflow-hidden rounded-xl border border-border bg-background/50 shadow backdrop-blur-sm">
                    <table className="min-w-full divide-y divide-border">
                        <thead>
                            <tr className="bg-background/80">
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                    Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                    Win Rate
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                    Games Played
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                    First Seen
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                    Latest Game
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {players.map((player) => {
                                const winRate = player.gamesPlayed > 0
                                    ? ((player.wins / player.gamesPlayed) * 100).toFixed(1)
                                    : '0.0';

                                return (
                                    <tr
                                        key={player.id}
                                        className="transition-colors hover:bg-muted/10"
                                    >
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/players/${player.id}`}
                                                className="font-medium text-blue-400 transition-colors hover:text-blue-300"
                                            >
                                                {player.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-green-400">{player.wins}</span>
                                            <span className="mx-1 text-muted">/</span>
                                            <span className="text-red-400">{player.losses}</span>
                                            <span className="ml-2 text-muted">({winRate}%)</span>
                                        </td>
                                        <td className="px-6 py-4 text-foreground">
                                            {player.gamesPlayed}
                                        </td>
                                        <td className="px-6 py-4 text-foreground">
                                            {format(new Date(player.firstSeen), 'MMM dd, yyyy h:mm a')}
                                        </td>
                                        <td className="px-6 py-4 text-foreground">
                                            {format(new Date(player.latestGame), 'MMM dd, yyyy h:mm a')}
                                        </td>
                                    </tr>
                                );
                            })}
                            {players.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-8 text-center text-sm text-muted"
                                    >
                                        No players found. Process some replays to see players here.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
