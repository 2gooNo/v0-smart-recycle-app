"use client"

import { useState } from "react"
import { useApp } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { X, Unlock, ScanLine, CheckCircle2, XCircle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type WasteType = "plastic" | "paper" | "metal"

const wasteEmojis: Record<WasteType, string> = {
  plastic: "🧴",
  paper: "📄",
  metal: "🔩",
}

interface SmartBinModalProps {
  binType: WasteType
  onClose: () => void
}

type BinState = "closed" | "opening" | "open" | "scanning" | "success" | "error"

export function SmartBinModal({ binType, onClose }: SmartBinModalProps) {
  const { detectedWaste, addPoints, resetDetection } = useApp()
  const [binState, setBinState] = useState<BinState>("closed")
  const [showPointsAnimation, setShowPointsAnimation] = useState(false)

  const handleOpenBin = async () => {
    setBinState("opening")
    await new Promise((resolve) => setTimeout(resolve, 800))
    setBinState("open")
  }

  const handleScanWaste = async () => {
    setBinState("scanning")
    await new Promise((resolve) => setTimeout(resolve, 1200))

    // Verify if waste type matches bin type
    if (detectedWaste === binType) {
      setBinState("success")
      addPoints(10)
      setShowPointsAnimation(true)
      setTimeout(() => setShowPointsAnimation(false), 2000)
    } else {
      setBinState("error")
    }
  }

  const handleTryAgain = () => {
    setBinState("closed")
  }

  const handleComplete = () => {
    resetDetection()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-card rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center text-3xl mb-3">
            {wasteEmojis[binType]}
          </div>
          <h2 className="text-xl font-semibold text-foreground capitalize">{binType} Bin</h2>
          <p className="text-sm text-muted-foreground mt-1">Smart Bin Station</p>
        </div>

        {/* Bin Visualization */}
        <div className="relative h-40 mb-6 flex items-center justify-center">
          <div className={cn(
            "relative w-28 h-32 rounded-xl bg-muted border-2 transition-all duration-500",
            binState === "open" || binState === "scanning" || binState === "success" || binState === "error"
              ? "border-primary"
              : "border-border"
          )}>
            {/* Bin Lid */}
            <div className={cn(
              "absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-muted-foreground/20 rounded-t-xl border-2 border-border transition-all duration-500 origin-bottom",
              (binState === "open" || binState === "scanning" || binState === "success" || binState === "error") && "-rotate-45 -translate-y-4"
            )} />
            
            {/* Bin Icon */}
            <div className="absolute inset-0 flex items-center justify-center text-4xl pt-4">
              {binState === "opening" ? (
                <div className="animate-pulse">♻️</div>
              ) : binState === "scanning" ? (
                <div className="animate-bounce">🔍</div>
              ) : binState === "success" ? (
                <div className="animate-in zoom-in">✅</div>
              ) : binState === "error" ? (
                <div className="animate-in zoom-in">❌</div>
              ) : (
                "♻️"
              )}
            </div>
          </div>

          {/* Points Animation */}
          {showPointsAnimation && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent text-accent-foreground font-semibold animate-in zoom-in slide-in-from-bottom-4">
              <Sparkles className="w-4 h-4" />
              +10 pts
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="text-center mb-6">
          {binState === "closed" && (
            <p className="text-muted-foreground">Tap to open the smart bin</p>
          )}
          {binState === "opening" && (
            <p className="text-primary animate-pulse">Opening bin...</p>
          )}
          {binState === "open" && (
            <p className="text-primary">Bin opened! Ready to scan your waste</p>
          )}
          {binState === "scanning" && (
            <p className="text-primary animate-pulse">Scanning waste...</p>
          )}
          {binState === "success" && (
            <div className="flex items-center justify-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Correct Recycling! +10 points</span>
            </div>
          )}
          {binState === "error" && (
            <div className="flex items-center justify-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Wrong Bin! Please try again</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {binState === "closed" && (
            <Button onClick={handleOpenBin} className="w-full h-12 rounded-xl text-base">
              <Unlock className="w-5 h-5 mr-2" />
              Open Bin
            </Button>
          )}
          {binState === "open" && (
            <Button onClick={handleScanWaste} className="w-full h-12 rounded-xl text-base">
              <ScanLine className="w-5 h-5 mr-2" />
              Scan Waste
            </Button>
          )}
          {binState === "success" && (
            <Button onClick={handleComplete} className="w-full h-12 rounded-xl text-base bg-success hover:bg-success/90">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Done
            </Button>
          )}
          {binState === "error" && (
            <div className="flex gap-3">
              <Button onClick={handleTryAgain} variant="outline" className="flex-1 h-12 rounded-xl">
                Try Again
              </Button>
              <Button onClick={onClose} variant="destructive" className="flex-1 h-12 rounded-xl">
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
