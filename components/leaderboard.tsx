"use client"

import { useApp } from "@/contexts/app-context"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Medal, Award, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  name: string
  points: number
  isCurrentUser?: boolean
}

export function Leaderboard() {
  const { points } = useApp()

  const leaderboardData: LeaderboardEntry[] = [
    { name: "Alice", points: 120 },
    { name: "Bob", points: 90 },
    { name: "You", points, isCurrentUser: true },
  ].sort((a, b) => b.points - a.points)

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
    }
  }

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-500/10 border-yellow-500/30"
      case 1:
        return "bg-gray-400/10 border-gray-400/30"
      case 2:
        return "bg-amber-600/10 border-amber-600/30"
      default:
        return "bg-muted/30 border-border/50"
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/20 flex items-center justify-center mb-3">
          <Trophy className="w-8 h-8 text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">Top recyclers this week</p>
      </div>

      {/* Leaderboard List */}
      <Card className="border-border/50 shadow-lg">
        <CardContent className="p-4">
          <div className="space-y-3">
            {leaderboardData.map((entry, index) => (
              <div
                key={entry.name}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all duration-200",
                  getRankBg(index),
                  entry.isCurrentUser && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-8 h-8 flex items-center justify-center">
                    {getRankIcon(index)}
                  </div>
                  
                  {/* Avatar */}
                  <div className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center",
                    entry.isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <User className="w-5 h-5" />
                  </div>
                  
                  {/* Name */}
                  <div>
                    <p className={cn(
                      "font-medium",
                      entry.isCurrentUser ? "text-primary" : "text-foreground"
                    )}>
                      {entry.name}
                    </p>
                    {entry.isCurrentUser && (
                      <p className="text-xs text-muted-foreground">That&apos;s you!</p>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="text-lg font-semibold text-foreground">{entry.points}</p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Motivation */}
      <Card className="border-border/50 bg-primary/5">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            ♻️ Keep recycling to climb the leaderboard!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
