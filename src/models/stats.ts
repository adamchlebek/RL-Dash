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

export interface TeamStat {
    wins: number;
    losses: number;
    playerIds: string[];
    goalsScored: number;
    goalsConceded: number;
}

export interface TeamResult {
    key: string;
    winRate: number;
    wins: number;
    losses: number;
    playerIds: string[];
    goalDiff: number;
}

export interface ReplayPlayerData {
    name: string;
    globalPlayer: {
        name: string | null;
    } | null;
}

export interface ReplayTeamData {
    goals: number | null;
    players: ReplayPlayerData[];
}

export interface ReplayData {
    blueTeam: ReplayTeamData | null;
    orangeTeam: ReplayTeamData | null;
}

export interface PlayerStats {
    id: string;
    name: string;
    totalGoals: number;
    totalAssists: number;
    totalSaves: number;
    totalShots: number;
    totalDemos: number;
    totalScore: number;
    totalBoost: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
}

export interface PlayerStatsResult {
    id: string;
    name: string;
    totalGoals: number;
    totalAssists: number;
    totalSaves: number;
    totalShots: number;
    totalDemos: number;
    totalScore: number;
    avgBoost: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
}

export interface GameHistoryResult {
    id: string;
    date: string;
    score: string;
    winningTeam: string[];
    losingTeam: string[];
}
