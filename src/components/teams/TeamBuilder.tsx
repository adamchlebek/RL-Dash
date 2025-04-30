import { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    useDraggable,
    useDroppable
} from '@dnd-kit/core';
import type { CSSProperties } from 'react';
import { GlobalPlayer } from '@prisma/client';

interface Player {
    id: string;
    platformId: string;
    name: string;
    avatar?: string;
}

interface TeamBuilderProps {
    teamSize: 2 | 3;
    players: GlobalPlayer[];
    onCalculate: (team1: { id: string; name: string }[], team2: { id: string; name: string }[]) => void;
    isCalculated: boolean;
    isCalculating: boolean;
    teamStats: {
        team1Stats: {
            wins: number;
            losses: number;
            winRate: number;
            totalGoals: number;
            recentPerformance: ('W' | 'L')[];
        };
        team2Stats: {
            wins: number;
            losses: number;
            winRate: number;
            totalGoals: number;
            recentPerformance: ('W' | 'L')[];
        };
        matchHistory: {
            winner: 1 | 2;
            score: string;
            date: string;
            team1: string[];
            team2: string[];
            originalTeam1: { id: string; name: string }[];
            originalTeam2: { id: string; name: string }[];
        }[];
    } | null;
}

interface TeamSlotProps {
    id: string;
    player: Player | null;
}

const WILDCARD: Player = {
    id: 'wildcard',
    platformId: 'wildcard',
    name: 'Wildcard',
    avatar: undefined
};

function TeamSlot({ id, player }: TeamSlotProps): React.ReactElement {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: {
            accepts: ['player']
        }
    });

    return (
        <div
            ref={setNodeRef}
            className={`h-32 w-32 ${!player ? 'border-2 border-dashed' : ''} flex items-center justify-center rounded-lg bg-gray-900 ${
                isOver ? 'border-blue-500' : !player ? 'border-gray-300' : ''
            }`}
        >
            {player && <DraggablePlayer player={player} slotId={id} />}
            {!player && <span className="text-2xl text-gray-500">+</span>}
        </div>
    );
}

function DraggablePlayer({
    player,
    slotId
}: {
    player: Player;
    slotId?: string;
}): React.ReactElement {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: slotId && player.id === 'wildcard' ? `${player.id}-${slotId}` : player.id,
        data: {
            type: 'player',
            player
        }
    });

    if (isDragging) {
        return <div ref={setNodeRef} />;
    }

    const style: CSSProperties | undefined = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
          }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`flex h-32 w-32 cursor-grab flex-col items-center justify-center rounded-lg border shadow-sm ${
                player.id === 'wildcard'
                    ? 'border-purple-300 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10'
                    : 'border-gray-200 bg-white'
            }`}
        >
            <div
                className={`mb-2 h-16 w-16 overflow-hidden rounded-full ${
                    player.id === 'wildcard'
                        ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500'
                        : 'bg-gray-200'
                }`}
            >
                {player.avatar && (
                    <img
                        src={player.avatar}
                        alt={player.name}
                        className="h-full w-full rounded-full object-cover"
                    />
                )}
            </div>
            <p
                className={`w-full px-2 text-center text-sm font-semibold ${
                    player.id === 'wildcard'
                        ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent'
                        : 'text-gray-800'
                }`}
            >
                {player.name}
            </p>
        </div>
    );
}

function PlayerPool({ children }: { children: React.ReactNode }): React.ReactElement {
    const { setNodeRef, isOver } = useDroppable({
        id: 'pool',
        data: {
            accepts: ['player']
        }
    });

    return (
        <div
            ref={setNodeRef}
            className={`h-full rounded-lg bg-gray-800 p-4 ${isOver ? 'ring-2 ring-blue-500' : ''}`}
        >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                {children}
            </div>
        </div>
    );
}

