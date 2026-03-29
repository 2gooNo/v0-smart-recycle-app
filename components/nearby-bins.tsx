"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { useApp, type BinStation, type WasteType } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Trash2 } from "lucide-react"
import { BIN_STATIONS } from "@/lib/stations"
import { cn } from "@/lib/utils"

export { BIN_STATIONS }

const BinMap = dynamic(() => import("@/components/bin-map").then((m) => ({ default: m.BinMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 rounded-xl bg-muted animate-pulse flex items-center justify-center">
      <MapPin className="w-6 h-6 text-muted-foreground" />
    </div>
  ),
})

const compartmentConfig: Record<WasteType, { label: string; color: string; bg: string }> = {
  plastic: { label: "Plastic", color: "text-blue-600",   bg: "bg-blue-100" },
  paper:   { label: "Paper",   color: "text-yellow-600", bg: "bg-yellow-100" },
  metal:   { label: "Metal",   color: "text-gray-600",   bg: "bg-gray-100" },
  general: { label: "General", color: "text-orange-600", bg: "bg-orange-100" },
}

interface NearbyBinsProps {
  onSelectStation: (station: BinStation) => void
}

export function NearbyBins({ onSelectStation }: NearbyBinsProps) {
  const { detectedWaste } = useApp()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handlePinClick = (station: BinStation) => {
    setSelectedId(station.id)
  }

  const handleGo = (station: BinStation) => {
    onSelectStation(station)
  }

  const selectedStation = BIN_STATIONS.find((s) => s.id === selectedId) ?? null

  return (
    <div className="flex flex-col h-full">
      {/* Hint banner */}
      <div className="flex items-start gap-2 bg-primary/10 rounded-xl p-3 mb-3 shrink-0">
        <Trash2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-primary leading-snug">
          Each station has <strong>4 compartments</strong>. Tap a pin to select a station, then press&nbsp;
          <strong>Go</strong> to open it.
          {detectedWaste && (
            <> Your waste type is <strong className="capitalize">{detectedWaste}</strong>.</>
          )}
        </p>
      </div>

      {/* Map — always visible */}
      <div className="rounded-xl overflow-hidden shrink-0 mb-3">
        <BinMap
          stations={BIN_STATIONS}
          selectedId={selectedId}
          onSelectStation={handlePinClick}
          height="h-64"
        />
      </div>

      {/* Station list — scrollable */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-2">
        {BIN_STATIONS.map((station) => {
          const isSelected = station.id === selectedId

          return (
            <div
              key={station.id}
              onClick={() => handlePinClick(station)}
              className={cn(
                "flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all duration-200",
                isSelected
                  ? "bg-primary/10 border-primary/40 ring-2 ring-primary/20"
                  : "bg-card border-border/50 hover:bg-muted/50"
              )}
            >
              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base",
                  isSelected ? "bg-primary/20" : "bg-muted"
                )}>
                  ♻
                </div>
                <div className="min-w-0">
                  <p className={cn(
                    "font-medium text-sm leading-tight truncate",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {station.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{station.address}</p>
                  {/* Compartment badges */}
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {station.compartments.map((c) => (
                      <span
                        key={c}
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize",
                          compartmentConfig[c].bg,
                          compartmentConfig[c].color,
                          detectedWaste === c && "ring-1 ring-current"
                        )}
                      >
                        {compartmentConfig[c].label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-col items-end gap-2 ml-2 shrink-0">
                <span className="text-xs text-muted-foreground">{station.distance}m</span>
                {isSelected && (
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleGo(station) }}
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
