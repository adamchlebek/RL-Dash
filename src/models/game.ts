export interface Game {
  id: string
  date: string
  score: string
  duration: string
  team1: {
    players: string[]
    score: number
  }
  team2: {
    players: string[]
    score: number
  }
  winner: 1 | 2
  stats: {
    goals: Record<string, number>
    assists: Record<string, number>
    saves: Record<string, number>
    shots: Record<string, number>
    demos: Record<string, number>
  }
} 