import { Player } from '../models/player'
import { Goal, Trophy, Crosshair, Target, Bomb, Gamepad2 } from 'lucide-react'

type PlayerTableProps = {
  players: Player[]
}

export function PlayerTable({ players }: PlayerTableProps) {
  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-zinc-700">
              <th className="pb-4 font-medium text-zinc-300">Player</th>
              <th className="pb-4 font-medium text-zinc-300">
                <div className="flex items-center gap-1">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Games</span>
                </div>
              </th>
              <th className="pb-4 font-medium text-zinc-300">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>W/L</span>
                </div>
              </th>
              <th className="pb-4 font-medium text-zinc-300">
                <div className="flex items-center gap-1">
                  <Goal className="w-4 h-4" />
                  <span>Goals</span>
                </div>
              </th>
              <th className="pb-4 font-medium text-zinc-300">
                <div className="flex items-center gap-1">
                  <Crosshair className="w-4 h-4" />
                  <span>Assists</span>
                </div>
              </th>
              <th className="pb-4 font-medium text-zinc-300">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>Shots</span>
                </div>
              </th>
              <th className="pb-4 font-medium text-zinc-300">
                <div className="flex items-center gap-1">
                  <Bomb className="w-4 h-4" />
                  <span>Demos</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.name} className="border-b border-zinc-700 last:border-0 hover:bg-zinc-700/50 transition-colors">
                <td className="py-4 font-medium">{player.name}</td>
                <td className="py-4">{player.gamesPlayed}</td>
                <td className="py-4">
                  <span className="text-green-400">{player.wins}</span>
                  <span className="text-zinc-500 mx-1">/</span>
                  <span className="text-red-400">{player.losses}</span>
                </td>
                <td className="py-4">{player.goals}</td>
                <td className="py-4">{player.assists}</td>
                <td className="py-4">{player.shots}</td>
                <td className="py-4">{player.demos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 