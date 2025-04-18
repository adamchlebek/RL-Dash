import { ReactNode } from 'react';

interface BadgeProps {
    children: ReactNode;
    color?: 'orange' | 'pink' | 'yellow' | 'red' | 'green' | 'blue';
    size?: 'sm' | 'base';
    className?: string;
}

export const Badge = ({ children, color = 'orange', size = 'sm', className = '' }: BadgeProps) => {
    const colorClasses = {
        orange: 'border-orange-500/50 bg-orange-500/20 text-orange-300',
        pink: 'border-pink-500/50 bg-pink-500/20 text-pink-300',
        yellow: 'border-yellow-500/50 bg-yellow-500/20 text-yellow-300',
        red: 'border-red-500/50 bg-red-500/20 text-red-300',
        green: 'border-green-500/50 bg-green-500/20 text-green-300',
        blue: 'border-blue-500/50 bg-blue-500/20 text-blue-300'
    };

    const sizeClasses = {
        sm: 'text-sm',
        base: 'text-base'
    };

    return (
        <span
            className={`rounded-full px-3 py-1.5 font-medium ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
        >
            {children}
        </span>
    );
};
