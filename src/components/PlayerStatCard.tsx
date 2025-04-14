import { ReactNode } from 'react'

interface PlayerStatCardProps {
  label: string
  value: string
  player: string
  icon: ReactNode
  color?: 'orange' | 'pink' | 'yellow' | 'red' | 'green'
}

export const PlayerStatCard = ({ label, value, player, icon, color = 'orange' }: PlayerStatCardProps) => {
  const colorClasses = {
    orange: 'border-orange-500/50 bg-orange-500/20 text-orange-300',
    pink: 'border-pink-500/50 bg-pink-500/20 text-pink-300',
    yellow: 'border-yellow-500/50 bg-yellow-500/20 text-yellow-300',
    red: 'border-red-500/50 bg-red-500/20 text-red-300',
    green: 'border-green-500/50 bg-green-500/20 text-green-300',
  }

  return (
    <div className={`bg-zinc-800/50 backdrop-blur-sm p-6 rounded-xl border ${colorClasses[color]} hover:bg-zinc-700/50 transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <p className="text-sm text-zinc-400">{label}</p>
      </div>
      <p className="text-2xl font-semibold mb-2">{value}</p>
      <div className="flex items-center gap-2">
        <span className={`text-sm px-3 py-1.5 rounded-full ${colorClasses[color]}`}>
          {player}
        </span>
      </div>
    </div>
  )
} 