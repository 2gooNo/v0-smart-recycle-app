"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Bin, WasteType } from "@/contexts/app-context"

const typeColors: Record<WasteType, { main: string; border: string }> = {
  plastic: { main: "#2563eb", border: "#bfdbfe" },
  paper: { main: "#ca8a04", border: "#fef08a" },
  metal: { main: "#4b5563", border: "#d1d5db" },
  general: { main: "#ea580c", border: "#fed7aa" },
}

interface BinMapProps {
  bins: Bin[]
  selectedId: string | null
  onSelectBin: (bin: Bin) => void
  wasteType: WasteType
  height?: string
}

export function BinMap({ bins, selectedId, onSelectBin, wasteType, height = "h-72" }: BinMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const leafletRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)

  // Store callbacks in refs to avoid re-initializing map
  const onSelectBinRef = useRef(onSelectBin)
  onSelectBinRef.current = onSelectBin

  const binsRef = useRef(bins)
  binsRef.current = bins

  // Initialize map only once
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return
    if (mapInstanceRef.current) return

    let cancelled = false

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return
      if (mapInstanceRef.current) return

      // Store leaflet reference
      leafletRef.current = L

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      // Center on Ulaanbaatar, Mongolia
      const center: [number, number] = [47.9184, 106.9177]

      const map = L.map(containerRef.current, {
        center,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
      setIsReady(true)
    })

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null
        leafletRef.current = null
        markersRef.current = []
        setIsReady(false)
      }
    }
  }, [])

  // Update markers when bins, selectedId, or wasteType changes
  useEffect(() => {
    if (!isReady || !mapInstanceRef.current || !leafletRef.current) return

    const L = leafletRef.current
    const map = mapInstanceRef.current
    const colors = typeColors[wasteType]

    // Clear existing markers
    markersRef.current.forEach(({ marker }) => {
      try {
        marker.remove()
      } catch (e) {
        // ignore
      }
    })
    markersRef.current = []

    const makeIcon = (selected: boolean) =>
      L.divIcon({
        html: `<div style="
          width:${selected ? 42 : 36}px;
          height:${selected ? 42 : 36}px;
          background:${colors.main};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:3px solid ${selected ? colors.border : "#fff"};
          box-shadow:0 2px ${selected ? 14 : 8}px rgba(0,0,0,${selected ? 0.4 : 0.2});
          display:flex;align-items:center;justify-content:center;
        "><span style="transform:rotate(45deg);font-size:${selected ? 16 : 14}px;line-height:1;">♻️</span></div>`,
        className: "",
        iconSize: [selected ? 42 : 36, selected ? 42 : 36],
        iconAnchor: [selected ? 21 : 18, selected ? 42 : 36],
        popupAnchor: [0, selected ? -44 : -38],
      })

    bins.forEach((bin) => {
      const isSelected = bin.id === selectedId
      const marker = L.marker([bin.lat, bin.lng], { icon: makeIcon(isSelected) })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;padding:4px 2px;min-width:140px;">
            <strong style="font-size:13px;">${bin.name}</strong><br/>
            <span style="font-size:11px;color:#6b7280;">${bin.address}</span><br/>
            <span style="font-size:11px;color:${colors.main};margin-top:2px;display:block;">${bin.distance}m away</span>
          </div>`,
          { maxWidth: 220 }
        )
        .on("click", () => onSelectBinRef.current(bin))

      markersRef.current.push({ marker, binId: bin.id })
    })
  }, [isReady, bins, selectedId, wasteType])

  // Pan to selected bin
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedId) return
    const bin = bins.find((b) => b.id === selectedId)
    if (bin) {
      mapInstanceRef.current.setView([bin.lat, bin.lng], 15, { animate: true })
    }
  }, [selectedId, bins])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin="anonymous"
      />
      <div 
        ref={containerRef} 
        className={`w-full ${height} rounded-xl overflow-hidden z-0 bg-muted`} 
      />
    </>
  )
}
