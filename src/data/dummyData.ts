import { HeartCrack, LucideIcon } from 'lucide-react';
import {
    Trophy,
    Clock,
    Target,
    Award,
    Skull,
    Timer,
    Zap,
    TrendingUp,
    TrendingDown,
    Bomb,
    Cat
} from 'lucide-react';
import { Stats } from '../models/player';

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
    longestWinStreak: Trophy,
    longestLossStreak: HeartCrack,
    mostForfeits: Cat
};

export interface GameHistory {
    id: string;
    date: string;
    score: string;
    winningTeam: string[];
    losingTeam: string[];
}

export interface GameData {
    id: string;
    date: string;
    score: string;
    winningTeam: string[];
    losingTeam: string[];
    stats: {
        goals: { [key: string]: number };
        assists: { [key: string]: number };
        saves: { [key: string]: number };
        shots: { [key: string]: number };
        demos: { [key: string]: number };
        boost: { [key: string]: number };
    };
    duration: string;
    map: string;
}
