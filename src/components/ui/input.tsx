  import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input component following Cyberpunk Design System v3
 * Uses dark backgrounds, neon borders, and glow effects on focus
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-sm border-2 border-gray-700 bg-dark-bg px-3 py-2",
          "text-base text-white font-mono",
          "placeholder:text-gray-500",
          "focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(11,228,236,0.3)]",
          "hover:border-gray-600",
          "transition-all duration-300",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
