import { ReactNode } from 'react';

interface TeamStatCardProps {
    label: string;
    value: string;
    players: string[];
    icon: ReactNode;
    isWorst?: boolean;
}

export const TeamStatCard = ({ label, value, players, icon, isWorst }: TeamStatCardProps) => {
    const [wins, losses] = value.split('/');

    return (
        <div
            className={`rounded-xl border bg-zinc-800/50 p-6 backdrop-blur-sm ${isWorst ? 'border-red-500/50' : 'border-yellow-500/50'} transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-700/50`}
        >
            <div className="mb-4 flex items-center justify-center gap-3">
                {icon}
                <p className="text-sm text-zinc-400">{label}</p>
            </div>
            <div className="mb-4 flex flex-wrap justify-center gap-2">
                {players.length > 0 ? (
                    players.map((player, index) => (
                        <span
                            key={index}
                            className={`rounded-full px-3 py-1.5 text-base font-medium ${isWorst ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}
                        >
                            {player}
                        </span>
                    ))
                ) : (
                    <span className="text-zinc-400">N/A</span>
                )}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-green-400">{wins}</span>
                <span className="text-zinc-500">/</span>
                <span className="text-red-400">{losses}</span>
            </div>
        </div>
    );
};
