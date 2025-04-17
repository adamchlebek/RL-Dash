import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getGameIdFromInstance } from '@/lib/getGameId';

export const revalidate = 3600; // Revalidate every hour

async function getPlayerData(id: string) {
    const player = await prisma.globalPlayer.findUnique({
        where: { id },
        include: {
            players: {
                include: {
                    team: true,
                    blueReplays: true,
                    orangeReplays: true
                }
            }
        }
    });

    return player;
}

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const player = await getPlayerData(id);

    if (!player) {
        notFound();
    }

    // Map player instances to add a replayId property for display
    const playerInstances = await Promise.all(
        player.players.map(async (instance) => {
            const replayId = await getGameIdFromInstance(instance.id);

            return {
                ...instance,
                replayId
            };
        })
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 text-white">
            <div className="mx-auto max-w-7xl space-y-8">
                <Link
                    href="/players"
                    className="inline-flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Players
                </Link>

                <h1 className="mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                    {player.name}
                </h1>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-lg bg-zinc-800/50 p-6 shadow">
                        <h2 className="mb-4 text-xl font-semibold">Player Info</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Platform:</span>
                                <span>{player.platform}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Platform ID:</span>
                                <span>{player.platformId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">First Seen:</span>
                                <span>{new Date(player.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400">Total Games:</span>
                                <span>{playerInstances.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-zinc-800/50 p-6 shadow md:col-span-2">
                        <h2 className="mb-4 text-xl font-semibold">Game History</h2>
                        {playerInstances.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-zinc-700">
                                    <thead className="bg-zinc-700/30">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-300 uppercase">
                                                Game
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-300 uppercase">
                                                Team
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-300 uppercase">
                                                Score
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-300 uppercase">
                                                Goals
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-300 uppercase">
                                                Assists
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-300 uppercase">
                                                Saves
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-700 bg-zinc-800/20">
                                        {playerInstances.map((instance) => (
                                            <tr
                                                key={instance.id}
                                                className="transition-colors hover:bg-zinc-700/30"
                                            >
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    {instance.replayId ? (
                                                        <Link
                                                            href={`/game/${instance.replayId}`}
                                                            className="text-blue-400 hover:text-blue-300"
                                                        >
                                                            {instance.replayId.substring(0, 8)}...
                                                        </Link>
                                                    ) : (
                                                        <span className="text-zinc-500">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    <span
                                                        className={`rounded px-2 py-1 ${instance.team?.color === 'blue' ? 'bg-blue-800/50' : 'bg-orange-700/50'}`}
                                                    >
                                                        {instance.team?.color || 'unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    {instance.score || '0'}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    {instance.goals || '0'}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    {instance.assists || '0'}
                                                </td>
                                                <td className="px-6 py-4 text-sm whitespace-nowrap">
                                                    {instance.saves || '0'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-zinc-400">No games found for this player.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
