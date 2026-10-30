import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    resolution: "10m Sentinel-2 Multi-Spectral (ESA Copernicus)",
    bands_analyzed: ["B03 (Green)", "B08 (NIR)", "B11 (SWIR)"],
    hotspots: [
      { lat: 12.9392, lng: 80.2195, intensity: 0.94, zone: "Pallikaranai Sector 7 Canal", delta_builtup_sqm: 14200 },
      { lat: 13.0135, lng: 80.0612, intensity: 0.88, zone: "Chembarambakkam Spillway Margin", delta_builtup_sqm: 8900 },
      { lat: 13.4210, lng: 80.3155, intensity: 0.79, zone: "Pulicat Mangrove Tidal Fringe", delta_builtup_sqm: 6200 },
      { lat: 13.0378, lng: 80.1482, intensity: 0.68, zone: "Porur Inflow Channel", delta_builtup_sqm: 3100 },
      { lat: 12.8220, lng: 80.2450, intensity: 0.55, zone: "Muttukadu Estuarine Bund", delta_builtup_sqm: 2100 }
    ],
    total_threat_score: 88.4,
    disaster_vulnerability: "SEVERE"
  });
}
