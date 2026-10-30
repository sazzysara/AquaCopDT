"use client";

import React, { useState } from "react";
import { AuthUser } from "./types";
import { useTheme } from "./ThemeContext";
import {
  Shield,
  Satellite,
  Waves,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Compass,
  Radio,
  Layers,
  Activity,
  Sun,
  Moon,
  Building,
  KeyRound,
  FileCheck2,
  User
} from "lucide-react";

interface AuthPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onExploreAsGuest?: () => void;
}

// Preset Dummy Credentials for fast testing
export const SAMPLE_CREDENTIALS = [
  {
    id: "officer-rajesh",
    name: "Officer Rajesh Varma",
    email: "officer.rajesh@aquacop.gov.in",
    password: "cop-officer-2026",
    role: "officer" as const,
    roleTitle: "Zonal Municipal Enforcement Officer",
    department: "Greater Chennai & Tambaram Waterbody Enforcement Cell",
    badgeId: "TN-REV-4082",
    avatar: "👮‍♂️",
    description: "Has statutory authority to issue Section 133 CrPC eviction notices and order drone inspections.",
    color: "from-emerald-500/15 to-teal-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
  },
  {
    id: "analyst-ananya",
    name: "Dr. Ananya Roy",
    email: "ananya.roy@sentinel-isro.gov.in",
    password: "ndwi-satellite-pass",
    role: "analyst" as const,
    roleTitle: "Lead Geospatial Remote Sensing Scientist",
    department: "ISRO NRSC Earth Observation Division",
    badgeId: "ISRO-EO-991",
    avatar: "🛰️",
    description: "Monitors Sentinel-2 MSI band reflections, NDWI shrinkage gradients, and radar anomalies.",
    color: "from-cyan-500/15 to-blue-500/5 border-cyan-500/30 text-cyan-600 dark:text-cyan-400"
  },
  {
    id: "citizen-priya",
    name: "Priya Sharma",
    email: "priya.citizen@aquaguard.org",
    password: "save-waterbodies-now",
    role: "citizen" as const,
    roleTitle: "Civic Wetland Watchdog & Community Guardian",
    department: "Citizen Water Guardians Network",
    badgeId: "CWG-IND-552",
    avatar: "🌊",
    description: "Submits geo-tagged photographic evidence of illegal earth-filling and masonry plinth intrusions.",
    color: "from-purple-500/15 to-fuchsia-500/5 border-purple-500/30 text-purple-600 dark:text-purple-400"
  }
];

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  onExploreAsGuest,
}) => {
  const { theme, toggleTheme } = useTheme();

  // Mode: "signin" | "signup"
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Form Inputs
  const [email, setEmail] = useState("officer.rajesh@aquacop.gov.in");
  const [password, setPassword] = useState("cop-officer-2026");
  const [name, setName] = useState("Officer Rajesh Varma");
  const [selectedRole, setSelectedRole] = useState<"officer" | "analyst" | "citizen">("officer");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string>("officer-rajesh");
  const [toastMessage, setToastMessage] = useState<string | null>(
    "Sample credentials pre-selected. Click 'Sign In' or click any sample below to autofill!"
  );

  // Handle clicking a sample credential
  const handleSelectSample = (sample: typeof SAMPLE_CREDENTIALS[0], autoLogin = false) => {
    setSelectedSampleId(sample.id);
    setEmail(sample.email);
    setPassword(sample.password);
    setName(sample.name);
    setSelectedRole(sample.role);
    setToastMessage(`Selected: ${sample.name} (${sample.roleTitle})`);

    if (autoLogin) {
      triggerLogin({
        id: sample.id,
        name: sample.name,
        email: sample.email,
        role: sample.role,
        roleTitle: sample.roleTitle,
        department: sample.department,
        badgeId: sample.badgeId,
        provider: "credentials",
      });
    }
  };

  // Login handler
  const triggerLogin = (customUser?: AuthUser) => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (customUser) {
        onLoginSuccess(customUser);
        return;
      }

      // Check if matches one of the samples
      const matched = SAMPLE_CREDENTIALS.find(
        (s) => s.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (matched) {
        onLoginSuccess({
          id: matched.id,
          name: matched.name,
          email: matched.email,
          role: matched.role,
          roleTitle: matched.roleTitle,
          department: matched.department,
          badgeId: matched.badgeId,
          provider: "credentials",
        });
      } else {
        // Dummy authenticate any user!
        const roleTitleMap = {
          officer: "Zonal Enforcement Officer",
          analyst: "Geospatial Analyst",
          citizen: "Citizen Guardian",
        };
        onLoginSuccess({
          id: `usr-${Date.now()}`,
          name: name.trim() || email.split("@")[0] || "AquaCop Sentinel User",
          email: email.trim() || "demo.user@aquacop.org",
          role: selectedRole,
          roleTitle: roleTitleMap[selectedRole],
          department:
            selectedRole === "officer"
              ? "Municipal Waterbody Conservation Department"
              : selectedRole === "analyst"
              ? "Satellite Remote Sensing Center"
              : "Citizen Environmental Defense Registry",
          badgeId: `COP-${Math.floor(1000 + Math.random() * 9000)}`,
          provider: "credentials",
        });
      }
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerLogin();
  };

  // Google OAuth Dummy Login
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setToastMessage("Verifying Google OAuth 2.0 Identity Token...");

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        id: "google-usr-772",
        name: "Sanjay Kumar",
        email: "sanjay.aquaguard@gmail.com",
        role: "citizen",
        roleTitle: "Verified Citizen Guardian & Environmental Reporter",
        department: "Public Civic Watchdog Registry (Google Verified)",
        badgeId: "GOOG-SEC-772",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        provider: "google",
      });
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col lg:flex-row relative overflow-x-hidden theme-surface">
      {/* Top Floating Theme & Quick Access Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-md hover:scale-105"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LEFT PANEL: First "AquaCop" Brand & Mission Showcase
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[52%] xl:w-[55%] p-6 sm:p-10 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--border)] bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-base)] to-[var(--bg-elevated)] relative overflow-hidden">
        {/* Decorative Radar Ambient Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[var(--color-primary)]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[var(--color-accent-purple)]/10 blur-3xl pointer-events-none" />

        {/* Top: Logo & System Classification Badge */}
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[var(--bg-input)] border border-[var(--border)] text-xs font-mono-val text-[var(--text-secondary)] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]"></span>
            </span>
            <span className="text-[var(--color-primary)] font-bold">ISRO & ESA SENTINEL-2 MSI</span>
            <span className="text-[var(--text-muted)]">·</span>
            <span>CO-ORBITAL WATER SENTINEL</span>
          </div>

          {/* Main Logo & Title: Official AquaCop Branding */}
          <div className="flex items-center gap-4 pt-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[18px] overflow-hidden border-2 border-[var(--border)] shadow-xl bg-white shrink-0 p-1">
              <img
                src="/aquacop-logo.jpg"
                alt="AquaCop Sentinel Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)] font-inter">
                  AquaCop
                </h1>
                <span className="text-xs font-mono-val px-2 py-0.5 rounded-[4px] bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold border border-[var(--color-primary)]/30">
                  v2.6 LIVE
                </span>
              </div>
              <p className="text-xs sm:text-sm font-mono-val text-[var(--text-muted)] mt-0.5">
                Satellite Waterbody Sentinel & Encroachment Response Command
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl pt-2">
            Autonomous multi-spectral radar surveillance protecting coastal wetlands, lakes, and urban catchments against illegal masonry plinths, earth-filling, and climate-induced flood disasters.
          </p>
        </div>

        {/* Center: Interactive Mission Telemetry Cards */}
        <div className="relative z-10 my-8 sm:my-10 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono-val text-[var(--text-muted)] border-b border-[var(--border)] pb-2">
            <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              ACTIVE SENTINEL RECONNAISSANCE GRID
            </span>
            <span className="text-[var(--color-success)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]"></span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Feature 1 */}
            <div className="p-4 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border)] shadow-sm hover:border-[var(--color-primary)] transition-all">
              <div className="w-8 h-8 rounded-[8px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-2.5">
                <Satellite className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Sentinel-2 MSI NDWI</div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                10-meter multi-spectral resolution tracking surface water retreat and bio-mass intrusion.
              </p>
              <div className="mt-2.5 text-[10px] font-mono-val text-[var(--color-primary)] font-semibold">
                B03 (Green) · B08 (NIR)
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-4 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border)] shadow-sm hover:border-[var(--color-accent-purple)] transition-all">
              <div className="w-8 h-8 rounded-[8px] bg-[var(--color-accent-purple)]/10 text-[var(--color-accent-purple)] flex items-center justify-center mb-2.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Cadastral Buffer Radar</div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                Automated 50m statutory High-Water buffer crossing alerts mapped to revenue survey plots.
              </p>
              <div className="mt-2.5 text-[10px] font-mono-val text-[var(--color-accent-purple)] font-semibold">
                Sec 133 CrPC · CRZ-2019
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-4 rounded-[10px] bg-[var(--bg-card)] border border-[var(--border)] shadow-sm hover:border-cyan-500 transition-all">
              <div className="w-8 h-8 rounded-[8px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2.5">
                <Waves className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-[var(--text-primary)]">Flood Inundation Sim</div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">
                Hydrodynamic modeling estimating catchment volume deficit under 50mm–200mm rainfall.
              </p>
              <div className="mt-2.5 text-[10px] font-mono-val text-cyan-600 dark:text-cyan-400 font-semibold">
                Predictive Surge Matrix
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Live Telemetry Metric Strip */}
        <div className="relative z-10 pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono-val text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-semibold">
              <Compass className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              4 Critical Basins:
            </span>
            <span className="text-[var(--text-secondary)]">Pallikaranai · Bellandur · Hussain Sagar · Deepor Beel</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-primary)] font-bold">14 Active Alerts</span>
            <span>·</span>
            <span>FastAPI Python Engine</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT PANEL: Login / Sign Up Form + Google + Sample Credentials
          ───────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[48%] xl:w-[45%] p-6 sm:p-10 lg:p-14 flex flex-col justify-center items-center bg-[var(--bg-card)] relative">
        <div className="w-full max-w-md space-y-6">
          {/* Header with Prominent, Bigger Font Size as Requested */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[10px] overflow-hidden border border-[var(--border)] bg-white p-0.5 shadow-sm shrink-0">
                <img src="/aquacop-logo.jpg" alt="AquaCop Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-sm font-black font-mono-val text-[var(--text-primary)] uppercase tracking-wider block">
                  AquaCop Sentinel
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono-val">
                  Official Statutory Authentication Gateway
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono-val text-[var(--color-primary)] font-semibold px-2.5 py-1 rounded-[6px] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
                <Lock className="w-3.5 h-3.5" />
                <span>SECURE SENTINEL TERMINAL</span>
              </div>

              {/* Mode Toggle Pills: Sign In vs Sign Up */}
              <div className="flex p-0.5 rounded-[8px] bg-[var(--bg-input)] border border-[var(--border)] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setToastMessage("Switching to Sign In mode");
                  }}
                  className={`px-3 py-1 rounded-[6px] transition-all ${
                    authMode === "signin"
                      ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-bold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setToastMessage("Switching to Sign Up mode. Create your sentinel identity!");
                  }}
                  className={`px-3 py-1 rounded-[6px] transition-all ${
                    authMode === "signup"
                      ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm font-bold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Little Big Font Size Header */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {authMode === "signin" ? "Sign In to AquaCop" : "Join the AquaCop Sentinel"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {authMode === "signin"
                ? "Enter your credentials to access the satellite radar and disaster command center."
                : "Create your verified credentials to report intrusions or oversee municipal water reserves."}
            </p>
          </div>

          {/* Toast / Notification Banner */}
          {toastMessage && (
            <div className="p-3 rounded-[8px] bg-[var(--status-investigation-bg)] border border-[var(--status-investigation-border)] text-[var(--status-investigation-text)] text-xs flex items-center justify-between gap-2 transition-all">
              <div className="flex items-center gap-2">
                <span className="font-medium">{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* If Sign Up mode: ask for Full Name and Role */}
            {authMode === "signup" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                    Full Name & Designation
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Officer Vikram Singh"
                      className="w-full pl-11 pr-4 py-3 text-base rounded-[8px] bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                    Assign Operational Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "officer", label: "Officer", desc: "Enforcement" },
                      { id: "analyst", label: "Analyst", desc: "Satellite" },
                      { id: "citizen", label: "Citizen", desc: "Watchdog" },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id as any)}
                        className={`p-2.5 rounded-[8px] border text-left transition-all ${
                          selectedRole === r.id
                            ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)] font-bold shadow-sm"
                            : "bg-[var(--bg-input)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                        }`}
                      >
                        <div className="text-xs font-bold">{r.label}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Email Field with Little Big Font Size */}
            <div>
              <label className="block text-sm sm:text-base font-semibold text-[var(--text-primary)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.gov.in / citizen@sentinel.org"
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 text-base sm:text-lg rounded-[8px] bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field with Little Big Font Size */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setToastMessage("For testing, feel free to use any sample credentials below!")}
                  className="text-xs text-[var(--color-primary)] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security token"
                  className="w-full pl-11 pr-11 py-3 sm:py-3.5 text-base sm:text-lg rounded-[8px] bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-mono-val font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span>Remember this terminal session</span>
              </label>
              <span className="font-mono-val text-[11px] text-[var(--text-muted)]">AES-256 Auth</span>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-[8px] bg-gradient-to-r from-[var(--color-primary)] to-[#008f6c] hover:brightness-110 text-white text-base font-bold shadow-lg shadow-[var(--color-primary)]/20 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating Sentinel Gateway...</span>
                </>
              ) : (
                <>
                  <span>{authMode === "signin" ? "Login to AquaCop" : "Create Account & Login"}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider: OR CONTINUE WITH */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-[var(--border)] w-full"></div>
            <span className="bg-[var(--bg-card)] px-3 text-xs font-mono-val text-[var(--text-muted)] uppercase tracking-wider shrink-0">
              or continue with
            </span>
          </div>

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-[8px] bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] text-sm sm:text-base font-semibold shadow-sm flex items-center justify-center gap-3 transition-all hover:border-[var(--border-hover)] disabled:opacity-50"
          >
            {/* Official Google G SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* ─────────────────────────────────────────────────────────────
              SAMPLE CREDENTIALS SECTION (Required by user)
              "for now the sample credentials shuld be shown if i click them
              and click that should be authenticate for dummy"
              ───────────────────────────────────────────────────────────── */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono-val font-bold text-[var(--color-primary)]">
                SAMPLE TEST CREDENTIALS
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono-val">
                Click any profile to test dummy auth
              </span>
            </div>

            <div className="space-y-2">
              {SAMPLE_CREDENTIALS.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample, false)}
                    className={`p-3 rounded-[8px] border transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${
                      isSelected
                        ? "bg-[var(--bg-elevated)] border-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-primary)]/30"
                        : "bg-[var(--bg-input)]/70 hover:bg-[var(--bg-elevated)] border-[var(--border)]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-lg shrink-0 shadow-sm">
                        {sample.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                            {sample.name}
                          </span>
                          <span className="text-[10px] font-mono-val px-1.5 py-0.2 rounded bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] shrink-0">
                            {sample.role.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono-val text-[var(--text-secondary)] truncate">
                          {sample.email}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono-val">
                          Pass: <span className="text-[var(--color-primary)] font-semibold">{sample.password}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSample(sample, true);
                        }}
                        title="Autofill and login instantly with this dummy account"
                        className="px-2.5 py-1.5 rounded-[6px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[11px] font-bold shadow-sm transition-all flex items-center gap-1"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Quick Login</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Guest Link */}
          {onExploreAsGuest && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onExploreAsGuest}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline transition-colors"
              >
                Skip authentication and preview dashboard as Anonymous Guest →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
