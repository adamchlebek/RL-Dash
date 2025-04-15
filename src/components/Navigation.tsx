import Link from "next/link";
import { Home, Users } from "lucide-react";

export function Navigation(): React.ReactElement {
  return (
    <div className="bg-zinc-800/70 backdrop-blur-sm border-b border-zinc-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/"
                className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              >
                RL Dash
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              <Link
                href="/players"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                <Users className="w-4 h-4 mr-2" />
                Players
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
