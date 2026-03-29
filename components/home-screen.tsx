"use client"

import { useState, useEffect } from "react"
import { useApp, type BinStation } from "@/contexts/app-context"
import { WasteDetector } from "@/components/waste-detector"
import { NearbyBins } from "@/components/nearby-bins"
import { SmartBinModal } from "@/components/smart-bin-modal"
import { ChevronLeft, Scan, MapPin, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = "detect" | "map" | "dispose"

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "detect", label: "Detect",  icon: Scan },
  { id: "map",    label: "Find Bin", icon: MapPin },
  { id: "dispose",label: "Dispose", icon: CheckCircle2 },
]

export function HomeScreen() {
  const { detectedWaste, resetDetection } = useApp()
  const [step, setStep] = useState<Step>("detect")
  const [direction, setDirection] = useState<"forward" | "back">("forward")
  const [visible, setVisible] = useState(true)
  const [selectedStation, setSelectedStation] = useState<BinStation | null>(null)

  // Auto-advance to map step when waste is detected
  useEffect(() => {
    if (detectedWaste && step === "detect") {
      // small delay so the result card animates first
      const t = setTimeout(() => navigateTo("map"), 900)
      return () => clearTimeout(t)
    }
  }, [detectedWaste]) // eslint-disable-line react-hooks/exhaustive-deps

  const navigateTo = (next: Step, dir: "forward" | "back" = "forward") => {
    setDirection(dir)
    setVisible(false)
    setTimeout(() => {
      setStep(next)
      setVisible(true)
    }, 220)
  }

  const handleSelectStation = (station: BinStation) => {
    setSelectedStation(station)
    navigateTo("dispose")
  }

  const handleBack = () => {
    if (step === "map") {
      resetDetection()
      navigateTo("detect", "back")
    } else if (step === "dispose") {
      setSelectedStation(null)
      navigateTo("map", "back")
    }
  }

  const handleDisposeDone = () => {
    setSelectedStation(null)
    resetDetection()
    navigateTo("detect", "back")
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === step)

  const slideClass = visible
    ? "translate-x-0 opacity-100"
    : direction === "forward"
      ? "-translate-x-6 opacity-0"
      : "translate-x-6 opacity-0"

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-5 shrink-0 px-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = s.id === step
          const isDone = i < currentStepIndex
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                isActive  && "bg-primary text-primary-foreground shadow-sm",
                isDone    && "bg-primary/20 text-primary",
                !isActive && !isDone && "text-muted-foreground"
              )}>
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-px mx-1 transition-colors duration-300",
                  isDone || isActive ? "bg-primary/40" : "bg-border"
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Back button */}
      {step !== "detect" && (
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3 shrink-0 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {/* Step content — animated slide */}
      <div
        className={cn(
          "flex-1 min-h-0 transition-all duration-200 ease-in-out",
          slideClass
        )}
      >
        {step === "detect" && (
          <div className="flex flex-col gap-4">
            <div className="text-center py-2">
              <h1 className="text-2xl font-bold text-foreground text-balance">Detect Your Waste</h1>
              <p className="text-muted-foreground mt-1 text-sm">Upload a photo and we will classify it for you</p>
            </div>
            <WasteDetector />
          </div>
        )}

        {step === "map" && (
          <div className="flex flex-col h-full min-h-0">
            <div className="mb-3 shrink-0">
              <h1 className="text-xl font-bold text-foreground text-balance">Find a Recycling Station</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Select a bin station near you in Ulaanbaatar</p>
            </div>
            <NearbyBins onSelectStation={handleSelectStation} />
          </div>
        )}

        {step === "dispose" && selectedStation && (
          <SmartBinModal
            station={selectedStation}
            onDone={handleDisposeDone}
          />
        )}
      </div>
    </div>
  )
}
