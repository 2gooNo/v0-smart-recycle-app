"use client"

import { useState } from "react"
import { useApp, type Bin, type WasteType } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Unlock, ArrowDown, ScanLine, CheckCircle2, Sparkles, LockKeyhole } from "lucide-react"
import { cn } from "@/lib/utils"

const typeConfig: Record<WasteType, { label: string; color: string; bg: string; border: string; emoji: string }> = {
  plastic: { label: "Plastic", color: "text-blue-700",  bg: "bg-blue-50",   border: "border-blue-300",  emoji: "🧴" },
  paper:   { label: "Paper",   color: "text-yellow-700",bg: "bg-yellow-50", border: "border-yellow-300",emoji: "📄" },
  metal:   { label: "Metal",   color: "text-gray-700",  bg: "bg-gray-100",  border: "border-gray-300",  emoji: "🔩" },
  general: { label: "General", color: "text-orange-700",bg: "bg-orange-50", border: "border-orange-300",emoji: "🗑️" },
}

// Step order: idle → open → drop → scanning → processing → success
type BinPhase = "idle" | "open" | "dropping" | "scanning" | "processing" | "success"

interface SmartBinModalProps {
  bin: Bin
  onDone: () => void
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function SmartBinModal({ bin, onDone }: SmartBinModalProps) {
  const { addPoints } = useApp()
  const [phase, setPhase] = useState<BinPhase>("idle")
  const [showPoints, setShowPoints] = useState(false)

  const cfg = typeConfig[bin.type]
  const lidOpen = phase !== "idle"

  // Step 1: user taps "Open Bin"
  const handleOpenBin = () => setPhase("open")

  // Step 2: user taps "Drop Trash in Bin" — triggers auto-sorting sequence
  const handleDropTrash = async () => {
    setPhase("dropping")
    await sleep(900)
    setPhase("scanning")
    await sleep(1100)
    setPhase("processing")
    await sleep(900)
    setPhase("success")
    addPoints(10)
    setShowPoints(true)
    setTimeout(() => setShowPoints(false), 2500)
  }

  const statusText: Record<BinPhase, string> = {
    idle:       "Bin is locked. Press Open Bin to unlock it.",
    open:       "Bin is open. Place your trash inside, then press Drop Trash.",
    dropping:   "Receiving trash...",
    scanning:   "AI is identifying waste type...",
    processing: "Auto-sorting in progress...",
    success:    `Sorted into ${cfg.label} bin! +10 points earned.`,
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Bin info */}
      <div>
        <h1 className="text-xl font-bold text-foreground text-balance">{bin.name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{bin.address} &mdash; {bin.distance}m away</p>
      </div>

      {/* Type badge */}
      <div className={cn("rounded-2xl border p-4 flex items-center gap-3", cfg.bg, cfg.border)}>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0", cfg.bg)}>
          {cfg.emoji}
        </div>
        <div>
          <p className={cn("text-base font-bold capitalize", cfg.color)}>{cfg.label} Bin</p>
          <p className="text-xs text-muted-foreground">
            {phase === "success" ? "Waste successfully processed" : "Smart auto-sorting bin"}
          </p>
        </div>
      </div>

      {/* Bin illustration */}
      <div className="relative flex flex-col items-center py-2">

        {/* Trash item dropping */}
        {phase === "dropping" && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 animate-bounce">
            <span className="text-3xl">{cfg.emoji}</span>
            <ArrowDown className="w-4 h-4 text-primary animate-pulse" />
          </div>
        )}

        {/* Bin body */}
        <div className={cn(
          "relative w-44 h-48 rounded-xl border-2 overflow-visible transition-all duration-300",
          cfg.bg, cfg.border
        )}>
          {/* Lid */}
          <div className={cn(
            "absolute -top-3 left-2 right-2 h-5 rounded-t-lg border-2 transition-all duration-500 origin-left z-20 flex items-center justify-center",
            cfg.border, cfg.bg,
            lidOpen ? "-translate-y-5 -rotate-45 opacity-50" : "translate-y-0 rotate-0 opacity-100"
          )}>
            <div className={cn("w-6 h-1 rounded-full opacity-40", cfg.color)} />
          </div>

          {/* Lock icon on idle */}
          {phase === "idle" && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2">
              <LockKeyhole className="w-6 h-6 text-muted-foreground/50" />
            </div>
          )}

          {/* Scanner beam */}
          {phase === "scanning" && (
            <div className="absolute inset-x-6 top-8 h-0.5 bg-primary rounded-full z-10">
              <div className="absolute inset-0 bg-primary/60 animate-ping rounded-full" />
            </div>
          )}

          {/* Compartment interior */}
          <div className="absolute inset-x-4 bottom-4 top-12 flex flex-col items-center justify-center rounded-lg border border-current/10 gap-1">
            <span className={cn("text-4xl transition-all duration-300", phase === "success" ? "scale-110" : "scale-100")}>
              {cfg.emoji}
            </span>
            <span className={cn("text-xs font-semibold uppercase tracking-wide", cfg.color)}>
              {cfg.label}
            </span>
            {phase === "success" && (
              <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
            )}
          </div>

          {/* AI status pill */}
          <div className="absolute top-6 right-2 left-2 flex items-center justify-center gap-1.5">
            <span className={cn(
              "w-2 h-2 rounded-full shrink-0",
              phase === "scanning" || phase === "processing" ? "bg-primary animate-pulse" :
              phase === "success" ? "bg-green-500" : "bg-muted-foreground/30"
            )} />
            <span className="text-[10px] font-medium text-muted-foreground">
              {phase === "scanning"   ? "Scanning..."   :
               phase === "processing" ? "Processing..." :
               phase === "success"    ? "Done"          :
               phase === "open"       ? "Ready"         : "Locked"}
            </span>
          </div>
        </div>

        {/* Points popup */}
        {showPoints && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-lg z-30 animate-in zoom-in slide-in-from-bottom-4">
            <Sparkles className="w-4 h-4" />
            +10 pts
          </div>
        )}
      </div>

      {/* Status text */}
      <p className="text-center text-sm text-muted-foreground leading-snug px-2">
        {statusText[phase]}
      </p>

      {/* Action buttons */}
      {phase === "idle" && (
        <Button onClick={handleOpenBin} className="w-full h-12 rounded-xl text-base">
          <Unlock className="w-5 h-5 mr-2" />
          Open Bin
        </Button>
      )}

      {phase === "open" && (
        <Button onClick={handleDropTrash} className="w-full h-12 rounded-xl text-base">
          <ArrowDown className="w-5 h-5 mr-2" />
          Drop Trash in Bin
        </Button>
      )}

      {(phase === "dropping" || phase === "scanning" || phase === "processing") && (
        <Button disabled className="w-full h-12 rounded-xl text-base">
          <ScanLine className="w-5 h-5 mr-2 animate-pulse" />
          {phase === "dropping"   ? "Receiving..." :
           phase === "scanning"   ? "Scanning..."  : "Processing..."}
        </Button>
      )}

      {phase === "success" && (
        <Button onClick={onDone} className="w-full h-12 rounded-xl text-base">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Done — Start Over
        </Button>
      )}
    </div>
  )
}
