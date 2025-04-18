import { ReactNode } from 'react';
import { Crown } from 'lucide-react';
import { Badge } from './ui/badge';
import { useRouter } from 'next/navigation';

interface StatCardProps {
    gameId?: string;
    label: string;
    value: string;
    players: string[];
    icon: ReactNode;
    winningTeam?: 0 | 1;
    color?: 'orange' | 'pink' | 'yellow' | 'red' | 'green' | 'blue';
    isWorst?: boolean;
    isTeam?: boolean;
    isMatchup?: boolean;
}

export const StatCard = ({
    gameId,
    label,
    value,
    players,
    icon,
    winningTeam = undefined,
    color = 'orange',
    isWorst = false,
    isTeam = false,
    isMatchup = false
}: StatCardProps) => {
    const router = useRouter();

    const getBorderColor = () => {
        if (isTeam) {
            return isWorst ? 'border-red-500/50' : 'border-yellow-500/50';
        }
        if (isMatchup) {
            return 'border-blue-500/50';
        }
        return `border-${color}-500/50`;
    };

    const handleGameIdClick = () => {
        if (gameId) {
            router.push(`/game/${gameId}`);
        }
    };

    if (isMatchup) {
        const team1Players = players[0].split(/[,&\s]+/).filter(Boolean);
        const team2Players = players[1].split(/[,&\s]+/).filter(Boolean);

        const team1Won = winningTeam === 0;
        const team2Won = winningTeam === 1;

        return (
            <div
                className={`rounded-xl border bg-zinc-800/50 p-6 backdrop-blur-sm ${getBorderColor()} transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-700/50 ${gameId ? 'cursor-pointer' : ''}`}
                onClick={handleGameIdClick}
            >
                <div className="mb-4 flex items-center justify-center gap-3">
                    {icon}
                    <p className="text-sm text-zinc-400">{label}</p>
                </div>
                <p className="mb-4 text-center text-2xl font-semibold">{value}</p>
                <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                        {team1Won && <Crown className="h-4 w-4 text-yellow-400" />}
                        <div className="flex flex-wrap justify-center gap-2">
                            {team1Players.map((player, index) => (
                                <Badge key={index} color="blue">
                                    {player}
                                </Badge>
                            ))}
                        </div>
                        {team1Won && <Crown className="h-4 w-4 text-yellow-400" />}
                    </div>
                    <div className="flex items-center">
                        <div className="h-[1px] flex-1 bg-zinc-700"></div>
                        <span className="px-3 font-medium text-zinc-500">vs</span>
                        <div className="h-[1px] flex-1 bg-zinc-700"></div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        {team2Won && <Crown className="h-4 w-4 text-yellow-400" />}
                        <div className="flex flex-wrap justify-center gap-2">
                            {team2Players.map((player, index) => (
                                <Badge key={index} color="blue">
                                    {player}
                                </Badge>
                            ))}
                        </div>
                        {team2Won && <Crown className="h-4 w-4 text-yellow-400" />}
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div
            className={`rounded-xl border bg-zinc-800/50 p-6 backdrop-blur-sm ${getBorderColor()} transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-700/50 ${gameId ? 'cursor-pointer' : ''}`}
            onClick={handleGameIdClick}
        >
            <div className={`mb-4 flex items-center ${isTeam ? 'justify-center' : ''} gap-3`}>
                {icon}
                <p className="text-sm text-zinc-400">{label}</p>
            </div>
            {isTeam ? (
                <>
                    <div className="mb-4 flex flex-wrap justify-center gap-2">
                        {players.length > 0 ? (
                            players.map((player, index) => (
                                <Badge key={index} color={isWorst ? 'red' : 'yellow'}>
                                    {player}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-zinc-400">N/A</span>
                        )}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="text-green-400">{value.split('/')[0]}</span>
                        <span className="text-zinc-500">/</span>
                        <span className="text-red-400">{value.split('/')[1]}</span>
                    </div>
                </>
            ) : (
                <>
                    <p className="mb-2 text-2xl font-semibold">{value}</p>
                    <div className="flex flex-wrap gap-2">
                        {players.length > 0 ? (
                            players.map((player, index) => (
                                <Badge key={index} color={color}>
                                    {player}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-zinc-400">N/A</span>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

