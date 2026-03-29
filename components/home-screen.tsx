"use client"

import { useState } from "react"
import { WasteDetector } from "@/components/waste-detector"
import { NearbyBins } from "@/components/nearby-bins"
import { SmartBinModal } from "@/components/smart-bin-modal"
import type { BinStation } from "@/contexts/app-context"

export function HomeScreen() {
  const [selectedStation, setSelectedStation] = useState<BinStation | null>(null)

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-foreground text-balance">Welcome!</h1>
        <p className="text-muted-foreground mt-1">Let&apos;s recycle smartly today</p>
      </div>

      <WasteDetector />

      <NearbyBins onSelectStation={setSelectedStation} />

      {selectedStation && (
        <SmartBinModal
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
        />
      )}
    </div>
  )
}
