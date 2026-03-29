"use client"

import { useState, useEffect } from "react"
import { useApp, type BinStation, type WasteType } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Unlock, ScanLine, CheckCircle2, Sparkles, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

const compartmentConfig: Record<WasteType, { label: string; color: string; bg: string; borderColor: string }> = {
  plastic: { label: "Plastic", color: "text-blue-700", bg: "bg-blue-50", borderColor: "border-blue-300" },
  paper: { label: "Paper", color: "text-yellow-700", bg: "bg-yellow-50", borderColor: "border-yellow-300" },
  metal: { label: "Metal", color: "text-gray-700", bg: "bg-gray-100", borderColor: "border-gray-300" },
  general: { label: "General", color: "text-orange-700", bg: "bg-orange-50", borderColor: "border-orange-300" },
}

const wasteEmoji: Record<WasteType, string> = {
  plastic: "🧴",
  paper: "📄",
  metal: "🔩",
  general: "🗑️",
}

interface SmartBinModalProps {
  station: BinStation
  onDone: () => void
}

type BinState = "idle" | "opening" | "dropping" | "scanning" | "sorting" | "success"

export function SmartBinModal({ station, onDone }: SmartBinModalProps) {
  const { detectedWaste, addPoints } = useApp()
  const [binState, setBinState] = useState<BinState>("idle")
  const [showPointsAnim, setShowPointsAnim] = useState(false)
  const [sortingIndex, setSortingIndex] = useState(0)

  const targetCompartment = detectedWaste ?? "general"
  const config = compartmentConfig[targetCompartment]
  const compartmentOrder: WasteType[] = ["plastic", "paper", "metal", "general"]
  const targetIndex = compartmentOrder.indexOf(targetCompartment)

  const handleDropTrash = async () => {
    setBinState("opening")
    await new Promise((r) => setTimeout(r, 600))
    setBinState("dropping")
    await new Promise((r) => setTimeout(r, 800))
    setBinState("scanning")
    await new Promise((r) => setTimeout(r, 1200))
    setBinState("sorting")
  }

  // Sorting animation - cycles through compartments then lands on correct one
  useEffect(() => {
    if (binState !== "sorting") return
    
    let current = 0
    const interval = setInterval(() => {
      current++
      if (current <= 6) {
        // Cycle through compartments rapidly
        setSortingIndex(current % 4)
      } else {
        // Land on correct compartment
        setSortingIndex(targetIndex)
        clearInterval(interval)
        setTimeout(() => {
          setBinState("success")
          addPoints(10)
          setShowPointsAnim(true)
          setTimeout(() => setShowPointsAnim(false), 2200)
        }, 400)
      }
    }, 200)

    return () => clearInterval(interval)
  }, [binState, targetIndex, addPoints])

  const lidOpen = binState !== "idle"
  const isScanning = binState === "scanning"
  const isSorting = binState === "sorting"
  const isSuccess = binState === "success"

  return (
    <div className="flex flex-col gap-5">
      {/* Station info */}
      <div>
        <h1 className="text-xl font-bold text-foreground text-balance">{station.name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{station.address} - {station.distance}m away</p>
      </div>

      {/* Info card - explains the automatic sorting */}
      <div className={cn("rounded-2xl border p-4", config.bg, config.borderColor)}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          {isSuccess ? "Sorted to" : "AI-Powered Auto-Sort"}
        </p>
        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", config.bg)}>
            {wasteEmoji[targetCompartment]}
          </div>
          <div>
            <p className={cn("text-base font-bold capitalize", config.color)}>{config.label}</p>
            <p className="text-xs text-muted-foreground">
              {isSuccess 
                ? "Automatically sorted by the smart bin" 
                : "Just drop your trash - bin sorts automatically"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Smart Bin visualization */}
      <div className="relative flex flex-col items-center py-2">
        {/* Trash dropping animation */}
        {binState === "dropping" && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 animate-bounce z-10">
            <div className="text-3xl">{wasteEmoji[targetCompartment]}</div>
            <ArrowDown className="w-5 h-5 text-primary mx-auto animate-pulse" />
          </div>
        )}

        {/* Main bin body */}
        <div className="relative w-64 h-44 rounded-xl bg-muted border-2 border-border overflow-hidden">
          {/* Lid */}
          <div className={cn(
            "absolute -top-1 left-2 right-2 h-6 bg-foreground/20 border-2 border-border rounded-t-lg transition-all duration-500 origin-bottom z-20",
            lidOpen ? "-translate-y-4 opacity-60" : "translate-y-0 opacity-100"
          )}>
            <div className="absolute inset-x-0 top-1 flex justify-center">
              <div className="w-8 h-1 rounded-full bg-foreground/30" />
            </div>
          </div>

          {/* AI Scanner beam */}
          {isScanning && (
            <div className="absolute inset-x-4 top-8 h-1 bg-primary/60 rounded-full animate-pulse z-10">
              <div className="absolute inset-0 bg-primary animate-ping rounded-full" />
            </div>
          )}

          {/* 4 compartments */}
          <div className="absolute inset-x-0 bottom-0 top-8 grid grid-cols-4 gap-0.5 px-1 pb-1">
            {compartmentOrder.map((type, idx) => {
              const c = compartmentConfig[type]
              const isHighlighted = isSorting ? idx === sortingIndex : (isSuccess && type === targetCompartment)
              const isTarget = type === targetCompartment
              
              return (
                <div
                  key={type}
                  className={cn(
                    "flex flex-col items-center justify-end pb-2 rounded-b-lg border border-border/30 transition-all duration-150",
                    isHighlighted ? cn(c.bg, "border-2", c.borderColor, "scale-105") : "bg-background/50 opacity-60"
                  )}
                >
                  <span className="text-lg mb-1">{wasteEmoji[type]}</span>
                  <span
                    className={cn(
                      "text-[9px] font-semibold leading-tight text-center px-0.5 uppercase tracking-wide",
                      isHighlighted ? c.color : "text-muted-foreground"
                    )}
                  >
                    {c.label}
                  </span>
                  {isSuccess && isTarget && (
                    <CheckCircle2 className="w-4 h-4 text-primary mt-1 animate-in zoom-in" />
                  )}
                </div>
              )
            })}
          </div>

          {/* AI brain indicator */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full">
            <span className={cn("w-2 h-2 rounded-full", isScanning || isSorting ? "bg-primary animate-pulse" : isSuccess ? "bg-green-500" : "bg-muted-foreground/40")} />
            <span className="font-medium">
              {isScanning ? "AI Scanning..." : isSorting ? "Sorting..." : isSuccess ? "Complete" : "Ready"}
            </span>
          </div>
        </div>

        {/* Points pop */}
        {showPointsAnim && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm animate-in zoom-in slide-in-from-bottom-4 shadow-lg z-30">
            <Sparkles className="w-4 h-4" />
            +10 pts
          </div>
        )}
      </div>

      {/* Status text */}
      <p className="text-center text-sm text-muted-foreground">
        {binState === "idle" && "Drop your trash into the bin - AI will sort it automatically"}
        {binState === "opening" && "Opening bin..."}
        {binState === "dropping" && "Receiving trash..."}
        {binState === "scanning" && "AI scanning waste type..."}
        {binState === "sorting" && "Automatically sorting to correct compartment..."}
        {binState === "success" && `Sorted to ${config.label}! +10 points earned`}
      </p>

      {/* Action button */}
      {binState === "idle" && (
        <Button onClick={handleDropTrash} className="w-full h-12 rounded-xl text-base">
          <Unlock className="w-5 h-5 mr-2" />
          Drop Trash in Bin
        </Button>
      )}
      {(binState === "opening" || binState === "dropping") && (
        <Button disabled className="w-full h-12 rounded-xl text-base">
          <ArrowDown className="w-5 h-5 mr-2 animate-bounce" />
          Dropping...
        </Button>
      )}
      {binState === "scanning" && (
        <Button disabled className="w-full h-12 rounded-xl text-base">
          <ScanLine className="w-5 h-5 mr-2 animate-pulse" />
          AI Scanning...
        </Button>
      )}
      {binState === "sorting" && (
        <Button disabled className="w-full h-12 rounded-xl text-base">
          <ScanLine className="w-5 h-5 mr-2 animate-spin" />
          Auto-Sorting...
        </Button>
      )}
      {binState === "success" && (
        <Button onClick={onDone} className="w-full h-12 rounded-xl text-base">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Done - Start Over
        </Button>
      )}
    </div>
  )
}
