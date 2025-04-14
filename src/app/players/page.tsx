import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const revalidate = 3600; // Revalidate every hour

async function getGlobalPlayers() {
  return await prisma.globalPlayer.findMany({
    orderBy: { name: 'asc' },
  });
}

export default async function PlayersPage() {
  const players = await getGlobalPlayers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Players
        </h1>
        
        <div className="overflow-x-auto bg-zinc-800/50 rounded-lg shadow">
          <table className="min-w-full divide-y divide-zinc-700">
            <thead className="bg-zinc-700/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">Platform ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">First Seen</th>
              </tr>
            </thead>
            <tbody className="bg-zinc-800/20 divide-y divide-zinc-700">
              {players.map((player) => (
                <tr key={player.id} className="hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link href={`/players/${player.id}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                      {player.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{player.platform}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">{player.platformId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {new Date(player.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-zinc-400">
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