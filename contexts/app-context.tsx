"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type WasteType = "plastic" | "paper" | "metal" | null

interface AppContextType {
  points: number
  addPoints: (amount: number) => void
  detectedWaste: WasteType
  setDetectedWaste: (waste: WasteType) => void
  selectedBin: WasteType
  setSelectedBin: (bin: WasteType) => void
  resetDetection: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(0)
  const [detectedWaste, setDetectedWaste] = useState<WasteType>(null)
  const [selectedBin, setSelectedBin] = useState<WasteType>(null)

  const addPoints = (amount: number) => {
    setPoints((prev) => prev + amount)
  }

  const resetDetection = () => {
    setDetectedWaste(null)
    setSelectedBin(null)
  }

  return (
    <AppContext.Provider
      value={{
        points,
        addPoints,
        detectedWaste,
        setDetectedWaste,
        selectedBin,
        setSelectedBin,
        resetDetection,
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
