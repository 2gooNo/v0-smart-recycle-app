"use client"

import { useState } from "react"
import { useApp, type BinStation, type WasteType } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { X, Unlock, ScanLine, CheckCircle2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const compartmentConfig: Record<WasteType, { label: string; color: string; bg: string; borderColor: string }> = {
  plastic: { label: "Plastic",  color: "text-blue-700",   bg: "bg-blue-50",   borderColor: "border-blue-300" },
  paper:   { label: "Paper",    color: "text-yellow-700", bg: "bg-yellow-50", borderColor: "border-yellow-300" },
  metal:   { label: "Metal",    color: "text-gray-700",   bg: "bg-gray-100",  borderColor: "border-gray-300" },
  general: { label: "General",  color: "text-orange-700", bg: "bg-orange-50", borderColor: "border-orange-300" },
}

interface SmartBinModalProps {
  station: BinStation
  onClose: () => void
}

type BinState = "idle" | "opening" | "open" | "scanning" | "success"

export function SmartBinModal({ station, onClose }: SmartBinModalProps) {
  const { detectedWaste, addPoints, resetDetection } = useApp()
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
    setTimeout(() => setShowPointsAnim(false), 2000)
  }

  const handleDone = () => {
    resetDetection()
    onClose()
  }

  const lidOpen = binState === "open" || binState === "scanning" || binState === "success"

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-card rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Station info */}
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-foreground pr-8">{station.name}</h2>
          <p className="text-sm text-muted-foreground">{station.address} &bull; {station.distance}m away</p>
        </div>

        {/* Compartment guide */}
        <div className={cn("rounded-2xl border p-4 mb-5", config.bg, config.borderColor)}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Drop your waste here</p>
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", config.bg)}>
              {targetCompartment === "plastic" ? "🧴" : targetCompartment === "paper" ? "📄" : targetCompartment === "metal" ? "🔩" : "🗑️"}
            </div>
            <div>
              <p className={cn("text-base font-bold capitalize", config.color)}>{config.label} Compartment</p>
              <p className="text-xs text-muted-foreground">Slide waste into this compartment</p>
            </div>
          </div>
        </div>

        {/* 4-compartment bin visualization */}
        <div className="relative h-44 mb-5 flex items-center justify-center">
          {/* Bin body */}
          <div className="relative w-48 h-36 rounded-xl bg-muted border-2 border-border overflow-hidden">
            {/* Lid */}
            <div className={cn(
              "absolute -top-4 left-0 right-0 h-8 bg-muted-foreground/30 border-2 border-border rounded-t-xl transition-all duration-500 origin-top",
              lidOpen ? "-rotate-90 opacity-0" : "rotate-0 opacity-100"
            )} />

            {/* 4 compartment dividers */}
            <div className="absolute inset-0 grid grid-cols-4 gap-0">
              {(["plastic", "paper", "metal", "general"] as WasteType[]).map((type) => {
                const c = compartmentConfig[type]
                const isTarget = type === targetCompartment
                return (
                  <div
                    key={type}
                    className={cn(
                      "flex flex-col items-center justify-end pb-2 border-r last:border-r-0 border-border/40 transition-all duration-300",
                      isTarget ? cn(c.bg, "opacity-100") : "opacity-50"
                    )}
                  >
                    <span className="text-[10px] font-medium leading-tight text-center px-0.5"
                      style={{ color: isTarget ? "inherit" : "#9ca3af" }}>
                      {c.label}
                    </span>
                    {binState === "scanning" && isTarget && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping mt-1" />
                    )}
                    {binState === "success" && isTarget && (
                      <CheckCircle2 className="w-3 h-3 text-primary mt-1" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Points animation */}
          {showPointsAnim && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm animate-in zoom-in slide-in-from-bottom-4">
              <Sparkles className="w-4 h-4" />
              +10 pts
            </div>
          )}
        </div>

        {/* Status */}
        <p className="text-center text-sm text-muted-foreground mb-4 h-5">
          {binState === "idle"     && "Open the bin to begin disposal"}
          {binState === "opening"  && "Opening bin..."}
          {binState === "open"     && "Bin ready — scan your waste to confirm"}
          {binState === "scanning" && "Scanning waste..."}
          {binState === "success"  && "Waste disposed correctly! +10 points earned"}
        </p>

        {/* Actions */}
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
            Scan & Confirm Disposal
          </Button>
        )}
        {binState === "success" && (
          <Button onClick={handleDone} className="w-full h-12 rounded-xl text-base">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Done
          </Button>
        )}
      </div>
    </div>
  )
}
