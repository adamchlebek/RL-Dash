export type StatValue = {
  value: string;
  players: string[];
  isTeamVsTeam?: boolean;
};

export type Stats = {
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
};
