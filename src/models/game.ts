export interface GameHistory {
  id: string;
  date: string;
  score: string;
  winningTeam: string[];
  losingTeam: string[];
  teamSize?: number;
  duration?: number;
  overtime?: boolean;
  overtimeSeconds?: number;
  blueTeam?: {
    goals: number;
    players: {
      name: string;
      globalPlayer?: {
        name: string | null;
      } | null;
    }[];
  };
  orangeTeam?: {
    goals: number;
    players: {
      name: string;
      globalPlayer?: {
        name: string | null;
      } | null;
    }[];
  };
}
