import { LucideIcon } from 'lucide-react'
import { Trophy, Users, Clock, Target, Award, Skull, Timer, Zap, TrendingUp, TrendingDown, Bomb } from 'lucide-react'
import { Player, Stats, StatValue } from '../models/player'

export const dummyPlayers: Player[] = [
  { name: 'Adam', goals: 15, wins: 8, losses: 2, assists: 12, shots: 30, demos: 5 },
  { name: 'Mark', goals: 12, wins: 7, losses: 3, assists: 15, shots: 25, demos: 8 },
  { name: 'John', goals: 10, wins: 6, losses: 4, assists: 8, shots: 20, demos: 3 },
  { name: 'Mike', goals: 8, wins: 5, losses: 5, assists: 10, shots: 18, demos: 6 },
]

export const dummyStats: Stats = {
  best3sTeam: { value: '75%', players: ['Adam', 'Mark', 'John'], isTeamVsTeam: false },
  best2sTeam: { value: '80%', players: ['Adam', 'Mark'], isTeamVsTeam: false },
  worst3sTeam: { value: '25%', players: ['John', 'Mike', 'Mark'], isTeamVsTeam: false },
  worst2sTeam: { value: '20%', players: ['John', 'Mike'], isTeamVsTeam: false },
  longestGame: { value: '12:34', players: ['Adam & Mark', 'John & Mike'], isTeamVsTeam: true },
  highestScoringGame: { value: '12-10', players: ['Adam & Mark', 'John & Mike'], isTeamVsTeam: true },
  biggestWinDeficit: { value: '8-0', players: ['Adam & Mark', 'John & Mike'], isTeamVsTeam: true },
  fastestGoal: { value: '0:12', players: ['Adam'], isTeamVsTeam: false },
  slowestGoal: { value: '11:45', players: ['Mike'], isTeamVsTeam: false },
  highestPoints: { value: '1250', players: ['Adam'], isTeamVsTeam: false },
  lowestPoints: { value: '450', players: ['Mike'], isTeamVsTeam: false },
  mostDemos: { value: '8', players: ['Mark'], isTeamVsTeam: false },
}

export const statIcons: Record<keyof Stats, LucideIcon> = {
  best3sTeam: Trophy,
  best2sTeam: Trophy,
  worst3sTeam: Skull,
  worst2sTeam: Skull,
  longestGame: Clock,
  highestScoringGame: Target,
  biggestWinDeficit: Award,
  fastestGoal: Zap,
  slowestGoal: Timer,
  highestPoints: TrendingUp,
  lowestPoints: TrendingDown,
  mostDemos: Bomb,
} 