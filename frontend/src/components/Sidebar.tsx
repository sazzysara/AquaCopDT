"use client";

import React, { useState, useMemo } from "react";
import { Waterbody, AuthUser } from "./types";
import {
  Satellite,
  BarChart3,
  ShieldAlert,
  AlertTriangle,
  Waves,
  MapPin,
  Radio,
  FileText,
  ChevronDown,
  X,
  Compass,
  Filter,
  CheckCircle2,
  Inbox,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

export type DashboardTab = "satellite" | "analytics" | "officer" | "citizen" | "simulator";

interface SidebarProps {
  currentTab: DashboardTab;
  setCurrentTab: (tab: DashboardTab) => void;
  waterbodies: Waterbody[];
  selectedWaterbody: Waterbody;
  onSelectWaterbody: (wb: Waterbody) => void;
  alertsCount: number;
  complaintsCount: number;
  onOpenReportModal: () => void;
  isOpen: boolean;
  onClose: () => void;
  onToggle?: () => void;
  isOfficerLoggedIn: boolean;
  onOpenOfficerLogin: () => void;
  currentUser?: AuthUser | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  waterbodies,
  selectedWaterbody,
  onSelectWaterbody,
  alertsCount,
  complaintsCount,
  onOpenReportModal,
  isOpen,
  onClose,
  onToggle,
  currentUser,
}) => {
  // District Filter State: "All" or specific district name
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");

  // Extract unique districts
  const districtList = useMemo(() => {
    const set = new Set<string>();
    waterbodies.forEach((w) => {
      if (w.district) set.add(w.district);
    });
    return ["All", ...Array.from(set)];
  }, [waterbodies]);

  // Filtered waterbodies according to selected district
  const filteredWaterbodies = useMemo(() => {
    if (selectedDistrict === "All") return waterbodies;
    return waterbodies.filter((w) => w.district === selectedDistrict);
  }, [waterbodies, selectedDistrict]);

  // Handle district pill click
  const handleSelectDistrict = (dist: string) => {
    setSelectedDistrict(dist);
    if (dist === "All") return;
    const firstInDistrict = waterbodies.find((w) => w.district === dist);
    if (firstInDistrict && selectedWaterbody.district !== dist) {
      onSelectWaterbody(firstInDistrict);
    }
  };

  // Clean, short, uncluttered dashboard menu items
  const menuItems = [
    {
      key: "satellite" as DashboardTab,
      label: "Heatmap",
      icon: Satellite,
      badge: "Live",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      key: "citizen" as DashboardTab,
      label: "Complaints Received",
      icon: Inbox,
      badge: `${complaintsCount}`,
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      key: "officer" as DashboardTab,
      label: "Encroachment Alerts",
      icon: AlertTriangle,
      badge: `${alertsCount}`,
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
    {
      key: "analytics" as DashboardTab,
      label: "Analytics",
      icon: BarChart3,
      badge: null,
      badgeColor: "",
    },
    {
      key: "simulator" as DashboardTab,
      label: "Flood Simulator",
      icon: Waves,
      badge: "Sim",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Floating Slide-Out Tab when Sidebar is slid closed */}
      {!isOpen && onToggle && (
        <button
          onClick={onToggle}
          className="fixed top-20 left-3 z-40 p-2.5 rounded-[10px] bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--color-primary)] hover:text-white shadow-xl transition-all duration-200 flex items-center gap-2 group font-mono-val text-xs"
          title="Slide open dashboard panel"
        >
          <PanelLeftOpen className="w-4 h-4 text-[var(--color-primary)] group-hover:text-white transition-colors" />
          <span className="font-semibold hidden sm:inline">Dashboard</span>
        </button>
      )}

      {/* Main Slideable Left Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen shrink-0 flex flex-col bg-[var(--bg-card)] border-r border-[var(--border)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] theme-surface overflow-hidden ${
          isOpen
            ? "w-72 sm:w-80 translate-x-0 opacity-100 shadow-xl lg:shadow-none"
            : "w-0 -translate-x-full opacity-0 pointer-events-none border-r-0"
        }`}
      >
        <div className="w-72 sm:w-80 h-full flex flex-col shrink-0">
          {/* 1. Header: Clean AquaCop Branding with Collapse button */}
          <div className="h-16 px-5 border-b border-[var(--border)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-[10px] overflow-hidden border border-[var(--border)] shadow-xs bg-white shrink-0 p-0.5">
                <img src="/aquacop-logo.jpg" alt="AquaCop Logo" className="w-full h-full object-contain" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tracking-tight text-[var(--text-primary)] font-inter">
                    AquaCop
                  </span>
                  <span className="text-[10px] font-mono-val px-1.5 py-0.2 rounded bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-semibold border border-[var(--color-primary)]/30">
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] font-mono-val">
                  Water Sentinel
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
              title="Slide sidebar away"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

        {/* 2. District Filter Section */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-base)]/50 shrink-0 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              Filter by District
            </span>
            <span className="text-[11px] font-mono-val text-[var(--text-muted)]">
              {filteredWaterbodies.length} lakes
            </span>
          </div>

          {/* District Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {districtList.map((district) => {
              const isSelected = selectedDistrict === district;
              const count =
                district === "All"
                  ? waterbodies.length
                  : waterbodies.filter((w) => w.district === district).length;

              return (
                <button
                  key={district}
                  type="button"
                  onClick={() => handleSelectDistrict(district)}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all flex items-center gap-1 ${
                    isSelected
                      ? "bg-[var(--color-primary)] text-white shadow-sm font-semibold"
                      : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]"
                  }`}
                >
                  <span>{district}</span>
                  <span
                    className={`text-[10px] font-mono-val px-1 rounded-full ${
                      isSelected ? "bg-white/25 text-white" : "bg-[var(--bg-input)] text-[var(--text-muted)]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Waterbody Quick Dropdown */}
          <div className="relative pt-1">
            <select
              value={selectedWaterbody?.id || filteredWaterbodies[0]?.id}
              onChange={(e) => {
                const target = waterbodies.find((w) => w.id === e.target.value);
                if (target) onSelectWaterbody(target);
              }}
              className="w-full text-xs font-medium py-2 pl-3 pr-8 rounded-[8px] bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] appearance-none cursor-pointer shadow-sm"
            >
              {filteredWaterbodies.map((wb) => (
                <option key={wb.id} value={wb.id}>
                  {wb.name} ({wb.district || "Basin"})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-4 text-[var(--text-muted)] pointer-events-none" />
          </div>

          {/* Selected Waterbody Status */}
          <div className="flex items-center justify-between text-[11px] font-mono-val text-[var(--text-muted)] pt-0.5">
            <span className="truncate max-w-[150px]">{selectedWaterbody?.name}</span>
            <span
              className={`font-semibold ${
                selectedWaterbody?.status === "CRITICAL_ALERT"
                  ? "text-rose-500"
                  : selectedWaterbody?.status === "HIGH_VULNERABILITY"
                  ? "text-amber-500"
                  : "text-emerald-500"
              }`}
            >
              {selectedWaterbody?.status === "CRITICAL_ALERT"
                ? "Critical"
                : selectedWaterbody?.status === "HIGH_VULNERABILITY"
                ? "High Risk"
                : "Monitored"}
            </span>
          </div>
        </div>

        {/* 3. Neat & Clear Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
          <div className="px-2.5 pb-1 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Menu
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setCurrentTab(item.key);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-[8px] transition-all flex items-center justify-between group gap-2.5 ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white font-semibold shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-[var(--text-muted)] group-hover:text-[var(--color-primary)]"
                    }`}
                  />
                  <span className="text-sm font-medium truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] font-mono-val px-2 py-0.5 rounded-[4px] border shrink-0 font-semibold ${
                      isActive
                        ? "bg-white/20 text-white border-white/30"
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 4. Bottom Action & Orbit Status */}
        <div className="p-3.5 border-t border-[var(--border)] bg-[var(--bg-card)] space-y-2.5 shrink-0">
          {(!currentUser || currentUser.role === "citizen") && (
            <button
              onClick={() => {
                onOpenReportModal();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full px-3.5 py-2.5 rounded-[8px] bg-[var(--color-accent-purple)] hover:bg-[var(--color-accent-purple-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Intrusion</span>
            </button>
          )}

          <div className="flex items-center justify-between text-[11px] font-mono-val text-[var(--text-muted)] px-1">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-[var(--color-primary)]" />
              <span>Sentinel-2 Pass</span>
            </span>
            <span className="text-emerald-500 font-semibold">Live 10m</span>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
};
