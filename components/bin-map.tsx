"use client"

import { useEffect, useRef, useId, useState } from "react"
import type { BinStation } from "@/contexts/app-context"

interface BinMapProps {
  stations: BinStation[]
  selectedId: string | null
  onSelectStation: (station: BinStation) => void
  height?: string
}

export function BinMap({ stations, selectedId, onSelectStation, height = "h-72" }: BinMapProps) {
  const uniqueId = useId()
  const containerId = `leaflet-map-${uniqueId.replace(/:/g, "-")}`
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const initRef = useRef(false)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    // Prevent double initialization in StrictMode
    if (initRef.current) return
    
    const container = document.getElementById(containerId)
    if (!container) return

    // Check if container already has a map
    if ((container as any)._leaflet_id) {
      return
    }

    initRef.current = true

    import("leaflet").then((L) => {
      const currentContainer = document.getElementById(containerId)
      if (!currentContainer || (currentContainer as any)._leaflet_id) return

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      // Center on Ulaanbaatar, Mongolia
      const center: [number, number] = [47.9184, 106.9177]

      const map = L.map(currentContainer, {
        center,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const makeIcon = (selected: boolean) =>
        L.divIcon({
          html: `<div style="
            width:${selected ? 42 : 36}px;
            height:${selected ? 42 : 36}px;
            background:${selected ? "#15803d" : "#16a34a"};
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:3px solid ${selected ? "#bbf7d0" : "#fff"};
            box-shadow:0 2px ${selected ? 14 : 8}px rgba(22,163,74,${selected ? 0.6 : 0.3});
            display:flex;align-items:center;justify-content:center;
          "><span style="transform:rotate(45deg);font-size:${selected ? 18 : 15}px;line-height:1;display:block;text-align:center;padding-top:2px;">♻️</span></div>`,
          className: "",
          iconSize: [selected ? 42 : 36, selected ? 42 : 36],
          iconAnchor: [selected ? 21 : 18, selected ? 42 : 36],
          popupAnchor: [0, selected ? -44 : -38],
        })

      stations.forEach((station) => {
        const isSelected = station.id === selectedId
        const marker = L.marker([station.lat, station.lng], { icon: makeIcon(isSelected) })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:sans-serif;padding:4px 2px;min-width:160px;">
              <strong style="font-size:13px;">${station.name}</strong><br/>
              <span style="font-size:11px;color:#6b7280;">${station.address}</span><br/>
              <span style="font-size:11px;color:#16a34a;margin-top:2px;display:block;">${station.distance}m away</span>
            </div>`,
            { maxWidth: 220 }
          )
          .on("click", () => onSelectStation(station))

        markersRef.current.push({ marker, stationId: station.id })
      })

      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (e) {
          // ignore cleanup errors
        }
        mapInstanceRef.current = null
        markersRef.current = []
        initRef.current = false
      }
    }
  }, [isClient, containerId, stations, selectedId, onSelectStation])

  // Pan to selected station
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedId) return
    const station = stations.find((s) => s.id === selectedId)
    if (station) {
      mapInstanceRef.current.setView([station.lat, station.lng], 15, { animate: true })
    }
  }, [selectedId, stations])

  if (!isClient) {
    return <div className={`w-full ${height} rounded-xl bg-muted animate-pulse`} />
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin="anonymous"
      />
      <div id={containerId} className={`w-full ${height} rounded-xl overflow-hidden z-0`} />
    </>
  )
}
