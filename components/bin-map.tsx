"use client"

import { useEffect, useRef } from "react"
import type { BinStation } from "@/contexts/app-context"

interface BinMapProps {
  stations: BinStation[]
  selectedId: string | null
  onSelectStation: (station: BinStation) => void
  height?: string
}

export function BinMap({ stations, selectedId, onSelectStation, height = "h-72" }: BinMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    // Clean up any existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    // Clear the container to avoid Leaflet's internal cache
    if (mapRef.current) {
      mapRef.current.innerHTML = ""
      delete (mapRef.current as any)._leaflet_id
    }
    markersRef.current = []

    import("leaflet").then((L) => {
      if (!mapRef.current) return

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      // Center on Ulaanbaatar, Mongolia
      const center: [number, number] = [47.9184, 106.9177]

      const map = L.map(mapRef.current, {
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
              <span style="font-size:11px;color:#16a34a;margin-top:2px;display:block;">${station.distance}m away • 4 compartments</span>
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
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = []
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Pan to selected station
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedId) return
    const station = stations.find((s) => s.id === selectedId)
    if (station) {
      mapInstanceRef.current.setView([station.lat, station.lng], 15, { animate: true })
    }
  }, [selectedId, stations])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin="anonymous"
      />
      <div ref={mapRef} className={`w-full ${height} rounded-xl overflow-hidden z-0`} />
    </>
  )
}
