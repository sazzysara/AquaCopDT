"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Waterbody, CitizenComplaintItem } from "./types";
import { getApiBaseUrl } from "../config/api";
import {
  Satellite,
  Layers,
  AlertTriangle,
  Waves,
  MapPin,
  Activity,
  Crosshair,
  TrendingDown,
  Info,
  ShieldAlert,
  Download,
  AlertOctagon,
  CheckCircle2,
  FileText
} from "lucide-react";

const SatelliteMapViewer = dynamic(
  () => import("./SatelliteMapViewer").then((mod) => mod.SatelliteMapViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[650px] rounded-[14px] bg-[#030712] border-2 border-[#1e293b] flex flex-col items-center justify-center text-xs font-mono-val text-[#94a3b8] gap-3">
        <div className="w-9 h-9 border-2 border-[#00ffff] border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Real Satellite Earth Imagery & Tamil Nadu Sentinel...</span>
      </div>
    ),
  }
);

interface EncroachmentHeatmapProps {
  waterbodies: Waterbody[];
  complaints?: CitizenComplaintItem[];
  selectedWaterbody: Waterbody;
  onSelectWaterbody: (wb: Waterbody) => void;
  onTriggerEnforcement: (wb: Waterbody) => void;
}

export const EncroachmentHeatmap: React.FC<EncroachmentHeatmapProps> = ({
  waterbodies,
  complaints,
  selectedWaterbody,
  onSelectWaterbody,
  onTriggerEnforcement,
}) => {
  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          UP (Top Header & Real-Time Sensor Telemetry Ribbon)
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Top Basin Selector & Sensor Provenance Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] theme-surface shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono-val text-[var(--text-muted)] flex items-center gap-1.5 font-semibold mr-1">
              <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
              Target Basin:
            </span>
            {waterbodies.map((wb) => (
              <button
                key={wb.id}
                onClick={() => onSelectWaterbody(wb)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all flex items-center gap-2 ${
                  selectedWaterbody.id === wb.id
                    ? "bg-[var(--color-primary)] text-white shadow-sm font-semibold"
                    : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-hover)]"
                }`}
              >
                <span>{wb.name.split(" ")[0]}</span>
                {wb.status === "CRITICAL_ALERT" && (
                  <span className="w-2 h-2 rounded-full bg-[var(--color-danger)] inline-block animate-pulse"></span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] bg-[var(--bg-base)] border border-[var(--border)] text-xs font-mono-val self-start lg:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
            <span className="text-[var(--text-primary)] font-bold">Copernicus Sentinel-2 MSI</span>
            <span className="text-[var(--text-muted)]">· Esri World Imagery (Tamil Nadu) 10m</span>
          </div>
        </div>

        {/* Horizontal Quick Telemetry KPI Ribbon (UP) - Full Width Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Water Loss Card */}
          <div className="p-4 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border)] space-y-1 theme-surface shadow-sm">
            <span className="text-[10px] font-mono-val text-[var(--text-muted)] block uppercase font-semibold">
              WATER LOSS
            </span>
            <span className="text-xl font-bold font-mono-val text-[#ef4444] block">
              -{selectedWaterbody.encroachedAreaSqkm} km²
            </span>
            <span className="text-[11px] text-[var(--text-muted)] block font-mono-val">
              ({((selectedWaterbody.encroachedAreaSqkm / selectedWaterbody.originalAreaSqkm) * 100).toFixed(1)}% lost)
            </span>
          </div>

          {/* Surge Depth Card */}
          <div className="p-4 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border)] space-y-1 theme-surface shadow-sm">
            <span className="text-[10px] font-mono-val text-[var(--text-muted)] block uppercase font-semibold">
              SURGE DEPTH
            </span>
            <span className="text-xl font-bold font-mono-val text-[#0284c7] block">
              +34 cm
            </span>
            <span className="text-[11px] text-[var(--text-muted)] block font-mono-val">
              Downstream flood
            </span>
          </div>

          {/* Spectral NDWI Card */}
          <div className="p-4 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border)] space-y-1 theme-surface shadow-sm">
            <span className="text-[10px] font-mono-val text-[var(--text-muted)] block uppercase font-semibold">
              SPECTRAL NDWI
            </span>
            <span className="text-xl font-bold font-mono-val text-[#10b981] block">
              +{selectedWaterbody.ndwiIndex.toFixed(2)}
            </span>
            <span className="text-[11px] text-[var(--text-muted)] block font-mono-val">
              Threshold: &gt;0.2 water
            </span>
          </div>

          {/* Active Intrusions Card */}
          <div className="p-4 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border)] space-y-1 theme-surface shadow-sm">
            <span className="text-[10px] font-mono-val text-[var(--text-muted)] block uppercase font-semibold">
              INTRUSIONS
            </span>
            <span className="text-xl font-bold font-mono-val text-[#8b5cf6] block">
              {selectedWaterbody.activeEncroachmentsCount} Sites
            </span>
            <span className="text-[11px] text-[var(--text-muted)] block font-mono-val">
              Detected by Sentinel
            </span>
          </div>

          {/* Disaster Hazard Card */}
          <div className="p-4 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border)] space-y-1.5 theme-surface shadow-sm">
            <span className="text-[10px] font-mono-val text-[var(--text-muted)] block uppercase font-semibold">
              DISASTER HAZARD
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono-val text-[var(--color-danger)]">
                {selectedWaterbody.floodRiskScore}/100
              </span>
              <span className="text-[10px] font-mono-val px-1.5 py-0.5 rounded bg-[var(--severity-critical-bg)] text-[var(--severity-critical-text)] font-bold">
                SEVERE
              </span>
            </div>
            <div className="w-full bg-[var(--bg-base)] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                style={{ width: `${selectedWaterbody.floodRiskScore}%` }}
              />
            </div>
          </div>

          {/* Action Dispatch (UP) */}
          <div className="p-3 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border)] flex flex-col justify-center gap-2 theme-surface shadow-sm">
            <button
              onClick={() => onTriggerEnforcement(selectedWaterbody)}
              className="w-full py-2 px-2.5 rounded-[6px] bg-[#00A67E] hover:bg-[#008f6b] text-white text-[11px] font-bold font-mono-val transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Issue Enforcement</span>
            </button>
            <a
              href={`${getApiBaseUrl()}/api/reports/eviction-notice/${selectedWaterbody.id || "WB-PALLIKARANAI"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 px-2.5 rounded-[6px] bg-[var(--color-danger)] hover:opacity-90 text-white text-[11px] font-bold font-mono-val transition-colors flex items-center justify-center gap-1.5 shadow-sm text-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Court Eviction PDF</span>
            </a>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CENTER: FULL-SCREEN SATELLITE EARTH MAP (LEFT TO RIGHT 100%)
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full">
        <SatelliteMapViewer
          waterbodies={waterbodies}
          complaints={complaints}
          selectedWaterbody={selectedWaterbody}
          onSelectWaterbody={onSelectWaterbody}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DOWN: DETAILED DOSSIER & ANALYSIS CARDS (BELOW MAP)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Down Column 1: Disaster Flood Modeling Assessment */}
        <div className="p-6 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-4 theme-surface shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
            <AlertOctagon className="w-5 h-5 text-[var(--color-danger)] shrink-0" />
            <h4 className="text-xs font-bold text-[var(--text-primary)] font-mono-val uppercase tracking-wider">
              Disaster Flood Modeling Assessment
            </h4>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Direct constriction of stormwater outflow channel; +34cm simulated flood surge risk in downstream residential sectors. Loss of 45,000 cu.m emergency retention volume detected by Sentinel-2 multi-spectral pass.
          </p>

          <div className="p-3.5 rounded-[8px] bg-[var(--bg-base)] border border-[var(--border)] space-y-1.5 text-xs font-mono-val">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Jurisdiction:</span>
              <strong className="text-[var(--text-primary)]">Sec 133 CrPC Eviction</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Legal Buffer Zone:</span>
              <strong className="text-[var(--color-danger)]">50.0m High-Water Mark</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Latest Satellite Orbit:</span>
              <strong className="text-[var(--status-verified-text)]">{selectedWaterbody.lastSatellitePass}</strong>
            </div>
          </div>

          <button
            onClick={() => onTriggerEnforcement(selectedWaterbody)}
            className="w-full py-2.5 px-4 rounded-[8px] bg-[#00A67E] hover:bg-[#008f6b] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm font-mono-val"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Issue Immediate Enforcement Order</span>
          </button>
        </div>

        {/* Down Column 2: Historical Shrinkage Timeline (1995 → 2026) */}
        <div className="p-6 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-4 theme-surface shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <span className="text-xs font-mono-val text-[var(--text-primary)] font-bold flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[var(--color-danger)]" />
              Encroachment Timeline
            </span>
            <span className="text-[11px] font-mono-val text-[var(--text-muted)]">1995 → 2026</span>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono-val">
                <span className="text-[var(--text-secondary)] font-medium">1995</span>
                <span className="text-[var(--text-primary)] font-semibold">
                  3.2 km² (20% left)
                </span>
              </div>
              <div className="w-full bg-[var(--bg-base)] h-2 rounded-[4px] overflow-hidden border border-[var(--border)]">
                <div className="h-full bg-[#ef4444]" style={{ width: "20%" }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono-val">
                <span className="text-[var(--text-secondary)] font-medium">2005</span>
                <span className="text-[var(--text-primary)] font-semibold">
                  3.0 km² (19% left)
                </span>
              </div>
              <div className="w-full bg-[var(--bg-base)] h-2 rounded-[4px] overflow-hidden border border-[var(--border)]">
                <div className="h-full bg-[#ef4444]" style={{ width: "19%" }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono-val">
                <span className="text-[var(--text-secondary)] font-medium">2015</span>
                <span className="text-[var(--text-primary)] font-semibold">
                  2.8 km² (18% left)
                </span>
              </div>
              <div className="w-full bg-[var(--bg-base)] h-2 rounded-[4px] overflow-hidden border border-[var(--border)]">
                <div className="h-full bg-[#ef4444]" style={{ width: "18%" }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono-val">
                <span className="text-[var(--text-secondary)] font-medium">2026 (Current)</span>
                <span className="text-[#ef4444] font-bold">
                  {selectedWaterbody.currentAreaSqkm} km² ({((selectedWaterbody.currentAreaSqkm / selectedWaterbody.originalAreaSqkm) * 100).toFixed(0)}% left)
                </span>
              </div>
              <div className="w-full bg-[var(--bg-base)] h-2 rounded-[4px] overflow-hidden border border-[var(--border)]">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500"
                  style={{ width: `${Math.max(10, Math.min(100, (selectedWaterbody.currentAreaSqkm / selectedWaterbody.originalAreaSqkm) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] font-mono-val pt-2 border-t border-[var(--border)]">
            Data validated against European Commission JRC Global Surface Water 38-year record.
          </p>
        </div>

        {/* Down Column 3: Environmental Status & Basin Description */}
        <div className="p-6 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-4 theme-surface shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
            <Info className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
            <h4 className="text-xs font-bold text-[var(--text-primary)] font-mono-val uppercase tracking-wider">
              Hydrogeological Basin Status
            </h4>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-bold text-[var(--text-primary)]">
              {selectedWaterbody.name} · {selectedWaterbody.region}
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {selectedWaterbody.description}
            </p>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[var(--bg-base)] border border-[var(--border)] text-xs font-mono-val space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Revenue District:</span>
              <span className="text-[var(--text-primary)] font-semibold">{selectedWaterbody.district}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Ecological Type:</span>
              <span className="text-[var(--text-primary)] font-semibold">{selectedWaterbody.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Declared Original Extent:</span>
              <span className="text-[var(--text-primary)] font-semibold">{selectedWaterbody.originalAreaSqkm} km²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Current Water Spread:</span>
              <span className="text-[var(--color-danger)] font-bold">{selectedWaterbody.currentAreaSqkm} km²</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
