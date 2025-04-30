'use client';

import { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    useDraggable,
    useDroppable,
    DragOverlay,
    DragStartEvent
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { globalPlayers } from '@/data/players';
import { RefreshCw, Plus, User } from 'lucide-react';

type TeamSize = '2v2' | '3v3' | null;
type Team = {
    players: (string | 'wildcard')[];
    side: 'left' | 'right';
};

export default function TeamsPage() {
    const [teamSize, setTeamSize] = useState<TeamSize>(null);
    const [teams, setTeams] = useState<Team[]>([
        { players: [], side: 'left' },
        { players: [], side: 'right' }
    ]);
    const [availablePlayers, setAvailablePlayers] = useState<string[]>(globalPlayers);
    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id.toString());
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const player = active.id.toString();
        const teamIndex = teams.findIndex((t) => t.side === over.id);
        if (teamIndex === -1) return;

        const newTeams = [...teams];
        const currentTeamIndex = teams.findIndex((t) => t.players.includes(player));

        if (currentTeamIndex !== -1) {
            newTeams[currentTeamIndex].players = newTeams[currentTeamIndex].players.filter(
                (p) => p !== player
            );
        } else {
            setAvailablePlayers((prev) => prev.filter((p) => p !== player));
        }

        if (newTeams[teamIndex].players.length < (teamSize === '2v2' ? 2 : 3)) {
            newTeams[teamIndex].players.push(player);
            setTeams(newTeams);
        }

        setActiveId(null);
    };

    const resetTeams = () => {
        setTeams([
            { players: [], side: 'left' },
            { players: [], side: 'right' }
        ]);
        setAvailablePlayers(globalPlayers);
    };

    const resetPhase = () => {
        setTeamSize(null);
        resetTeams();
    };

    return (
        <div className="bg-background text-foreground min-h-screen p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 flex items-center justify-between">
                    <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                        Team Builder
                    </h1>
                    <button
                        onClick={resetPhase}
                        className="border-border bg-background/50 text-muted hover:border-muted hover:text-foreground flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reset
                    </button>
                </div>

                {!teamSize ? (
                    <div className="flex gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 cursor-pointer rounded-lg bg-blue-600 p-6 text-xl font-semibold text-white"
                            onClick={() => setTeamSize('2v2')}
                        >
                            2v2
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 cursor-pointer rounded-lg bg-purple-600 p-6 text-xl font-semibold text-white"
                            onClick={() => setTeamSize('3v3')}
                        >
                            3v3
                        </motion.button>
                    </div>
                ) : (
                    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <div className="flex items-start justify-between gap-12">
                            {teams.map((team, index) => (
                                <div key={team.side} className="flex-1">
                                    <div className="mb-6 flex items-center justify-between">
                                        <div className="text-foreground text-xl font-semibold">
                                            Team {index + 1}
                                        </div>
                                        <button
                                            onClick={() => resetTeams()}
                                            className="border-border bg-background/50 text-muted hover:border-muted hover:text-foreground flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1 text-sm transition-all"
                                        >
                                            <RefreshCw className="h-3 w-3" />
                                            Reset
                                        </button>
                                    </div>
                                    <DroppableTeam
                                        id={team.side}
                                        players={team.players}
                                        teamSize={teamSize}
                                    />
                                </div>
                            ))}
                            <div className="mt-24 flex items-center justify-center px-12 text-8xl font-bold text-white/20 select-none">
                                VS
                            </div>
                        </div>

                        <div className="mt-16">
                            <h2 className="text-foreground mb-6 text-2xl font-semibold">
                                Available Players
                            </h2>
                            <div className="grid grid-cols-4 gap-4">
                                {availablePlayers.map((player) => (
                                    <DraggablePlayer key={player} id={player} name={player} />
                                ))}
                                <DraggablePlayer id="wildcard" name="Wildcard" isWildcard />
                            </div>
                        </div>

                        <DragOverlay>
                            {activeId ? (
                                <PlayerCard
                                    name={activeId === 'wildcard' ? 'Wildcard' : activeId}
                                    isWildcard={activeId === 'wildcard'}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>
        </div>
    );
}

function DroppableTeam({
    id,
    players,
    teamSize
}: {
    id: string;
    players: (string | 'wildcard')[];
    teamSize: TeamSize;
}) {
    const { setNodeRef } = useDroppable({
        id
    });

    const maxPlayers = teamSize === '2v2' ? 2 : 3;
    const emptySlots = Array(maxPlayers)
        .fill(null)
        .map((_, i) => players[i] || null);

    return (
        <div ref={setNodeRef} className="space-y-4">
            {emptySlots.map((player, i) => (
                <div
                    key={i}
                    className={`h-24 rounded-lg border-2 ${!player ? 'border-dashed border-white/20' : 'border-transparent'}`}
                >
                    {player ? (
                        <PlayerCard
                            name={player === 'wildcard' ? 'Wildcard' : player}
                            isWildcard={player === 'wildcard'}
                            isDraggable
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <Plus className="h-6 w-6 text-white/20" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function PlayerCard({
    name,
    isWildcard,
    isDraggable
}: {
    name: string;
    isWildcard?: boolean;
    isDraggable?: boolean;
}) {
    return (
        <div
            className={`bg-background/5 flex h-full items-center gap-4 rounded-lg border border-white/10 p-4 backdrop-blur-sm ${isDraggable ? 'cursor-move' : ''} ${isWildcard ? 'border-yellow-500/20 bg-yellow-500/10' : ''}`}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <User className="h-6 w-6 text-white/40" />
            </div>
            <span className={`font-medium ${isWildcard ? 'text-yellow-500' : 'text-white'}`}>
                {name}
            </span>
        </div>
    );
}

function DraggablePlayer({
    id,
    name,
    isWildcard
}: {
    id: string;
    name: string;
    isWildcard?: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id
    });

    const style = {
        transform: CSS.Translate.toString(transform)
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            whileHover={{ scale: 1.02 }}
            className="h-24"
        >
            <PlayerCard name={name} isWildcard={isWildcard} isDraggable />
        </motion.div>
    );
}
