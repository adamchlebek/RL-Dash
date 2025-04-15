"use client";

import { gameData } from "@/data/dummyData";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GamePage() {
  const { id } = useParams<{ id: string }>();

  const game = gameData[id as string];

  if (!game) {
    notFound();
  }

  const allPlayers = [...game.winningTeam, ...game.losingTeam];

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
        <h2 className="text-xl font-bold mb-4">Player Stats</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-zinc-700">
                <th className="pb-4 font-medium text-zinc-300">Player</th>
                <th className="pb-4 font-medium text-zinc-300">Goals</th>
                <th className="pb-4 font-medium text-zinc-300">Assists</th>
                <th className="pb-4 font-medium text-zinc-300">Saves</th>
                <th className="pb-4 font-medium text-zinc-300">Shots</th>
                <th className="pb-4 font-medium text-zinc-300">Demos</th>
                <th className="pb-4 font-medium text-zinc-300">Boost</th>
              </tr>
            </thead>
            <tbody>
              {allPlayers.map((player) => (
                <tr
                  key={player}
                  className="border-b border-zinc-700 last:border-0"
                >
                  <td className="py-4">{player}</td>
                  <td className="py-4">{game.stats.goals[player]}</td>
                  <td className="py-4">{game.stats.assists[player]}</td>
                  <td className="py-4">{game.stats.saves[player]}</td>
                  <td className="py-4">{game.stats.shots[player]}</td>
                  <td className="py-4">{game.stats.demos[player]}</td>
                  <td className="py-4">{game.stats.boost[player]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