export default function TeamBuilder({
    teamSize,
    players,
    onCalculate,
    isCalculated,
    teamStats,
    isCalculating
}: TeamBuilderProps): React.ReactElement {
    const [teams, setTeams] = useState<{ [key: string]: Player | null }>({});
    const [availablePlayers, setAvailablePlayers] = useState<Player[]>(
        players.map((p) => ({ 
            id: p.id,
            platformId: p.platformId,
            name: p.name, 
            avatar: p.imageUrl || undefined 
        }))
    );
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showResults, setShowResults] = useState<boolean>(false);

    const resetTeam = (teamNumber: 1 | 2): void => {
        const teamKeys = Array.from({ length: teamSize }).map((_, i) => `team${teamNumber}-${i}`);
        const teamPlayers = teamKeys
            .map((key) => teams[key])
            .filter((player) => player && player.id !== 'wildcard') as Player[];

        setTeams((prev) => {
            const newTeams = { ...prev };
            teamKeys.forEach((key) => {
                delete newTeams[key];
            });
            return newTeams;
        });

        setAvailablePlayers((prev) => [...prev, ...teamPlayers]);
    };

    const handleDragStart = (event: DragStartEvent): void => {
        setActiveId(event.active.id.toString());
    };

    const handleDragEnd = (event: DragEndEvent): void => {
        setActiveId(null);
        const { active, over } = event;

        if (!over) return;

        const playerId = active.id.toString();
        const targetId = over.id.toString();

        if (targetId === 'pool') {
            if (playerId.startsWith('wildcard-')) {
                const [, , slotIndex] = playerId.split('-');
                const teamSlotKey = `team2-${slotIndex}`;

                setTeams((prev) => {
                    const newTeams = { ...prev };
                    delete newTeams[teamSlotKey];
                    return newTeams;
                });
                return;
            }

            const teamSlotKey = Object.entries(teams).find(
                ([, player]) => player?.id === playerId
            )?.[0];

            if (teamSlotKey) {
                const player = teams[teamSlotKey];
                if (player) {
                    if (player.id !== 'wildcard') {
                        setAvailablePlayers((prev) => [...prev, player]);
                    }
                    setTeams((prev) => {
                        const newTeams = { ...prev };
                        delete newTeams[teamSlotKey];
                        return newTeams;
                    });
                }
            }
            return;
        }

        if (playerId === 'wildcard') {
            const existingPlayer = teams[targetId];
            if (existingPlayer && existingPlayer.id !== 'wildcard') {
                setAvailablePlayers((prev) => [...prev, existingPlayer]);
            }
            setTeams((prev) => ({
                ...prev,
                [targetId]: WILDCARD
            }));
            return;
        }

        const sourceSlot = Object.entries(teams).find(([, player]) => player?.id === playerId)?.[0];
        const player = sourceSlot ? teams[sourceSlot] : availablePlayers.find((p) => p.id === playerId);

        if (!player) return;

        const existingPlayer = teams[targetId];

        setTeams((prev) => {
            const newTeams = { ...prev };

            if (sourceSlot) {
                if (existingPlayer && existingPlayer.id !== 'wildcard') {
                    newTeams[sourceSlot] = existingPlayer;
                } else {
                    delete newTeams[sourceSlot];
                }
            } else if (existingPlayer && existingPlayer.id !== 'wildcard') {
                setAvailablePlayers((prev) => [...prev, existingPlayer]);
            }

            if (availablePlayers.some((p) => p.id === playerId)) {
                setAvailablePlayers((prev) => prev.filter((p) => p.id !== playerId));
            }

            newTeams[targetId] = player;
            return newTeams;
        });
    };

    const handleCalculateClick = (): void => {
        const newTeams = { ...teams };
        
        Array.from({ length: teamSize }).forEach((_, i) => {
            if (!teams[`team1-${i}`]) newTeams[`team1-${i}`] = WILDCARD;
            if (!teams[`team2-${i}`]) newTeams[`team2-${i}`] = WILDCARD;
        });

        setTeams(newTeams);

        const team1Players = Array.from({ length: teamSize }).map((_, i) => newTeams[`team1-${i}`]);
        const team2Players = Array.from({ length: teamSize }).map((_, i) => newTeams[`team2-${i}`]);

        setShowResults(false);
        onCalculate(
            team1Players.map(p => ({ 
                id: p!.platformId,
                name: p!.name 
            })),
            team2Players.map(p => ({ 
                id: p!.platformId,
                name: p!.name 
            }))
        );
        setShowResults(true);
    };

    if (isCalculated && teamStats && showResults && !isCalculating) {
        const noGamesPlayed = teamStats.matchHistory.length === 0;

        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-start px-4 py-12">
                <div className="w-full max-w-7xl">
                    <h2 className="mb-12 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-center text-3xl font-bold text-transparent">
                        Team Matchup
                    </h2>

                    <div className="mb-4 flex gap-4">
                        <button 
                            onClick={() => {
                                setShowResults(false);
                            }}
                            className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
                        >
                            Edit Teams
                        </button>
                    </div>

                    {noGamesPlayed ? (
                        <div className="rounded-lg bg-gray-900 p-6 text-center">
                            <h3 className="text-xl font-semibold text-white mb-2">No Games Found</h3>
                            <p className="text-gray-400">These teams haven&apos;t played any games together yet.</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                                {[1, 2].map((teamNum) => (
                                    <div key={teamNum} className="rounded-lg bg-gray-900 p-6">
                                        <h3 className="mb-4 text-xl font-semibold text-white">
                                            Team {teamNum}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from({ length: teamSize }).map((_, i) => {
                                                const player = teams[`team${teamNum}-${i}`];
                                                return (
                                                    player && (
                                                        <div
                                                            key={i}
                                                            className={`flex items-center gap-2 rounded-full bg-gray-800 px-3 py-1`}
                                                        >
                                                            {player.avatar && (
                                                                <img
                                                                    src={player.avatar}
                                                                    alt={player.name}
                                                                    className="h-6 w-6 rounded-full"
                                                                />
                                                            )}
                                                            <span className="text-sm text-white">
                                                                {player.name}
                                                            </span>
                                                        </div>
                                                    )
                                                );
                                            })}
                                        </div>

                                        <div className="mt-6 space-y-4">
                                            <div className="rounded-lg bg-gray-800 p-4">
                                                <h4 className="mb-2 text-sm font-semibold text-gray-400">
                                                    Win/Loss Record
                                                </h4>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xl font-bold text-green-400">
                                                        {teamNum === 1
                                                            ? teamStats.team1Stats.wins
                                                            : teamStats.team2Stats.wins}
                                                    </span>
                                                    <span className="text-gray-500">/</span>
                                                    <span className="text-xl font-bold text-red-400">
                                                        {teamNum === 1
                                                            ? teamStats.team1Stats.losses
                                                            : teamStats.team2Stats.losses}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="rounded-lg bg-gray-800 p-4">
                                                <h4 className="mb-2 text-sm font-semibold text-gray-400">
                                                    Win Rate
                                                </h4>
                                                <div className="text-xl font-bold text-purple-400">
                                                    {teamNum === 1
                                                        ? teamStats.team1Stats.winRate.toFixed(1)
                                                        : teamStats.team2Stats.winRate.toFixed(1)}
                                                    %
                                                </div>
                                            </div>

                                            <div className="rounded-lg bg-gray-800 p-4">
                                                <h4 className="mb-2 text-sm font-semibold text-gray-400">
                                                    Total Goals
                                                </h4>
                                                <div className="text-xl font-bold text-blue-400">
                                                    {teamNum === 1
                                                        ? teamStats.team1Stats.totalGoals
                                                        : teamStats.team2Stats.totalGoals}
                                                </div>
                                            </div>

                                            <div className="rounded-lg bg-gray-800 p-4">
                                                <h4 className="mb-2 text-sm font-semibold text-gray-400">
                                                    Recent Performance
                                                </h4>
                                                <div className="flex gap-1">
                                                    {(teamNum === 1
                                                        ? teamStats.team1Stats.recentPerformance
                                                        : teamStats.team2Stats.recentPerformance
                                                    ).map((result, i) => (
                                                        <div
                                                            key={i}
                                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${result === 'W'
                                                                    ? 'bg-green-400/20 text-green-400'
                                                                    : 'bg-red-400/20 text-red-400'
                                                                }`}
                                                        >
                                                            {result}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="rounded-lg bg-gray-900 p-6">
                                <h3 className="mb-4 text-lg font-semibold text-gray-400">Match History</h3>
                                <div className="space-y-3">
                                    {teamStats.matchHistory.map((match, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between rounded-lg bg-gray-800 p-6"
                                        >
                                            <div className="flex items-center gap-8">
                                                <div className="flex items-center gap-4">
                                                    {match.team1.map((name, idx) => {
                                                        const isWildcard = !Array.from({ length: teamSize })
                                                            .map((_, i) => teams[`team1-${i}`])
                                                            .some(p => p?.name === name);
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`flex items-center gap-2 rounded-full ${isWildcard ? 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20' : 'bg-gray-700'} px-3 py-1 ${match.winner === 1 ? 'ring-1 ring-green-400' : ''}`}
                                                            >
                                                                <span className={`text-sm ${isWildcard ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent' : 'text-white'}`}>
                                                                    {name}
                                                                    {isWildcard && ' (Wildcard)'}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <span className="font-semibold text-white">
                                                    {match.score}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {match.team2.map((name, idx) => {
                                                        const isWildcard = !Array.from({ length: teamSize })
                                                            .map((_, i) => teams[`team2-${i}`])
                                                            .some(p => p?.name === name);
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`flex items-center gap-2 rounded-full ${isWildcard ? 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20' : 'bg-gray-700'} px-3 py-1 ${match.winner === 2 ? 'ring-1 ring-green-400' : ''}`}
                                                            >
                                                                <span className={`text-sm ${isWildcard ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent' : 'text-white'}`}>
                                                                    {name}
                                                                    {isWildcard && ' (Wildcard)'}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-400">{match.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="relative flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-gray-900 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
                                    Team 1
                                </h2>
                                <button
                                    onClick={() => resetTeam(1)}
                                    className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600 transition-colors hover:bg-red-200"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: teamSize }).map((_, i) => (
                                <TeamSlot
                                    key={`team1-${i}`}
                                    id={`team1-${i}`}
                                    player={teams[`team1-${i}`]}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="rounded-lg bg-gray-900 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
                                    Team 2
                                </h2>
                                <button
                                    onClick={() => resetTeam(2)}
                                    className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600 transition-colors hover:bg-red-200"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: teamSize }).map((_, i) => (
                                <TeamSlot
                                    key={`team2-${i}`}
                                    id={`team2-${i}`}
                                    player={teams[`team2-${i}`]}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <PlayerPool>
                    {availablePlayers.map((player) => (
                        <DraggablePlayer key={player.id} player={player} />
                    ))}
                    <DraggablePlayer player={WILDCARD} />
                </PlayerPool>

                <button
                    onClick={handleCalculateClick}
                    disabled={isCalculating}
                    className="group relative mt-4 cursor-pointer overflow-hidden rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-[2px] transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_2px_rgba(191,66,245,0.3)] focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none active:scale-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <div className="group-hover:bg-opacity-90 relative rounded-lg bg-gray-900 px-8 py-4 transition-all">
                        <div className="flex items-center justify-center gap-2">
                            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-xl font-bold text-transparent">
                                {isCalculating ? 'Calculating...' : 'Calculate Stats'}
                            </span>
                        </div>
                    </div>
                </button>

                <DragOverlay>
                    {activeId ? (
                        <div style={{ transform: 'rotate(5deg)' }}>
                            <DraggablePlayer
                                player={
                                    availablePlayers.find((p) => p.id === activeId) ||
                                    Object.values(teams).find((p) => p?.id === activeId) ||
                                    (activeId.startsWith('wildcard') ? WILDCARD : WILDCARD)
                                }
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
}
