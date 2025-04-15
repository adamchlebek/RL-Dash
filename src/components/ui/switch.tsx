"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  disabled?: boolean;
}

export function Switch({ className, disabled, ...props }: SwitchProps) {
  return (
    <SwitchPrimitives.Root
      className={`w-[42px] h-[24px] bg-zinc-700 rounded-full relative data-[state=checked]:bg-purple-500 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={disabled}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={`block w-[20px] h-[20px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px] ${
          disabled ? "animate-pulse" : ""
        }`}
      />
    </SwitchPrimitives.Root>
  );
} 