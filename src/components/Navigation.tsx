'use client';

import Link from 'next/link';
import { Boxes, Home, Users } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../providers/ThemeProvider';

export function Navigation(): React.ReactElement {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="border-border bg-background/70 border-b backdrop-blur-sm">
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
                                className="text-muted hover:text-foreground inline-flex items-center px-1 pt-1 text-sm font-medium"
                            >
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </Link>
                            <Link
                                href="/players"
                                className="text-muted hover:text-foreground inline-flex items-center px-1 pt-1 text-sm font-medium"
                            >
                                <Users className="mr-2 h-4 w-4" />
                                Players
                            </Link>
                            <Link
                                href="/teams"
                                className="text-muted hover:text-foreground inline-flex items-center px-1 pt-1 text-sm font-medium"
                            >
                                <Boxes className="mr-2 h-4 w-4" />
                                Teams
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <ThemeToggle checked={theme === 'light'} onChange={toggleTheme} />
                    </div>
                </div>
            </div>
        </div>
    );
}
