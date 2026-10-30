"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, DashboardTab } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";
import { EncroachmentHeatmap } from "../components/EncroachmentHeatmap";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";
import { OfficerPortal } from "../components/OfficerPortal";
import { CitizenPortal } from "../components/CitizenPortal";
import { FloodSimulator } from "../components/FloodSimulator";
import { SatelliteComparisonDashboard } from "../components/SatelliteComparisonDashboard";
import { ComplaintModal } from "../components/ComplaintModal";
import { OfficerLoginModal } from "../components/OfficerLoginModal";
import { AuthPage } from "../components/AuthPage";
import {
  INITIAL_WATERBODIES,
  INITIAL_ALERTS,
  INITIAL_COMPLAINTS,
  INITIAL_DELETED_COMPLAINTS,
} from "../components/mockData";
import { Waterbody, EncroachmentAlertItem, CitizenComplaintItem, AuthUser, ThreatChangeClass } from "../components/types";
import { useTheme } from "../components/ThemeContext";
import {
  Shield,
  Satellite,
  Waves,
  AlertTriangle,
  ArrowRight,
  Activity,
  Layers,
  FileCheck2,
  CheckCircle,
  TrendingDown,
  Building,
  Eye,
  Crosshair,
  Radio,
  MapPin,
  Clock,
  Sun,
  Moon,
  LogOut,
  Map,
  FileText
} from "lucide-react";

