import { Player } from "../models/player";
import {
  Goal,
  Trophy,
  Crosshair,
  Target,
  Bomb,
  Gamepad2,
  Percent,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

type PlayerTableProps = {
  players: Player[];
};

type SortField =
  | "name"
  | "gamesPlayed"
  | "winRate"
  | "goals"
  | "goalsPerGame"
  | "assists"
  | "shots"
  | "shootingPct"
  | "demos";
type SortDirection = "asc" | "desc";

export function PlayerTable({ players }: PlayerTableProps) {
  const [sortField, setSortField] = useState<SortField>("gamesPlayed");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedPlayers = [...players].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "gamesPlayed":
        comparison = a.gamesPlayed - b.gamesPlayed;
        break;
      case "winRate":
        const winRateA = a.gamesPlayed > 0 ? a.wins / a.gamesPlayed : 0;
        const winRateB = b.gamesPlayed > 0 ? b.wins / b.gamesPlayed : 0;
        comparison = winRateA - winRateB;
        break;
      case "goals":
        comparison = a.goals - b.goals;
        break;
      case "goalsPerGame":
        const gpgA = a.gamesPlayed > 0 ? a.goals / a.gamesPlayed : 0;
        const gpgB = b.gamesPlayed > 0 ? b.goals / b.gamesPlayed : 0;
        comparison = gpgA - gpgB;
        break;
      case "assists":
        comparison = a.assists - b.assists;
        break;
      case "shots":
        comparison = a.shots - b.shots;
        break;
      case "shootingPct":
        const shotPctA = a.shots > 0 ? (a.goals / a.shots) * 100 : 0;
        const shotPctB = b.shots > 0 ? (b.goals / b.shots) * 100 : 0;
        comparison = shotPctA - shotPctB;
        break;
      case "demos":
        comparison = a.demos - b.demos;
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const getSortIndicator = (field: SortField) => {
    if (field !== sortField) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/50">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-zinc-700">
              <th
                className="pb-4 font-medium text-zinc-300 cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Player {getSortIndicator("name")}
              </th>
              <th
                className="pb-4 font-medium text-zinc-300 cursor-pointer"
                onClick={() => handleSort("gamesPlayed")}
              >
                <div className="flex items-center gap-1">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Games {getSortIndicator("gamesPlayed")}</span>
                </div>
              </th>
              <th
                className="pb-4 font-medium text-zinc-300 cursor-pointer"
                onClick={() => handleSort("winRate")}
              >
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>W/L {getSortIndicator("winRate")}</span>
                </div>
              </th>
              <th
                className="pb-4 font-medium text-zinc-300 cursor-pointer"
                onClick={() => handleSort("goals")}
              >
                <div className="flex items-center gap-1">
                  <Goal className="w-4 h-4" />
                  <span>Goals {getSortIndicator("goals")}</span>
                </div>
              </th>
              <th
                className="pb-4 font-medium text-zinc-300 cursor-pointer"
                onClick={() => handleSort("goalsPerGame")}
              >
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>GPG {getSortIndicator("goalsPerGame")}</span>
                </div>
              </th>
              <th
                className="pb-4 font-medium text-zinc-300 cursor-pointer"
                onClick={() => handleSort("assists")}
              >
                <div className="flex items-center gap-1">
                  <Crosshair className="w-4 h-4" />
                  <span>Assists {getSortIndicator("assists")}</span>
                </div>
              </th>
              <th
                className="pb-4 font-medium text-zinc-300 cursor-pointer"
                onClick={() => handleSort("shots")}
              >
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>Shots {getSortIndicator("shots")}</span>
                </div>
              </th>
              <th
                className="pb-4 font-medium text-zinc-300 cursor-pointer"
                onClick={() => handleSort("shootingPct")}
              >
                <div className="flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  <span>Shot% {getSortIndicator("shootingPct")}</span>
                </div>
              </th>
              <th
                className="pb-4 font-medium text-zinc-300 cursor-pointer"
                onClick={() => handleSort("demos")}
              >
                <div className="flex items-center gap-1">
                  <Bomb className="w-4 h-4" />
                  <span>Demos {getSortIndicator("demos")}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => {
              const winRate =
                player.gamesPlayed > 0
                  ? ((player.wins / player.gamesPlayed) * 100).toFixed(1)
                  : "0.0";

              const goalsPerGame =
                player.gamesPlayed > 0
                  ? (player.goals / player.gamesPlayed).toFixed(2)
                  : "0.00";

              const shootingPercentage =
                player.shots > 0
                  ? ((player.goals / player.shots) * 100).toFixed(1)
                  : "0.0";

              return (
                <tr
                  key={player.name}
                  className="border-b border-zinc-700 last:border-0 hover:bg-zinc-700/50 transition-colors"
                >
                  <td className="py-4 px-4 font-medium">
                    <Link
                      href={`/players/${player.id}`}
                      className="hover:text-zinc-300 transition-colors"
                    >
                      {player.name}
                    </Link>
                  </td>
                  <td className="py-4 px-4">{player.gamesPlayed}</td>
                  <td className="py-4 px-4">
                    <span className="text-green-400">{player.wins}</span>
                    <span className="text-zinc-500 mx-1">/</span>
                    <span className="text-red-400">{player.losses}</span>
                    <span className="text-zinc-500 ml-2">({winRate}%)</span>
                  </td>
                  <td className="py-4 px-4">{player.goals}</td>
                  <td className="py-4 px-4">{goalsPerGame}</td>
                  <td className="py-4 px-4">{player.assists}</td>
                  <td className="py-4 px-4">{player.shots}</td>
                  <td className="py-4 px-4">{shootingPercentage}%</td>
                  <td className="py-4 px-4">{player.demos}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
