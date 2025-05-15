import Link from 'next/link';
import { format } from 'date-fns';
import { getPlayerStats } from '@/lib/stats';

export const revalidate = 3600; // Revalidate every hour

export default async function PlayersPage(): Promise<React.ReactElement> {
    const players = await getPlayerStats();

    return (
        <div className="bg-background text-foreground min-h-screen p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <h1 className="mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                    Players
                </h1>

                <div className="border-border bg-background/50 overflow-hidden rounded-xl border shadow backdrop-blur-sm">
                    <table className="divide-border min-w-full divide-y">
                        <thead>
                            <tr className="bg-background/80">
                                <th className="text-muted px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                                    Name
                                </th>
                                <th className="text-muted px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                                    Win Rate
                                </th>
                                <th className="text-muted px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                                    Current Streak
                                </th>
                                <th className="text-muted px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                                    Games Played
                                </th>
                                <th className="text-muted px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                                    Latest Game
                                </th>
                                <th className="text-muted px-6 py-4 text-left text-xs font-semibold tracking-wider uppercase">
                                    First Seen
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-border divide-y">
                            {players.map((player) => {
                                const winRate =
                                    player.gamesPlayed > 0
                                        ? ((player.wins / player.gamesPlayed) * 100).toFixed(1)
                                        : '0.0';

                                return (
                                    <tr
                                        key={player.id}
                                        className="hover:bg-muted/10 transition-colors"
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
                                            <span className="text-muted mx-1">/</span>
                                            <span className="text-red-400">{player.losses}</span>
                                            <span className="text-muted ml-2">({winRate}%)</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {player.currentStreak !== 0 && (
                                                <span
                                                    className={`font-medium ${player.isWinningStreak ? 'text-green-400' : 'text-red-400'}`}
                                                >
                                                    {player.isWinningStreak ? 'W' : 'L'}{' '}
                                                    {Math.abs(player.currentStreak)}
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-foreground px-6 py-4">
                                            {player.gamesPlayed}
                                        </td>
                                        <td className="text-foreground px-6 py-4">
                                            {format(
                                                new Date(player.firstSeen),
                                                'MMM dd, yyyy h:mm a'
                                            )}
                                        </td>
                                        <td className="text-foreground px-6 py-4">
                                            {format(
                                                new Date(player.latestGame),
                                                'MMM dd, yyyy h:mm a'
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {players.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-muted px-6 py-8 text-center text-sm"
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
