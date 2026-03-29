"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { useApp, type BinStation, type WasteType } from "@/contexts/app-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Lazy load the map to avoid SSR issues with Leaflet
const BinMap = dynamic(() => import("@/components/bin-map").then((m) => ({ default: m.BinMap })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-52 rounded-xl bg-muted animate-pulse flex items-center justify-center">
      <MapPin className="w-6 h-6 text-muted-foreground" />
    </div>
  ),
})

const compartmentConfig: Record<WasteType, { label: string; color: string; bg: string }> = {
  plastic: { label: "Plastic", color: "text-blue-600", bg: "bg-blue-100" },
  paper:   { label: "Paper",   color: "text-yellow-600", bg: "bg-yellow-100" },
  metal:   { label: "Metal",   color: "text-gray-600",  bg: "bg-gray-100" },
  general: { label: "General", color: "text-orange-600", bg: "bg-orange-100" },
}

// Mock stations placed around Kuala Lumpur city centre
export const BIN_STATIONS: BinStation[] = [
  {
    id: "station-1",
    name: "Central Park Recycling Hub",
    address: "Jln Raja Chulan, KL",
    distance: 120,
    lat: 3.1502,
    lng: 101.7077,
    compartments: ["plastic", "paper", "metal", "general"],
  },
  {
    id: "station-2",
    name: "Bukit Bintang Eco Station",
    address: "Jln Bukit Bintang, KL",
    distance: 340,
    lat: 3.1466,
    lng: 101.7113,
    compartments: ["plastic", "paper", "metal", "general"],
  },
  {
    id: "station-3",
    name: "KLCC Green Point",
    address: "Jln Ampang, KL",
    distance: 580,
    lat: 3.1579,
    lng: 101.7116,
    compartments: ["plastic", "paper", "metal", "general"],
  },
]

interface NearbyBinsProps {
  onSelectStation: (station: BinStation) => void
}

export function NearbyBins({ onSelectStation }: NearbyBinsProps) {
  const { detectedWaste } = useApp()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)

  if (!detectedWaste) return null

  const handleSelect = (station: BinStation) => {
    setSelectedId(station.id)
    setShowMap(true)
  }

  const handleGo = (station: BinStation) => {
    setSelectedId(station.id)
    onSelectStation(station)
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Nearby Recycling Stations</h2>
          </div>
          <button
            onClick={() => setShowMap((v) => !v)}
            className="text-xs text-primary font-medium underline underline-offset-2"
          >
            {showMap ? "Hide map" : "Show map"}
          </button>
        </div>

        {/* Hint */}
        <div className="flex items-start gap-2 bg-primary/10 rounded-xl p-3 mb-4">
          <Trash2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-primary leading-snug">
            Each station has <strong>4 compartments</strong>: Plastic, Paper, Metal, General.
            Drop your <strong className="capitalize">{detectedWaste}</strong> waste in the correct compartment.
          </p>
        </div>

        {/* Map */}
        {showMap && (
          <div className="mb-4">
            <BinMap
              stations={BIN_STATIONS}
              selectedId={selectedId}
              onSelectStation={handleSelect}
            />
          </div>
        )}

        {/* Station List */}
        <div className="space-y-3">
          {BIN_STATIONS.map((station) => {
            const isSelected = station.id === selectedId

            return (
              <div
                key={station.id}
                onClick={() => handleSelect(station)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200",
                  isSelected
                    ? "bg-primary/10 border-primary/40 ring-2 ring-primary/30"
                    : "bg-muted/30 border-border/50 hover:bg-muted/60"
                )}
              >
                {/* Left */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg",
                    isSelected ? "bg-primary/20" : "bg-muted"
                  )}>
                    ♻️
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
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {station.compartments.map((c) => (
                        <span
                          key={c}
                          className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize",
                            compartmentConfig[c].bg,
                            compartmentConfig[c].color,
                            c === detectedWaste && "ring-1 ring-current"
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
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    onClick={(e) => { e.stopPropagation(); handleGo(station) }}
                    className="rounded-xl h-8 text-xs px-3"
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Go
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
