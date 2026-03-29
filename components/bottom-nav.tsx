"use client"

import { Home, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeTab: "home" | "leaderboard"
  onTabChange: (tab: "home" | "leaderboard") => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        <button
          onClick={() => onTabChange("home")}
          className={cn(
            "flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200",
            activeTab === "home"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </button>
        <button
          onClick={() => onTabChange("leaderboard")}
          className={cn(
            "flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200",
            activeTab === "leaderboard"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Trophy className="w-6 h-6" />
          <span className="text-xs font-medium">Leaderboard</span>
        </button>
      </div>
    </nav>
  )
}
