import { ReactNode } from 'react'
import { StatValue } from '../models/stats'

type StatCardProps = {
  label: string
  value: string
  players: string[]
  isTeamVsTeam?: boolean
  icon: ReactNode
}

export function StatCard({ label, value, players, isTeamVsTeam, icon }: StatCardProps) {
  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-xl border border-zinc-700/50 hover:bg-zinc-700/50 transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <p className="text-sm text-zinc-400">{label}</p>
      </div>
      <p className="text-2xl font-semibold mb-2">{value}</p>
      {isTeamVsTeam ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm bg-zinc-700/50 px-2 py-1 rounded-full text-zinc-300">
              {players[0]}
            </span>
            <span className="text-zinc-500">vs</span>
            <span className="text-sm bg-zinc-700/50 px-2 py-1 rounded-full text-zinc-300">
              {players[1]}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {players.map((player, index) => (
            <span 
              key={index} 
              className="text-sm bg-zinc-700/50 px-2 py-1 rounded-full text-zinc-300"
            >
              {player}
            </span>
          ))}
        </div>
      )}
    </div>
  )
} 