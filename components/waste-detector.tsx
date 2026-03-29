"use client"

import { useState, useRef } from "react"
import { useApp } from "@/contexts/app-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Scan, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type WasteType = "plastic" | "paper" | "metal"

const wasteEmojis: Record<WasteType, string> = {
  plastic: "🧴",
  paper: "📄",
  metal: "🔩",
}

const wasteLabels: Record<WasteType, string> = {
  plastic: "Plastic",
  paper: "Paper",
  metal: "Metal",
}

export function WasteDetector() {
  const { detectedWaste, setDetectedWaste } = useApp()
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const detectWasteType = (name: string): WasteType => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("bottle") || lowerName.includes("plastic")) {
      return "plastic"
    }
    if (lowerName.includes("paper") || lowerName.includes("cardboard") || lowerName.includes("document")) {
      return "paper"
    }
    return "metal"
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setDetectedWaste(null)
      setShowSuccess(false)
    }
  }

  const handleDetect = async () => {
    if (!fileName) return

    setIsDetecting(true)
    setShowSuccess(false)

    // Simulate AI detection with 1.5 second delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const wasteType = detectWasteType(fileName)
    setDetectedWaste(wasteType)
    setIsDetecting(false)
    setShowSuccess(true)

    // Hide success animation after 2 seconds
    setTimeout(() => setShowSuccess(false), 2000)
  }

  return (
    <Card className="overflow-hidden border-border/50 shadow-lg">
      <CardContent className="p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Detect Your Waste</h2>
        
        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200",
            fileName
              ? "border-primary/50 bg-primary/5"
              : "border-border hover:border-primary/30 hover:bg-muted/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
              fileName ? "bg-primary/20" : "bg-muted"
            )}>
              <Upload className={cn(
                "w-7 h-7 transition-colors",
                fileName ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            {fileName ? (
              <div>
                <p className="text-sm font-medium text-foreground">{fileName}</p>
                <p className="text-xs text-muted-foreground mt-1">Tap to change</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-foreground">Upload an image</p>
                <p className="text-xs text-muted-foreground mt-1">Take a photo of your waste item</p>
              </div>
            )}
          </div>
        </div>

        {/* Detect Button */}
        <Button
          onClick={handleDetect}
          disabled={!fileName || isDetecting}
          className="w-full mt-4 h-12 text-base font-medium rounded-xl"
        >
          {isDetecting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Scan className="w-5 h-5 mr-2" />
              Detect Waste
            </>
          )}
        </Button>

        {/* Detection Result */}
        {detectedWaste && (
          <div className={cn(
            "mt-4 p-4 rounded-2xl bg-success/10 border border-success/20 transition-all duration-300",
            showSuccess && "animate-in zoom-in-95"
          )}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-success/20 text-2xl">
                {wasteEmojis[detectedWaste]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium text-success">Detected</span>
                </div>
                <p className="text-lg font-semibold text-foreground">{wasteLabels[detectedWaste]}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
