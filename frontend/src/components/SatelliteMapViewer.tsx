"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Waterbody, EncroachmentAlertItem, CitizenComplaintItem } from "./types";
import {
  Layers,
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Eye,
  Compass,
  Download,
  AlertTriangle,
  Waves,
  Map as MapIcon,
  Globe,
  Mountain
} from "lucide-react";

interface SatelliteMapViewerProps {
  waterbodies: Waterbody[];
  selectedWaterbody: Waterbody;
  onSelectWaterbody: (wb: Waterbody) => void;
  alerts?: EncroachmentAlertItem[];
  complaints?: CitizenComplaintItem[];
}

// Complete Tamil Nadu Coastline Coordinates (Coromandel Coast from Pulicat to Kanniyakumari)
const TAMIL_NADU_COASTLINE: [number, number][] = [
  [13.550, 80.200], // Pulicat North
  [13.418, 80.312], // Pulicat Lagoon
  [13.260, 80.330], // Ennore Port
  [13.082, 80.298], // Chennai Harbor
  [13.054, 80.285], // Marina Beach
  [13.001, 80.273], // Besant Nagar
  [12.822, 80.245], // Muttukadu / Kovalam
  [12.510, 80.160], // Mahabalipuram
  [12.250, 80.010], // Sadras / Kalpakkam
  [12.000, 79.860], // Marakkanam
  [11.750, 79.770], // Cuddalore
  [11.428, 79.791], // Pichavaram Mangroves
  [11.150, 79.850], // Karaikal
  [10.760, 79.840], // Nagapattinam
  [10.280, 79.860], // Point Calimere (Kodiakkarai)
  [10.350, 79.350], // Muthupet Lagoon
  [9.900, 79.100],  // Manamelkudi
  [9.280, 79.130],  // Ramanathapuram Coast
  [9.288, 79.313],  // Rameswaram
  [9.150, 78.950],  // Mandapam
  [8.800, 78.160],  // Tuticorin (Thoothukudi)
  [8.500, 78.120],  // Tiruchendur
  [8.180, 77.700],  // Kudankulam
  [8.078, 77.541],  // Kanniyakumari (Cape Comorin - Southern Tip)
];

// Major Tamil Nadu waterbodies data with coordinates
const ALL_TN_WATERBODIES = [
  {
    id: "WB-PALLIKARANAI",
    name: "Pallikaranai Marshland",
    district: "Chengalpattu",
    coordinates: [12.936, 80.218] as [number, number],
    type: "Freshwater Marsh (Ramsar)",
    area: "50.0 km²",
    loss: "31.1%",
    status: "CRITICAL_ALERT"
  },
  {
    id: "WB-CHEMBARAMBAKKAM",
    name: "Chembarambakkam Lake",
    district: "Kancheepuram",
    coordinates: [13.011, 80.057] as [number, number],
    type: "Reservoir",
    area: "15.8 km²",
    loss: "9.7%",
    status: "CRITICAL_ALERT"
  },
  {
    id: "WB-PULICAT",
    name: "Pulicat Lagoon",
    district: "Tiruvallur",
    coordinates: [13.418, 80.312] as [number, number],
    type: "Coastal Lagoon",
    area: "461.2 km²",
    loss: "4.1%",
    status: "HIGH_VULNERABILITY"
  },
  {
    id: "WB-PORUR",
    name: "Porur Lake",
    district: "Chennai",
    coordinates: [13.038, 80.149] as [number, number],
    type: "Urban Lake",
    area: "3.2 km²",
    loss: "17.9%",
    status: "HIGH_VULNERABILITY"
  },
  {
    id: "WB-MUTTUKADU",
    name: "Muttukadu Backwater",
    district: "Chengalpattu",
    coordinates: [12.822, 80.245] as [number, number],
    type: "Coastal Backwater",
    area: "8.4 km²",
    loss: "8.3%",
    status: "MONITORED"
  },
  {
    id: "WB-REDHILLS",
    name: "Red Hills Lake (Puzhal)",
    district: "Tiruvallur",
    coordinates: [13.193, 80.181] as [number, number],
    type: "Drinking Water Reservoir",
    area: "18.0 km²",
    loss: "12.4%",
    status: "MONITORED"
  },
  {
    id: "WB-VEERANAM",
    name: "Veeranam Lake",
    district: "Cuddalore",
    coordinates: [11.332, 79.544] as [number, number],
    type: "Historical Reservoir (Chola)",
    area: "25.0 km²",
    loss: "15.2%",
    status: "HIGH_VULNERABILITY"
  },
  {
    id: "WB-PICHAVARAM",
    name: "Pichavaram Mangrove Wetland",
    district: "Cuddalore",
    coordinates: [11.428, 79.791] as [number, number],
    type: "Tidal Mangrove Forest",
    area: "11.0 km²",
    loss: "6.8%",
    status: "MONITORED"
  },
  {
    id: "WB-METTUR",
    name: "Stanley Reservoir (Mettur Dam)",
    district: "Salem",
    coordinates: [11.802, 77.801] as [number, number],
    type: "Major River Reservoir",
    area: "153.4 km²",
    loss: "5.5%",
    status: "HEALTHY"
  },
  {
    id: "WB-SINGANALLUR",
    name: "Singanallur Lake",
    district: "Coimbatore",
    coordinates: [10.993, 77.014] as [number, number],
    type: "Biodiversity Wetland",
    area: "1.15 km²",
    loss: "22.0%",
    status: "HIGH_VULNERABILITY"
  },
  {
    id: "WB-VAIGAI",
    name: "Vaigai Dam & Reservoir",
    district: "Theni",
    coordinates: [10.053, 77.591] as [number, number],
    type: "Basin Catchment",
    area: "18.5 km²",
    loss: "11.8%",
    status: "MONITORED"
  }
];

