"use client"

import { Toaster as Sonner } from "sonner"

/**
 * Toaster component following Cyberpunk Design System v3
 */
type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-dark-card group-[.toaster]:text-white group-[.toaster]:border-2 group-[.toaster]:border-neon-cyan group-[.toaster]:shadow-[0_0_20px_rgba(11,228,236,0.3)] group-[.toaster]:font-mono group-[.toaster]:rounded-sm",
          description: "group-[.toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-neon-cyan/10 group-[.toast]:border-2 group-[.toast]:border-neon-cyan group-[.toast]:text-neon-cyan group-[.toast]:font-mono group-[.toast]:uppercase group-[.toast]:tracking-wider hover:group-[.toast]:bg-neon-cyan/20",
          cancelButton:
            "group-[.toast]:bg-dark-bg group-[.toast]:border-2 group-[.toast]:border-gray-700 group-[.toast]:text-gray-400 group-[.toast]:font-mono",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
