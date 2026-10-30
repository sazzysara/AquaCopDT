"use client";

import React, { useState } from "react";
import { Waterbody } from "./types";
import { AlertTriangle, Waves, CloudRain, Building2, ShieldCheck, ArrowRight } from "lucide-react";

interface FloodSimulatorProps {
  selectedWaterbody: Waterbody;
  onOpenReportModal: () => void;
}

export const FloodSimulator: React.FC<FloodSimulatorProps> = ({
  selectedWaterbody,
  onOpenReportModal,
}) => {
  const [rainfallMm, setRainfallMm] = useState<number>(180);
  const [additionalEncroachmentPct, setAdditionalEncroachmentPct] = useState<number>(20);

  // Dynamic calculations based on encroachment + rainfall
  const retentionDeficitMillionM3 = (
    (selectedWaterbody.originalAreaSqkm * 0.45 * (additionalEncroachmentPct / 100)) +
    (selectedWaterbody.encroachedAreaSqkm * 0.8)
  ).toFixed(2);

  const floodSurgeDepthCm = Math.round(
    (rainfallMm * 0.18) * (1 + (additionalEncroachmentPct + (selectedWaterbody.encroachedAreaSqkm * 2)) / 50)
  );

  const affectedHouseholds = Math.round(
    floodSurgeDepthCm * 185 * (selectedWaterbody.floodRiskScore / 50)
  );

  const severityLevel =
    floodSurgeDepthCm > 60
      ? "CATASTROPHIC DISASTER"
      : floodSurgeDepthCm > 35
      ? "HIGH INUNDATION CRISIS"
      : "MODERATE URBAN WATERLOGGING";

  return (
    <div className="space-y-8">
      {/* Simulator Header with generous padding */}
      <div className="p-7 sm:p-8 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-4 theme-surface shadow-sm">
        <div className="flex items-center gap-2 text-xs font-mono-val text-[var(--satellite-status-text)] font-semibold">
          <AlertTriangle className="w-4 h-4 text-[var(--color-danger)]" />
          <span>HYDROLOGICAL SATELLITE DISASTER FORECASTER</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          How Wetland Encroachment Amplifies Urban Flood Disasters
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
          When natural marshes, lakes, and coastal buffer strips are paved over or filled with
          construction debris, the water has nowhere to go. Simulate catastrophic precipitation
          events across <span className="text-[var(--text-primary)] font-semibold">{selectedWaterbody.name}</span> to
          understand why immediate anti-encroachment action is vital.
        </p>
      </div>

      {/* Simulator Controls & Realtime Outcome with generous grid gap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sliders Input Panel (5 cols) */}
        <div className="lg:col-span-5 p-7 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-7 theme-surface shadow-sm">
          <h3 className="text-xs font-bold text-[var(--text-primary)] font-mono-val uppercase tracking-wider pb-3 border-b border-[var(--border)]">
            Hydrological Stress Variables
          </h3>

          {/* Slider 1: Rainfall */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono-val">
              <span className="text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
                <CloudRain className="w-4 h-4 text-[var(--satellite-status-text)]" />
                24-Hour Rainfall Intensity:
              </span>
              <span className="text-[var(--text-primary)] font-bold text-sm">{rainfallMm} mm</span>
            </div>
            <input
              type="range"
              min="50"
              max="350"
              step="10"
              value={rainfallMm}
              onChange={(e) => setRainfallMm(Number(e.target.value))}
              className="w-full accent-[var(--color-primary)] cursor-pointer h-2"
            />
            <div className="flex justify-between text-[11px] font-mono-val text-[var(--text-muted)]">
              <span>50mm (Monsoon)</span>
              <span>200mm (Cyclone)</span>
              <span>350mm (Extreme)</span>
            </div>
          </div>

          {/* Slider 2: Additional Illegal Encroachment */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono-val">
              <span className="text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
                <Building2 className="w-4 h-4 text-[var(--color-danger)]" />
                Catchment Lost to Construction:
              </span>
              <span className="text-[var(--color-danger)] font-bold text-sm">+{additionalEncroachmentPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={additionalEncroachmentPct}
              onChange={(e) => setAdditionalEncroachmentPct(Number(e.target.value))}
              className="w-full accent-[var(--color-danger)] cursor-pointer h-2"
            />
            <div className="flex justify-between text-[11px] font-mono-val text-[var(--text-muted)]">
              <span>0% (Current baseline)</span>
              <span>25% (High unmonitored)</span>
              <span>50%</span>
            </div>
          </div>

          <div className="p-4 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] text-xs space-y-2">
            <span className="text-[10px] font-mono-val text-[var(--color-primary)] block uppercase font-bold">
              Current Baseline Observation:
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)] font-semibold">{selectedWaterbody.name}</strong> has already lost{" "}
              <strong className="text-[var(--color-danger)] font-bold">-{selectedWaterbody.encroachedAreaSqkm} km²</strong>{" "}
              of land buffer to unauthorized building since 1995.
            </p>
          </div>
        </div>

        {/* Real-time Disaster Outcome Simulation Display (7 cols) */}
        <div className="lg:col-span-7 p-7 sm:p-8 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-7 theme-surface shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
            <h3 className="text-xs font-bold text-[var(--text-primary)] font-mono-val uppercase tracking-wider">
              Projected Disaster Impact Telemetry
            </h3>
            <span
              className={`px-3 py-1 rounded-[4px] text-xs font-bold font-mono-val border ${
                floodSurgeDepthCm > 60
                  ? "bg-[var(--severity-critical-bg)] text-[var(--severity-critical-text)] border-[var(--severity-critical-border)]"
                  : floodSurgeDepthCm > 35
                  ? "bg-[var(--severity-high-bg)] text-[var(--severity-high-text)] border-[var(--severity-high-border)]"
                  : "bg-[var(--status-verified-bg)] text-[var(--status-verified-text)] border-[var(--status-verified-border)]"
              }`}
            >
              {severityLevel}
            </span>
          </div>

          {/* Main Visual Metric: Flood Depth with spacious cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 sm:p-5 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] space-y-1.5">
              <span className="text-[10px] font-mono-val text-[var(--text-muted)] block font-medium">
                STREET FLOOD DEPTH
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-mono-val text-[var(--color-danger)]">
                +{floodSurgeDepthCm} cm
              </span>
              <span className="text-[11px] text-[var(--text-muted)] block">
                Over spillway capacity
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] space-y-1.5">
              <span className="text-[10px] font-mono-val text-[var(--text-muted)] block font-medium">
                RETENTION DEFICIT
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-mono-val text-[var(--satellite-status-text)]">
                {retentionDeficitMillionM3} M m³
              </span>
              <span className="text-[11px] text-[var(--text-muted)] block">
                Water with nowhere to drain
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] space-y-1.5">
              <span className="text-[10px] font-mono-val text-[var(--text-muted)] block font-medium">
                AT-RISK PROPERTIES
              </span>
              <span className="text-2xl sm:text-3xl font-bold font-mono-val text-[var(--status-purple-text)]">
                ~{affectedHouseholds.toLocaleString()}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] block">
                Residential units in zone
              </span>
            </div>
          </div>

          {/* Visual Water Column Animation */}
          <div className="space-y-3 pt-1">
            <div className="flex justify-between text-xs font-mono-val">
              <span className="text-[var(--text-muted)] font-medium">Surge Water Inundation Level:</span>
              <span className="text-[var(--text-primary)] font-bold text-sm">{floodSurgeDepthCm} cm</span>
            </div>
            <div className="relative h-14 w-full rounded-[8px] bg-[var(--bg-input)] border border-[var(--border)] overflow-hidden flex items-end">
              <div
                className="w-full bg-gradient-to-t from-[var(--color-primary)] via-[#0088AA] to-[var(--color-danger)] transition-all duration-300 relative"
                style={{ height: `${Math.min(100, (floodSurgeDepthCm / 90) * 100)}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-white opacity-75 animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between text-[11px] font-mono-val text-[var(--text-muted)]">
              <span>0 cm (Safe Runoff)</span>
              <span>45 cm (Knee-Deep Submersion)</span>
              <span>90+ cm (Severe Rescue Required)</span>
            </div>
          </div>

          {/* Call to action with good padding */}
          <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[var(--text-muted)]">
              Encroachments are legally actionable under the Disaster Management Act.
            </span>
            <button
              onClick={onOpenReportModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-[8px] bg-[var(--color-accent-purple)] hover:bg-[var(--color-accent-purple-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Report Encroachment Threat Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
