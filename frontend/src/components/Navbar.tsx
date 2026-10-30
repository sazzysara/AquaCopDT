"use client";

import React from "react";
import { useTheme } from "./ThemeContext";
import { DashboardTab } from "./Sidebar";
import { Waterbody, AuthUser } from "./types";
import {
  Shield,
  Menu,
  Sun,
  Moon,
  AlertTriangle,
  UserCheck,
  Lock,
  Compass,
  MapPin,
  ChevronRight,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Download
} from "lucide-react";

interface NavbarProps {
  currentTab: DashboardTab;
  selectedWaterbody: Waterbody;
  isOfficerLoggedIn: boolean;
  currentUser?: AuthUser | null;
  isSidebarOpen?: boolean;
  onOpenOfficerLogin: () => void;
  onOpenReportModal: () => void;
  onLogoutOfficer: () => void;
  onLogoutUser?: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  selectedWaterbody,
  isOfficerLoggedIn,
  currentUser,
  isSidebarOpen = true,
  onOpenOfficerLogin,
  onOpenReportModal,
  onLogoutOfficer,
  onLogoutUser,
  onToggleSidebar,
}) => {
  const { theme, toggleTheme } = useTheme();

  const tabTitles: Record<DashboardTab, { section: string; title: string }> = {
    satellite: { section: "MONITOR", title: "Heatmap" },
    citizen: { section: "REPORTS", title: "Complaints Received" },
    officer: { section: "ENFORCEMENT", title: "Encroachment Alerts" },
    analytics: { section: "METRICS", title: "Analytics" },
    simulator: { section: "SIMULATION", title: "Flood Simulator" },
  };

  const currentInfo = tabTitles[currentTab] || { section: "DASHBOARD", title: "AquaCop System" };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-[var(--border)] bg-[var(--bg-nav)] backdrop-blur-md px-4 sm:px-6 flex items-center justify-between theme-surface shrink-0">
      {/* Left: Slideable Sidebar Trigger + Dashboard Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-[8px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] transition-all flex items-center gap-1.5 shadow-sm"
          title={isSidebarOpen ? "Slide dashboard panel away" : "Slide dashboard panel in"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 text-[var(--color-primary)]" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-[var(--color-primary)]" />
          )}
          <span className="text-xs font-mono-val font-semibold hidden sm:inline">
            {isSidebarOpen ? "Collapse" : "Menu"}
          </span>
        </button>

        {/* AquaCop Brand Logo when sidebar is collapsed */}
        {!isSidebarOpen && (
          <div className="flex items-center gap-2.5 pr-2 border-r border-[var(--border)]">
            <div className="w-8 h-8 rounded-[8px] overflow-hidden border border-[var(--border)] bg-white p-0.5 shadow-2xs shrink-0">
              <img src="/aquacop-logo.jpg" alt="AquaCop Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-sm text-[var(--text-primary)] tracking-tight hidden md:inline">
              AquaCop
            </span>
          </div>
        )}

        {/* Dashboard Title & Breadcrumb */}
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono-val text-[var(--text-muted)]">
            <span className="text-[var(--color-primary)] font-semibold">{currentInfo.section}</span>
            <ChevronRight className="w-3 h-3 text-[var(--border)]" />
            <span className="truncate max-w-[150px] sm:max-w-none">{selectedWaterbody?.name || "Target Basin"}</span>
          </div>
          <h1 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-tight truncate max-w-[220px] sm:max-w-md">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Orbital Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[var(--bg-input)] border border-[var(--border)] text-[11px] font-mono-val text-[var(--text-muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] inline-block"></span>
          <span className="text-[var(--text-secondary)]">Sentinel-2B:</span>
          <span className="text-[var(--color-success)] font-semibold">10m RES</span>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-[6px] bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors theme-surface"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-[var(--text-primary)]" />}
        </button>

        {/* Technical Report PDF Download Link */}
        <a
          href="http://localhost:8000/api/reports/technical-report"
          target="_blank"
          rel="noopener noreferrer"
          download="AquaCop_Technical_Architecture_Report.pdf"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-[6px] bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--color-primary)] transition-all shadow-2xs group"
          title="Download Complete 7-Page Technical Architecture & System Specification PDF"
        >
          <FileText className="w-3.5 h-3.5 text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline">Tech Report (PDF)</span>
          <Download className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--color-primary)]" />
        </a>

        {/* Quick Report Intrusion Button (Citizen Only) */}
        {(!currentUser || currentUser.role === "citizen") && (
          <button
            onClick={onOpenReportModal}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[6px] bg-[var(--color-accent-purple)] hover:bg-[var(--color-accent-purple-hover)] text-white transition-colors border border-[#a31da3]/50 shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Intrusion</span>
          </button>
        )}

        {/* Authenticated User / Sign Out Controls */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-1 border-l border-[var(--border)]">
            <div className="flex items-center gap-2 px-2 py-1 rounded-[6px] bg-[var(--bg-card)] border border-[var(--border)]">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <div className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-mono-val text-[var(--color-primary)] font-semibold truncate max-w-[120px]">
                  {currentUser.role.toUpperCase()}
                </div>
              </div>
            </div>

            <button
              onClick={onLogoutUser}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--danger-banner-text)] px-2.5 py-1.5 bg-[var(--bg-card)] hover:bg-[var(--danger-banner-bg)] border border-[var(--border)] hover:border-[var(--danger-banner-border)] rounded-[6px] transition-all flex items-center gap-1.5 font-medium"
              title="Sign Out / Switch Account to Login Page"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : isOfficerLoggedIn ? (
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono-val px-2 py-1 bg-[var(--bg-card)] text-[var(--status-verified-text)] rounded-[6px] border border-[var(--border)]">
              <UserCheck className="w-3 h-3 text-[var(--color-primary)]" />
              Officer #408
            </span>
            <button
              onClick={onLogoutOfficer}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-[6px] transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenOfficerLogin}
            className="text-xs font-medium px-2.5 py-1.5 rounded-[6px] bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] transition-colors flex items-center gap-1.5 theme-surface"
          >
            <Lock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span className="hidden sm:inline">Officer Login</span>
            <span className="sm:hidden">Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
