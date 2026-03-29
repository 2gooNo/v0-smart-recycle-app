"use client"

import { useApp } from "@/contexts/app-context"
import { Leaf, Sparkles } from "lucide-react"

export function Header() {
  const { points } = useApp()

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="text-lg font-semibold text-foreground">SmartRecycle</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30">
          <Sparkles className="w-4 h-4 text-accent-foreground" />
          <span className="text-sm font-medium text-accent-foreground">{points} pts</span>
        </div>
      </div>
    </header>
  )
}
