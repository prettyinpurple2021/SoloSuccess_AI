import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * SectionHeader component following Cyberpunk Design System v3
 * Uses neon colors, dark backgrounds, and glow effects
 */
interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  actions?: React.ReactNode
  variant?: "default" | "cyan" | "magenta" | "purple"
}

export function SectionHeader({
  title,
  description,
  icon,
  badge,
  actions,
  variant = "default",
  className,
  ...props
}: SectionHeaderProps) {
  const variantStyles = {
    default: {
      border: "border-gray-700",
      iconColor: "text-neon-cyan",
      titleColor: "text-white",
      glow: ""
    },
    cyan: {
      border: "border-neon-cyan",
      iconColor: "text-neon-cyan",
      titleColor: "text-neon-cyan",
      glow: "shadow-[0_0_15px_rgba(11,228,236,0.2)]"
    },
    magenta: {
      border: "border-neon-magenta",
      iconColor: "text-neon-magenta",
      titleColor: "text-neon-magenta",
      glow: "shadow-[0_0_15px_rgba(255,0,110,0.2)]"
    },
    purple: {
      border: "border-neon-purple",
      iconColor: "text-neon-purple",
      titleColor: "text-neon-purple",
      glow: "shadow-[0_0_15px_rgba(179,0,255,0.2)]"
    }
  }

  const styles = variantStyles[variant]

  return (
    <div
      className={cn("mb-6", className)}
      {...props}
    >
      <div
        className={cn(
          "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
          variant !== "default" && `rounded-sm bg-dark-card border-2 ${styles.border} ${styles.glow} px-6 py-4`
        )}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {icon && <div className={styles.iconColor}>{icon}</div>}
            <h2 
              className={cn(
                "font-orbitron text-xl font-bold uppercase tracking-wider",
                styles.titleColor
              )}
            >
              {title}
            </h2>
            {badge && <div>{badge}</div>}
          </div>
          {description && (
            <p className="font-mono text-gray-400 text-sm">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
