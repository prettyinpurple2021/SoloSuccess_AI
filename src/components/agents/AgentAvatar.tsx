"use client"

import { cn } from "@/lib/utils"

interface AgentAvatarProps {
  displayName: string
  accentColor: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function AgentAvatar({ 
  displayName, 
  accentColor, 
  size = 'md',
  className 
}: AgentAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl"
  }

  return (
    <div 
      className={cn(
        "rounded-none border border-current flex items-center justify-center font-bold agent-avatar backdrop-blur-sm",
        sizeClasses[size],
        className
      )}
      style={{ 
        color: accentColor, 
        borderColor: accentColor,
        background: `${accentColor}1A` // 10% opacity
      }}
      role="img"
      aria-label={`${displayName} avatar`}
    >
      {displayName.charAt(0)}
    </div>
  )
}
