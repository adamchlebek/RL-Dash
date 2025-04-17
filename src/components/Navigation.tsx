import Link from 'next/link';
import { Clock, Home, Settings, Users } from 'lucide-react';

export function Navigation(): React.ReactElement {
    return (
        <div className="border-b border-zinc-700/50 bg-zinc-800/70 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex flex-shrink-0 items-center">
                            <Link
                                href="/"
                                className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xl font-bold text-transparent"
                            >
                                RL Dash
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href="/"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                            >
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </Link>
                            <Link
                                href="/players"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                            >
                                <Users className="mr-2 h-4 w-4" />
                                Players
                            </Link>
                            <Link
                                href="/replays"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                Replays
                            </Link>
                            <Link
                                href="/settings"
                                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
