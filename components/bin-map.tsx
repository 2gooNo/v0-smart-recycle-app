"use client"

import { useEffect, useState } from "react"
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

// This component is always loaded via next/dynamic with ssr:false,
// so window is guaranteed to exist here. We still lazy-import react-leaflet
// to keep the bundle split clean.
export function BinMap({ bins, selectedId, onSelectBin, wasteType, height = "h-72" }: BinMapProps) {
  const [LeafletComponents, setLeafletComponents] = useState<{
    MapContainer: any
    TileLayer: any
    Marker: any
    Popup: any
    FlyController: any
  } | null>(null)

  const [leafletIcon, setLeafletIcon] = useState<((color: string, selected: boolean) => any) | null>(null)

  useEffect(() => {
    // Dynamically import both leaflet and react-leaflet only on the client
    Promise.all([
      import("leaflet"),
      import("react-leaflet"),
      import("leaflet/dist/leaflet.css" as any),
    ]).then(([L, RL]) => {
      // Fix webpack broken default icons
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const makeIcon = (color: string, selected: boolean) => {
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

      // FlyController is a child component that needs useMap from react-leaflet
      function FlyController({ bins, selectedId }: { bins: Bin[]; selectedId: string | null }) {
        const map = RL.useMap()
        useEffect(() => {
          if (!selectedId) return
          const bin = bins.find((b) => b.id === selectedId)
          if (bin) map.flyTo([bin.lat, bin.lng], 15, { duration: 0.7 })
        }, [selectedId, bins, map])
        return null
      }

      setLeafletIcon(() => makeIcon)
      setLeafletComponents({
        MapContainer: RL.MapContainer,
        TileLayer: RL.TileLayer,
        Marker: RL.Marker,
        Popup: RL.Popup,
        FlyController,
      })
    })
  }, [])

  const color = typeColors[wasteType]
  const center: [number, number] = bins.length > 0 ? [bins[0].lat, bins[0].lng] : UB_CENTER

  if (!LeafletComponents || !leafletIcon) {
    return (
      <div className={`w-full ${height} rounded-xl bg-muted animate-pulse flex items-center justify-center`}>
        <span className="text-xs text-muted-foreground">Loading map...</span>
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, Popup, FlyController } = LeafletComponents

  return (
    <div className={`w-full ${height}`} style={{ borderRadius: 12, overflow: "hidden" }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyController bins={bins} selectedId={selectedId} />
        {bins.map((bin) => (
          <Marker
            key={bin.id}
            position={[bin.lat, bin.lng]}
            icon={leafletIcon(color, bin.id === selectedId)}
            eventHandlers={{ click: () => onSelectBin(bin) }}
          >
            <Popup>
              <div style={{ fontFamily: "sans-serif", minWidth: 140 }}>
                <strong style={{ fontSize: 13 }}>{bin.name}</strong><br />
                <span style={{ fontSize: 11, color: "#6b7280" }}>{bin.address}</span><br />
                <span style={{ fontSize: 11, color, display: "block", marginTop: 2 }}>{bin.distance}m away</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
