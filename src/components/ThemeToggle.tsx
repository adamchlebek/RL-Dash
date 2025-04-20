'use client';

import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
    onChange: () => void;
    checked: boolean;
}

export function ThemeToggle({ onChange, checked }: ThemeToggleProps): React.ReactElement {
    return (
        <div
            className={`relative h-8 w-16 cursor-pointer rounded-full p-1.5 transition-colors duration-200 ease-in-out ${checked ? 'bg-blue-400' : 'bg-zinc-700'}`}
            onClick={onChange}
        >
            <div
                className="pointer-events-none absolute flex items-center justify-center"
                style={{
                    right: checked ? 'auto' : '8px',
                    left: checked ? '8px' : 'auto'
                }}
            >
                {checked ? (
                    <Sun className="h-5 w-5 text-yellow-300" />
                ) : (
                    <Moon className="h-5 w-5 text-zinc-200" />
                )}
            </div>
            <div
                className="h-5 w-5 rounded-full bg-white transition-transform duration-200 ease-in-out"
                style={{ transform: checked ? 'translateX(32px)' : 'translateX(0)' }}
            />
        </div>
    );
}
