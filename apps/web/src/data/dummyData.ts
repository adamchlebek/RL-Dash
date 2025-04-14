import { LucideIcon } from 'lucide-react'
import { Trophy, Clock, Target, Award, Skull, Timer, Zap, TrendingUp, TrendingDown, Bomb } from 'lucide-react'
import { Player, Stats } from '../models/player'

export const dummyPlayers: Player[] = [
  { name: 'Adam', goals: 15, wins: 8, losses: 2, assists: 12, shots: 30, demos: 5, gamesPlayed: 10 },
  { name: 'Mark', goals: 12, wins: 7, losses: 3, assists: 15, shots: 25, demos: 8, gamesPlayed: 10 },
  { name: 'John', goals: 10, wins: 6, losses: 4, assists: 8, shots: 20, demos: 3, gamesPlayed: 10 },
  { name: 'Mike', goals: 8, wins: 5, losses: 5, assists: 10, shots: 18, demos: 6, gamesPlayed: 10 },
]

export const dummyStats: Stats = {
  best3sTeam: { value: '15/2', players: ['Adam', 'Mark', 'John'], isTeamVsTeam: false },
  best2sTeam: { value: '12/1', players: ['Adam', 'Mark'], isTeamVsTeam: false },
  worst3sTeam: { value: '2/15', players: ['John', 'Mike', 'Mark'], isTeamVsTeam: false },
  worst2sTeam: { value: '1/12', players: ['John', 'Mike'], isTeamVsTeam: false },
  longestGame: { value: '12:34', players: ['Adam & Mark', 'John & Mike'], isTeamVsTeam: true },
  highestScoringGame: { value: '12-10', players: ['Adam & Mark', 'John & Mike'], isTeamVsTeam: true },
  biggestWinDeficit: { value: '8-0', players: ['Adam & Mark', 'John & Mike'], isTeamVsTeam: true },
  fastestGoal: { value: '120 mph', players: ['Adam'], isTeamVsTeam: false },
  slowestGoal: { value: '15 mph', players: ['Mike'], isTeamVsTeam: false },
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

export interface GameHistory {
  id: string
  date: string
  score: string
  winningTeam: string[]
  losingTeam: string[]
}

export const gameHistory: GameHistory[] = [
  {
    id: "game1",
    date: '2024-03-15',
    score: '5-3',
    winningTeam: ['Adam', 'Mark'],
    losingTeam: ['John', 'Mike']
  },
  {
    id: "game2",
    date: '2024-03-14',
    score: '4-2',
    winningTeam: ['Adam', 'Mark', 'John'],
    losingTeam: ['Mike', 'John', 'Mark']
  },
  {
    id: "game3",
    date: '2024-03-13',
    score: '3-1',
    winningTeam: ['Mike', 'John'],
    losingTeam: ['Adam', 'Mark']
  },
  {
    id: "game4",
    date: '2024-03-12',
    score: '6-4',
    winningTeam: ['Adam', 'Mark', 'John'],
    losingTeam: ['Mike', 'John', 'Mark']
  }
]

export interface GameData {
  id: string
  date: string
  score: string
  winningTeam: string[]
  losingTeam: string[]
  stats: {
    goals: { [key: string]: number }
    assists: { [key: string]: number }
    saves: { [key: string]: number }
    shots: { [key: string]: number }
    demos: { [key: string]: number }
    boost: { [key: string]: number }
  }
  duration: string
  map: string
}

export const gameData: { [key: string]: GameData } = {
  "game1": {
    id: "game1",
    date: "2024-03-15",
    score: "5-3",
    winningTeam: ["Adam", "Mark"],
    losingTeam: ["John", "Mike"],
    stats: {
      goals: { "Adam": 3, "Mark": 2, "John": 2, "Mike": 1 },
      assists: { "Adam": 2, "Mark": 2, "John": 1, "Mike": 0 },
      saves: { "Adam": 3, "Mark": 4, "John": 2, "Mike": 3 },
      shots: { "Adam": 7, "Mark": 5, "John": 4, "Mike": 3 },
      demos: { "Adam": 2, "Mark": 3, "John": 1, "Mike": 1 },
      boost: { "Adam": 1200, "Mark": 980, "John": 850, "Mike": 920 }
    },
    duration: "5:32",
    map: "Champions Field"
  }
} 