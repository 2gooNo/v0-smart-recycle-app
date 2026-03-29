"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { type Bin, type WasteType } from "@/contexts/app-context"

const typeColors: Record<WasteType, string> = {
  plastic: "#2563eb",
  paper:   "#ca8a04",
  metal:   "#4b5563",
  general: "#ea580c",
}

// Center on Ulaanbaatar, Mongolia
const UB_CENTER: [number, number] = [47.9184, 106.9177]

interface BinMapProps {
  bins: Bin[]
  selectedId: string | null
  onSelectBin: (bin: Bin) => void
  wasteType: WasteType
  height?: string
}

export function BinMap({ bins, selectedId, onSelectBin, wasteType, height = "h-72" }: BinMapProps) {
  // Use a unique ID per component instance to avoid Leaflet's internal caching
  const [instanceId] = useState(() => `map-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [ready, setReady] = useState(false)
  const leafletRef = useRef<any>(null)
  const initializingRef = useRef(false)

  const color = typeColors[wasteType]

  // Stable callback refs to avoid stale closures
  const binsRef = useRef(bins)
  const onSelectBinRef = useRef(onSelectBin)
  binsRef.current = bins
  onSelectBinRef.current = onSelectBin

  // Initialize map once
  useEffect(() => {
    const container = document.getElementById(instanceId)
    if (!container || initializingRef.current) return
    
    initializingRef.current = true
    let cancelled = false

    Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css" as any),
    ]).then(([L]) => {
      if (cancelled) {
        initializingRef.current = false
        return
      }

      const currentContainer = document.getElementById(instanceId)
      if (!currentContainer) {
        initializingRef.current = false
        return
      }
      
      // Clear any existing map on this container
      if ((currentContainer as any)._leaflet_id) {
        // Container already has a map, skip
        initializingRef.current = false
        return
      }

      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      leafletRef.current = L

      const map = L.map(currentContainer, {
        center: UB_CENTER,
        zoom: 13,
        scrollWheelZoom: false,
        zoomControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      mapInstanceRef.current = map
      setReady(true)
      initializingRef.current = false
    })

    return () => {
      cancelled = true
      initializingRef.current = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      markersRef.current = []
      setReady(false)
    }
  }, [instanceId]) // Only run once per instance

  // Update markers when bins or selection changes
  useEffect(() => {
    if (!ready || !mapInstanceRef.current || !leafletRef.current) return

    const L = leafletRef.current
    const map = mapInstanceRef.current

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Create icon factory
    const makeIcon = (selected: boolean) => {
      const size = selected ? 38 : 30
      const svg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size*1.35)}" viewBox="0 0 30 40">` +
        `<path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 25 15 25S30 25.5 30 15C30 6.716 23.284 0 15 0z" fill="${color}" stroke="white" stroke-width="2.5"/>` +
        `<circle cx="15" cy="15" r="7" fill="white" opacity="0.95"/>` +
        `</svg>`
      )
      return L.divIcon({
        className: "",
        html: `<img src="data:image/svg+xml,${svg}" style="width:${size}px;height:${Math.round(size*1.35)}px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />`,
        iconSize: [size, Math.round(size * 1.35)],
        iconAnchor: [size / 2, Math.round(size * 1.35)],
        popupAnchor: [0, -Math.round(size * 1.35)],
      })
    }

    // Add markers for each bin
    binsRef.current.forEach((bin) => {
      const isSelected = bin.id === selectedId
      const marker = L.marker([bin.lat, bin.lng], { icon: makeIcon(isSelected) })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;min-width:140px">` +
          `<strong style="font-size:13px">${bin.name}</strong><br/>` +
          `<span style="font-size:11px;color:#6b7280">${bin.address}</span><br/>` +
          `<span style="font-size:11px;color:${color};display:block;margin-top:2px">${bin.distance}m away</span>` +
          `</div>`
        )
        .on("click", () => onSelectBinRef.current(bin))

      markersRef.current.push(marker)
    })

    // Fly to selected bin
    if (selectedId) {
      const bin = binsRef.current.find((b) => b.id === selectedId)
      if (bin) {
        map.flyTo([bin.lat, bin.lng], 15, { duration: 0.5 })
      }
    }
  }, [ready, bins, selectedId, color])

  return (
    <div className={`w-full ${height} relative`} style={{ borderRadius: 12, overflow: "hidden" }}>
      <div
        id={instanceId}
        style={{ width: "100%", height: "100%" }}
        className={!ready ? "bg-muted animate-pulse" : ""}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Loading map...</span>
        </div>
      )}
    </div>
  )
}
