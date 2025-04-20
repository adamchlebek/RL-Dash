import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import { getPlayerStats, getGameHistory } from '@/lib/stats';
import GameHistoryTable from '@/components/GameHistoryTable';

export const revalidate = 3600;

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default async function PlayerPage({ params }: Props): Promise<React.ReactElement> {
    const { id } = await params;
    const players = await getPlayerStats();
    const player = players.find((p) => p.id === id);

    if (!player) {
        notFound();
    }

    const gameHistory = await getGameHistory(id);
    const winRate = player.gamesPlayed > 0 ? ((player.wins / player.gamesPlayed) * 100).toFixed(1) : '0.0';

    return (
        <div className="min-h-screen bg-background p-8 text-foreground">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                        {player.name}
                    </h1>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border bg-background/50 p-6 shadow backdrop-blur-sm">
                        <h3 className="text-sm font-medium text-muted">Win Rate</h3>
                        <p className="mt-2 text-3xl font-semibold text-foreground">
                            {winRate}%
                        </p>
                        <div className="mt-1">
                            <span className="text-green-400">{player.wins}</span>
                            <span className="mx-1 text-muted">/</span>
                            <span className="text-red-400">{player.losses}</span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-background/50 p-6 shadow backdrop-blur-sm">
                        <h3 className="text-sm font-medium text-muted">Games Played</h3>
                        <p className="mt-2 text-3xl font-semibold text-foreground">
                            {player.gamesPlayed}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-background/50 p-6 shadow backdrop-blur-sm">
                        <h3 className="text-sm font-medium text-muted">First Seen</h3>
                        <p className="mt-2 text-3xl font-semibold text-foreground">
                            {format(new Date(player.firstSeen), 'MMM dd, yyyy')}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                            {format(new Date(player.firstSeen), 'h:mm a')}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-background/50 p-6 shadow backdrop-blur-sm">
                        <h3 className="text-sm font-medium text-muted">Latest Game</h3>
                        <p className="mt-2 text-3xl font-semibold text-foreground">
                            {format(new Date(player.latestGame), 'MMM dd, yyyy')}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                            {format(new Date(player.latestGame), 'h:mm a')}
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-6 shadow backdrop-blur-sm">
                    <h2 className="mb-6 text-2xl font-semibold text-foreground">Game History</h2>
                    <GameHistoryTable games={gameHistory} highlightPlayerId={id} />
                </div>
            </div>
        </div>
    );
}
