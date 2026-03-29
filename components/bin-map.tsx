"use client"

import { useEffect, useRef } from "react"
import type { BinStation } from "@/contexts/app-context"

interface BinMapProps {
  stations: BinStation[]
  selectedId: string | null
  onSelectStation: (station: BinStation) => void
}

export function BinMap({ stations, selectedId, onSelectStation }: BinMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return
    if (mapInstanceRef.current) return // already initialized

    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icon paths broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const center: [number, number] = [stations[0]?.lat ?? 3.139, stations[0]?.lng ?? 101.6869]

      const map = L.map(mapRef.current!, {
        center,
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Create a green icon for bin stations
      const greenIcon = L.divIcon({
        html: `<div style="
          width:36px;height:36px;background:#16a34a;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;
        "><span style="transform:rotate(45deg);font-size:16px;line-height:1;display:block;text-align:center;padding-top:2px;">♻️</span></div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
      })

      const selectedIcon = L.divIcon({
        html: `<div style="
          width:42px;height:42px;background:#15803d;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);border:3px solid #bbf7d0;
          box-shadow:0 2px 12px rgba(22,163,74,0.5);display:flex;align-items:center;justify-content:center;
        "><span style="transform:rotate(45deg);font-size:18px;line-height:1;display:block;text-align:center;padding-top:2px;">♻️</span></div>`,
        className: "",
        iconSize: [42, 42],
        iconAnchor: [21, 42],
        popupAnchor: [0, -44],
      })

      stations.forEach((station) => {
        const isSelected = station.id === selectedId
        const marker = L.marker([station.lat, station.lng], {
          icon: isSelected ? selectedIcon : greenIcon,
        })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:sans-serif;padding:4px 2px;">
              <strong style="font-size:13px;">${station.name}</strong><br/>
              <span style="font-size:11px;color:#6b7280;">${station.address}</span><br/>
              <span style="font-size:11px;color:#16a34a;margin-top:2px;display:block;">${station.distance}m away</span>
            </div>`,
            { maxWidth: 200 }
          )
          .on("click", () => {
            onSelectStation(station)
          })

        markersRef.current.push(marker)
      })

      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = []
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Pan to selected station when it changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedId) return
    const station = stations.find((s) => s.id === selectedId)
    if (station) {
      mapInstanceRef.current.setView([station.lat, station.lng], 16, { animate: true })
    }
  }, [selectedId, stations])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin="anonymous"
      />
      <div ref={mapRef} className="w-full h-52 rounded-xl overflow-hidden z-0" />
    </>
  )
}
