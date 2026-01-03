"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

/**
 * Progress component following Cyberpunk Design System v3
 * Uses dark backgrounds with neon gradient indicators
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { 
    indicatorClassName?: string
    variant?: 'cyan' | 'magenta' | 'lime' | 'purple' | 'orange'
  }
>(({ className, value, indicatorClassName, variant = 'cyan', ...props }, ref) => {
  const variantGradients = {
    cyan: 'bg-gradient-to-r from-neon-cyan to-neon-cyan/70 shadow-[0_0_10px_rgba(11,228,236,0.5)]',
    magenta: 'bg-gradient-to-r from-neon-magenta to-neon-magenta/70 shadow-[0_0_10px_rgba(255,0,110,0.5)]',
    lime: 'bg-gradient-to-r from-neon-lime to-neon-lime/70 shadow-[0_0_10px_rgba(57,255,20,0.5)]',
    purple: 'bg-gradient-to-r from-neon-purple to-neon-purple/70 shadow-[0_0_10px_rgba(179,0,255,0.5)]',
    orange: 'bg-gradient-to-r from-neon-orange to-neon-orange/70 shadow-[0_0_10px_rgba(255,102,0,0.5)]',
  }
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-sm bg-dark-bg border border-gray-700", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full w-full flex-1 transition-all duration-300", variantGradients[variant], indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
