import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const revalidate = 3600; // Revalidate every hour

async function getPlayerData(id: string) {
  const player = await prisma.globalPlayer.findUnique({
    where: { id },
    include: {
      players: {
        include: {
          team: true,
          blueReplays: true,
          orangeReplays: true,
        },
      },
    },
  });

  return player;
}

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayerData(id);

  if (!player) {
    notFound();
  }

  // Map player instances to add a replayId property for display
  const playerInstances = player.players.map((instance) => {
    // Determine which replay relation to use
    const replay = instance.blueReplays[0] || instance.orangeReplays[0];
    return {
      ...instance,
      replayId: replay?.id,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Link
          href="/players"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Players
        </Link>

        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {player.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-800/50 rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Player Info</h2>
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

          <div className="bg-zinc-800/50 rounded-lg p-6 shadow md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Game History</h2>
            {playerInstances.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-700">
                  <thead className="bg-zinc-700/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                        Game
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                        Goals
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                        Assists
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                        Saves
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-zinc-800/20 divide-y divide-zinc-700">
                    {playerInstances.map((instance) => (
                      <tr
                        key={instance.id}
                        className="hover:bg-zinc-700/30 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {instance.replayId ? (
                            <Link
                              href={`/replay/${instance.replayId}`}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              {instance.replayId.substring(0, 8)}...
                            </Link>
                          ) : (
                            <span className="text-zinc-500">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded ${instance.team?.color === "blue" ? "bg-blue-800/50" : "bg-orange-700/50"}`}
                          >
                            {instance.team?.color || "unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {instance.score || "0"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {instance.goals || "0"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {instance.assists || "0"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {instance.saves || "0"}
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
