"use client"

// Pure React map using pigeon-maps (no Leaflet)
import { useState } from "react"
import { Map, Marker } from "pigeon-maps"
import { type Bin, type WasteType } from "@/contexts/app-context"

const typeColors: Record<WasteType, string> = {
  plastic: "#2563eb",
  paper:   "#ca8a04",
  metal:   "#4b5563",
  general: "#ea580c",
}

const typeLabels: Record<WasteType, string> = {
  plastic: "Plastic",
  paper:   "Paper",
  metal:   "Metal",
  general: "General",
}

// Ulaanbaatar, Mongolia
const UB_CENTER: [number, number] = [47.9184, 106.9177]

interface BinMapProps {
  bins: Bin[]
  selectedId: string | null
  onSelectBin: (bin: Bin) => void
  wasteType: WasteType
  height?: string
}

function osm(x: number, y: number, z: number) {
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
}

export function BinMap({ bins, selectedId, onSelectBin, wasteType, height = "h-72" }: BinMapProps) {
  const color = typeColors[wasteType]
  const [center, setCenter] = useState<[number, number]>(UB_CENTER)
  const [zoom, setZoom] = useState(13)

  const selectedBin = bins.find((b) => b.id === selectedId)

  return (
    <div className={`w-full ${height} relative`} style={{ borderRadius: 12, overflow: "hidden" }}>
      <Map
        provider={osm}
        center={selectedBin ? [selectedBin.lat, selectedBin.lng] : center}
        zoom={selectedBin ? 15 : zoom}
        onBoundsChanged={({ center, zoom }) => {
          setCenter(center)
          setZoom(zoom)
        }}
        attribution={
          <span style={{ fontSize: 10 }}>
            &copy;{" "}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
              OpenStreetMap
            </a>
          </span>
        }
      >
        {bins.map((bin) => {
          const isSelected = bin.id === selectedId
          const size = isSelected ? 38 : 30
          return (
            <Marker
              key={bin.id}
              anchor={[bin.lat, bin.lng]}
              width={size}
              onClick={() => onSelectBin(bin)}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
                  transform: isSelected ? "scale(1.15)" : "scale(1)",
                  transition: "transform 0.2s",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={size}
                  height={Math.round(size * 1.35)}
                  viewBox="0 0 30 40"
                >
                  <path
                    d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 25 15 25S30 25.5 30 15C30 6.716 23.284 0 15 0z"
                    fill={color}
                    stroke="white"
                    strokeWidth="2.5"
                  />
                  <circle cx="15" cy="15" r="7" fill="white" opacity="0.95" />
                </svg>
                {isSelected && (
                  <div
                    style={{
                      marginTop: 4,
                      background: color,
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 99,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {bin.name}
                  </div>
                )}
              </div>
            </Marker>
          )
        })}
      </Map>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          background: "white",
          borderRadius: 8,
          padding: "4px 10px",
          fontSize: 12,
          fontWeight: 600,
          color,
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          zIndex: 999,
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
        {typeLabels[wasteType]} Bins ({bins.length})
      </div>
    </div>
  )
}
