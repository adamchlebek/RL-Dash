'use client';

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Loader2, Crown } from 'lucide-react'
import type { GameDetailsResult } from '@/lib/gameDetails'

interface GameDetailsModalProps {
    gameId: string
    isOpen: boolean
    onClose: () => void
}

interface StatsTableProps {
    players: GameDetailsResult['teams']['blue']['players']
}

const formatDate = (dateString: string): { date: string; time: string } => {
    const date = new Date(dateString)
    return {
        date: date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
        }),
        time: date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }
}

export const GameDetailsModal = ({ gameId, isOpen, onClose }: GameDetailsModalProps) => {
    const [gameDetails, setGameDetails] = useState<GameDetailsResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (isOpen && gameId) {
            setIsLoading(true)
            fetch(`/api/game/${gameId}`)
                .then(res => res.json())
                .then(setGameDetails)
                .catch(console.error)
                .finally(() => setIsLoading(false))
        }
    }, [isOpen, gameId])

    const StatsTable = ({ players }: StatsTableProps) => {
        const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
        const highestScore = Math.max(...gameDetails?.teams.blue.players.concat(gameDetails?.teams.orange.players).map(p => p.score) || [0])
        
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="py-2 text-left text-foreground">Player</th>
                            <th className="py-2 text-right text-foreground">Score</th>
                            <th className="py-2 text-right text-foreground">Goals</th>
                            <th className="py-2 text-right text-foreground">Assists</th>
                            <th className="py-2 text-right text-foreground">Saves</th>
                            <th className="py-2 text-right text-foreground">Shots</th>
                            <th className="py-2 text-right text-foreground">Demos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPlayers.map((player, i) => (
                            <tr key={i} className="border-b border-border">
                                <td className="flex items-center gap-2 py-2">
                                    {player.name}
                                    {player.score === highestScore && <Crown className="h-4 w-4 text-yellow-400" />}
                                </td>
                                <td className="py-2 text-right">{player.score}</td>
                                <td className="py-2 text-right">{player.goals}</td>
                                <td className="py-2 text-right">{player.assists}</td>
                                <td className="py-2 text-right">{player.saves}</td>
                                <td className="py-2 text-right">{player.shots}</td>
                                <td className="py-2 text-right">{player.stats.demos.inflicted}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Game Details</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                    </div>
                ) : gameDetails && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-center gap-12 rounded-lg bg-zinc-800/50 p-8">
                            <div className="text-center">
                                <h3 className="mb-2 text-lg font-semibold text-blue-400">Blue Team</h3>
                                <div className="text-4xl font-bold">{gameDetails.teams.blue.goals}</div>
                            </div>
                            <div className="text-center">
                                <div className="space-y-0.5">
                                    <div className="text-sm text-zinc-400">{formatDate(gameDetails.date).date}</div>
                                    <div className="text-sm text-zinc-400">{formatDate(gameDetails.date).time}</div>
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="mb-2 text-lg font-semibold text-orange-400">Orange Team</h3>
                                <div className="text-4xl font-bold">{gameDetails.teams.orange.goals}</div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-blue-400">Blue Team</h3>
                                <StatsTable players={gameDetails.teams.blue.players} />
                            </div>

                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-orange-400">Orange Team</h3>
                                <StatsTable players={gameDetails.teams.orange.players} />
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => router.push(`/game/${gameId}`)}
                                className="rounded-lg bg-zinc-700 px-4 py-2 font-medium cursor-pointer text-white transition-colors hover:bg-zinc-600"
                            >
                                View All Details
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}