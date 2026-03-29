import type { Bin, WasteType } from "@/contexts/app-context"

// Individual single-type bins placed across Ulaanbaatar, Mongolia
export const ALL_BINS: Bin[] = [
  // Plastic bins
  {
    id: "plastic-1",
    name: "Sukhbaatar Plastic Bin",
    address: "Sukhbaatar Square, Chingeltei",
    distance: 80,
    lat: 47.9184,
    lng: 106.9177,
    type: "plastic",
  },
  {
    id: "plastic-2",
    name: "State Dept Store Plastic",
    address: "Peace Ave 44, Chingeltei",
    distance: 210,
    lat: 47.9121,
    lng: 106.9154,
    type: "plastic",
  },
  {
    id: "plastic-3",
    name: "Naran Plaza Plastic Bin",
    address: "Naran Plaza Mall, Sukhbaatar",
    distance: 760,
    lat: 47.9231,
    lng: 106.9207,
    type: "plastic",
  },
  {
    id: "plastic-4",
    name: "Bayanzurkh Plastic Point",
    address: "4th Microdistrict",
    distance: 1200,
    lat: 47.9280,
    lng: 106.9450,
    type: "plastic",
  },
  
  // Paper bins
  {
    id: "paper-1",
    name: "Central Post Paper Bin",
    address: "Peace Ave 57, Chingeltei",
    distance: 170,
    lat: 47.9099,
    lng: 106.9163,
    type: "paper",
  },
  {
    id: "paper-2",
    name: "University Paper Station",
    address: "Ikh Toiruu 1, Sukhbaatar",
    distance: 390,
    lat: 47.9207,
    lng: 106.9255,
    type: "paper",
  },
  {
    id: "paper-3",
    name: "Gandan Area Paper Bin",
    address: "Gandan Monastery, Sukhbaatar",
    distance: 680,
    lat: 47.9208,
    lng: 106.8994,
    type: "paper",
  },
  {
    id: "paper-4",
    name: "Sansar Paper Collection",
    address: "Sansar District",
    distance: 950,
    lat: 47.9150,
    lng: 106.9400,
    type: "paper",
  },
  
  // Metal bins
  {
    id: "metal-1",
    name: "Chinggis Museum Metal Bin",
    address: "Khudaldaany Gudamj",
    distance: 530,
    lat: 47.9148,
    lng: 106.9298,
    type: "metal",
  },
  {
    id: "metal-2",
    name: "Narantuul Metal Station",
    address: "Narantuul Market, Bayanzurkh",
    distance: 950,
    lat: 47.9074,
    lng: 106.9431,
    type: "metal",
  },
  {
    id: "metal-3",
    name: "Khan-Uul Metal Point",
    address: "Khan-Uul District Center",
    distance: 1500,
    lat: 47.8850,
    lng: 106.9200,
    type: "metal",
  },
  {
    id: "metal-4",
    name: "Bayangol Metal Bin",
    address: "Bayangol District Center",
    distance: 1100,
    lat: 47.9051,
    lng: 106.8782,
    type: "metal",
  },
  
  // General waste bins
  {
    id: "general-1",
    name: "Zaisan General Waste",
    address: "Zaisan Memorial, Khan-Uul",
    distance: 1400,
    lat: 47.8803,
    lng: 106.9098,
    type: "general",
  },
  {
    id: "general-2",
    name: "Circus Area General Bin",
    address: "State Circus, Sukhbaatar",
    distance: 450,
    lat: 47.9160,
    lng: 106.9220,
    type: "general",
  },
  {
    id: "general-3",
    name: "3rd District General",
    address: "3rd Microdistrict",
    distance: 890,
    lat: 47.9100,
    lng: 106.9350,
    type: "general",
  },
  {
    id: "general-4",
    name: "Chingeltei General Bin",
    address: "Chingeltei District",
    distance: 1050,
    lat: 47.9250,
    lng: 106.9000,
    type: "general",
  },
]

// Helper to get bins filtered by waste type
export function getBinsByType(wasteType: WasteType): Bin[] {
  return ALL_BINS.filter((bin) => bin.type === wasteType).sort((a, b) => a.distance - b.distance)
}
