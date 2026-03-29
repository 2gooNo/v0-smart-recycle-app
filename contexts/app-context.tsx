"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type WasteType = "plastic" | "paper" | "metal" | "general"

export interface Bin {
  id: string
  name: string
  address: string
  distance: number
  lat: number
  lng: number
  type: WasteType // Each bin handles only ONE type
}

interface AppContextType {
  points: number
  addPoints: (amount: number) => void
  detectedWaste: WasteType | null
  setDetectedWaste: (waste: WasteType | null) => void
  resetDetection: () => void
  disposeCount: number
  incrementDisposeCount: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(0)
  const [detectedWaste, setDetectedWaste] = useState<WasteType | null>(null)
  const [disposeCount, setDisposeCount] = useState(0)

  const addPoints = (amount: number) => {
    setPoints((prev) => Math.max(0, prev + amount)) // Never go below 0
  }

  const resetDetection = () => {
    setDetectedWaste(null)
  }

  const incrementDisposeCount = () => {
    setDisposeCount((prev) => prev + 1)
  }

  return (
    <AppContext.Provider
      value={{
        points,
        addPoints,
        detectedWaste,
        setDetectedWaste,
        resetDetection,
        disposeCount,
        incrementDisposeCount,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
