"use client"

import { useState } from "react"
import { useApp, type Bin, type WasteType } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Unlock, ScanLine, CheckCircle2, Sparkles, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

const typeConfig: Record<WasteType, { label: string; color: string; bg: string; borderColor: string; emoji: string }> = {
  plastic: { label: "Plastic", color: "text-blue-700", bg: "bg-blue-50", borderColor: "border-blue-300", emoji: "🧴" },
  paper: { label: "Paper", color: "text-yellow-700", bg: "bg-yellow-50", borderColor: "border-yellow-300", emoji: "📄" },
  metal: { label: "Metal", color: "text-gray-700", bg: "bg-gray-100", borderColor: "border-gray-300", emoji: "🔩" },
  general: { label: "General", color: "text-orange-700", bg: "bg-orange-50", borderColor: "border-orange-300", emoji: "🗑️" },
}

interface SmartBinModalProps {
  bin: Bin
  onDone: () => void
}

type BinState = "idle" | "opening" | "dropping" | "scanning" | "processing" | "success"

export function SmartBinModal({ bin, onDone }: SmartBinModalProps) {
  const { detectedWaste, addPoints } = useApp()
  const [binState, setBinState] = useState<BinState>("idle")
  const [showPointsAnim, setShowPointsAnim] = useState(false)

  const config = typeConfig[bin.type]

  const handleDropTrash = async () => {
    setBinState("opening")
    await new Promise((r) => setTimeout(r, 600))
    setBinState("dropping")
    await new Promise((r) => setTimeout(r, 800))
    setBinState("scanning")
    await new Promise((r) => setTimeout(r, 1000))
    setBinState("processing")
    await new Promise((r) => setTimeout(r, 800))
    setBinState("success")
    addPoints(10)
    setShowPointsAnim(true)
    setTimeout(() => setShowPointsAnim(false), 2200)
  }

  const lidOpen = binState !== "idle"
  const isScanning = binState === "scanning"
  const isProcessing = binState === "processing"
  const isSuccess = binState === "success"

  return (
    <div className="flex flex-col gap-5">
      {/* Bin info */}
      <div>
        <h1 className="text-xl font-bold text-foreground text-balance">{bin.name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{bin.address} - {bin.distance}m away</p>
      </div>

      {/* Bin type card */}
      <div className={cn("rounded-2xl border p-4", config.bg, config.borderColor)}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          {isSuccess ? "Recycled" : "Bin Type"}
        </p>
        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", config.bg)}>
            {config.emoji}
          </div>
          <div>
            <p className={cn("text-base font-bold capitalize", config.color)}>{config.label} Bin</p>
            <p className="text-xs text-muted-foreground">
              {isSuccess 
                ? "Successfully processed your waste" 
                : "Auto-sorting single-type smart bin"
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
            <div className="text-3xl">{config.emoji}</div>
            <ArrowDown className="w-5 h-5 text-primary mx-auto animate-pulse" />
          </div>
        )}

        {/* Main bin body - single type */}
        <div className={cn(
          "relative w-48 h-52 rounded-xl border-2 overflow-hidden transition-all duration-300",
          config.bg,
          config.borderColor
        )}>
          {/* Lid */}
          <div className={cn(
            "absolute -top-1 left-2 right-2 h-6 border-2 rounded-t-lg transition-all duration-500 origin-bottom z-20",
            config.borderColor,
            config.bg,
            lidOpen ? "-translate-y-4 opacity-60" : "translate-y-0 opacity-100"
          )}>
            <div className="absolute inset-x-0 top-1 flex justify-center">
              <div className={cn("w-8 h-1 rounded-full", config.color, "opacity-30")} />
            </div>
          </div>

          {/* AI Scanner beam */}
          {isScanning && (
            <div className="absolute inset-x-4 top-10 h-1 bg-primary/60 rounded-full animate-pulse z-10">
              <div className="absolute inset-0 bg-primary animate-ping rounded-full" />
            </div>
          )}

          {/* Single compartment visualization */}
          <div className="absolute inset-x-4 bottom-4 top-10 flex flex-col items-center justify-center rounded-lg border border-current/20">
            <span className="text-5xl mb-2">{config.emoji}</span>
            <span className={cn("text-sm font-semibold uppercase tracking-wide", config.color)}>
              {config.label}
            </span>
            {isSuccess && (
              <CheckCircle2 className="w-6 h-6 text-primary mt-2 animate-in zoom-in" />
            )}
          </div>

          {/* AI indicator */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full">
            <span className={cn(
              "w-2 h-2 rounded-full",
              isScanning || isProcessing ? "bg-primary animate-pulse" : isSuccess ? "bg-green-500" : "bg-muted-foreground/40"
            )} />
            <span className="font-medium">
              {isScanning ? "Scanning..." : isProcessing ? "Processing..." : isSuccess ? "Done" : "Ready"}
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
        {binState === "idle" && "Drop your trash into the bin"}
        {binState === "opening" && "Opening bin..."}
        {binState === "dropping" && "Receiving trash..."}
        {binState === "scanning" && "AI verifying waste type..."}
        {binState === "processing" && "Processing..."}
        {binState === "success" && `Recycled in ${config.label} bin! +10 points earned`}
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
      {(binState === "scanning" || binState === "processing") && (
        <Button disabled className="w-full h-12 rounded-xl text-base">
          <ScanLine className="w-5 h-5 mr-2 animate-pulse" />
          {binState === "scanning" ? "Scanning..." : "Processing..."}
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
