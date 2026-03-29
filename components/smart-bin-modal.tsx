"use client"

import { useState, useEffect } from "react"
import { useApp, type Bin, type WasteType } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Unlock, ArrowDown, ScanLine, CheckCircle2, Sparkles, LockKeyhole, XCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const typeConfig: Record<WasteType, { label: string; color: string; bg: string; border: string; emoji: string }> = {
  plastic: { label: "Plastic", color: "text-blue-700",  bg: "bg-blue-50",   border: "border-blue-300",  emoji: "🧴" },
  paper:   { label: "Paper",   color: "text-yellow-700",bg: "bg-yellow-50", border: "border-yellow-300",emoji: "📄" },
  metal:   { label: "Metal",   color: "text-gray-700",  bg: "bg-gray-100",  border: "border-gray-300",  emoji: "🔩" },
  general: { label: "General", color: "text-orange-700",bg: "bg-orange-50", border: "border-orange-300",emoji: "🗑️" },
}

// Step order: idle → open → drop → scanning → processing → success/penalty → redirect → done
type BinPhase = "idle" | "open" | "dropping" | "scanning" | "processing" | "success" | "penalty" | "redirect" | "done"

interface SmartBinModalProps {
  bin: Bin
  onDone: () => void
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const CORRECT_POINTS = 10
const PENALTY_POINTS = -5

export function SmartBinModal({ bin, onDone }: SmartBinModalProps) {
  const { addPoints, disposeCount, incrementDisposeCount, detectedWaste } = useApp()
  const [phase, setPhase] = useState<BinPhase>("idle")
  const [showPoints, setShowPoints] = useState(false)
  const [pointsValue, setPointsValue] = useState(0)
  
  // For demo: odd counts (1st, 3rd, 5th...) = correct, even counts (2nd, 4th...) = wrong
  // disposeCount starts at 0, so after increment: 1 = correct, 2 = wrong, 3 = correct...
  const [isWrongTrash, setIsWrongTrash] = useState(false)

  const cfg = typeConfig[bin.type]
  const lidOpen = phase !== "idle"

  // Step 1: user taps "Open Bin"
  const handleOpenBin = () => setPhase("open")

  // Step 2: user taps "Drop Trash in Bin" — triggers auto-sorting sequence
  const handleDropTrash = async () => {
    // Increment count first, then check if this attempt should be wrong
    incrementDisposeCount()
    const attemptNumber = disposeCount + 1 // +1 because we just incremented
    const shouldBeWrong = attemptNumber % 2 === 0 // 2nd, 4th, 6th... = wrong
    setIsWrongTrash(shouldBeWrong)

    setPhase("dropping")
    await sleep(900)
    setPhase("scanning")
    await sleep(1100)
    setPhase("processing")
    await sleep(900)
    
    if (shouldBeWrong) {
      // Wrong trash detected - penalty
      setPhase("penalty")
      setPointsValue(PENALTY_POINTS)
      addPoints(PENALTY_POINTS)
      setShowPoints(true)
      await sleep(1500)
      setPhase("redirect")
      await sleep(1200)
      setPhase("done")
      setTimeout(() => setShowPoints(false), 500)
    } else {
      // Correct trash - reward
      setPhase("success")
      setPointsValue(CORRECT_POINTS)
      addPoints(CORRECT_POINTS)
      setShowPoints(true)
      setTimeout(() => setShowPoints(false), 2500)
    }
  }

  const statusText: Record<BinPhase, string> = {
    idle:       "Bin is locked. Press Open Bin to unlock it.",
    open:       "Bin is open. Place your trash inside, then press Drop Trash.",
    dropping:   "Receiving trash...",
    scanning:   "AI is identifying waste type...",
    processing: "Auto-sorting in progress...",
    success:    `Sorted into ${cfg.label} bin! +${CORRECT_POINTS} points earned.`,
    penalty:    `Wrong trash detected! ${PENALTY_POINTS} points penalty.`,
    redirect:   "Redirecting to wrong-trash compartment...",
    done:       "Trash moved to wrong-trash compartment.",
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Bin info */}
      <div>
        <h1 className="text-xl font-bold text-foreground text-balance">{bin.name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{bin.address} &mdash; {bin.distance}m away</p>
      </div>

      {/* Type badge */}
      <div className={cn(
        "rounded-2xl border p-4 flex items-center gap-3 transition-colors",
        phase === "penalty" || phase === "redirect" || phase === "done" 
          ? "bg-red-50 border-red-300" 
          : cn(cfg.bg, cfg.border)
      )}>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0",
          phase === "penalty" || phase === "redirect" || phase === "done" ? "bg-red-100" : cfg.bg
        )}>
          {phase === "penalty" || phase === "redirect" || phase === "done" 
            ? <AlertTriangle className="w-6 h-6 text-red-600" />
            : cfg.emoji}
        </div>
        <div>
          <p className={cn(
            "text-base font-bold capitalize",
            phase === "penalty" || phase === "redirect" || phase === "done" ? "text-red-700" : cfg.color
          )}>
            {phase === "penalty" || phase === "redirect" || phase === "done" 
              ? "Wrong Trash Detected" 
              : `${cfg.label} Bin`}
          </p>
          <p className="text-xs text-muted-foreground">
            {phase === "success" ? "Waste successfully processed" : 
             phase === "penalty" ? "Penalty applied" :
             phase === "redirect" ? "Redirecting..." :
             phase === "done" ? "Moved to reject compartment" :
             "Smart auto-sorting bin"}
          </p>
        </div>
      </div>

      {/* Bin illustration */}
      <div className="relative flex flex-col items-center py-2">

