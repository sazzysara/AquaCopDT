"use client";

import React, { useState } from "react";
import { Waterbody } from "./types";
import {
  BarChart3,
  TrendingDown,
  Layers,
  Activity,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Info,
  CheckCircle2,
  Building,
  Waves,
  MapPin
} from "lucide-react";

interface AnalyticsDashboardProps {
  selectedWaterbody: Waterbody;
  waterbodies: Waterbody[];
  onSelectWaterbody: (wb: Waterbody) => void;
  onOpenReportModal: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  selectedWaterbody,
  waterbodies,
  onSelectWaterbody,
  onOpenReportModal,
}) => {
  const [activeMetricTab, setActiveMetricTab] = useState<"historical" | "spectral" | "cadastral">("historical");

  // Spectral reflectance benchmark data for Sentinel-2 MSI Bands
  const spectralBands = [
    { band: "B02", name: "Blue (490nm)", water: 0.12, vegetation: 0.04, concreteEncroachment: 0.22 },
    { band: "B03", name: "Green (560nm)", water: 0.15, vegetation: 0.12, concreteEncroachment: 0.28 },
    { band: "B04", name: "Red (665nm)", water: 0.08, vegetation: 0.05, concreteEncroachment: 0.34 },
    { band: "B08", name: "NIR (842nm)", water: 0.01, vegetation: 0.48, concreteEncroachment: 0.38 },
    { band: "B11", name: "SWIR-1 (1610nm)", water: 0.00, vegetation: 0.22, concreteEncroachment: 0.42 },
    { band: "B12", name: "SWIR-2 (2190nm)", water: 0.00, vegetation: 0.10, concreteEncroachment: 0.39 },
  ];

  // Cadastral plot records for the selected basin
  const cadastralPlots = [
    {
      plotId: "Sy. No. 188/B-1",
      zone: "Radial Road Sector 4",
      extentAcres: 3.42,
      classification: "Waterbody Poramboke (Kulam / Eri)",
      encroachmentNature: "Commercial Plinth & Red Earth Filling",
      bufferRemaining: "14.8m (Breached)",
      status: "Notice Issued Under Sec 133 CrPC",
      severity: "CRITICAL",
    },
    {
      plotId: "Sy. No. 142/A-2",
      zone: "Southern Inundation Buffer",
      extentAcres: 1.85,
      classification: "Catchment Overflow Corridor",
      encroachmentNature: "Concrete Compound Wall & Silt Berm",
      bufferRemaining: "22.1m (Breached)",
      status: "Demolition Pending District Collector Order",
      severity: "HIGH",
    },
    {
      plotId: "Sy. No. 209/4-C",
      zone: "North-West Feeder Channel",
      extentAcres: 2.10,
      classification: "Drainage Odai Poramboke",
      encroachmentNature: "Construction Debris & Ready-Mix Dumping",
      bufferRemaining: "8.4m (Critical)",
      status: "Site Eviction Order Served",
      severity: "CRITICAL",
    },
    {
      plotId: "Sy. No. 97/1",
      zone: "Eastern Marsh Perimeter",
      extentAcres: 0.95,
      classification: "Statutory 50m High-Water Zone",
      encroachmentNature: "Temporary Labor Sheds & Masonry Footings",
      bufferRemaining: "34.0m (Warning)",
      status: "Field Surveyor Inspection Verified",
      severity: "MODERATE",
    },
  ];

  // Calculate percentage loss
  const lossPercentage = Math.round(
    (selectedWaterbody.encroachedAreaSqkm / selectedWaterbody.originalAreaSqkm) * 100
  );

  return (
    <div className="space-y-8">
      {/* Top Header & Compact Metrics Bar with generous spacing */}
      <div className="p-6 sm:p-7 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-6 theme-surface shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono-val text-[var(--color-primary)] font-bold flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                GEOSPATIAL ANALYTICS & TIME-SERIES INTELLIGENCE
              </span>
              <span className="text-[10px] font-mono-val px-2.5 py-0.5 rounded-[4px] bg-[var(--mono-badge-bg)] border border-[var(--mono-badge-border)] text-[var(--text-primary)] font-semibold">
                {selectedWaterbody.name}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Multi-Decadal Basin Shrinkage & Spectral Signature Audit
            </h2>
          </div>

          {/* Metric Sub-Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-[8px] bg-[var(--bg-base)] border border-[var(--border)] self-start sm:self-auto theme-surface">
            <button
              onClick={() => setActiveMetricTab("historical")}
              className={`px-3 py-1.5 text-xs rounded-[6px] font-semibold transition-colors ${
                activeMetricTab === "historical"
                  ? "bg-[var(--bg-card)] text-[var(--color-primary)] shadow-sm border border-[var(--border)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Area Loss (1995-2026)
            </button>
            <button
              onClick={() => setActiveMetricTab("spectral")}
              className={`px-3 py-1.5 text-xs rounded-[6px] font-semibold transition-colors ${
                activeMetricTab === "spectral"
                  ? "bg-[var(--bg-card)] text-[var(--satellite-status-text)] shadow-sm border border-[var(--border)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Spectral Bands
            </button>
            <button
              onClick={() => setActiveMetricTab("cadastral")}
              className={`px-3 py-1.5 text-xs rounded-[6px] font-semibold transition-colors ${
                activeMetricTab === "cadastral"
                  ? "bg-[var(--bg-card)] text-[var(--status-purple-text)] shadow-sm border border-[var(--border)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Cadastral Ledger
            </button>
          </div>
        </div>

        {/* 4-Stat High Density KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] space-y-1 theme-surface">
            <span className="text-[10px] font-mono-val text-[var(--text-muted)] block font-medium">ORIGINAL AREA (1995)</span>
            <span className="text-2xl font-bold font-mono-val text-[var(--text-primary)]">
              {selectedWaterbody.originalAreaSqkm} km²
            </span>
            <span className="text-[11px] text-[var(--text-muted)] block">Pre-construction baseline</span>
          </div>

          <div className="p-4 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] space-y-1 theme-surface">
            <span className="text-[10px] font-mono-val text-[var(--text-muted)] block font-medium">CURRENT AREA (2026)</span>
            <span className="text-2xl font-bold font-mono-val text-[var(--color-primary)]">
              {selectedWaterbody.currentAreaSqkm} km²
            </span>
            <span className="text-[11px] text-[var(--color-danger)] font-mono-val font-semibold block">
              -{lossPercentage}% total wetland lost
            </span>
          </div>

          <div className="p-4 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] space-y-1 theme-surface">
            <span className="text-[10px] font-mono-val text-[var(--text-muted)] block font-medium">ENCROACHED SURFACE</span>
            <span className="text-2xl font-bold font-mono-val text-[var(--color-danger)]">
              -{selectedWaterbody.encroachedAreaSqkm} km²
            </span>
            <span className="text-[11px] text-[var(--text-muted)] block">Illegal landfill & concrete</span>
          </div>

          <div className="p-4 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] space-y-1 theme-surface">
            <span className="text-[10px] font-mono-val text-[var(--text-muted)] block font-medium">RUNOFF COEFFICIENT</span>
            <span className="text-2xl font-bold font-mono-val text-[var(--status-purple-text)]">
              0.74 <span className="text-xs text-[var(--text-muted)] font-normal">from 0.18</span>
            </span>
            <span className="text-[11px] text-[var(--color-danger)] font-medium block">+310% flood surge velocity</span>
          </div>
        </div>
      </div>

      {/* Main Chart Section with spacious gap */}
      {activeMetricTab === "historical" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SVG Area Loss Line & Area Chart (8 cols) */}
          <div className="lg:col-span-8 p-7 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-5 theme-surface shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-xs font-bold text-[var(--text-primary)] font-mono-val uppercase tracking-wider flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[var(--color-danger)]" />
                Satellite Water Spread vs Built-Up Density (1995 – 2026)
              </h3>
              <div className="flex items-center gap-4 text-[11px] font-mono-val">
                <span className="flex items-center gap-1.5 text-[var(--color-primary)] font-semibold">
                  <span className="w-3 h-1 bg-[var(--color-primary)] rounded inline-block"></span>
                  Waterbody Area (km²)
                </span>
                <span className="flex items-center gap-1.5 text-[var(--color-danger)] font-semibold">
                  <span className="w-3 h-1 bg-[var(--color-danger)] rounded inline-block"></span>
                  Built-up Intrusion (%)
                </span>
              </div>
            </div>

            {/* Custom Interactive SVG Chart */}
            <div className="relative h-72 w-full bg-[var(--bg-input)] rounded-[10px] border border-[var(--border)] p-6 flex flex-col justify-between overflow-hidden">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 grid grid-rows-4 grid-cols-4 pointer-events-none opacity-20">
                <div className="border-b border-r border-[var(--border)]"></div>
                <div className="border-b border-r border-[var(--border)]"></div>
                <div className="border-b border-r border-[var(--border)]"></div>
                <div className="border-b border-r border-[var(--border)]"></div>
                <div className="border-b border-r border-[var(--border)]"></div>
                <div className="border-b border-r border-[var(--border)]"></div>
                <div className="border-b border-r border-[var(--border)]"></div>
                <div className="border-b border-r border-[var(--border)]"></div>
                <div className="border-b border-r border-[var(--border)]"></div>
                <div className="border-b border-r border-[var(--border)]"></div>
                <div className="border-b border-r border-[var(--border)]"></div>
                <div className="border-b border-r border-[var(--border)]"></div>
              </div>

              {/* Responsive SVG Graphic */}
              <svg className="w-full h-48 overflow-visible" viewBox="0 0 500 160">
                <defs>
                  <linearGradient id="waterAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00A67E" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00A67E" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="builtupGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#FF4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Shaded Area for Waterbody Loss */}
                <path
                  d="M 40 25 L 180 50 L 320 85 L 460 125 L 460 150 L 40 150 Z"
                  fill="url(#waterAreaGradient)"
                />

                {/* Shaded Area for Built-up Incursion */}
                <path
                  d="M 40 145 L 180 120 L 320 75 L 460 35 L 460 150 L 40 150 Z"
                  fill="url(#builtupGradient)"
                />

                {/* Water Surface Curve Line */}
                <path
                  d="M 40 25 L 180 50 L 320 85 L 460 125"
                  fill="none"
                  stroke="#00A67E"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Built-up Encroachment Curve Line */}
                <path
                  d="M 40 145 L 180 120 L 320 75 L 460 35"
                  fill="none"
                  stroke="#FF4444"
                  strokeWidth="3"
                  strokeDasharray="5,4"
                  strokeLinecap="round"
                />

                {/* Data Points - Waterbody Area */}
                <circle cx="40" cy="25" r="5" fill="#00A67E" stroke="#ffffff" strokeWidth="2" />
                <circle cx="180" cy="50" r="5" fill="#00A67E" stroke="#ffffff" strokeWidth="2" />
                <circle cx="320" cy="85" r="5" fill="#00A67E" stroke="#ffffff" strokeWidth="2" />
                <circle cx="460" cy="125" r="5.5" fill="#00A67E" stroke="#ffffff" strokeWidth="2" />

                {/* Data Points - Builtup */}
                <circle cx="40" cy="145" r="4.5" fill="#FF4444" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="180" cy="120" r="4.5" fill="#FF4444" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="320" cy="75" r="4.5" fill="#FF4444" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="460" cy="35" r="5.5" fill="#FF4444" stroke="#ffffff" strokeWidth="2" />

                {/* Floating Value Badges */}
                <text x="35" y="15" fill="#00A67E" fontSize="11" fontFamily="monospace" fontWeight="bold">50.0 km²</text>
                <text x="170" y="42" fill="#00A67E" fontSize="11" fontFamily="monospace">41.2 km²</text>
                <text x="310" y="78" fill="#00A67E" fontSize="11" fontFamily="monospace">32.5 km²</text>
                <text x="440" y="118" fill="#00A67E" fontSize="11" fontFamily="monospace" fontWeight="bold">23.4 km²</text>

                <text x="445" y="25" fill="#FF4444" fontSize="11" fontFamily="monospace" fontWeight="bold">58% Built</text>
              </svg>

              {/* X Axis Year Labels */}
              <div className="flex justify-between items-center text-[11px] font-mono-val text-[var(--text-muted)] pt-3 border-t border-[var(--border)]">
                <span className="font-bold text-[var(--text-primary)]">1995 (Baseline)</span>
                <span>2005 (Boom)</span>
                <span>2015 (Floods)</span>
                <span className="font-bold text-[var(--color-danger)]">2026 (Present Day)</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-2">
              <span>Sentinel-2 Orthorectified MSI Scene Level-2A</span>
              <span className="font-mono-val text-[var(--color-primary)] font-bold">Confidence: 99.4% Multi-Spectral Fit</span>
            </div>
          </div>

          {/* Hydrological Impact Sidebar (4 cols) */}
          <div className="lg:col-span-4 p-7 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-5 theme-surface shadow-sm">
            <h3 className="text-xs font-bold text-[var(--text-primary)] font-mono-val uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-[var(--border)]">
              <Waves className="w-4 h-4 text-[var(--satellite-status-text)]" />
              Disaster Cascades Caused
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between font-mono-val text-xs">
                  <span className="text-[var(--text-muted)]">Stormwater Storage Loss</span>
                  <span className="text-[var(--color-danger)] font-bold">-26.6 Million m³</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Pre-construction flood sponge capacity eliminated due to illegal filling on the western rim.
                </p>
              </div>

              <div className="p-4 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between font-mono-val text-xs">
                  <span className="text-[var(--text-muted)]">Inundation Velocity</span>
                  <span className="text-[var(--status-purple-text)] font-bold">3.8x Speed</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Water drainage transit time shortened from 18 hours to under 4 hours, overwhelming stormwater drains.
                </p>
              </div>

              <div className="p-4 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] space-y-1.5">
                <div className="flex items-center justify-between font-mono-val text-xs">
                  <span className="text-[var(--text-muted)]">Legal Eviction Priority</span>
                  <span className="text-[var(--color-danger)] font-bold">Category 1 Urgent</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Direct breach of High Court directives on wetland restoration and CRZ-II norms.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenReportModal}
              className="w-full py-3 px-4 rounded-[8px] bg-[var(--color-accent-purple)] hover:bg-[var(--color-accent-purple-hover)] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>File Evidence on this Basin</span>
            </button>
          </div>
        </div>
      )}

      {/* Spectral Band Analysis Section */}
      {activeMetricTab === "spectral" && (
        <div className="p-7 sm:p-8 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-6 theme-surface shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[var(--text-primary)] font-mono-val uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--satellite-status-text)]" />
                Sentinel-2 MSI Multi-Spectral Reflectance Curves
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                How satellite bands separate authentic water from illegal concrete and red-soil plinths.
              </p>
            </div>
            <div className="text-xs font-mono-val px-3 py-1.5 rounded-[6px] bg-[var(--bg-input)] text-[var(--color-primary)] border border-[var(--border)] font-bold">
              NDWI = (Band 3 - Band 8) / (Band 3 + Band 8)
            </div>
          </div>

          {/* Spectral Reflectance Table with comfortable padding */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-left font-mono-val text-[11px] text-[var(--text-muted)]">
                  <th className="py-3 px-4 font-semibold">SENTINEL BAND</th>
                  <th className="py-3 px-4 font-semibold">SPECTRAL REGION</th>
                  <th className="py-3 px-4 font-semibold text-[var(--satellite-status-text)]">WATER REFLECTANCE</th>
                  <th className="py-3 px-4 font-semibold text-[var(--color-primary)]">MARSH VEGETATION</th>
                  <th className="py-3 px-4 font-semibold text-[var(--color-danger)]">ILLEGAL CONCRETE / PLINTH</th>
                  <th className="py-3 px-4 font-semibold">ANOMALY DELTA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-mono-val">
                {spectralBands.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">{row.band}</td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{row.name}</td>
                    <td className="py-3.5 px-4 text-[var(--satellite-status-text)] font-semibold">{row.water}</td>
                    <td className="py-3.5 px-4 text-[var(--color-primary)] font-semibold">{row.vegetation}</td>
                    <td className="py-3.5 px-4 text-[var(--color-danger)] font-bold">
                      {row.concreteEncroachment}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] px-2.5 py-1 rounded-[4px] bg-[var(--severity-critical-bg)] text-[var(--severity-critical-text)] border border-[var(--severity-critical-border)] font-bold">
                        +{((row.concreteEncroachment - row.water) * 100).toFixed(0)}% Shift
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cadastral Land Parcel Ledger */}
      {activeMetricTab === "cadastral" && (
        <div className="p-7 sm:p-8 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-6 theme-surface shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-[var(--text-primary)] font-mono-val uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[var(--status-purple-text)]" />
                Revenue Cadastral Land Parcel Registry & Buffer Violations
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Geo-referenced revenue survey plots intersecting statutory 50-meter waterbody buffer lines.
              </p>
            </div>
            <div className="text-xs font-mono-val text-[var(--color-danger)] font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[var(--severity-critical-bg)] border border-[var(--severity-critical-border)]">
              <AlertTriangle className="w-4 h-4" />
              <span>4 Survey Plots in Direct Breach</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-left font-mono-val text-[11px] text-[var(--text-muted)]">
                  <th className="py-3 px-4 font-semibold">SURVEY PLOT #</th>
                  <th className="py-3 px-4 font-semibold">REVENUE ZONE</th>
                  <th className="py-3 px-4 font-semibold">EXTENT</th>
                  <th className="py-3 px-4 font-semibold">LEGAL CLASSIFICATION</th>
                  <th className="py-3 px-4 font-semibold">ENCROACHMENT NATURE</th>
                  <th className="py-3 px-4 font-semibold">BUFFER DISTANCE</th>
                  <th className="py-3 px-4 font-semibold">STATUTORY ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-mono-val">
                {cadastralPlots.map((plot, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">{plot.plotId}</td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{plot.zone}</td>
                    <td className="py-3.5 px-4 text-[var(--text-primary)] font-semibold">{plot.extentAcres} Ac</td>
                    <td className="py-3.5 px-4 text-[var(--color-primary)] font-medium">{plot.classification}</td>
                    <td className="py-3.5 px-4 text-[var(--color-danger)] font-semibold">{plot.encroachmentNature}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] px-2.5 py-1 rounded-[4px] bg-[var(--severity-critical-bg)] text-[var(--severity-critical-text)] border border-[var(--severity-critical-border)] font-bold">
                        {plot.bufferRemaining}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-primary)] text-xs">{plot.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
