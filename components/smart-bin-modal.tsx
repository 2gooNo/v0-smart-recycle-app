"use client"

import { useState } from "react"
import { useApp, type BinStation, type WasteType } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Unlock, ScanLine, CheckCircle2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const compartmentConfig: Record<WasteType, { label: string; color: string; bg: string; borderColor: string }> = {
  plastic: { label: "Plastic",  color: "text-blue-700",   bg: "bg-blue-50",   borderColor: "border-blue-300" },
  paper:   { label: "Paper",    color: "text-yellow-700", bg: "bg-yellow-50", borderColor: "border-yellow-300" },
  metal:   { label: "Metal",    color: "text-gray-700",   bg: "bg-gray-100",  borderColor: "border-gray-300" },
  general: { label: "General",  color: "text-orange-700", bg: "bg-orange-50", borderColor: "border-orange-300" },
}

const wasteEmoji: Record<WasteType, string> = {
  plastic: "🧴",
  paper:   "📄",
  metal:   "🔩",
  general: "🗑️",
}

interface SmartBinModalProps {
  station: BinStation
  onDone: () => void
}

type BinState = "idle" | "opening" | "open" | "scanning" | "success"

export function SmartBinModal({ station, onDone }: SmartBinModalProps) {
  const { detectedWaste, addPoints } = useApp()
  const [binState, setBinState] = useState<BinState>("idle")
  const [showPointsAnim, setShowPointsAnim] = useState(false)

  const targetCompartment = detectedWaste ?? "general"
  const config = compartmentConfig[targetCompartment]

  const handleOpen = async () => {
    setBinState("opening")
    await new Promise((r) => setTimeout(r, 800))
    setBinState("open")
  }

  const handleScan = async () => {
    setBinState("scanning")
    await new Promise((r) => setTimeout(r, 1400))
    setBinState("success")
    addPoints(10)
    setShowPointsAnim(true)
    setTimeout(() => setShowPointsAnim(false), 2200)
  }

  const lidOpen = binState === "open" || binState === "scanning" || binState === "success"

  return (
    <div className="flex flex-col gap-5">
      {/* Station info */}
      <div>
        <h1 className="text-xl font-bold text-foreground text-balance">{station.name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{station.address} &bull; {station.distance}m away</p>
      </div>

      {/* Target compartment card */}
      <div className={cn("rounded-2xl border p-4", config.bg, config.borderColor)}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Drop your waste here</p>
        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", config.bg)}>
            {wasteEmoji[targetCompartment]}
          </div>
          <div>
            <p className={cn("text-base font-bold capitalize", config.color)}>{config.label} Compartment</p>
            <p className="text-xs text-muted-foreground">Slide waste into this compartment</p>
          </div>
        </div>
      </div>

      {/* Bin visualization */}
      <div className="relative flex items-center justify-center py-4">
        <div className="relative w-56 h-40 rounded-xl bg-muted border-2 border-border overflow-hidden">
          {/* Lid */}
          <div className={cn(
            "absolute -top-4 left-0 right-0 h-8 bg-muted-foreground/30 border-2 border-border rounded-t-xl transition-all duration-500 origin-top",
            lidOpen ? "-rotate-90 opacity-0" : "rotate-0 opacity-100"
          )} />

          {/* 4 compartments */}
          <div className="absolute inset-0 grid grid-cols-4 gap-0">
            {(["plastic", "paper", "metal", "general"] as WasteType[]).map((type) => {
              const c = compartmentConfig[type]
              const isTarget = type === targetCompartment
              return (
                <div
                  key={type}
                  className={cn(
                    "flex flex-col items-center justify-end pb-2 border-r last:border-r-0 border-border/40 transition-all duration-300",
                    isTarget ? cn(c.bg, "opacity-100") : "opacity-40"
                  )}
                >
                  <span
                    className="text-[10px] font-medium leading-tight text-center px-0.5"
                    style={{ color: isTarget ? "inherit" : "#9ca3af" }}
                  >
                    {c.label}
                  </span>
                  {binState === "scanning" && isTarget && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping mt-1" />
                  )}
                  {binState === "success" && isTarget && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-1" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Points pop */}
        {showPointsAnim && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm animate-in zoom-in slide-in-from-bottom-4 shadow-lg">
            <Sparkles className="w-4 h-4" />
            +10 pts
          </div>
        )}
      </div>

      {/* Status text */}
      <p className="text-center text-sm text-muted-foreground">
        {binState === "idle"    && "Open the bin to begin disposal"}
        {binState === "opening" && "Opening bin lid..."}
        {binState === "open"    && "Bin is open — scan your waste to confirm disposal"}
        {binState === "scanning"&& "Scanning waste..."}
        {binState === "success" && "Waste disposed correctly! +10 points earned"}
      </p>

      {/* Action button */}
      {binState === "idle" && (
        <Button onClick={handleOpen} className="w-full h-12 rounded-xl text-base">
          <Unlock className="w-5 h-5 mr-2" />
          Open Bin
        </Button>
      )}
      {binState === "opening" && (
        <Button disabled className="w-full h-12 rounded-xl text-base">
          Opening...
        </Button>
      )}
      {binState === "open" && (
        <Button onClick={handleScan} className="w-full h-12 rounded-xl text-base">
          <ScanLine className="w-5 h-5 mr-2" />
          Scan and Confirm Disposal
        </Button>
      )}
      {binState === "success" && (
        <Button onClick={onDone} className="w-full h-12 rounded-xl text-base">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Done — Start Over
        </Button>
      )}
    </div>
  )
}
