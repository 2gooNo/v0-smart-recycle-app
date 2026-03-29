"use client"

import { useState } from "react"
import { WasteDetector } from "@/components/waste-detector"
import { NearbyBins } from "@/components/nearby-bins"
import { SmartBinModal } from "@/components/smart-bin-modal"

type WasteType = "plastic" | "paper" | "metal"

export function HomeScreen() {
  const [selectedBin, setSelectedBin] = useState<WasteType | null>(null)

  return (
    <div className="space-y-4">
      {/* Welcome Message */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-foreground">Welcome!</h1>
        <p className="text-muted-foreground mt-1">Let&apos;s recycle smartly today</p>
      </div>

      {/* Waste Detector */}
      <WasteDetector />

      {/* Nearby Bins */}
      <NearbyBins onSelectBin={setSelectedBin} />

      {/* Smart Bin Modal */}
      {selectedBin && (
        <SmartBinModal
          binType={selectedBin}
          onClose={() => setSelectedBin(null)}
        />
      )}
    </div>
  )
}
