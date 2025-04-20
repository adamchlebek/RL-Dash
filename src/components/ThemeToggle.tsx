'use client';

import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
    onChange: () => void;
    checked: boolean;
}

export function ThemeToggle({ onChange, checked }: ThemeToggleProps): React.ReactElement {
    return (
        <div 
            className={`w-16 h-8 rounded-full p-1.5 cursor-pointer transition-colors duration-200 ease-in-out relative ${checked ? 'bg-blue-400' : 'bg-zinc-700'}`}
            onClick={onChange}
        >
            <div 
                className="absolute flex items-center justify-center pointer-events-none"
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
                className="w-5 h-5 rounded-full transition-transform duration-200 ease-in-out bg-white"
                style={{ transform: checked ? 'translateX(32px)' : 'translateX(0)' }}
            />
        </div>
    );
} 