"use client";

import { gameData } from "@/data/dummyData";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

type PlayerStatsType = {
  name: string;
  totalGoals: number;
  totalAssists: number;
  totalSaves: number;
  totalShots: number;
  totalDemos: number;
  totalScore: number;
  avgBoost: number;
  gamesPlayed: number;
};

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const [globalStats, setGlobalStats] = useState<PlayerStatsType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAllTimeStats, setShowAllTimeStats] = useState<boolean>(true);

  const game = gameData[id as string];

  if (!game) {
    notFound();
  }

  const allPlayers = [...game.winningTeam, ...game.losingTeam];

  useEffect(() => {
    async function fetchPlayerStats() {
      try {
        const response = await fetch("/api/stats/players");
        if (!response.ok) {
          throw new Error("Failed to fetch player stats");
        }
        const data = await response.json();
        setGlobalStats(data);
      } catch (error) {
        console.error("Failed to load player stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayerStats();
  }, []);

  // Find the global stats for a player
  const getGlobalStatsForPlayer = (
    playerName: string,
  ): PlayerStatsType | undefined => {
    return globalStats.find((player) => player.name === playerName);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Overview
      </Link>

      <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {new Date(game.date).toLocaleDateString()}
          </h1>
          <span className="text-xl">{game.map}</span>
          <span className="text-xl">{game.duration}</span>
        </div>

        <div className="mt-6 flex justify-center items-center gap-4 text-3xl font-bold">
          <div className="flex gap-2">
            {game.winningTeam.map((player) => (
              <span
                key={player}
                className="bg-green-900/50 px-3 py-1 rounded-lg"
              >
                {player}
              </span>
            ))}
          </div>
          <span className="text-4xl font-mono">{game.score}</span>
          <div className="flex gap-2">
            {game.losingTeam.map((player) => (
              <span key={player} className="bg-red-900/50 px-3 py-1 rounded-lg">
                {player}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Player Stats</h2>
          {!loading && (
            <button
              onClick={() => setShowAllTimeStats(!showAllTimeStats)}
              className="px-3 py-1 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-md transition-colors"
            >
              {showAllTimeStats ? "Hide All-Time Stats" : "Show All-Time Stats"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-zinc-400">
            Loading player statistics...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-zinc-700">
                  <th className="pb-4 font-medium text-zinc-300">Player</th>
                  <th
                    className="pb-4 font-medium text-zinc-300"
                    colSpan={showAllTimeStats ? 2 : 1}
                  >
                    Goals
                  </th>
                  <th
                    className="pb-4 font-medium text-zinc-300"
                    colSpan={showAllTimeStats ? 2 : 1}
                  >
                    Assists
                  </th>
                  <th
                    className="pb-4 font-medium text-zinc-300"
                    colSpan={showAllTimeStats ? 2 : 1}
                  >
                    Saves
                  </th>
                  <th
                    className="pb-4 font-medium text-zinc-300"
                    colSpan={showAllTimeStats ? 2 : 1}
                  >
                    Shots
                  </th>
                  <th
                    className="pb-4 font-medium text-zinc-300"
                    colSpan={showAllTimeStats ? 2 : 1}
                  >
                    Demos
                  </th>
                  <th
                    className="pb-4 font-medium text-zinc-300"
                    colSpan={showAllTimeStats ? 2 : 1}
                  >
                    Boost
                  </th>
                  {showAllTimeStats && (
                    <th className="pb-4 font-medium text-zinc-300">Games</th>
                  )}
                </tr>
                <tr className="text-xs text-zinc-400 border-b border-zinc-700">
                  <th></th>
                  <th className="pb-2">Game</th>
                  {showAllTimeStats && <th className="pb-2">Total</th>}
                  <th className="pb-2">Game</th>
                  {showAllTimeStats && <th className="pb-2">Total</th>}
                  <th className="pb-2">Game</th>
                  {showAllTimeStats && <th className="pb-2">Total</th>}
                  <th className="pb-2">Game</th>
                  {showAllTimeStats && <th className="pb-2">Total</th>}
                  <th className="pb-2">Game</th>
                  {showAllTimeStats && <th className="pb-2">Total</th>}
                  <th className="pb-2">Game</th>
                  {showAllTimeStats && <th className="pb-2">Avg</th>}
                  {showAllTimeStats && <th className="pb-2">Played</th>}
                </tr>
              </thead>
              <tbody>
                {allPlayers.map((player) => {
                  const playerGlobalStats = getGlobalStatsForPlayer(player);

                  return (
                    <tr
                      key={player}
                      className="border-b border-zinc-700 last:border-0"
                    >
                      <td className="py-4 font-medium">{player}</td>
                      <td className="py-4">{game.stats.goals[player]}</td>
                      {showAllTimeStats && (
                        <td className="py-4 text-zinc-400">
                          {playerGlobalStats?.totalGoals || 0}
                        </td>
                      )}
                      <td className="py-4">{game.stats.assists[player]}</td>
                      {showAllTimeStats && (
                        <td className="py-4 text-zinc-400">
                          {playerGlobalStats?.totalAssists || 0}
                        </td>
                      )}
                      <td className="py-4">{game.stats.saves[player]}</td>
                      {showAllTimeStats && (
                        <td className="py-4 text-zinc-400">
                          {playerGlobalStats?.totalSaves || 0}
                        </td>
                      )}
                      <td className="py-4">{game.stats.shots[player]}</td>
                      {showAllTimeStats && (
                        <td className="py-4 text-zinc-400">
                          {playerGlobalStats?.totalShots || 0}
                        </td>
                      )}
                      <td className="py-4">{game.stats.demos[player]}</td>
                      {showAllTimeStats && (
                        <td className="py-4 text-zinc-400">
                          {playerGlobalStats?.totalDemos || 0}
                        </td>
                      )}
                      <td className="py-4">{game.stats.boost[player]}</td>
                      {showAllTimeStats && (
                        <td className="py-4 text-zinc-400">
                          {playerGlobalStats?.avgBoost
                            ? playerGlobalStats.avgBoost.toFixed(0)
                            : 0}
                        </td>
                      )}
                      {showAllTimeStats && (
                        <td className="py-4 text-zinc-400">
                          {playerGlobalStats?.gamesPlayed || 0}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
