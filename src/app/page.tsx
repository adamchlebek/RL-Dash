"use client";

import { useState, useEffect, useCallback } from "react";
import { TeamStatCard } from "../components/TeamStatCard";
import { MatchupStatCard } from "../components/MatchupStatCard";
import { PlayerStatCard } from "../components/PlayerStatCard";
import { PlayerTable } from "../components/PlayerTable";
import GameHistoryTable from "../components/GameHistoryTable";
import { statIcons } from "../data/dummyData";
import { Trophy, User, Users, History, RefreshCw } from "lucide-react";
import { Stats } from "../models/player";
import { GameHistory } from "../models/game";
import { useReplaySubscription } from "@/lib/useReplaySubscription";

type PlayerStatsType = {
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
};

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStatsType[]>([]);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isPlayerLoading, setPlayerLoading] = useState<boolean>(true);
  const [isGameHistoryLoading, setGameHistoryLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const statsData = await response.json();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlayerStats = useCallback(async () => {
    try {
      setPlayerLoading(true);
      const response = await fetch("/api/stats/players");

      if (!response.ok) {
        throw new Error("Failed to fetch player stats");
      }

      const playerData = await response.json();
      setPlayerStats(playerData);
    } catch (error) {
      console.error("Error fetching player stats:", error);
    } finally {
      setPlayerLoading(false);
    }
  }, []);

  const fetchGameHistory = useCallback(async () => {
    try {
      setGameHistoryLoading(true);
      const response = await fetch("/api/stats/games");

      if (!response.ok) {
        throw new Error("Failed to fetch game history");
      }

      const historyData = await response.json();
      setGameHistory(historyData);
    } catch (error) {
      console.error("Error fetching game history:", error);
    } finally {
      setGameHistoryLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    await Promise.all([fetchStats(), fetchPlayerStats(), fetchGameHistory()]);

    setIsRefreshing(false);
  }, [fetchStats, fetchPlayerStats, fetchGameHistory]);

  useReplaySubscription(handleRefresh);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Stats
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-zinc-400 hover:text-white p-2 rounded-full cursor-pointer disabled:opacity-50 transition-all"
          >
            <RefreshCw
              className={`w-6 h-6 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {!isLoading && stats && (
          <>
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Team Stats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <TeamStatCard
                  label="Best 3s Team"
                  value={stats.best3sTeam.value}
                  players={stats.best3sTeam.players}
                  icon={<statIcons.best3sTeam className="w-6 h-6" />}
                />
                <TeamStatCard
                  label="Best 2s Team"
                  value={stats.best2sTeam.value}
                  players={stats.best2sTeam.players}
                  icon={<statIcons.best2sTeam className="w-6 h-6" />}
                />
                <TeamStatCard
                  label="Worst 3s Team"
                  value={stats.worst3sTeam.value}
                  players={stats.worst3sTeam.players}
                  icon={<statIcons.worst3sTeam className="w-6 h-6" />}
                  isWorst
                />
                <TeamStatCard
                  label="Worst 2s Team"
                  value={stats.worst2sTeam.value}
                  players={stats.worst2sTeam.players}
                  icon={<statIcons.worst2sTeam className="w-6 h-6" />}
                  isWorst
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MatchupStatCard
                  label="Biggest Win Deficit"
                  value={stats.biggestWinDeficit.value}
                  teams={stats.biggestWinDeficit.players as [string, string]}
                  icon={<statIcons.biggestWinDeficit className="w-6 h-6" />}
                />
                <MatchupStatCard
                  label="Longest Game"
                  value={stats.longestGame.value}
                  teams={stats.longestGame.players as [string, string]}
                  icon={<statIcons.longestGame className="w-6 h-6" />}
                />
                <MatchupStatCard
                  label="Highest Scoring Game"
                  value={stats.highestScoringGame.value}
                  teams={stats.highestScoringGame.players as [string, string]}
                  icon={<statIcons.highestScoringGame className="w-6 h-6" />}
                />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-400" />
                Individual Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PlayerStatCard
                  label="Highest Points"
                  value={Number(stats.highestPoints.value).toLocaleString()}
                  player={stats.highestPoints.players[0]}
                  icon={<statIcons.highestPoints className="w-6 h-6" />}
                  color="yellow"
                />
                <PlayerStatCard
                  label="Lowest Points"
                  value={Number(stats.lowestPoints.value).toLocaleString()}
                  player={stats.lowestPoints.players[0]}
                  icon={<statIcons.lowestPoints className="w-6 h-6" />}
                  color="red"
                />
                <PlayerStatCard
                  label="Most Demos (single game)"
                  value={Number(stats.mostDemos.value).toLocaleString()}
                  player={stats.mostDemos.players[0]}
                  icon={<statIcons.mostDemos className="w-6 h-6" />}
                  color="green"
                />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-400" />
                Player Stats
              </h2>
              {!isPlayerLoading ? (
                <PlayerTable
                  players={playerStats.map((player) => ({
                    id: player.id,
                    name: player.name,
                    goals: player.totalGoals,
                    assists: player.totalAssists,
                    shots: player.totalShots,
                    demos: player.totalDemos,
                    gamesPlayed: player.gamesPlayed,
                    wins: player.wins,
                    losses: player.losses,
                  }))}
                />
              ) : (
                <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50">
                  <div className="text-center py-8 text-zinc-400">
                    Loading player statistics...
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <History className="w-6 h-6 text-blue-400" />
                Game History
              </h2>
              {!isGameHistoryLoading ? (
                <GameHistoryTable games={gameHistory} />
              ) : (
                <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50">
                  <div className="text-center py-8 text-zinc-400">
                    Loading game history...
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
