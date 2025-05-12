'use client';

import { ReactNode, useState } from 'react';
import { Crown } from 'lucide-react';
import { Badge } from './ui/badge';
import { GameDetailsModal } from './GameDetailsModal';

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
    isLoading?: boolean;
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
    isMatchup = false,
    isLoading = false
}: StatCardProps): React.ReactNode => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getBorderColor = () => {
        if (isTeam) {
            return isWorst ? 'border-red-500/50' : 'border-yellow-500/50';
        }
        if (isMatchup) {
            return 'border-blue-500/50';
        }
        return `border-${color}-500/50`;
    };

    const handleClick = () => {
        if (gameId && !isLoading) {
            setIsModalOpen(true);
        }
    };

    if (isLoading) {
        return (
            <div
                className={`bg-background/50 rounded-xl border p-6 backdrop-blur-sm ${getBorderColor()}`}
            >
                <div className="mb-4 flex items-center justify-center gap-3">
                    <div className="h-6 w-6 animate-pulse rounded-full bg-gray-500" />
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-500" />
                </div>
                {isTeam ? (
                    <>
                        <div className="mb-4 flex flex-wrap justify-center gap-2">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-6 w-16 animate-pulse rounded-full bg-gray-500"
                                />
                            ))}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-8 animate-pulse rounded bg-gray-500" />
                            <span className="text-muted">/</span>
                            <div className="h-4 w-8 animate-pulse rounded bg-gray-500" />
                        </div>
                    </>
                ) : isMatchup ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                            <div className="flex flex-wrap justify-center gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-6 w-16 animate-pulse rounded-full bg-gray-500"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="bg-border h-[1px] flex-1"></div>
                            <span className="text-muted px-3 font-medium">vs</span>
                            <div className="bg-border h-[1px] flex-1"></div>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <div className="flex flex-wrap justify-center gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-6 w-16 animate-pulse rounded-full bg-gray-500"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mx-auto mb-4 h-8 w-24 animate-pulse rounded bg-gray-500" />
                        <div className="flex flex-wrap justify-center gap-2">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-6 w-16 animate-pulse rounded-full bg-gray-500"
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    if (isMatchup) {
        const team1Players = players[0].split(/[,&\s]+/).filter(Boolean);
        const team2Players = players[1].split(/[,&\s]+/).filter(Boolean);

        const team1Won = winningTeam === 0;
        const team2Won = winningTeam === 1;

        return (
            <>
                <div
                    className={`bg-background/50 rounded-xl border p-6 backdrop-blur-sm ${getBorderColor()} hover:bg-background/70 transition-all duration-300 hover:scale-[1.02] ${gameId ? 'cursor-pointer' : ''}`}
                    onClick={handleClick}
                >
                    <div className="mb-4 flex items-center justify-center gap-3">
                        {icon}
                        <p className="text-muted text-sm">{label}</p>
                    </div>
                    <p className="text-foreground mb-4 text-center text-2xl font-semibold">
                        {value}
                    </p>
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
                            <div className="bg-border h-[1px] flex-1"></div>
                            <span className="text-muted px-3 font-medium">vs</span>
                            <div className="bg-border h-[1px] flex-1"></div>
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
                {gameId && (
                    <GameDetailsModal
                        gameId={gameId}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <div
                className={`bg-background/50 rounded-xl border p-6 backdrop-blur-sm ${getBorderColor()} hover:bg-background/70 transition-all duration-300 hover:scale-[1.02] ${gameId ? 'cursor-pointer' : ''}`}
                onClick={handleClick}
            >
                <div className={`mb-4 flex items-center ${isTeam ? 'justify-center' : ''} gap-3`}>
                    {icon}
                    <p className="text-muted text-sm">{label}</p>
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
                                <span className="text-muted">N/A</span>
                            )}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm">
                            <span className="text-green-400">{value.split('/')[0]}</span>
                            <span className="text-muted">/</span>
                            <span className="text-red-400">{value.split('/')[1]}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-foreground mb-2 text-2xl font-semibold">{value}</p>
                        <div className="flex flex-wrap gap-2">
                            {players.length > 0 ? (
                                players.map((player, index) => (
                                    <Badge key={index} color={color}>
                                        {player}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-muted">N/A</span>
                            )}
                        </div>
                    </>
                )}
            </div>
            {gameId && (
                <GameDetailsModal
                    gameId={gameId}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
};
