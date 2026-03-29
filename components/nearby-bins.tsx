"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { useApp, type Bin, type WasteType } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Trash2 } from "lucide-react"
import { getBinsByType } from "@/lib/stations"
import { cn } from "@/lib/utils"

const BinMap = dynamic(() => import("@/components/bin-map").then((m) => ({ default: m.BinMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 rounded-xl bg-muted animate-pulse flex items-center justify-center">
      <MapPin className="w-6 h-6 text-muted-foreground" />
    </div>
  ),
})

const typeConfig: Record<WasteType, { label: string; color: string; bg: string; emoji: string }> = {
  plastic: { label: "Plastic", color: "text-blue-600", bg: "bg-blue-100", emoji: "🧴" },
  paper: { label: "Paper", color: "text-yellow-600", bg: "bg-yellow-100", emoji: "📄" },
  metal: { label: "Metal", color: "text-gray-600", bg: "bg-gray-200", emoji: "🔩" },
  general: { label: "General", color: "text-orange-600", bg: "bg-orange-100", emoji: "🗑️" },
}

interface NearbyBinsProps {
  onSelectBin: (bin: Bin) => void
}

export function NearbyBins({ onSelectBin }: NearbyBinsProps) {
  const { detectedWaste } = useApp()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Only show bins matching the detected waste type
  const filteredBins = detectedWaste ? getBinsByType(detectedWaste) : []
  const config = detectedWaste ? typeConfig[detectedWaste] : null

  const handlePinClick = (bin: Bin) => {
    setSelectedId(bin.id)
  }

  const handleGo = (bin: Bin) => {
    onSelectBin(bin)
  }

  if (!detectedWaste || !config) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Please detect waste first</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Hint banner */}
      <div className={cn("flex items-start gap-2 rounded-xl p-3 mb-3 shrink-0", config.bg)}>
        <Trash2 className={cn("w-4 h-4 mt-0.5 shrink-0", config.color)} />
        <p className={cn("text-sm leading-snug", config.color)}>
          Showing <strong>{config.label}</strong> bins only. Tap a pin to select, then press <strong>Go</strong>.
        </p>
      </div>

      {/* Map - shows only matching bins */}
      <div className="rounded-xl overflow-hidden shrink-0 mb-3">
        <BinMap
          bins={filteredBins}
          selectedId={selectedId}
          onSelectBin={handlePinClick}
          wasteType={detectedWaste}
          height="h-64"
        />
      </div>

      {/* Bin list - scrollable */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-2">
        {filteredBins.map((bin) => {
          const isSelected = bin.id === selectedId

          return (
            <div
              key={bin.id}
              onClick={() => handlePinClick(bin)}
              className={cn(
                "flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all duration-200",
                isSelected
                  ? cn(config.bg, "border-current ring-2 ring-current/20", config.color)
                  : "bg-card border-border/50 hover:bg-muted/50"
              )}
            >
              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg",
                  config.bg
                )}>
                  {config.emoji}
                </div>
                <div className="min-w-0">
                  <p className={cn(
                    "font-medium text-sm leading-tight truncate",
                    isSelected ? config.color : "text-foreground"
                  )}>
                    {bin.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{bin.address}</p>
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-col items-end gap-2 ml-2 shrink-0">
                <span className="text-xs text-muted-foreground">{bin.distance}m</span>
                {isSelected && (
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleGo(bin) }}
                    className="rounded-xl h-8 text-xs px-3"
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Go
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
