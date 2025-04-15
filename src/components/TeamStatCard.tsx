import { ReactNode } from "react";

interface TeamStatCardProps {
  label: string;
  value: string;
  players: string[];
  icon: ReactNode;
  isWorst?: boolean;
}

export const TeamStatCard = ({
  label,
  value,
  players,
  icon,
  isWorst,
}: TeamStatCardProps) => {
  const [wins, losses] = value.split("/");

  return (
    <div
      className={`bg-zinc-800/50 backdrop-blur-sm p-6 rounded-xl border ${isWorst ? "border-red-500/50" : "border-yellow-500/50"} hover:bg-zinc-700/50 transition-all duration-300 hover:scale-[1.02]`}
    >
      <div className="flex items-center gap-3 mb-4 justify-center">
        {icon}
        <p className="text-sm text-zinc-400">{label}</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {players.map((player, index) => (
          <span
            key={index}
            className={`text-base font-medium px-3 py-1.5 rounded-full ${isWorst ? "bg-red-500/20 text-red-300" : "bg-yellow-500/20 text-yellow-300"}`}
          >
            {player}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm justify-center">
        <span className="text-green-400">{wins}</span>
        <span className="text-zinc-500">/</span>
        <span className="text-red-400">{losses}</span>
      </div>
    </div>
  );
};