export const SatelliteMapViewer: React.FC<SatelliteMapViewerProps> = ({
  waterbodies,
  selectedWaterbody,
  onSelectWaterbody,
  alerts = [],
  complaints = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletLibRef = useRef<any>(null);

  // Basemap tile layers refs
  const baseTileLayerRef = useRef<any>(null);
  const labelsLayerRef = useRef<any>(null);
  const ndwiTileLayerRef = useRef<any>(null);
  const coastlineLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const hotspotsLayerRef = useRef<any>(null);
  const complaintsLayerRef = useRef<any>(null);

  // Layer switches & basemap mode (Google Maps style: satellite | street | terrain)
  const [mapMode, setMapMode] = useState<"satellite" | "street" | "terrain">("satellite");
  const [showCoastline, setShowCoastline] = useState(true);
  const [showNdwiOverlay, setShowNdwiOverlay] = useState(true);
  const [showAlertHotspots, setShowAlertHotspots] = useState(true);
  const [showComplaints, setShowComplaints] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [mapExtent, setMapExtent] = useState<"tn_state" | "basin_zoom">("basin_zoom");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // 1. Initialize Leaflet map ONCE on mount for butter-smooth 60fps performance
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;
    const container = mapContainerRef.current;
    let handleWheel: ((e: WheelEvent) => void) | null = null;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      leafletLibRef.current = L;

      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Initialize map with GPU canvas acceleration & disabled scrollWheelZoom to prevent accidental zooming while scrolling page
      const initialCenter = selectedWaterbody?.coordinates || [12.936, 80.218];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 11,
        minZoom: 6,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true, // GPU acceleration for ultra-smooth panning
        scrollWheelZoom: false, // Prevents intercepting page scroll!
      });

      // Google Maps style gesture handling: Ctrl+Scroll to zoom, normal scroll scrolls the page
      handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (e.deltaY < 0) {
            map.zoomIn(1);
          } else if (e.deltaY > 0) {
            map.zoomOut(1);
          }
        }
      };
      container.addEventListener("wheel", handleWheel, { passive: false });

      mapInstanceRef.current = map;

      // 1. Add Default Basemap (Esri Satellite)
      const satelliteUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      const baseTile = L.tileLayer(satelliteUrl, {
        maxZoom: 19,
        attribution: "Esri World Imagery, Sentinel-2 MSI",
      }).addTo(map);
      baseTileLayerRef.current = baseTile;

      // Labels layer (CartoDB Positron Only Labels / Esri Boundaries)
      const labelsTile = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, opacity: 0.85 }
      ).addTo(map);
      labelsLayerRef.current = labelsTile;

      // 2. Add NDWI Spectral Tile Layer
      try {
        const ndwiTile = L.tileLayer("http://localhost:8001/api/tiles/{z}/{x}/{y}.png", {
          maxZoom: 18,
          opacity: 0.7,
          zIndex: 5,
        }).addTo(map);
        ndwiTileLayerRef.current = ndwiTile;
      } catch (e) {
        console.warn("NDWI tile server fallback", e);
      }

      // 3. Coastline Layer Group
      const coastGroup = L.layerGroup().addTo(map);
      coastlineLayerRef.current = coastGroup;
      L.polyline(TAMIL_NADU_COASTLINE, {
        color: "#00e5ff",
        weight: 6,
        opacity: 0.45,
        lineCap: "round",
      }).addTo(coastGroup);
      const mainCoast = L.polyline(TAMIL_NADU_COASTLINE, {
        color: "#00ffff",
        weight: 2.8,
        opacity: 0.95,
      }).addTo(coastGroup);
      mainCoast.bindTooltip("Tamil Nadu Coastline (~1,076 km Coromandel Coast)", {
        sticky: true,
      });

      // 4. Hotspots Layer Group
      const hotGroup = L.layerGroup().addTo(map);
      hotspotsLayerRef.current = hotGroup;
      const hotspots = [
        { lat: 12.9392, lon: 80.2195, name: "Pallikaranai South Canal Fill", breach: "12.4m into High-Water Line" },
        { lat: 13.0135, lon: 80.0612, name: "Chembarambakkam Industrial Sheds", breach: "18.0m into Inundation Zone" },
        { lat: 13.0378, lon: 80.1482, name: "Porur Bypass Encroachment", breach: "25.0m past Government Pillar" },
        { lat: 13.4210, lon: 80.3155, name: "Pulicat Mangrove Fringe Bunding", breach: "Illegal Aquaculture Silt Bund" },
      ];
      hotspots.forEach((spot) => {
        L.circle([spot.lat, spot.lon], {
          radius: 350,
          color: "#ff2222",
          fillColor: "#ff2222",
          fillOpacity: 0.55,
          weight: 2,
        })
          .addTo(hotGroup)
          .bindTooltip(`🚨 <strong>CRITICAL BREACH:</strong> ${spot.name}<br/>${spot.breach}`, {
            sticky: true,
          });
      });

      // 5. Markers Layer Group
      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      // 6. Anonymous Complaints Spatial Layer Group
      const complaintsGroup = L.layerGroup().addTo(map);
      complaintsLayerRef.current = complaintsGroup;

      setIsMapReady(true);
    });

    return () => {
      isMounted = false;
      if (container && handleWheel) {
        container.removeEventListener("wheel", handleWheel);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Smoothly update Markers when waterbodies, selectedWaterbody or mapMode changes
  useEffect(() => {
    const L = leafletLibRef.current;
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!L || !map || !markersGroup) return;

    markersGroup.clearLayers();

    ALL_TN_WATERBODIES.forEach((wb) => {
      const isSelected = selectedWaterbody?.id === wb.id;
      
      // Determine color according to status (Matching user screenshot legend: Blue=Waterbody, Red=Encroachment, Orange=Assigned, Green=Resolved)
      let pinColor = "#0284c7"; // Blue (Waterbody default)
      if (wb.status === "CRITICAL_ALERT") pinColor = "#ef4444"; // Red (AI Detected Encroachment)
      else if (wb.status === "HIGH_VULNERABILITY") pinColor = "#f97316"; // Orange (Assigned Complaint)
      else if (wb.status === "MONITORED" || wb.status === "HEALTHY") pinColor = "#10b981"; // Green (Resolved / Protected)

      // SVG Custom Marker Icon matching Google Maps / user screenshot
      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; cursor: pointer;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: ${pinColor}33; animation: pulse 2s infinite;"></div>
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: ${pinColor}; border: 2.5px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></span>
          </div>
          ${isSelected ? `<div style="position: absolute; top: -14px; background: #00ffff; color: #000000; font-family: monospace; font-size: 9px; font-weight: bold; padding: 1px 5px; border-radius: 3px; white-space: nowrap; box-shadow: 0 1px 4px rgba(0,0,0,0.5);">TARGET</div>` : ""}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-wb-marker",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker(wb.coordinates, { icon: customIcon }).addTo(markersGroup);

      marker.on("click", () => {
        const matched = waterbodies.find((w) => w.id === wb.id) || {
          ...selectedWaterbody,
          id: wb.id,
          name: wb.name,
          district: wb.district,
          coordinates: wb.coordinates,
        };
        onSelectWaterbody(matched as Waterbody);
        map.flyTo(wb.coordinates, 12, { duration: 1.0, easeLinearity: 0.25 });
      });

      // Rich interactive popup
      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; min-width: 220px; color: #1e293b;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <strong style="font-size: 13px; color: #0f172a;">${wb.name}</strong>
            <span style="font-size: 10px; font-family: monospace; padding: 2px 6px; border-radius: 4px; background: ${pinColor}22; color: ${pinColor}; font-weight: bold;">${wb.status}</span>
          </div>
          <div style="font-size: 11px; line-height: 1.6; color: #475569;">
            <div><strong>District:</strong> ${wb.district}</div>
            <div><strong>Type:</strong> ${wb.type}</div>
            <div><strong>Spread:</strong> ${wb.area}</div>
            <div><strong>Encroachment Loss:</strong> <span style="color: #ef4444; font-weight: bold;">-${wb.loss}</span></div>
          </div>
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0; display: flex; gap: 6px;">
            <a href="http://localhost:8001/api/reports/eviction-notice/${wb.id}" target="_blank" style="display: inline-block; flex: 1; text-align: center; background: #dc2626; color: #ffffff; text-decoration: none; padding: 5px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; font-family: monospace;">
              PDF Eviction Pack
            </a>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent);

      // Buffer ring
      L.circle(wb.coordinates, {
        radius: wb.id === "WB-PALLIKARANAI" ? 2200 : wb.id === "WB-CHEMBARAMBAKKAM" ? 2800 : 1500,
        color: mapMode === "street" ? "#0284c7" : "#00e5ff",
        fillColor: mapMode === "street" ? "#0284c7" : "#00e5ff",
        fillOpacity: 0.14,
        weight: 1.5,
        dashArray: "4, 4",
      }).addTo(markersGroup);
    });
  }, [isMapReady, selectedWaterbody, waterbodies, mapMode, onSelectWaterbody]);

  // 2b. Render Anonymous Citizen Complaints connected to backend spatial map structure
  useEffect(() => {
    const L = leafletLibRef.current;
    const map = mapInstanceRef.current;
    const complaintsGroup = complaintsLayerRef.current;
    if (!L || !map || !complaintsGroup) return;

    complaintsGroup.clearLayers();
    if (!showComplaints) return;

    complaints.forEach((c) => {
      if (!c.latitude || !c.longitude || c.isDeleted) return;

      const anonId = c.anonymousId || `ANON-CTZ-${c.id.slice(-4)}`;
      const isVerified = c.satelliteCrosscheckStatus === "VERIFIED_ANOMALY";
      const pinColor = isVerified ? "#d97706" : "#f59e0b";

      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; cursor: pointer;">
          <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: ${pinColor}33; animation: pulse 2.2s infinite;"></div>
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: ${pinColor}; border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
            <svg style="width: 12px; height: 12px; color: #ffffff;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div style="position: absolute; top: -14px; background: #1e293b; color: #fde68a; border: 1px solid #f59e0b88; font-family: monospace; font-size: 8.5px; font-weight: bold; padding: 1px 5px; border-radius: 3px; white-space: nowrap; box-shadow: 0 1px 4px rgba(0,0,0,0.6);">
            ${anonId}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-complaint-pin",
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([c.latitude, c.longitude], { icon: customIcon }).addTo(complaintsGroup);

      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 11.5px; min-width: 230px; color: #0f172a; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 6px;">
            <span style="background: #fef3c7; color: #b45309; font-family: monospace; font-weight: bold; font-size: 11px; padding: 2px 6px; border-radius: 4px; border: 1px solid #fde68a;">
              🛡️ ${anonId}
            </span>
            <span style="font-size: 10px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 1px 6px; border-radius: 3px;">
              ${c.status}
            </span>
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${c.waterbodyName}</div>
          <div style="color: #475569; font-size: 11px; margin-top: 2px;">Survey Plot: <strong>${c.surveyNumber}</strong> · ${c.cityZone}</div>
          <div style="color: #64748b; font-size: 11px; margin-top: 4px; line-height: 1.4;">
            "${c.description.slice(0, 110)}..."
          </div>
          <div style="margin-top: 8px; padding: 6px 8px; background: #f8fafc; border-radius: 6px; font-size: 10.5px; color: #334155; border: 1px solid #e2e8f0;">
            <div style="color: #b45309; font-weight: bold;">🛡️ Whistleblower Safeguard Active</div>
            <div style="color: #64748b; font-size: 9.5px; margin-top: 1px;">Officer and citizen only share Case Token: <strong>${anonId}</strong>. Citizen's identity and phone are strictly masked.</div>
          </div>
          <div style="margin-top: 8px; display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #059669; font-weight: bold;">
            <span>🛰️ ${c.satelliteCrosscheckStatus}</span>
            <span style="color: #64748b; font-weight: normal; font-family: monospace;">${c.submittedDate || "Recent"}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.bindTooltip(`🛡️ Grievance ${anonId}: ${c.waterbodyName} (${c.surveyNumber})`, { sticky: true });
    });
  }, [isMapReady, complaints, showComplaints]);

  // 3. Smooth flyTo camera animation when target waterbody changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedWaterbody) return;
    mapInstanceRef.current.flyTo(selectedWaterbody.coordinates, 12, {
      duration: 1.0,
      easeLinearity: 0.25,
    });
  }, [selectedWaterbody]);

  // 4. Instant Basemap Switch (Google Maps style: Satellite vs Street vs Terrain)
  const handleSwitchMapMode = (mode: "satellite" | "street" | "terrain") => {
    setMapMode(mode);
    if (!baseTileLayerRef.current) return;

    if (mode === "street") {
      // OpenStreetMap Standard (Roadmap / Street view as in user screenshot)
      baseTileLayerRef.current.setUrl("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
      if (labelsLayerRef.current) labelsLayerRef.current.setOpacity(0);
    } else if (mode === "terrain") {
      // Topographic Terrain View
      baseTileLayerRef.current.setUrl("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png");
      if (labelsLayerRef.current) labelsLayerRef.current.setOpacity(0);
    } else {
      // Satellite Earth View (Esri World Imagery)
      baseTileLayerRef.current.setUrl("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}");
      if (labelsLayerRef.current) labelsLayerRef.current.setOpacity(showLabels ? 0.85 : 0);
    }
  };

  // Toggle Coastline Layer
  const handleToggleCoastline = () => {
    const next = !showCoastline;
    setShowCoastline(next);
    if (!mapInstanceRef.current || !coastlineLayerRef.current) return;
    if (next) {
      mapInstanceRef.current.addLayer(coastlineLayerRef.current);
    } else {
      mapInstanceRef.current.removeLayer(coastlineLayerRef.current);
    }
  };

  // Toggle NDWI Overlay
  const handleToggleNdwi = () => {
    const next = !showNdwiOverlay;
    setShowNdwiOverlay(next);
    if (!mapInstanceRef.current || !ndwiTileLayerRef.current) return;
    if (next) {
      mapInstanceRef.current.addLayer(ndwiTileLayerRef.current);
    } else {
      mapInstanceRef.current.removeLayer(ndwiTileLayerRef.current);
    }
  };

  // Toggle Hotspots Layer
  const handleToggleHotspots = () => {
    const next = !showAlertHotspots;
    setShowAlertHotspots(next);
    if (!mapInstanceRef.current || !hotspotsLayerRef.current) return;
    if (next) {
      mapInstanceRef.current.addLayer(hotspotsLayerRef.current);
    } else {
      mapInstanceRef.current.removeLayer(hotspotsLayerRef.current);
    }
  };

  // Toggle State/Basin Extents
  const handleSetExtent = (extent: "tn_state" | "basin_zoom") => {
    setMapExtent(extent);
    if (!mapInstanceRef.current) return;
    if (extent === "tn_state") {
      mapInstanceRef.current.flyTo([11.127, 78.656], 7, { duration: 1.2 });
    } else {
      mapInstanceRef.current.flyTo(selectedWaterbody.coordinates, 12, { duration: 1.0 });
    }
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-[500] bg-black p-4" : ""}`}>
      {/* Main Map Container with Professional GIS Frame */}
      <div className="relative rounded-[14px] overflow-hidden border-2 border-[#1e293b] shadow-2xl bg-[#030712] theme-surface">
        
        {/* GIS Lat/Lon Neatline Border Frame (Only displayed in Satellite Mode) */}
        {mapMode === "satellite" && (
          <>
            <div className="absolute top-0 left-0 right-0 z-20 h-6 bg-[#090d16] border-b border-[#334155] flex items-center justify-between px-8 text-[10px] font-mono-val text-[#94a3b8] pointer-events-none select-none">
              <span>78°E</span>
              <span>79°E</span>
              <span className="text-[#00ffff] font-bold">80°E (Chennai / Coromandel Meridian)</span>
              <span>81°E</span>
              <span>82°E</span>
            </div>

            <div className="absolute top-6 bottom-6 left-0 z-20 w-6 bg-[#090d16] border-r border-[#334155] flex flex-col justify-between py-6 text-[9px] font-mono-val text-[#94a3b8] items-center pointer-events-none select-none">
              <span>14°N</span>
              <span className="text-[#00ffff] font-bold">13°N</span>
              <span>12°N</span>
              <span>11°N</span>
              <span>10°N</span>
              <span>9°N</span>
              <span>8°N</span>
            </div>

            <div className="absolute top-6 bottom-6 right-0 z-20 w-6 bg-[#090d16] border-l border-[#334155] flex flex-col justify-between py-6 text-[9px] font-mono-val text-[#94a3b8] items-center pointer-events-none select-none">
              <span>14°N</span>
              <span>13°N</span>
              <span>12°N</span>
              <span>11°N</span>
              <span>10°N</span>
              <span>9°N</span>
              <span>8°N</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 h-6 bg-[#090d16] border-t border-[#334155] flex items-center justify-between px-8 text-[10px] font-mono-val text-[#94a3b8] pointer-events-none select-none">
              <span>78°E</span>
              <span>79°E</span>
              <span className="text-[#00ffff] font-bold">TAMIL NADU SATELLITE SENTINEL · WGS84</span>
              <span>81°E</span>
              <span>82°E</span>
            </div>
          </>
        )}

        {/* Interactive Leaflet Map Div */}
        <div
          ref={mapContainerRef}
          className="w-full h-[620px] lg:h-[700px] z-10"
          style={{ background: mapMode === "street" ? "#e5e7eb" : "#0b1528" }}
        />

        {/* ─────────────────────────────────────────────────────────────
            GOOGLE MAPS STYLE BASEMAP SWITCHER (Top-Right Floating Panel)
           ───────────────────────────────────────────────────────────── */}
        <div className="absolute top-8 left-8 z-30 flex items-center gap-1.5 p-1.5 rounded-[10px] bg-[#090d16]/90 backdrop-blur-md border border-[#334155] shadow-2xl text-xs font-mono-val">
          <button
            onClick={() => handleSwitchMapMode("satellite")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-all font-semibold ${
              mapMode === "satellite"
                ? "bg-[#00ffff] text-black shadow-[0_0_10px_#00ffff]"
                : "text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>

          <button
            onClick={() => handleSwitchMapMode("street")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-all font-semibold ${
              mapMode === "street"
                ? "bg-[#0284c7] text-white shadow-md font-bold"
                : "text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map (Street)</span>
          </button>

          <button
            onClick={() => handleSwitchMapMode("terrain")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-all font-semibold ${
              mapMode === "terrain"
                ? "bg-[#10b981] text-white shadow-md font-bold"
                : "text-[#cbd5e1] hover:text-white hover:bg-[#1e293b]"
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>Terrain</span>
          </button>
        </div>

        {/* Inset World/Regional Locator Map (Top-Left corner under Basemap switch) */}
        {mapMode === "satellite" && (
          <div className="absolute top-20 left-8 z-30 w-36 sm:w-44 p-1.5 rounded-[8px] bg-[#090d16]/90 backdrop-blur-md border border-[#334155] shadow-lg pointer-events-none hidden sm:block">
            <div className="text-[9px] font-mono-val text-[#94a3b8] font-bold mb-1 flex items-center justify-between">
              <span>REGIONAL LOCATOR</span>
              <span className="text-[#00ffff]">INDIA / TN</span>
            </div>
            <div className="relative h-20 w-full rounded-[4px] overflow-hidden bg-[#020b18] border border-[#1e293b]">
              <svg viewBox="0 0 100 80" className="w-full h-full opacity-80">
                <path
                  d="M 10 10 L 90 10 L 85 40 L 70 55 L 55 75 L 45 75 L 35 55 L 20 40 Z"
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <rect x="42" y="48" width="18" height="24" fill="#00ffff33" stroke="#00ffff" strokeWidth="1.5" />
              </svg>
              <div className="absolute bottom-1 right-1 text-[8px] font-mono-val text-[#00ffff] font-bold">
                AOI BOX
              </div>
            </div>
          </div>
        )}

        {/* Ocean Text Watermarks on Satellite View */}
        {mapMode === "satellite" && (
          <>
            <div className="absolute top-1/2 right-12 z-20 pointer-events-none select-none opacity-40 text-sm md:text-base font-serif italic text-[#60a5fa] tracking-widest">
              Bay of Bengal
            </div>
            <div className="absolute bottom-10 right-28 z-20 pointer-events-none select-none opacity-40 text-xs md:text-sm font-serif italic text-[#60a5fa] tracking-widest">
              Gulf of Mannar
            </div>
          </>
        )}

        {/* Map On-Screen Controls (Zoom, Extent, Fullscreen) */}
        <div className="absolute top-8 right-8 z-30 flex flex-col gap-1.5 bg-[#090d16]/90 backdrop-blur-md p-1.5 rounded-[8px] border border-[#334155] shadow-lg">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-[6px] hover:bg-[#1e293b] text-white transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4 text-[#00ffff]" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-[6px] hover:bg-[#1e293b] text-white transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4 text-[#00ffff]" />
          </button>
          <div className="w-full h-px bg-[#334155] my-0.5"></div>
          <button
            onClick={() => handleSetExtent(mapExtent === "tn_state" ? "basin_zoom" : "tn_state")}
            className="p-2 rounded-[6px] hover:bg-[#1e293b] text-white transition-colors flex items-center justify-center"
            title={mapExtent === "tn_state" ? "Focus on Basin" : "View Entire Tamil Nadu"}
          >
            <Compass className={`w-4 h-4 ${mapExtent === "tn_state" ? "text-amber-400" : "text-[#00ffff]"}`} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-[6px] hover:bg-[#1e293b] text-white transition-colors flex items-center justify-center"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#00ffff]" /> : <Maximize2 className="w-4 h-4 text-[#00ffff]" />}
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            LEGEND (Matches User Screenshot Structure Exactly!)
           ───────────────────────────────────────────────────────────── */}
        <div className="absolute bottom-8 left-8 z-30 p-2.5 sm:p-3 rounded-[10px] bg-[#090d16]/92 backdrop-blur-md border border-[#334155] text-xs font-mono-val flex flex-wrap items-center gap-3.5 shadow-2xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] inline-block shadow-[0_0_6px_#0284c7]"></span>
            <span className="text-white text-[11px] font-medium">Waterbody</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse inline-block shadow-[0_0_6px_#ef4444]"></span>
            <span className="text-[#fca5a5] text-[11px] font-semibold">AI Detected Encroachment</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block shadow-[0_0_6px_#f97316]"></span>
            <span className="text-[#fdba74] text-[11px] font-medium">Assigned Complaint</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] inline-block shadow-[0_0_6px_#d97706]"></span>
            <span className="text-[#fde68a] text-[11px] font-medium">Anonymous Grievance Pin</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shadow-[0_0_6px_#10b981]"></span>
            <span className="text-[#86efac] text-[11px] font-medium">Resolved</span>
          </div>

          <div className="h-4 w-px bg-[#334155] hidden sm:block"></div>

          {/* Attribution matching User Screenshot */}
          <span className="text-[#94a3b8] text-[10px] hidden md:inline">
            Leaflet | © OpenStreetMap | WaterWatch TN
          </span>
        </div>

        {/* Layer Toggle Drawer (Bottom-Right) */}
        <div className="absolute bottom-8 right-8 z-30 p-2.5 rounded-[10px] bg-[#090d16]/90 backdrop-blur-md border border-[#334155] text-xs font-mono-val flex flex-wrap items-center gap-2 shadow-2xl">
          <span className="text-[#94a3b8] text-[10px] uppercase font-bold mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#00ffff]" />
            Layers:
          </span>

          <button
            onClick={handleToggleCoastline}
            className={`px-2.5 py-1 rounded-[6px] transition-colors text-[11px] font-medium border ${
              showCoastline
                ? "bg-[#00ffff]/20 text-[#00ffff] border-[#00ffff]"
                : "bg-[#1e293b] text-[#94a3b8] border-transparent"
            }`}
          >
            Coastline Vector
          </button>

          <button
            onClick={handleToggleNdwi}
            className={`px-2.5 py-1 rounded-[6px] transition-colors text-[11px] font-medium border ${
              showNdwiOverlay
                ? "bg-[#00A67E]/20 text-[#00A67E] border-[#00A67E]"
                : "bg-[#1e293b] text-[#94a3b8] border-transparent"
            }`}
          >
            NDWI Spectral Tiles
          </button>

          <button
            onClick={handleToggleHotspots}
            className={`px-2.5 py-1 rounded-[6px] transition-colors text-[11px] font-medium border ${
              showAlertHotspots
                ? "bg-red-500/20 text-red-400 border-red-500"
                : "bg-[#1e293b] text-[#94a3b8] border-transparent"
            }`}
          >
            Hotspots
          </button>
        </div>
      </div>

      {/* Target Waterbody Quick Insight Bar below Map */}
      <div className="p-4 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] theme-surface shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] animate-ping"></span>
            <h4 className="text-sm font-bold text-[var(--text-primary)] font-mono-val">
              {selectedWaterbody.name} · {selectedWaterbody.district}
            </h4>
            <span className="text-[10px] font-mono-val px-2 py-0.5 rounded bg-[var(--severity-critical-bg)] text-[var(--severity-critical-text)] font-bold">
              {selectedWaterbody.status}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Coordinates: {selectedWaterbody.coordinates[0].toFixed(4)}°N, {selectedWaterbody.coordinates[1].toFixed(4)}°E | Original: {selectedWaterbody.originalAreaSqkm} km² | Current: {selectedWaterbody.currentAreaSqkm} km² (-{selectedWaterbody.encroachedAreaSqkm} km² Encroached)
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`http://localhost:8001/api/reports/eviction-notice/${selectedWaterbody.id || "WB-PALLIKARANAI"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-[8px] bg-[var(--color-danger)] hover:opacity-90 text-white text-xs font-bold font-mono-val flex items-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Court Eviction Pack (PDF)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
