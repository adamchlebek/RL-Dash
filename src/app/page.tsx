'use client'

import { useState } from 'react'
import { TeamStatCard } from '../components/TeamStatCard'
import { MatchupStatCard } from '../components/MatchupStatCard'
import { PlayerStatCard } from '../components/PlayerStatCard'
import { PlayerTable } from '../components/PlayerTable'
import { dummyPlayers, dummyStats, statIcons } from '../data/dummyData'
import { Trophy, User, Users } from 'lucide-react'

export default function Home() {
  const [players] = useState(dummyPlayers)
  const [stats] = useState(dummyStats)

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div>
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Rocket League Stats
          </h1>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Team Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TeamStatCard 
              label="Best 3s Team" 
              value={stats.best3sTeam.value}
              players={stats.best3sTeam.players}
              icon={statIcons.best3sTeam}
            />
            <TeamStatCard 
              label="Best 2s Team" 
              value={stats.best2sTeam.value}
              players={stats.best2sTeam.players}
              icon={statIcons.best2sTeam}
            />
            <TeamStatCard 
              label="Worst 3s Team" 
              value={stats.worst3sTeam.value}
              players={stats.worst3sTeam.players}
              icon={statIcons.worst3sTeam}
              isWorst
            />
            <TeamStatCard 
              label="Worst 2s Team" 
              value={stats.worst2sTeam.value}
              players={stats.worst2sTeam.players}
              icon={statIcons.worst2sTeam}
              isWorst
            />
            <MatchupStatCard 
              label="Longest Game" 
              value={stats.longestGame.value}
              teams={stats.longestGame.players as [string, string]}
              icon={statIcons.longestGame}
            />
            <MatchupStatCard 
              label="Highest Scoring Game" 
              value={stats.highestScoringGame.value}
              teams={stats.highestScoringGame.players as [string, string]}
              icon={statIcons.highestScoringGame}
            />
            <MatchupStatCard 
              label="Biggest Win Deficit" 
              value={stats.biggestWinDeficit.value}
              teams={stats.biggestWinDeficit.players as [string, string]}
              icon={statIcons.biggestWinDeficit}
            />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Individual Achievements (in a game)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PlayerStatCard 
              label="Fastest Goal" 
              value={stats.fastestGoal.value}
              player={stats.fastestGoal.players[0]}
              icon={statIcons.fastestGoal}
              color="orange"
            />
            <PlayerStatCard 
              label="Slowest Goal" 
              value={stats.slowestGoal.value}
              player={stats.slowestGoal.players[0]}
              icon={statIcons.slowestGoal}
              color="pink"
            />
            <PlayerStatCard 
              label="Highest Points" 
              value={stats.highestPoints.value}
              player={stats.highestPoints.players[0]}
              icon={statIcons.highestPoints}
              color="yellow"
            />
            <PlayerStatCard 
              label="Lowest Points" 
              value={stats.lowestPoints.value}
              player={stats.lowestPoints.players[0]}
              icon={statIcons.lowestPoints}
              color="red"
            />
            <PlayerStatCard 
              label="Most Demos" 
              value={stats.mostDemos.value}
              player={stats.mostDemos.players[0]}
              icon={statIcons.mostDemos}
              color="green"
            />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-400" />
            Player Stats
          </h2>
          <PlayerTable players={players} />
        </div>
      </div>
    </div>
  )
}
