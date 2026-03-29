"use client"

import { useApp } from "@/contexts/app-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"

type WasteType = "plastic" | "paper" | "metal"

interface Bin {
  type: WasteType
  distance: number
  emoji: string
}

const bins: Bin[] = [
  { type: "plastic", distance: 200, emoji: "🧴" },
  { type: "paper", distance: 150, emoji: "📄" },
  { type: "metal", distance: 180, emoji: "🔩" },
]

interface NearbyBinsProps {
  onSelectBin: (binType: WasteType) => void
}

export function NearbyBins({ onSelectBin }: NearbyBinsProps) {
  const { detectedWaste, selectedBin, setSelectedBin } = useApp()

  const handleGoToBin = (binType: WasteType) => {
    setSelectedBin(binType)
    onSelectBin(binType)
  }

  if (!detectedWaste) return null

  return (
    <Card className="border-border/50 shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Nearby Bins</h2>
        </div>

        <div className="space-y-3">
          {bins.map((bin) => {
            const isMatch = bin.type === detectedWaste
            const isSelected = bin.type === selectedBin

            return (
              <div
                key={bin.type}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all duration-200",
                  isMatch
                    ? "bg-primary/10 border-primary/30"
                    : "bg-muted/30 border-border/50",
                  isSelected && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center text-xl",
                    isMatch ? "bg-primary/20" : "bg-muted"
                  )}>
                    {bin.emoji}
                  </div>
                  <div>
                    <p className={cn(
                      "font-medium capitalize",
                      isMatch ? "text-primary" : "text-foreground"
                    )}>
                      {bin.type} Bin
                    </p>
                    <p className="text-sm text-muted-foreground">{bin.distance}m away</p>
                  </div>
                </div>
                <Button
                  variant={isMatch ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGoToBin(bin.type)}
                  className="rounded-xl"
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  Go
                </Button>
              </div>
            )
          })}
        </div>

        {detectedWaste && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            💡 The <span className="font-medium text-primary">{detectedWaste} bin</span> is highlighted for you
          </p>
        )}
      </CardContent>
    </Card>
  )
}
