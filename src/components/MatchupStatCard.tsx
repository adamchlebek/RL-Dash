import { ReactNode } from "react";
import { Crown } from "lucide-react";

interface MatchupStatCardProps {
  label: string;
  value: string;
  teams: [string, string];
  icon: ReactNode;
}

export const MatchupStatCard = ({
  label,
  value,
  teams,
  icon,
}: MatchupStatCardProps) => {
  const [team1, team2] = [
    teams.slice(0, teams.length / 2),
    teams.slice(teams.length / 2),
  ];

  // Parse score to determine winner
  const isScoreFormat = value.includes("-");
  let team1Won = false;
  if (isScoreFormat) {
    const [score1, score2] = value.split("-").map(Number);
    team1Won = score1 > score2;
  }

  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm p-6 rounded-xl border border-blue-500/50 hover:bg-zinc-700/50 transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center gap-3 mb-4 justify-center">
        {icon}
        <p className="text-sm text-zinc-400">{label}</p>
      </div>
      <p className="text-2xl font-semibold mb-4 text-center">{value}</p>
      <div className="space-y-3">
        <div className="flex gap-2 justify-center items-center">
          {isScoreFormat && team1Won && (
            <Crown className="w-4 h-4 text-yellow-400" />
          )}
          <div className="flex flex-wrap gap-2 justify-center">
            {team1.map((player, index) => (
              <span
                key={index}
                className="text-sm bg-blue-500/20 px-3 py-1.5 rounded-full text-blue-300"
              >
                {player}
              </span>
            ))}
          </div>
          {isScoreFormat && team1Won && (
            <Crown className="w-4 h-4 text-yellow-400" />
          )}
        </div>
        <div className="flex items-center">
          <div className="flex-1 h-[1px] bg-zinc-700"></div>
          <span className="text-zinc-500 font-medium px-3">vs</span>
          <div className="flex-1 h-[1px] bg-zinc-700"></div>
        </div>
        <div className="flex gap-2 justify-center items-center">
          {isScoreFormat && !team1Won && (
            <Crown className="w-4 h-4 text-yellow-400" />
          )}
          <div className="flex flex-wrap gap-2 justify-center">
            {team2.map((player, index) => (
              <span
                key={index}
                className="text-sm bg-blue-500/20 px-3 py-1.5 rounded-full text-blue-300"
              >
                {player}
              </span>
            ))}
          </div>
          {isScoreFormat && !team1Won && (
            <Crown className="w-4 h-4 text-yellow-400" />
          )}
        </div>
      </div>
    </div>
  );
};
