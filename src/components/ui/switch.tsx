"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

/**
 * Switch component following Cyberpunk Design System v3
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-sm border-2 border-gray-700 transition-all duration-300",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan data-[state=checked]:shadow-[0_0_10px_rgba(11,228,236,0.5)]",
      "data-[state=unchecked]:bg-dark-bg",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-sm bg-white shadow-lg ring-0 transition-transform",
        "data-[state=checked]:translate-x-5 data-[state=checked]:bg-dark-bg",
        "data-[state=unchecked]:translate-x-0",
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
