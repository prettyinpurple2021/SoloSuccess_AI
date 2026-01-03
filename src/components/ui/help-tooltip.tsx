"use client"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  HelpCircle, Lightbulb, Zap, Star, BookOpen, Video } from "lucide-react"

interface HelpTooltipProps {
  children: React.ReactNode
  title: string
  description: string
  tips?: string[]
  videoUrl?: string
  docsUrl?: string
  examples?: string[]
  difficulty?: "beginner" | "intermediate" | "advanced"
  category?: string
  className?: string
}

export function HelpTooltip({ 
  children, 
  title, 
  description, 
  tips = [], 
  videoUrl, 
  docsUrl, 
  examples = [],
  difficulty = "beginner",
  category,
  className 
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "beginner": return "bg-neon-lime/20 text-neon-lime border-neon-lime"
      case "intermediate": return "bg-neon-orange/20 text-neon-orange border-neon-orange"
      case "advanced": return "bg-neon-magenta/20 text-neon-magenta border-neon-magenta"
      default: return "bg-gray-700 text-gray-300 border-gray-600"
    }
  }

  const getDifficultyIcon = (diff: string) => {
    switch (diff) {
      case "beginner": return "🌱"
      case "intermediate": return "🚀"
      case "advanced": return "⚡"
      default: return "💡"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 ${className}`}>
            {children}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-gray-500 hover:text-neon-cyan"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsOpen(!isOpen)
              }}
            >
              <HelpCircle className="h-3 w-3" />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          align="center" 
          className="w-80 p-0 border-2 border-neon-cyan bg-dark-card shadow-[0_0_20px_rgba(11,228,236,0.3)]"
        >
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-neon-cyan" />
                    {title}
                  </CardTitle>
                  {category && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={`text-xs border ${getDifficultyColor(difficulty)}`}>
                    {getDifficultyIcon(difficulty)} {difficulty}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <p className="text-sm text-gray-300 font-mono">{description}</p>
              
              {tips.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-neon-orange mb-2 flex items-center gap-1 uppercase tracking-wider">
                    <Zap className="h-3 w-3" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-1">
                    {tips.map((tip, index) => (
                      <li key={index} className="text-xs text-gray-400 flex items-start gap-2 font-mono">
                        <Star className="h-3 w-3 text-neon-purple mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {examples.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Examples</h4>
                  <div className="space-y-1">
                    {examples.map((example, index) => (
                      <div key={index} className="text-xs bg-dark-bg p-2 rounded-sm border-l-2 border-neon-purple font-mono text-gray-400">
                        &quot;{example}&quot;
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(videoUrl || docsUrl) && (
                <div className="flex gap-2 pt-2 border-t border-gray-700">
                  {videoUrl && (
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      <Video className="h-3 w-3 mr-1" />
                      Watch
                    </Button>
                  )}
                  {docsUrl && (
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Docs
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Quick help tooltip for simple cases
export function QuickHelp({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1">
            {children}
            <HelpCircle className="h-3 w-3 text-gray-500 hover:text-neon-cyan cursor-help" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-dark-card border-neon-cyan">
          <p className="text-sm text-gray-300 font-mono">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Feature highlight tooltip
export function FeatureHighlight({ 
  children, 
  feature, 
  benefit 
}: { 
  children: React.ReactNode; 
  feature: string; 
  benefit: string 
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1">
            {children}
            <div className="h-2 w-2 bg-neon-purple rounded-full animate-pulse" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-dark-card border-neon-purple">
          <div className="space-y-2">
            <p className="text-sm font-bold text-neon-purple">{feature}</p>
            <p className="text-xs text-gray-400 font-mono">{benefit}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
