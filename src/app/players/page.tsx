import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const revalidate = 3600; // Revalidate every hour

async function getGlobalPlayers() {
    return await prisma.globalPlayer.findMany({
        orderBy: { name: 'asc' },
        include: {
            players: {
                include: {
                    blueReplays: {
                        select: {
                            id: true,
                            date: true
                        }
                    },
                    orangeReplays: {
                        select: {
                            id: true,
                            date: true
                        }
                    }
                }
            }
        }
    });
}

export default async function PlayersPage() {
    const players = await getGlobalPlayers();

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 text-white">
            <div className="mx-auto max-w-7xl space-y-8">
                <h1 className="mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                    Players
                </h1>

                <div className="overflow-x-auto rounded-lg bg-zinc-800/50 shadow">
                    <table className="min-w-full divide-y divide-zinc-700">
                        <thead className="bg-zinc-700/30">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-300 uppercase">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-300 uppercase">
                                    Platform
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-300 uppercase">
                                    Platform ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-300 uppercase">
                                    First Seen
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-300 uppercase">
                                    Latest Game
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-700 bg-zinc-800/20">
                            {players.map((player) => {
                                const allGames = [
                                    ...player.players.flatMap((p) => p.blueReplays),
                                    ...player.players.flatMap((p) => p.orangeReplays)
                                ].sort(
                                    (a, b) =>
                                        new Date(b.date || 0).getTime() -
                                        new Date(a.date || 0).getTime()
                                );

                                const latestGame = allGames[0];

                                return (
                                    <tr
                                        key={player.id}
                                        className="transition-colors hover:bg-zinc-700/30"
                                    >
                                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                                            <Link
                                                href={`/players/${player.id}`}
                                                className="text-blue-400 transition-colors hover:text-blue-300"
                                            >
                                                {player.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-zinc-300">
                                            {player.platform}
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-zinc-300">
                                            {player.platformId}
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-zinc-300">
                                            {new Date(player.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-zinc-300">
                                            {latestGame ? (
                                                <Link
                                                    href={`/game/${latestGame.id}`}
                                                    className="text-blue-400 transition-colors hover:text-blue-300"
                                                >
                                                    {new Date(
                                                        latestGame.date || 0
                                                    ).toLocaleDateString()}
                                                </Link>
                                            ) : (
                                                'No games'
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {players.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-zinc-400">
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
