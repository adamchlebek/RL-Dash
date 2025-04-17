import { ReactNode } from 'react';
import { Crown } from 'lucide-react';

interface MatchupStatCardProps {
    label: string;
    value: string;
    teams: [string, string];
    icon: ReactNode;
}

export const MatchupStatCard = ({ label, value, teams, icon }: MatchupStatCardProps) => {
    // Process teams - each team is a string that may contain multiple players
    const team1Players = teams[0].split(/[,&\s]+/).filter(Boolean);
    const team2Players = teams[1].split(/[,&\s]+/).filter(Boolean);

    // Parse score to determine winner
    const isScoreFormat = value.includes('-');
    let team1Won = false;
    if (isScoreFormat) {
        const [score1, score2] = value.split('-').map(Number);
        team1Won = score1 > score2;
    }

    return (
        <div className="rounded-xl border border-blue-500/50 bg-zinc-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-700/50">
            <div className="mb-4 flex items-center justify-center gap-3">
                {icon}
                <p className="text-sm text-zinc-400">{label}</p>
            </div>
            <p className="mb-4 text-center text-2xl font-semibold">{value}</p>
            <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                    {isScoreFormat && team1Won && <Crown className="h-4 w-4 text-yellow-400" />}
                    <div className="flex flex-wrap justify-center gap-2">
                        {team1Players.map((player, index) => (
                            <span
                                key={index}
                                className="rounded-full bg-blue-500/20 px-3 py-1.5 text-sm text-blue-300"
                            >
                                {player}
                            </span>
                        ))}
                    </div>
                    {isScoreFormat && team1Won && <Crown className="h-4 w-4 text-yellow-400" />}
                </div>
                <div className="flex items-center">
                    <div className="h-[1px] flex-1 bg-zinc-700"></div>
                    <span className="px-3 font-medium text-zinc-500">vs</span>
                    <div className="h-[1px] flex-1 bg-zinc-700"></div>
                </div>
                <div className="flex items-center justify-center gap-2">
                    {isScoreFormat && !team1Won && <Crown className="h-4 w-4 text-yellow-400" />}
                    <div className="flex flex-wrap justify-center gap-2">
                        {team2Players.map((player, index) => (
                            <span
                                key={index}
                                className="rounded-full bg-blue-500/20 px-3 py-1.5 text-sm text-blue-300"
                            >
                                {player}
                            </span>
                        ))}
                    </div>
                    {isScoreFormat && !team1Won && <Crown className="h-4 w-4 text-yellow-400" />}
                </div>
            </div>
        </div>
    );
};