export default function AquaCopApp() {
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [citizenViewMode, setCitizenViewMode] = useState<"portal" | "map">("portal");

  const [currentTab, setCurrentTab] = useState<DashboardTab>("satellite");
  const [waterbodies, setWaterbodies] = useState<Waterbody[]>(INITIAL_WATERBODIES);
  const [alerts, setAlerts] = useState<EncroachmentAlertItem[]>(INITIAL_ALERTS);
  const [complaints, setComplaints] = useState<CitizenComplaintItem[]>(INITIAL_COMPLAINTS);
  const [deletedComplaints, setDeletedComplaints] = useState<CitizenComplaintItem[]>(INITIAL_DELETED_COMPLAINTS);
  const [selectedWaterbody, setSelectedWaterbody] = useState<Waterbody>(INITIAL_WATERBODIES[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 310);
      return next;
    });
  };

  // Modal States
  const [isOfficerLoggedIn, setIsOfficerLoggedIn] = useState(false);
  const [isOfficerLoginOpen, setIsOfficerLoginOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Restore authenticated session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aquacop_auth_user");
      if (saved) {
        const parsed: AuthUser = JSON.parse(saved);
        setCurrentUser(parsed);
        if (parsed.role === "officer") {
          setIsOfficerLoggedIn(true);
        }
      }

      // Restore custom complaints from localStorage
      const storedComplaints = localStorage.getItem("aquacop_custom_complaints");
      if (storedComplaints) {
        const parsedComplaints = JSON.parse(storedComplaints);
        if (Array.isArray(parsedComplaints) && parsedComplaints.length > 0) {
          setComplaints((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const newItems = parsedComplaints.filter((item: CitizenComplaintItem) => !existingIds.has(item.id));
            return [...newItems, ...prev];
          });
        }
      }

      // Restore deleted complaints from localStorage
      const storedDeleted = localStorage.getItem("aquacop_deleted_complaints");
      let deletedIds = new Set<string>();
      if (storedDeleted) {
        try {
          const parsedDeleted = JSON.parse(storedDeleted);
          if (Array.isArray(parsedDeleted) && parsedDeleted.length > 0) {
            setDeletedComplaints((prev) => {
              const existingIds = new Set(prev.map((item) => item.id));
              const newItems = parsedDeleted.filter((item: CitizenComplaintItem) => !existingIds.has(item.id));
              return [...newItems, ...prev];
            });
            parsedDeleted.forEach((d: CitizenComplaintItem) => deletedIds.add(d.id));
          }
        } catch (e) {}
      }

      // Ensure active complaints do not include any deleted records
      if (deletedIds.size > 0) {
        setComplaints((prev) => prev.filter((c) => !deletedIds.has(c.id)));
      }

      // Restore custom alerts from localStorage
      const storedAlerts = localStorage.getItem("aquacop_custom_alerts");
      if (storedAlerts) {
        const parsedAlerts = JSON.parse(storedAlerts);
        if (Array.isArray(parsedAlerts) && parsedAlerts.length > 0) {
          setAlerts((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const newItems = parsedAlerts.filter((item: EncroachmentAlertItem) => !existingIds.has(item.id));
            return [...newItems, ...prev];
          });
        }
      }
    } catch (e) {
      console.warn("Could not load user session", e);
    } finally {
      setIsAuthLoaded(true);
    }

    // Check URL parameters for role routing (e.g. ?role=officer or ?role=citizen or ?tab=satellite-comparison)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role");
      const tabParam = params.get("tab");
      if (tabParam === "satellite-comparison" || tabParam === "comparison") {
        setCurrentTab("satellite-comparison");
      } else if (roleParam === "officer") {
        setIsOfficerLoggedIn(true);
        setCurrentTab("officer");
      } else if (roleParam === "citizen") {
        setCurrentTab("citizen");
      }
    }

    // Fetch real-time waterbodies from FastAPI backend
    fetch("http://localhost:8001/api/waterbodies")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Waterbody[] = data.map((d: any, idx: number) => ({
            id: d.id,
            name: d.name,
            district: d.district || "Chennai",
            region: d.region || "Metropolitan Basin",
            type: d.type || "Wetland",
            coordinates: d.coordinates || [13.0, 80.2],
            originalAreaSqkm: d.original_area_sqkm || 10.0,
            currentAreaSqkm: d.current_area_sqkm || 7.5,
            encroachedAreaSqkm: d.encroached_area_sqkm || 2.5,
            ndwiIndex: d.ndwi_index || 0.42,
            floodRiskScore: d.flood_risk_score || 85,
            status: d.status || "MONITORED",
            activeEncroachmentsCount: d.active_encroachments_count || 1,
            lastSatellitePass: d.last_satellite_pass || "Sentinel-2A · Orbit Pass Verified",
            historicalYears: INITIAL_WATERBODIES[idx]?.historicalYears || [
              { year: 1995, area: d.original_area_sqkm, builtupDensity: 8 },
              { year: 2026, area: d.current_area_sqkm, builtupDensity: 64 },
            ],
            description: INITIAL_WATERBODIES[idx]?.description || `${d.name} under real-time Sentinel-2 NDWI surveillance.`
          }));
          setWaterbodies(mapped);
          setSelectedWaterbody(mapped[0]);
        }
      })
      .catch((e) => console.log("Using cached waterbodies", e));

    // Fetch real-time alerts from FastAPI backend
    fetch("http://localhost:8001/api/alerts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedAlerts: EncroachmentAlertItem[] = data.map((a: any) => ({
            id: a.id,
            waterbodyId: a.waterbody_id,
            waterbodyName: a.waterbody_name,
            severity: a.severity,
            threatClass: a.threat_class,
            threatName: a.threat_name,
            threatColor: a.threat_color,
            confidenceLabel: a.confidence_label,
            confidenceTier: a.confidence_tier,
            coordinates: a.coordinates,
            surveyPlot: a.survey_plot,
            detectedAt: a.detected_at,
            encroachmentType: a.encroachment_type,
            bufferDistanceMeters: a.buffer_distance_meters,
            disasterImpact: a.disaster_impact,
            disasterRiskScore: a.disaster_risk_score || 85,
            status: a.status,
            officerAssigned: a.officer_assigned,
            satelliteImageBefore: "Sentinel-2 Multi-Spectral Baseline",
            satelliteImageAfter: "Sentinel-2 Multi-Spectral Current",
            imageryDate: a.imagery_date,
            flaggedDate: a.flagged_date,
            detectionDelayDays: a.detection_delay_days,
            complaintDate: a.complaint_date,
            delaySavingsDays: a.delay_savings_days,
          }));
          setAlerts(mappedAlerts);
        }
      })
      .catch((e) => console.log("Using cached alerts", e));

    // Fetch real-time complaints from FastAPI backend
    fetch("http://localhost:8001/api/complaints")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mappedComplaints: CitizenComplaintItem[] = data.map((c: any) => ({
            id: c.id,
            anonymousId: c.anonymous_id || c.anonymousId || `ANON-CTZ-${c.id.slice(-4)}`,
            citizenName: c.citizen_name,
            citizenPhone: c.citizen_phone,
            waterbodyName: c.waterbody_name,
            district: c.district || "Chengalpattu",
            cityZone: c.city_zone,
            surveyNumber: c.survey_number,
            issueType: c.issue_type || "Land Filling",
            description: c.description,
            latitude: c.latitude,
            longitude: c.longitude,
            evidenceType: c.evidence_type,
            satelliteCrosscheckStatus: c.satellite_crosscheck_status || "VERIFIED_ANOMALY",
            createdAt: c.created_at,
            submittedDate: c.submitted_date || "25 Sep 2026",
            assignedAuthority: c.assigned_authority || (c.status === "Assigned" ? "Rajesh Kumar (Field Officer)" : undefined),
            updatedText: "Updated: Today",
            status: c.status,
            photos: c.photos || [
              { name: "site_photo_exif_gps.jpg", url: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80", size: "3.1 MB" }
            ],
            documents: c.documents || [
              { name: "cadastral_survey_deed.pdf", size: "1.2 MB", type: "PDF Evidence" }
            ]
          }));

          // Merge: Keep INITIAL_COMPLAINTS (WTN series) and append non-duplicate server records
          setComplaints((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const newServerItems = mappedComplaints.filter((item) => !existingIds.has(item.id));
            return [...prev, ...newServerItems];
          });
        }
      })
      .catch((e) => console.log("Using cached complaints", e));
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("aquacop_auth_user", JSON.stringify(user));
    } catch (e) {}
    if (user.role === "officer") {
      setIsOfficerLoggedIn(true);
      setCurrentTab("officer");
    } else if (user.role === "citizen") {
      setCurrentTab("citizen");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsOfficerLoggedIn(false);
    try {
      localStorage.removeItem("aquacop_auth_user");
    } catch (e) {}
  };

  const handleSwitchToCitizen = () => {
    const citizenUser: AuthUser = {
      id: "citizen-priya",
      name: "Priya Sharma",
      email: "priya.citizen@aquaguard.org",
      role: "citizen",
      roleTitle: "Civic Wetland Watchdog & Community Guardian",
      department: "Citizen Water Guardians Network",
      badgeId: "CWG-IND-552",
      provider: "credentials",
    };
    handleLoginSuccess(citizenUser);
    setCurrentTab("citizen");
  };

  const handleExploreAsGuest = () => {
    const guestUser: AuthUser = {
      id: "guest-usr-01",
      name: "Public Citizen Explorer",
      email: "public.guest@aquacop.org",
      role: "citizen",
      roleTitle: "Public Guest Guardian",
      department: "Open Citizen Observation Network",
      provider: "credentials",
    };
    handleLoginSuccess(guestUser);
    setCurrentTab("citizen");
  };

  // Status updates
  const handleUpdateAlertStatus = (alertId: string, newStatus: EncroachmentAlertItem["status"]) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === alertId ? { ...item, status: newStatus } : item))
    );
  };

  const handleUpdateComplaintStatus = (complaintId: string, newStatus: CitizenComplaintItem["status"]) => {
    setComplaints((prev) => {
      const updated = prev.map((item) => (item.id === complaintId ? { ...item, status: newStatus } : item));
      try {
        const customOnly = updated.filter((c) => !INITIAL_COMPLAINTS.some((ic) => ic.id === c.id));
        localStorage.setItem("aquacop_custom_complaints", JSON.stringify(customOnly));
      } catch (e) {}
      return updated;
    });
  };

  const handleAddNewComplaint = (newComplaint: CitizenComplaintItem) => {
    // 1. Update complaints list and save to localStorage
    setComplaints((prev) => {
      const updated = [newComplaint, ...prev];
      try {
        const customOnly = updated.filter((c) => !INITIAL_COMPLAINTS.some((ic) => ic.id === c.id));
        localStorage.setItem("aquacop_custom_complaints", JSON.stringify(customOnly));
      } catch (e) {}
      return updated;
    });

    // 2. Map issue type to ThreatChangeClass
    const threatClass = (
      newComplaint.issueType?.toLowerCase().includes("sand")
        ? "SAND_MINING"
        : newComplaint.issueType?.toLowerCase().includes("waste")
        ? "WASTE_DUMPING"
        : newComplaint.issueType?.toLowerCase().includes("construction")
        ? "CONSTRUCTION"
        : "LAND_FILLING"
    ) as ThreatChangeClass;

    // 3. Create linked high-priority alert for officers
    const anonId = newComplaint.anonymousId || `ANON-CTZ-${newComplaint.id.slice(-4)}`;
    const newAlert: EncroachmentAlertItem = {
      id: `ALT-CITIZEN-${Math.floor(100 + Math.random() * 900)}`,
      waterbodyId: selectedWaterbody.id,
      waterbodyName: newComplaint.waterbodyName,
      severity: "CRITICAL",
      threatClass,
      threatName: `Citizen Lodged · ${newComplaint.issueType || "Land Filling"}`,
      threatColor: "#EF4444",
      confidenceLabel: "Ground Verified Evidence · High Confidence",
      confidenceTier: "HIGH",
      coordinates: [newComplaint.latitude, newComplaint.longitude],
      surveyPlot: newComplaint.surveyNumber,
      detectedAt: "Just now",
      encroachmentType: `Citizen Grievance (${anonId}): ${newComplaint.description.slice(0, 90)}...`,
      bufferDistanceMeters: 12.5,
      disasterImpact: "Obstruction of wetland catchment line. Photographic evidence cross-referenced with Sentinel-2 satellite pass.",
      disasterRiskScore: 94,
      status: "PENDING_DISPATCH",
      officerAssigned: undefined,
      satelliteImageBefore: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      satelliteImageAfter: newComplaint.photoEvidenceUrl || "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80",
      imageryDate: "Today (Sentinel-2 Pass)",
      flaggedDate: "Today",
      detectionDelayDays: 0.1,
      complaintDate: "Today",
      delaySavingsDays: 0,
      citizenReported: true,
      complaintId: newComplaint.id,
      citizenName: `Anonymous Citizen (${anonId})`,
      anonymousId: anonId,
    };

    setAlerts((prev) => {
      const updated = [newAlert, ...prev];
      try {
        const customAlerts = updated.filter(a => a.citizenReported);
        localStorage.setItem("aquacop_custom_alerts", JSON.stringify(customAlerts));
      } catch (e) {}
      return updated;
    });
  };

  const handleDeleteComplaint = (complaintId: string, reason: string) => {
    const target = complaints.find((c) => c.id === complaintId);
    if (!target) return;

    const deletedRecord: CitizenComplaintItem = {
      ...target,
      isDeleted: true,
      deletionReason: reason,
      deletedAt: new Date().toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      deletedBy: currentUser?.name || "Priya Sharma",
      status: "Withdrawn",
      updatedText: "Withdrawn: Today",
    };

    // 1. Remove from active complaints
    setComplaints((prev) => {
      const updated = prev.filter((c) => c.id !== complaintId);
      try {
        const customOnly = updated.filter((c) => !INITIAL_COMPLAINTS.some((ic) => ic.id === c.id));
        localStorage.setItem("aquacop_custom_complaints", JSON.stringify(customOnly));
      } catch (e) {}
      return updated;
    });

    // 2. Add to deleted complaints
    setDeletedComplaints((prev) => {
      const updated = [deletedRecord, ...prev.filter((c) => c.id !== complaintId)];
      try {
        localStorage.setItem("aquacop_deleted_complaints", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 3. Remove corresponding alert if citizen reported
    setAlerts((prev) => {
      const updated = prev.filter((a) => a.complaintId !== complaintId);
      try {
        const customAlerts = updated.filter((a) => a.citizenReported);
        localStorage.setItem("aquacop_custom_alerts", JSON.stringify(customAlerts));
      } catch (e) {}
      return updated;
    });
  };

  const handleTriggerEnforcement = (wb: Waterbody) => {
    setCurrentTab("officer");
    if (!isOfficerLoggedIn) {
      setIsOfficerLoginOpen(true);
    }
  };

  // If user is not yet logged in, show the AuthPage first
  if (isAuthLoaded && !currentUser) {
    return (
      <AuthPage
        onLoginSuccess={handleLoginSuccess}
        onExploreAsGuest={handleExploreAsGuest}
      />
    );
  }

  // ── CITIZEN ROLE: Dedicated Full-Screen Citizen Complaint & Evidence Portal ──
  if (currentUser?.role === "citizen") {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] theme-surface">
        {/* Full-Screen Citizen Navigation Header */}
        <header className="sticky top-0 z-30 h-16 w-full border-b border-[var(--border)] bg-[var(--bg-nav)] backdrop-blur-md px-4 sm:px-8 flex items-center justify-between theme-surface shrink-0">
          {/* Left: Branding & Sentinel Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[9px] overflow-hidden border border-[var(--border)] bg-white p-0.5 shadow-xs shrink-0">
                <img src="/aquacop-logo.jpg" alt="AquaCop Logo" className="w-full h-full object-contain" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black tracking-tight font-inter text-[var(--text-primary)]">
                    AquaCop
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-val font-bold bg-[var(--color-primary)] text-white">
                    CITIZEN SENTINEL
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono-val hidden md:inline">
                  Tamil Nadu Water Resources · Section 133 CrPC Grievance Lodgement
                </span>
              </div>
            </div>
          </div>

          {/* Center: Full-Screen Mode Toggle (Portal vs Satellite Map) */}
          <div className="flex items-center p-1 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] text-xs">
            <button
              onClick={() => setCitizenViewMode("portal")}
              className={`px-3.5 py-1.5 rounded-[7px] font-semibold transition-all flex items-center gap-2 ${
                citizenViewMode === "portal"
                  ? "bg-[var(--bg-card)] text-[var(--color-primary)] shadow-xs font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Complaint Portal</span>
            </button>
            <button
              onClick={() => setCitizenViewMode("map")}
              className={`px-3.5 py-1.5 rounded-[7px] font-semibold transition-all flex items-center gap-2 ${
                citizenViewMode === "map"
                  ? "bg-[var(--bg-card)] text-[var(--color-primary)] shadow-xs font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Satellite Map</span>
            </button>
          </div>

          {/* Right Controls: Theme Toggle & User Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-[6px] bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors theme-surface"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-[var(--text-primary)]" />}
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-[8px] bg-[var(--bg-card)] border border-[var(--border)]">
                <div className="w-7 h-7 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0) : "P"}
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-xs font-bold text-[var(--text-primary)]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-mono-val text-[var(--color-primary)] font-semibold">
                    {currentUser.badgeId || "CWG-IND-552"}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs text-[var(--text-secondary)] hover:text-rose-600 px-2.5 py-1.5 bg-[var(--bg-card)] hover:bg-rose-500/10 border border-[var(--border)] hover:border-rose-500/30 rounded-[8px] transition-all flex items-center gap-1.5 font-medium"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Full-Screen Content */}
        {citizenViewMode === "map" ? (
          <div className="flex-1 p-4 sm:p-6 w-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Satellite className="w-4 h-4 text-[var(--color-primary)]" />
                <span>Real-Time Sentinel-2 Waterbody Encroachment Map</span>
              </h2>
              <button
                onClick={() => setCitizenViewMode("portal")}
                className="px-3.5 py-1.5 rounded-[8px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold shadow-xs"
              >
                Return to Complaint Portal
              </button>
            </div>
            <EncroachmentHeatmap
              waterbodies={waterbodies}
              complaints={complaints}
              selectedWaterbody={selectedWaterbody}
              onSelectWaterbody={setSelectedWaterbody}
              onTriggerEnforcement={handleTriggerEnforcement}
            />
          </div>
        ) : (
          <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
            <CitizenPortal
              complaints={complaints}
              waterbodies={waterbodies}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              currentUser={currentUser}
              onAddNewComplaint={handleAddNewComplaint}
              onDeleteComplaint={handleDeleteComplaint}
              isFullScreen={true}
            />
          </main>
        )}

        {/* Compact Footer */}
        <footer className="border-t border-[var(--border)] bg-[var(--bg-card)] py-4 text-xs text-[var(--text-muted)] theme-surface shrink-0">
          <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono-val text-[11px]">
              <img src="/aquacop-logo.jpg" alt="AquaCop" className="w-5 h-5 rounded-[4px] object-contain border border-[var(--border)] bg-white shrink-0" />
              <span className="text-[var(--text-primary)] font-bold">AquaCop</span>
              <span>·</span>
              <span>Citizen Water Guardians Network · Statutory Section 133 CrPC Eviction Sentinel</span>
            </div>
            <div className="flex items-center gap-4 font-mono-val text-[11px]">
              <span>Sentinel-2 MSI 10m Ground Verification</span>
              <span>·</span>
              <span className="text-[var(--color-primary)] font-semibold">2026 Resilient City Infrastructure</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-base)] text-[var(--text-primary)] theme-surface">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        waterbodies={waterbodies}
        selectedWaterbody={selectedWaterbody}
        onSelectWaterbody={setSelectedWaterbody}
        alertsCount={alerts.filter((a) => a.status !== "SEALED").length}
        complaintsCount={complaints.length}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={handleToggleSidebar}
        isOfficerLoggedIn={isOfficerLoggedIn}
        onOpenOfficerLogin={() => setIsOfficerLoginOpen(true)}
        currentUser={currentUser}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <Navbar
          currentTab={currentTab}
          selectedWaterbody={selectedWaterbody}
          isOfficerLoggedIn={isOfficerLoggedIn}
          currentUser={currentUser}
          isSidebarOpen={isSidebarOpen}
          onOpenOfficerLogin={() => setIsOfficerLoginOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onLogoutOfficer={() => setIsOfficerLoggedIn(false)}
          onLogoutUser={handleLogout}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* Content Container - Full width for edge-to-edge Satellite GIS, max-w-1440 for other tabs */}
        <main
          className={
            currentTab === "satellite" || currentTab === "citizen"
              ? "flex-1 p-3 sm:p-5 lg:p-6 space-y-6 w-full max-w-none"
              : "flex-1 p-6 sm:p-8 lg:p-10 space-y-8 max-w-[1440px] w-full mx-auto"
          }
        >
          {/* Top Basin Telemetry & Status Banner (Shown on non-satellite, non-citizen tabs to prevent duplicate header) */}
          {currentTab !== "satellite" && currentTab !== "citizen" && (
            <section className="p-6 sm:p-7 rounded-[12px] bg-[var(--bg-card)] box-outline theme-surface space-y-5 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Mission Badge & Target Details */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[10px] bg-[var(--bg-input)] box-outline flex items-center justify-center shrink-0">
                    <Satellite className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm sm:text-base font-mono-val font-bold text-[var(--text-primary)]">
                        {selectedWaterbody.name}
                      </span>
                      <span className="text-[10px] font-mono-val px-2.5 py-1 rounded-[4px] bg-[var(--severity-critical-bg)] text-[var(--severity-critical-text)] border border-[var(--severity-critical-border)] font-bold">
                        {selectedWaterbody.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono-val text-[var(--text-muted)]">
                      <span>Coords: [{selectedWaterbody.coordinates.join(", ")}]</span>
                      <span>·</span>
                      <span>Resolution: 10m Multi-Spectral</span>
                      <span>·</span>
                      <span className="text-[var(--color-primary)] font-semibold">{selectedWaterbody.lastSatellitePass}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Compact Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-val shrink-0">
                  <div className="px-4 py-2.5 rounded-[8px] bg-[var(--bg-input)] box-outline space-y-0.5">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">CURRENT AREA</span>
                    <span className="text-base font-bold text-[var(--color-primary)]">
                      {selectedWaterbody.currentAreaSqkm} km²
                    </span>
                  </div>

                  <div className="px-4 py-2.5 rounded-[8px] bg-[var(--bg-input)] box-outline space-y-0.5">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">ENCROACHED</span>
                    <span className="text-base font-bold text-[var(--color-danger)]">
                      -{selectedWaterbody.encroachedAreaSqkm} km²
                    </span>
                  </div>

                  <div className="px-4 py-2.5 rounded-[8px] bg-[var(--bg-input)] box-outline space-y-0.5">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">SPECTRAL NDWI</span>
                    <span className="text-base font-bold text-[var(--color-success)]">
                      +{selectedWaterbody.ndwiIndex}
                    </span>
                  </div>

                  <div className="px-4 py-2.5 rounded-[8px] bg-[var(--bg-input)] box-outline space-y-0.5">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">FLOOD HAZARD</span>
                    <span className="text-base font-bold text-[var(--status-purple-text)]">
                      {selectedWaterbody.floodRiskScore}/100
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Active Dashboard Switch with ample separation */}
          <section className="space-y-8">
            {currentTab === "satellite" && (
              <EncroachmentHeatmap
                waterbodies={waterbodies}
                complaints={complaints}
                selectedWaterbody={selectedWaterbody}
                onSelectWaterbody={setSelectedWaterbody}
                onTriggerEnforcement={handleTriggerEnforcement}
              />
            )}

            {currentTab === "satellite-comparison" && (
              <SatelliteComparisonDashboard
                waterbodies={waterbodies}
                selectedWaterbody={selectedWaterbody}
                onSelectWaterbody={setSelectedWaterbody}
              />
            )}

            {currentTab === "analytics" && (
              <AnalyticsDashboard
                selectedWaterbody={selectedWaterbody}
                waterbodies={waterbodies}
                onSelectWaterbody={setSelectedWaterbody}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}

            {currentTab === "officer" && (
              <OfficerPortal
                alerts={alerts}
                complaints={complaints}
                deletedComplaints={deletedComplaints}
                waterbodies={waterbodies}
                onUpdateAlertStatus={handleUpdateAlertStatus}
                onUpdateComplaintStatus={handleUpdateComplaintStatus}
                isLoggedIn={isOfficerLoggedIn}
                onOpenLoginModal={() => setIsOfficerLoginOpen(true)}
              />
            )}

            {currentTab === "citizen" && (
              <CitizenPortal
                complaints={complaints}
                waterbodies={waterbodies}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                currentUser={currentUser}
                onAddNewComplaint={handleAddNewComplaint}
                onDeleteComplaint={handleDeleteComplaint}
              />
            )}

            {currentTab === "simulator" && (
              <FloodSimulator
                selectedWaterbody={selectedWaterbody}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}
          </section>

          {/* System Methodology Footer Card with Crisp Box Outline */}
          <section className="p-6 sm:p-7 rounded-[12px] bg-[var(--bg-card)] box-outline theme-surface space-y-4 text-xs shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <span className="font-mono-val font-bold text-[var(--color-primary)] uppercase text-[11px] tracking-wider">
                Statutory Protocol & Spectral Radar Architecture
              </span>
              <span className="font-mono-val text-[11px] text-[var(--text-muted)]">
                Governed under Section 133 CrPC & Coastal Regulation Zone Notification (CRZ-2019)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[var(--text-secondary)] pt-1">
              <div className="space-y-1.5 p-3 rounded-[8px] bg-[var(--bg-base)] box-outline">
                <strong className="text-[var(--text-primary)] block font-semibold">1. Multi-Spectral NDWI Processing</strong>
                <p className="leading-relaxed">
                  Calculates Normalized Difference Water Index using Sentinel-2 Green (B03) and NIR (B08) to detect surface water loss under 10-meter resolution.
                </p>
              </div>
              <div className="space-y-1.5 p-3 rounded-[8px] bg-[var(--bg-base)] box-outline">
                <strong className="text-[var(--text-primary)] block font-semibold">2. Cadastral High-Water Buffer Overlay</strong>
                <p className="leading-relaxed">
                  Cross-references state revenue survey boundaries with the 50-meter statutory buffer line to identify masonry plinths and earth-fill intrusions.
                </p>
              </div>
              <div className="space-y-1.5 p-3 rounded-[8px] bg-[var(--bg-base)] box-outline">
                <strong className="text-[var(--text-primary)] block font-semibold">3. Multi-Tier Governance & Eviction</strong>
                <p className="leading-relaxed">
                  Citizen dossiers with EXIF geo-tags trigger immediate satellite re-check and route formal notices to the Zonal Revenue Officer enforcement queue.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Compact Footer */}
        <footer className="border-t border-[var(--border)] bg-[var(--bg-card)] py-5 text-xs text-[var(--text-muted)] theme-surface shrink-0">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-mono-val text-[11px]">
              <img src="/aquacop-logo.jpg" alt="AquaCop" className="w-5 h-5 rounded-[4px] object-contain border border-[var(--border)] bg-white shrink-0" />
              <span className="text-[var(--text-primary)] font-bold">AquaCop</span>
              <span>·</span>
              <span>Satellite-Driven Waterbody Preservation & Anti-Encroachment Sentinel</span>
            </div>
            <div className="flex items-center gap-4 font-mono-val text-[11px]">
              <span>FastAPI Python Core</span>
              <span>·</span>
              <span>Sentinel-2 MSI 10m</span>
              <span>·</span>
              <span className="text-[var(--color-primary)] font-semibold">2026 Resilient City Infrastructure</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <ComplaintModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        waterbodies={waterbodies}
        onSubmitComplaint={handleAddNewComplaint}
        currentUser={currentUser}
        onSwitchToCitizen={handleSwitchToCitizen}
      />

      <OfficerLoginModal
        isOpen={isOfficerLoginOpen}
        onClose={() => setIsOfficerLoginOpen(false)}
        onLoginSuccess={() => setIsOfficerLoggedIn(true)}
      />
    </div>
  );
}
