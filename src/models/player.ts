import { StatValue } from './stats';

export interface Player {
    id?: string;
    name: string;
    goals: number;
    wins: number;
    losses: number;
    assists: number;
    shots: number;
    saves: number;
    demos: number;
    nukes: number;
    avgPointsPerGame: number;
    gamesPlayed: number;
    currentStreak: number;
    isWinningStreak: boolean;
    totalGoals?: number;
    totalAssists?: number;
    totalSaves?: number;
    totalShots?: number;
    totalDemos?: number;
    totalScore?: number;
    avgBoost?: number;
    shootingPercentage?: number;
    stats?: {
        core?: {
            shots: number;
            goals: number;
            saves: number;
            assists: number;
            score: number;
        };
        boost?: {
            avg_amount: number;
        };
        demo?: {
            inflicted: number;
            taken: number;
        };
    };
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
    mostForfeits: StatValue;
    longestWinStreak: StatValue;
    longestLossStreak: StatValue;
}
