import { cn } from "@/lib/utils"

/**
 * Skeleton component following Cyberpunk Design System v3
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-gray-700/50", className)}
      {...props}
    />
  )
}

export { Skeleton }
