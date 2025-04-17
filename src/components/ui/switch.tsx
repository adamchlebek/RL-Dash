'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
    disabled?: boolean;
}

export function Switch({ className, disabled, ...props }: SwitchProps) {
    return (
        <SwitchPrimitives.Root
            className={`relative h-[24px] w-[42px] cursor-pointer rounded-full bg-zinc-700 outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-purple-500 ${className}`}
            disabled={disabled}
            {...props}
        >
            <SwitchPrimitives.Thumb
                className={`block h-[20px] w-[20px] translate-x-0.5 rounded-full bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px] ${
                    disabled ? 'animate-pulse' : ''
                }`}
            />
        </SwitchPrimitives.Root>
    );
}