        {/* Trash item dropping */}
        {phase === "dropping" && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 animate-bounce">
            <span className="text-3xl">{detectedWaste ? typeConfig[detectedWaste].emoji : cfg.emoji}</span>
            <ArrowDown className="w-4 h-4 text-primary animate-pulse" />
          </div>
        )}

        {/* Trash redirecting animation */}
        {phase === "redirect" && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 animate-pulse">
            <span className="text-2xl">{detectedWaste ? typeConfig[detectedWaste].emoji : cfg.emoji}</span>
            <ArrowDown className="w-4 h-4 text-red-500 animate-bounce" />
          </div>
        )}

        {/* Bin body - now with two compartments */}
        <div className={cn(
          "relative w-48 h-56 rounded-xl border-2 overflow-visible transition-all duration-300",
          phase === "penalty" || phase === "redirect" || phase === "done" 
            ? "bg-red-50 border-red-300" 
            : cn(cfg.bg, cfg.border)
        )}>
          {/* Lid */}
          <div className={cn(
            "absolute -top-3 left-2 right-2 h-5 rounded-t-lg border-2 transition-all duration-500 origin-left z-20 flex items-center justify-center",
            phase === "penalty" || phase === "redirect" || phase === "done" 
              ? "border-red-300 bg-red-50" 
              : cn(cfg.border, cfg.bg),
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

          {/* Two compartments side by side */}
          <div className="absolute inset-x-2 bottom-2 top-10 flex gap-1">
            {/* Main compartment (correct trash) */}
            <div className={cn(
              "flex-1 flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-300",
              phase === "success" 
                ? "border-green-400 bg-green-50" 
                : "border-current/10 bg-white/50"
            )}>
              <span className={cn(
                "text-3xl transition-all duration-300", 
                phase === "success" ? "scale-110" : "scale-100"
              )}>
                {cfg.emoji}
              </span>
              <span className={cn("text-[10px] font-semibold uppercase tracking-wide mt-1", cfg.color)}>
                {cfg.label}
              </span>
              {phase === "success" && (
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-1" />
              )}
            </div>

            {/* Wrong trash compartment */}
            <div className={cn(
              "w-16 flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-300",
              phase === "redirect" || phase === "done" 
                ? "border-red-400 bg-red-100" 
                : "border-dashed border-muted-foreground/20 bg-muted/30"
            )}>
              <XCircle className={cn(
                "w-5 h-5 transition-colors",
                phase === "redirect" || phase === "done" ? "text-red-600" : "text-muted-foreground/40"
              )} />
              <span className={cn(
                "text-[8px] font-medium uppercase tracking-wide mt-1 text-center leading-tight",
                phase === "redirect" || phase === "done" ? "text-red-600" : "text-muted-foreground/40"
              )}>
                Wrong
              </span>
              {(phase === "redirect" || phase === "done") && (
                <span className="text-lg mt-1">{detectedWaste ? typeConfig[detectedWaste].emoji : cfg.emoji}</span>
              )}
            </div>
          </div>

          {/* AI status pill */}
          <div className="absolute top-5 right-2 left-2 flex items-center justify-center gap-1.5">
            <span className={cn(
              "w-2 h-2 rounded-full shrink-0",
              phase === "scanning" || phase === "processing" ? "bg-primary animate-pulse" :
              phase === "success" ? "bg-green-500" :
              phase === "penalty" || phase === "redirect" || phase === "done" ? "bg-red-500" :
              "bg-muted-foreground/30"
            )} />
            <span className={cn(
              "text-[10px] font-medium",
              phase === "penalty" || phase === "redirect" || phase === "done" 
                ? "text-red-600" 
                : "text-muted-foreground"
            )}>
              {phase === "scanning"   ? "Scanning..."   :
               phase === "processing" ? "Processing..." :
               phase === "success"    ? "Done"          :
               phase === "penalty"    ? "WRONG!"        :
               phase === "redirect"   ? "Redirecting..." :
               phase === "done"       ? "Rejected"      :
               phase === "open"       ? "Ready"         : "Locked"}
            </span>
          </div>
        </div>

        {/* Points popup */}
        {showPoints && (
          <div className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold text-sm shadow-lg z-30 animate-in zoom-in slide-in-from-bottom-4",
            pointsValue > 0 
              ? "bg-primary text-primary-foreground" 
              : "bg-red-500 text-white"
          )}>
            {pointsValue > 0 ? <Sparkles className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {pointsValue > 0 ? `+${pointsValue}` : pointsValue} pts
          </div>
        )}
      </div>

      {/* Status text */}
      <p className={cn(
        "text-center text-sm leading-snug px-2",
        phase === "penalty" || phase === "redirect" || phase === "done" 
          ? "text-red-600 font-medium" 
          : "text-muted-foreground"
      )}>
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

      {phase === "penalty" && (
        <Button disabled variant="destructive" className="w-full h-12 rounded-xl text-base">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Wrong Trash Detected!
        </Button>
      )}

      {phase === "redirect" && (
        <Button disabled variant="destructive" className="w-full h-12 rounded-xl text-base">
          <ArrowDown className="w-5 h-5 mr-2 animate-bounce" />
          Redirecting to Reject...
        </Button>
      )}

      {phase === "success" && (
        <Button onClick={onDone} className="w-full h-12 rounded-xl text-base">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Done — Start Over
        </Button>
      )}

      {phase === "done" && (
        <Button onClick={onDone} variant="outline" className="w-full h-12 rounded-xl text-base border-red-300 text-red-700 hover:bg-red-50">
          <XCircle className="w-5 h-5 mr-2" />
          Done — Try Again
        </Button>
      )}
    </div>
  )
}
