export interface Player {
  name: string;
  goals: number;
  wins: number;
  losses: number;
  assists: number;
  shots: number;
  demos: number;
  gamesPlayed: number;
}

export interface StatValue {
  value: string;
  players: string[];
  isTeamVsTeam?: boolean;
}

export interface Stats {
  best3sTeam: StatValue;
  best2sTeam: StatValue;
  worst3sTeam: StatValue;
  worst2sTeam: StatValue;
  longestGame: StatValue;
  highestScoringGame: StatValue;
  biggestWinDeficit: StatValue;
  fastestGoal: StatValue;
  slowestGoal: StatValue;
  highestPoints: StatValue;
  lowestPoints: StatValue;
  mostDemos: StatValue;
}
