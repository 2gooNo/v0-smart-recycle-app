"use client"

import { Header } from "@/components/header"
import { HomeScreen } from "@/components/home-screen"

export default function SmartRecyclePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-md mx-auto px-4 py-4 pb-8">
        <HomeScreen />
      </main>
    </div>
  )
}
