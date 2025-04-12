import React from 'react'
import { Player } from '../models/player'
import { Stats } from '../models/stats'
import { 
  Trophy, 
  Skull, 
  Clock, 
  Target, 
  Award, 
  Timer, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Bomb 
} from 'lucide-react'

export const dummyPlayers: Player[] = [
  { name: 'Adam', goals: 15, wins: 8, losses: 2, assists: 12, shots: 30, demos: 5 },
  { name: 'Mark', goals: 12, wins: 7, losses: 3, assists: 15, shots: 25, demos: 8 },
  { name: 'Ross', goals: 10, wins: 6, losses: 4, assists: 8, shots: 20, demos: 3 },
  { name: 'Coley', goals: 8, wins: 5, losses: 5, assists: 10, shots: 18, demos: 6 },
  { name: 'John', goals: 7, wins: 4, losses: 6, assists: 9, shots: 15, demos: 4 },
  { name: 'Mike', goals: 6, wins: 3, losses: 7, assists: 7, shots: 12, demos: 3 },
]

export const dummyStats: Stats = {
  best3sTeam: { value: '15/2', players: ['Adam', 'Mark', 'Ross'], isTeamVsTeam: false },
  best2sTeam: { value: '12/1', players: ['Adam', 'Ross'], isTeamVsTeam: false },
  worst3sTeam: { value: '1/8', players: ['Mark', 'Ross', 'Coley'], isTeamVsTeam: false },
  worst2sTeam: { value: '0/7', players: ['Mark', 'Coley'], isTeamVsTeam: false },
  longestGame: { value: '12:34', players: ['Adam', 'Mark', 'John', 'Mike'], isTeamVsTeam: true },
  highestScoringGame: { value: '9-8', players: ['Adam', 'Mark', 'Ross', 'Coley'], isTeamVsTeam: true },
  biggestWinDeficit: { value: '8-1', players: ['Adam', 'Mark', 'John', 'Mike'], isTeamVsTeam: true },
  fastestGoal: { value: '145 kph', players: ['Adam'], isTeamVsTeam: false },
  slowestGoal: { value: '12 kph', players: ['Coley'], isTeamVsTeam: false },
  highestPoints: { value: '1,234', players: ['Ross'], isTeamVsTeam: false },
  lowestPoints: { value: '45', players: ['Mark'], isTeamVsTeam: false },
  mostDemos: { value: '12', players: ['Adam'], isTeamVsTeam: false },
}

type IconProps = {
  className?: string
}

const createIcon = (Icon: React.ComponentType<IconProps>) => {
  return <Icon className="w-6 h-6" />
}

export const statIcons = {
  best3sTeam: createIcon(Trophy),
  best2sTeam: createIcon(Trophy),
  worst3sTeam: createIcon(Skull),
  worst2sTeam: createIcon(Skull),
  longestGame: createIcon(Clock),
  highestScoringGame: createIcon(Target),
  biggestWinDeficit: createIcon(Award),
  fastestGoal: createIcon(Zap),
  slowestGoal: createIcon(Timer),
  highestPoints: createIcon(TrendingUp),
  lowestPoints: createIcon(TrendingDown),
  mostDemos: createIcon(Bomb),
} 