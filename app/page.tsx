"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { HomeScreen } from "@/components/home-screen"
import { Leaderboard } from "@/components/leaderboard"

export default function SmartRecyclePage() {
  const [activeTab, setActiveTab] = useState<"home" | "leaderboard">("home")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-4 pb-24">
        {activeTab === "home" ? <HomeScreen /> : <Leaderboard />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
