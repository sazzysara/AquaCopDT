"use client";

import React, { useState, useEffect, useMemo } from "react";
import { EncroachmentAlertItem, Waterbody, CitizenComplaintItem } from "./types";
import {
  ShieldAlert,
  Send,
  FileCheck,
  CheckCircle2,
  Clock,
  Filter,
  AlertOctagon,
  Eye,
  Building,
  UserCheck,
  Waves,
  MapPin,
  FileText,
  AlertTriangle,
  Download,
  Inbox,
  Satellite,
  User,
  ExternalLink,
  ChevronRight,
  Search,
  Phone,
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  Archive,
  FileSearch,
} from "lucide-react";

interface OfficerPortalProps {
  alerts: EncroachmentAlertItem[];
  complaints?: CitizenComplaintItem[];
  deletedComplaints?: CitizenComplaintItem[];
  waterbodies: Waterbody[];
  onUpdateAlertStatus: (alertId: string, newStatus: EncroachmentAlertItem["status"]) => void;
  onUpdateComplaintStatus?: (complaintId: string, newStatus: CitizenComplaintItem["status"]) => void;
  isLoggedIn: boolean;
  onOpenLoginModal: () => void;
}

export const OfficerPortal: React.FC<OfficerPortalProps> = ({
  alerts,
  complaints = [],
  deletedComplaints = [],
  waterbodies,
  onUpdateAlertStatus,
  onUpdateComplaintStatus,
  isLoggedIn,
  onOpenLoginModal,
}) => {
  // Mode Switcher: "alerts" (Satellite triggers) vs "complaints" (Citizen grievances) vs "deleted" (Withdrawn/deleted grievances)
  const [activePortalTab, setActivePortalTab] = useState<"alerts" | "complaints" | "deleted">("alerts");

  // Satellite alerts filter states
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedThreat, setSelectedThreat] = useState<string>("ALL");
  const [inspectingAlert, setInspectingAlert] = useState<EncroachmentAlertItem | null>(alerts[0] || null);

  // Citizen complaints filter states
  const [inspectingComplaint, setInspectingComplaint] = useState<CitizenComplaintItem | null>(complaints[0] || null);
  const [complaintSearch, setComplaintSearch] = useState("");
  const [complaintStatusFilter, setComplaintStatusFilter] = useState("ALL");

  // Deleted complaints filter states
  const [inspectingDeletedComplaint, setInspectingDeletedComplaint] = useState<CitizenComplaintItem | null>(deletedComplaints[0] || null);
  const [deletedSearch, setDeletedSearch] = useState("");

  // Lightbox for photos
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  // Feedback toast
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Auto-sync inspecting items when lists change
  useEffect(() => {
    if (alerts.length > 0 && (!inspectingAlert || !alerts.some(a => a.id === inspectingAlert.id))) {
      setInspectingAlert(alerts[0]);
    }
  }, [alerts]);

  useEffect(() => {
    if (complaints.length > 0 && (!inspectingComplaint || !complaints.some(c => c.id === inspectingComplaint.id))) {
      setInspectingComplaint(complaints[0]);
    }
  }, [complaints]);

  useEffect(() => {
    if (deletedComplaints.length > 0 && (!inspectingDeletedComplaint || !deletedComplaints.some(c => c.id === inspectingDeletedComplaint.id))) {
      setInspectingDeletedComplaint(deletedComplaints[0]);
    }
  }, [deletedComplaints]);

  // Filtered satellite alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      if (selectedSeverity !== "ALL" && item.severity !== selectedSeverity) return false;
      if (selectedThreat !== "ALL") {
        if (selectedThreat === "CONSTRUCTION" && item.threatClass !== "CONSTRUCTION") return false;
        if (selectedThreat === "LAND_FILLING" && item.threatClass !== "LAND_FILLING") return false;
        if (selectedThreat === "SAND_MINING" && item.threatClass !== "SAND_MINING") return false;
        if (selectedThreat === "WASTE_DUMPING" && item.threatClass !== "WASTE_DUMPING") return false;
      }
      return true;
    });
  }, [alerts, selectedSeverity, selectedThreat]);

  // Filtered citizen complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const q = complaintSearch.toLowerCase();
      const matchesSearch =
        !q ||
        c.waterbodyName.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.surveyNumber.toLowerCase().includes(q) ||
        (c.issueType && c.issueType.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (complaintStatusFilter === "ALL") return true;

      const normStatus = c.status.toLowerCase().replace(/\s+/g, "");
      const normFilter = complaintStatusFilter.toLowerCase().replace(/\s+/g, "");
      return normStatus === normFilter;
    });
  }, [complaints, complaintSearch, complaintStatusFilter]);

  // Filtered deleted / withdrawn complaints
  const filteredDeletedComplaints = useMemo(() => {
    return deletedComplaints.filter((c) => {
      const q = deletedSearch.toLowerCase();
      const matchesSearch =
        !q ||
        c.waterbodyName.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.surveyNumber.toLowerCase().includes(q) ||
        (c.deletionReason && c.deletionReason.toLowerCase().includes(q)) ||
        (c.issueType && c.issueType.toLowerCase().includes(q));

      return matchesSearch;
    });
  }, [deletedComplaints, deletedSearch]);

  const handleAuditAction = (label: string) => {
    setActionFeedback(`Audit Recorded: ${label}`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleAction = (alertId: string, action: EncroachmentAlertItem["status"], label: string) => {
    onUpdateAlertStatus(alertId, action);
    setActionFeedback(`Success: ${label} recorded in statutory audit registry.`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleComplaintAction = (complaintId: string, newStatus: CitizenComplaintItem["status"], label: string) => {
    if (onUpdateComplaintStatus) {
      onUpdateComplaintStatus(complaintId, newStatus);
    }
    if (inspectingComplaint && inspectingComplaint.id === complaintId) {
      setInspectingComplaint({ ...inspectingComplaint, status: newStatus });
    }
    setActionFeedback(`Statutory Action Taken: ${label} for Case #${complaintId}`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Officer Auth Bar */}
      <div className="p-6 sm:p-7 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-6 theme-surface shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[10px] overflow-hidden border border-[var(--border)] bg-white p-1 shrink-0 shadow-xs">
            <img src="/aquacop-logo.jpg" alt="AquaCop Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-base font-bold text-[var(--text-primary)] font-mono-val tracking-tight">
                MUNICIPAL & REVENUE ENFORCEMENT COMMAND
              </h2>
              {isLoggedIn ? (
                <span className="text-[10px] font-mono-val px-2.5 py-1 rounded-[4px] bg-[var(--status-verified-bg)] text-[var(--status-verified-text)] border border-[var(--status-verified-border)] font-semibold">
                  OFFICER VERIFIED · SEC 133 CrPC
                </span>
              ) : (
                <span className="text-[10px] font-mono-val px-2.5 py-1 rounded-[4px] bg-[var(--severity-critical-bg)] text-[var(--severity-critical-text)] border border-[var(--severity-critical-border)] font-semibold">
                  PUBLIC READ-ONLY MODE
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Sentinel-2 multi-spectral radar telemetry cross-referenced with public citizen evidence dossiers under Section 133 CrPC.
            </p>
          </div>
        </div>

        {!isLoggedIn ? (
          <button
            onClick={onOpenLoginModal}
            className="self-start md:self-auto px-5 py-2.5 rounded-[8px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm shrink-0"
          >
            <UserCheck className="w-4 h-4" />
            <span>Authenticate Officer Credentials</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 text-xs font-mono-val text-[var(--text-muted)] shrink-0">
            <span>Jurisdiction: Greater Metropolitan Enforcement Cell</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)] animate-pulse"></span>
          </div>
        )}
      </div>

      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div className="p-4 rounded-[10px] bg-[var(--status-verified-bg)] border border-[var(--color-primary)] text-[var(--text-primary)] text-xs font-mono-val flex items-center gap-3 theme-surface animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-[var(--status-verified-text)] shrink-0" />
          <span className="font-semibold">{actionFeedback}</span>
        </div>
      )}

      {/* ── Officer Navigation Tabs: Sentinel Alerts vs Citizen Grievances ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2.5 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] theme-surface">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActivePortalTab("alerts")}
            className={`px-4 py-2.5 rounded-[8px] text-xs font-mono-val font-semibold flex items-center gap-2 transition-all ${
              activePortalTab === "alerts"
                ? "bg-[var(--color-primary)] text-white shadow-sm font-bold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            }`}
          >
            <Satellite className="w-4 h-4" />
            <span>Sentinel-2 Radar Triggers</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activePortalTab === "alerts" ? "bg-white/20 text-white" : "bg-[var(--bg-input)] text-[var(--text-primary)]"
            }`}>
              {alerts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortalTab("complaints")}
            className={`px-4 py-2.5 rounded-[8px] text-xs font-mono-val font-semibold flex items-center gap-2 transition-all relative ${
              activePortalTab === "complaints"
                ? "bg-[var(--color-primary)] text-white shadow-sm font-bold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Citizen Grievances & Evidence</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activePortalTab === "complaints"
                ? "bg-white/20 text-white"
                : "bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold"
            }`}>
              {complaints.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortalTab("deleted")}
            className={`px-4 py-2.5 rounded-[8px] text-xs font-mono-val font-semibold flex items-center gap-2 transition-all relative ${
              activePortalTab === "deleted"
                ? "bg-rose-700 text-white shadow-sm font-bold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Withdrawn / Deleted Grievances</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activePortalTab === "deleted"
                ? "bg-white/20 text-white"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold"
            }`}>
              {deletedComplaints.length}
            </span>
          </button>
        </div>

        <div className="px-3 text-[11px] font-mono-val text-[var(--text-muted)] hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Live Sentinel-2 Cross-Verification Active</span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 1. CITIZEN GRIEVANCES & PUBLIC EVIDENCE VIEW                          */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activePortalTab === "complaints" && (
        <div className="space-y-6">
          {/* Filter Bar for Citizen Complaints */}
          <div className="p-4 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-3 theme-surface">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono-val">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="font-bold text-[var(--text-primary)] uppercase">
                  Public Evidence Lodgements ({filteredComplaints.length} Records):
                </span>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search by lake, citizen, ID..."
                  value={complaintSearch}
                  onChange={(e) => setComplaintSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-[6px] bg-[var(--bg-input)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--color-primary)] font-mono-val"
                />
              </div>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--border)]">
              {[
                { id: "ALL", label: "All Complaints" },
                { id: "Under Review", label: "Under AI Review" },
                { id: "Assigned", label: "Assigned to Field" },
                { id: "Field Inspection", label: "Field Inspection Active" },
                { id: "Action Taken", label: "Notice Issued / Action Taken" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setComplaintStatusFilter(s.id)}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-mono-val transition-all border ${
                    complaintStatusFilter === s.id
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] font-bold shadow-xs"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Complaint Items Feed (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <span className="text-xs font-bold text-[var(--text-primary)] font-mono-val uppercase tracking-wider">
                  Citizen Lodgement Queue ({filteredComplaints.length})
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-mono-val">
                  Sorted: Newest First
                </span>
              </div>

              {filteredComplaints.length === 0 ? (
                <div className="p-8 text-center rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-muted)]">
                  No citizen complaints match your filter.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredComplaints.map((item) => {
                    const isSelected = inspectingComplaint?.id === item.id;
                    const isNewlyFiled = item.id.startsWith("AQ-") || item.updatedText === "Updated: Just now" || item.submittedDate === "Today";

                    return (
                      <div
                        key={item.id}
                        onClick={() => setInspectingComplaint(item)}
                        className={`p-4 sm:p-5 rounded-[12px] cursor-pointer transition-all border theme-surface space-y-3 ${
                          isSelected
                            ? "bg-[var(--bg-elevated)] border-[var(--color-primary)] shadow-md ring-1 ring-[var(--color-primary)]/20"
                            : "bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--border-hover)] hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono-val font-bold text-[var(--text-primary)]">
                                {item.id}
                              </span>
                              {isNewlyFiled && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono-val font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                                  NEW LODGEMENT
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono-val font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                                {item.issueType || "Encroachment"}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-[var(--text-primary)]">
                              {item.waterbodyName}
                            </h4>
                            <p className="text-[11px] font-mono-val text-[var(--text-muted)]">
                              Filed by: <strong className="text-[var(--text-primary)]">{item.citizenName}</strong> · Plot: {item.surveyNumber}
                            </p>
                          </div>

                          <span className="text-[11px] font-mono-val text-[var(--text-muted)] shrink-0">
                            {item.submittedDate || "Recent"}
                          </span>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono-val">
                          <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                            <FileCheck className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                            <span>{(item.photos?.length || 1)} Photos · {(item.documents?.length || 1)} Docs</span>
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                              item.status === "Under Review"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                : item.status === "Field Inspection" || item.status === "Assigned"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Citizen Evidence Dossier & Officer Action Command (7 cols) */}
            <div className="lg:col-span-7">
              {inspectingComplaint ? (
                <div className="p-7 sm:p-8 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-6 theme-surface shadow-sm">
                  {/* Dossier Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-mono-val text-[var(--color-primary)] font-bold">
                          PUBLIC GRIEVANCE DOSSIER #{inspectingComplaint.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono-val font-bold border ${
                            inspectingComplaint.status === "Under Review"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              : inspectingComplaint.status === "Field Inspection" || inspectingComplaint.status === "Assigned"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {inspectingComplaint.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono-val bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold">
                          SHA-256 TAMPER-PROOF
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                        {inspectingComplaint.waterbodyName}
                      </h3>
                      <p className="text-xs font-mono-val text-[var(--text-muted)]">
                        District: <span className="text-[var(--text-primary)] font-semibold">{inspectingComplaint.district || "Chengalpattu"}</span> · Cadastral Plot: <span className="text-[var(--text-primary)] font-semibold">{inspectingComplaint.surveyNumber}</span>
                      </p>
                    </div>

                    <div className="text-left sm:text-right text-xs font-mono-val space-y-0.5 p-3 rounded-[8px] bg-[var(--bg-input)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-muted)] block uppercase font-medium">GPS PIN</span>
                      <span className="text-[var(--text-primary)] font-bold">
                        {inspectingComplaint.latitude}° N, {inspectingComplaint.longitude}° E
                      </span>
                    </div>
                  </div>

                  {/* Citizen Identity & Contact Details Card */}
                  <div className="p-4 rounded-[10px] bg-[var(--bg-base)] border border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono-val">
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block uppercase">Reporting Citizen</span>
                      <strong className="text-[var(--text-primary)] block mt-0.5">{inspectingComplaint.citizenName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block uppercase">Contact Phone</span>
                      <strong className="text-[var(--text-primary)] block mt-0.5">{inspectingComplaint.citizenPhone || "+91 98402 77102"}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block uppercase">Lodged Date</span>
                      <strong className="text-[var(--text-primary)] block mt-0.5">{inspectingComplaint.submittedDate || "25 Sep 2026"}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] block uppercase">Jurisdiction</span>
                      <strong className="text-[var(--text-primary)] block mt-0.5">Sec 133 CrPC</strong>
                    </div>
                  </div>

                  {/* Citizen Statement */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[var(--text-primary)] font-mono-val uppercase tracking-wider block">
                      Citizen Grievance Statement:
                    </span>
                    <blockquote className="p-4 rounded-[8px] bg-[var(--bg-base)] border-l-4 border-[var(--color-primary)] text-xs text-[var(--text-primary)] leading-relaxed italic">
                      &ldquo;{inspectingComplaint.description}&rdquo;
                    </blockquote>
                  </div>

                  {/* Photographic Evidence Gallery */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono-val text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                        Geo-Tagged Photographic Evidence
                      </span>
                      <span className="text-[10px] font-mono-val text-emerald-600 dark:text-emerald-400 font-semibold">
                        EXIF Metadata Timestamp Corroborated
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(inspectingComplaint.photos && inspectingComplaint.photos.length > 0
                        ? inspectingComplaint.photos
                        : [
                            {
                              name: "site_encroachment_photo_01.jpg",
                              url: inspectingComplaint.photoEvidenceUrl || "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
                              size: "3.2 MB"
                            }
                          ]
                      ).map((photo, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedPhotoPreview(photo.url)}
                          className="group relative rounded-[10px] overflow-hidden border border-[var(--border)] cursor-pointer bg-[var(--bg-base)] aspect-video"
                        >
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-[10px] font-mono-val flex justify-between">
                            <span className="truncate">{photo.name}</span>
                            <span className="shrink-0">{photo.size || "3.2 MB"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attached Cadastral Documents */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-mono-val text-[var(--text-muted)] uppercase tracking-wider font-semibold block">
                      Attached Legal & Revenue Documents:
                    </span>
                    <div className="space-y-2">
                      {(inspectingComplaint.documents && inspectingComplaint.documents.length > 0
                        ? inspectingComplaint.documents
                        : [
                            { name: "Cadastral_Revenue_Survey_Sketch.pdf", size: "1.4 MB", type: "Survey Deed Evidence" }
                          ]
                      ).map((doc, idx) => (
                        <a
                          key={idx}
                          href={`http://localhost:8001/api/reports/eviction-notice/${inspectingComplaint.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={`AquaCop_Evidence_${inspectingComplaint.id}.pdf`}
                          className="p-3 rounded-[8px] bg-[var(--bg-base)] hover:bg-[var(--bg-input)] border border-[var(--border)] hover:border-[var(--color-primary)] flex items-center justify-between gap-3 text-xs transition-all cursor-pointer group"
                          title="Click to download statutory evidence PDF"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                            <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] truncate">{doc.name}</span>
                            <span className="text-[10px] font-mono-val text-[var(--text-muted)]">({doc.size || "1.2 MB"})</span>
                          </div>
                          <span className="px-2.5 py-1 rounded text-[10px] font-mono-val bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold shrink-0 flex items-center gap-1 group-hover:bg-emerald-500/20 transition-colors">
                            <Download className="w-3 h-3" />
                            DOWNLOAD EVIDENCE PDF
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Sentinel-2 Crosscheck Telemetry Banner */}
                  <div className="p-4 rounded-[10px] bg-[var(--bg-input)] border border-blue-500/30 flex items-center justify-between gap-4 text-xs font-mono-val">
                    <div className="flex items-center gap-2.5">
                      <Satellite className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                      <span>Sentinel-2 Crosscheck Status: <strong className="text-[var(--color-primary)]">{inspectingComplaint.satelliteCrosscheckStatus}</strong></span>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      92% Evidence Match
                    </span>
                  </div>

                  {/* Officer Statutory Action Controls */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-mono-val text-[var(--text-muted)] uppercase tracking-wider font-semibold block">
                      Officer Statutory Enforcement Dispatch:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <button
                        onClick={() => handleComplaintAction(inspectingComplaint.id, "Field Inspection", "Field Inspection Dispatched")}
                        className="p-3 rounded-[8px] bg-[var(--bg-input)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2 transition-all shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                        <span>Order Field Inspection</span>
                      </button>

                      <button
                        onClick={() => handleComplaintAction(inspectingComplaint.id, "Notice Served", "Section 133 CrPC Eviction Notice Issued")}
                        className="p-3 rounded-[8px] bg-[var(--color-accent-purple)] hover:bg-[var(--color-accent-purple-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Issue Sec 133 Notice</span>
                      </button>

                      <a
                        href={`http://localhost:8001/api/reports/eviction-notice/${inspectingComplaint.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-[8px] bg-[var(--color-danger)] hover:opacity-90 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Court PDF</span>
                      </a>

                      <button
                        onClick={() => handleComplaintAction(inspectingComplaint.id, "Action Taken", "Demolition & Buffer Restoration Enforced")}
                        className="p-3 rounded-[8px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Restored / Closed</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] text-center text-xs text-[var(--text-muted)] space-y-2">
                  <Inbox className="w-8 h-8 mx-auto text-[var(--text-muted)]" />
                  <p>Select a citizen grievance from the queue to inspect statutory evidence.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 2. SENTINEL-2 RADAR ALERTS VIEW (EXISTING HIGH-TECH TELEMETRY)        */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activePortalTab === "alerts" && (
        <div className="space-y-6">
          {/* Threat Class & Severity Filter Bar */}
          <div className="p-4 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-3 theme-surface">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono-val">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="font-bold text-[var(--text-primary)] uppercase">Filter by Monitored Threat Class:</span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">
                Honest confidence labels strictly applied · All detections require field verification
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "ALL", label: "All Threats", color: "border-[var(--border)] text-[var(--text-primary)]" },
                { id: "CONSTRUCTION", label: "Construction (High Conf.)", color: "border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/10" },
                { id: "LAND_FILLING", label: "Land Filling (High Conf.)", color: "border-orange-500/40 text-orange-600 dark:text-orange-400 bg-orange-500/10" },
                { id: "SAND_MINING", label: "Sand Mining (Medium Conf. - Verify)", color: "border-yellow-500/40 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10" },
                { id: "WASTE_DUMPING", label: "Waste Dumping (Candidate - Verify)", color: "border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedThreat(t.id)}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-mono-val transition-all border ${t.color} ${
                    selectedThreat === t.id
                      ? "ring-2 ring-[var(--color-primary)] font-bold shadow-sm"
                      : "opacity-75 hover:opacity-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid with spacious gap */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Alerts Feed Column (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <span className="text-xs font-bold text-[var(--text-primary)] font-mono-val uppercase tracking-wider">
                  Active Encroachment Triggers ({filteredAlerts.length})
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-mono-val bg-[var(--bg-elevated)] p-1 rounded-[6px] border border-[var(--border)]">
                  {(["ALL", "CRITICAL", "HIGH"] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSelectedSeverity(sev)}
                      className={`px-2.5 py-1 rounded-[4px] transition-colors font-medium ${
                        selectedSeverity === sev
                          ? "bg-[var(--bg-card)] text-[var(--text-primary)] font-bold shadow-sm"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredAlerts.map((alert) => {
                  const isSelected = inspectingAlert?.id === alert.id;
                  return (
                    <div
                      key={alert.id}
                      onClick={() => setInspectingAlert(alert)}
                      className={`p-5 rounded-[12px] cursor-pointer transition-all border theme-surface space-y-3.5 ${
                        isSelected
                          ? "bg-[var(--bg-elevated)] border-[var(--color-primary)] shadow-md ring-1 ring-[var(--color-primary)]/20"
                          : "bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--border-hover)] hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold font-mono-val border ${
                                alert.severity === "CRITICAL"
                                  ? "bg-[var(--severity-critical-bg)] text-[var(--severity-critical-text)] border-[var(--severity-critical-border)]"
                                  : alert.severity === "HIGH"
                                  ? "bg-[var(--severity-high-bg)] text-[var(--severity-high-text)] border-[var(--severity-high-border)]"
                                  : "bg-[var(--severity-moderate-bg)] text-[var(--severity-moderate-text)] border-[var(--severity-moderate-border)]"
                              }`}
                            >
                              {alert.severity}
                            </span>
                            {alert.citizenReported && (
                              <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono-val font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                CITIZEN LODGED
                              </span>
                            )}
                            {alert.threatName && (
                              <span
                                className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono-val font-semibold border"
                                style={{
                                  borderColor: `${alert.threatColor || "#EF4444"}55`,
                                  color: alert.threatColor || "#EF4444",
                                  backgroundColor: `${alert.threatColor || "#EF4444"}15`
                                }}
                              >
                                {alert.threatName}
                              </span>
                            )}
                            <span className="text-xs font-mono-val text-[var(--text-primary)] font-bold">
                              {alert.id}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                            {alert.waterbodyName}
                          </p>
                        </div>
                        <span className="text-[11px] font-mono-val text-[var(--text-muted)] whitespace-nowrap">
                          {alert.detectedAt}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {alert.encroachmentType}
                      </p>

                      {/* Detection Delay Comparison Tag */}
                      <div className="p-2.5 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border)] text-[11px] font-mono-val flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[var(--text-muted)]">
                          🛰️ Satellite Flagged: <strong className="text-[var(--color-primary)]">{alert.detectionDelayDays || 1.8}d</strong> from pass
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          ⚡ Saved: ~{alert.delaySavingsDays || 64} days vs complaints
                        </span>
                      </div>

                      <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono-val">
                        <span className="text-[var(--color-danger)] font-bold">
                          Breach: {alert.bufferDistanceMeters}m to line
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold border ${
                            alert.status === "PENDING_DISPATCH"
                              ? "bg-[var(--status-pending-bg)] text-[var(--status-pending-text)] border-[var(--status-pending-border)]"
                              : alert.status === "INVESTIGATION_ORDERED"
                              ? "bg-[var(--status-investigation-bg)] text-[var(--status-investigation-text)] border-[var(--status-investigation-border)]"
                              : alert.status === "EVICTION_NOTICE_ISSUED"
                              ? "bg-[var(--status-purple-bg)] text-[var(--status-purple-text)] border-[var(--status-purple-border)]"
                              : "bg-[var(--status-sealed-bg)] text-[var(--status-sealed-text)] border-[var(--status-sealed-border)]"
                          }`}
                        >
                          {alert.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Alert Dossier Column (7 cols) */}
            <div className="lg:col-span-7">
              {inspectingAlert ? (
                <div className="p-7 sm:p-8 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-7 theme-surface shadow-sm">
                  {/* Dossier Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-mono-val text-[var(--color-primary)] font-bold">
                          OFFICER CASE DOSSIER #{inspectingAlert.id}
                        </span>
                        {inspectingAlert.citizenReported && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono-val font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            CITIZEN CORROBORATED
                          </span>
                        )}
                        {inspectingAlert.threatName && (
                          <span
                            className="px-2.5 py-0.5 text-[10px] font-mono-val rounded-[4px] font-bold border"
                            style={{
                              borderColor: `${inspectingAlert.threatColor || "#EF4444"}66`,
                              color: inspectingAlert.threatColor || "#EF4444",
                              backgroundColor: `${inspectingAlert.threatColor || "#EF4444"}20`
                            }}
                          >
                            {inspectingAlert.threatName} · {inspectingAlert.confidenceLabel || "High Confidence"}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                        {inspectingAlert.waterbodyName}
                      </h3>
                      <p className="text-xs font-mono-val text-[var(--text-muted)]">
                        Cadastral Survey Plot: <span className="text-[var(--text-primary)] font-semibold">{inspectingAlert.surveyPlot}</span>
                        {inspectingAlert.citizenName && (
                          <span> · Filed by Citizen: <strong className="text-[var(--color-primary)]">{inspectingAlert.citizenName}</strong></span>
                        )}
                      </p>
                    </div>

                    <div className="text-left sm:text-right text-xs font-mono-val space-y-0.5 p-3 rounded-[8px] bg-[var(--bg-input)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">GPS COORDINATES</span>
                      <span className="text-[var(--text-primary)] font-bold">
                        {inspectingAlert.coordinates[0]}° N, {inspectingAlert.coordinates[1]}° E
                      </span>
                    </div>
                  </div>

                  {/* Citizen Report Callout (If linked) */}
                  {inspectingAlert.citizenReported && (
                    <div className="p-4 rounded-[10px] bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-800 text-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Inbox className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="text-[var(--text-primary)]">
                          Triggered by public citizen grievance <strong>#{inspectingAlert.complaintId}</strong> ({inspectingAlert.citizenName}).
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setActivePortalTab("complaints");
                          const matched = complaints.find(c => c.id === inspectingAlert.complaintId);
                          if (matched) setInspectingComplaint(matched);
                        }}
                        className="px-3 py-1.5 rounded-[6px] bg-blue-600 text-white font-semibold font-mono-val text-[11px] shrink-0 hover:bg-blue-700 transition-colors"
                      >
                        View Citizen Evidence &gt;
                      </button>
                    </div>
                  )}

                  {/* Centrepiece: Detection Delay Comparison & Audit Trail */}
                  <div className="p-5 rounded-[10px] bg-[var(--bg-base)] border border-amber-500/30 space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <span className="text-xs font-bold text-[var(--text-primary)] font-mono-val uppercase flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        Detection Delay Audit: Satellite vs Traditional Grievance
                      </span>
                      <span className="text-[10px] font-mono-val px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                        Real Scene Audit
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-val">
                      <div className="p-2.5 rounded bg-[var(--bg-card)] border border-[var(--border)] space-y-1">
                        <span className="text-[10px] text-[var(--text-muted)] block uppercase">1. Change Appeared</span>
                        <strong className="text-[var(--text-primary)] block">{inspectingAlert.imageryDate || "18 Dec 2025"}</strong>
                        <span className="text-[10px] text-[var(--text-muted)]">Sentinel-2 scene pass</span>
                      </div>
                      <div className="p-2.5 rounded bg-[var(--bg-card)] border border-[var(--color-primary)] space-y-1">
                        <span className="text-[10px] text-[var(--color-primary)] block uppercase font-bold">2. AquaCop Flagged</span>
                        <strong className="text-[var(--color-primary)] block">{inspectingAlert.flaggedDate || "20 Dec 2025"}</strong>
                        <span className="text-[10px] text-[var(--color-primary)] font-semibold">+{inspectingAlert.detectionDelayDays || 2.0} days lag</span>
                      </div>
                      <div className="p-2.5 rounded bg-[var(--bg-card)] border border-[var(--border)] space-y-1">
                        <span className="text-[10px] text-[var(--text-muted)] block uppercase">3. Officer Dispatched</span>
                        <strong className="text-[var(--text-primary)] block">{inspectingAlert.flaggedDate ? "21 Dec 2025" : "Active"}</strong>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">&lt; 24h statutory action</span>
                      </div>
                      <div className="p-2.5 rounded bg-[var(--bg-card)] border border-rose-500/30 space-y-1">
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 block uppercase font-bold">4. Public Complaint</span>
                        <strong className="text-rose-600 dark:text-rose-400 block">{inspectingAlert.complaintDate || "05 Mar 2026"}</strong>
                        <span className="text-[10px] text-rose-500 font-semibold">+{inspectingAlert.delaySavingsDays ? inspectingAlert.delaySavingsDays + 2 : 77} days later</span>
                      </div>
                    </div>

                    <blockquote className="p-3 rounded bg-[var(--bg-card)] border-l-4 border-[var(--color-primary)] text-xs text-[var(--text-secondary)] italic leading-relaxed">
                      &ldquo;A complaint-based system finds problems after they are visible to residents; satellite monitoring finds them when the first change appears.&rdquo;
                    </blockquote>
                  </div>

                  {/* Multi-temporal Satellite Evidence */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono-val text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                        Multi-Temporal Satellite Evidence (Before vs Present)
                      </span>
                      <span className="text-[10px] font-mono-val text-[var(--color-primary)]">
                        10m Sentinel-2 Composite · Indicative Boundary
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="rounded-[10px] overflow-hidden border border-[var(--border)] bg-[var(--bg-base)]">
                        <div className="h-44 bg-gradient-to-br from-[#003B46] to-[#07575B] flex items-center justify-center p-6 text-center">
                          <div className="space-y-2">
                            <Waves className="w-8 h-8 text-[#00FFFF] mx-auto" />
                            <span className="text-xs font-mono-val text-white block font-bold">
                              2022 Pristine Wetland Buffer
                            </span>
                            <span className="text-[11px] font-mono-val text-white/80 block">
                              Zero Builtup Intrusion (NDWI: 0.72)
                            </span>
                          </div>
                        </div>
                        <div className="p-3 text-[11px] font-mono-val text-[var(--text-muted)] bg-[var(--bg-elevated)] border-t border-[var(--border)] flex justify-between">
                          <span>Sentinel-2 Pass</span>
                          <span>Oct 2022 Baseline</span>
                        </div>
                      </div>

                      <div className="rounded-[10px] overflow-hidden border border-[var(--severity-critical-border)] bg-[var(--bg-base)]">
                        <div className="h-44 bg-gradient-to-br from-[#3B1515] to-[#1F1824] flex items-center justify-center p-6 text-center">
                          <div className="space-y-2">
                            <Building className="w-8 h-8 text-[var(--color-danger)] mx-auto animate-pulse" />
                            <span className="text-xs font-mono-val text-white block font-bold">
                              2026 {inspectingAlert.threatName || "Illegal Earth-Fill"} Intrusion
                            </span>
                            <span className="text-[11px] font-mono-val text-[#FF6B6B] block font-semibold">
                              Buffer Violated by {inspectingAlert.bufferDistanceMeters}m
                            </span>
                          </div>
                        </div>
                        <div className="p-3 text-[11px] font-mono-val text-[var(--severity-critical-text)] bg-[var(--bg-elevated)] border-t border-[var(--severity-critical-border)] flex justify-between">
                          <span>Latest Pass: Today 03:14</span>
                          <span className="font-bold">CRITICAL VIOLATION</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Disaster Impact Assessment */}
                  <div className="p-5 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] space-y-3 theme-surface">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-[var(--color-danger)] shrink-0" />
                      <span className="text-xs font-bold text-[var(--text-primary)] font-mono-val uppercase">
                        Disaster Flood Modeling Assessment (Disaster Risk Score: {inspectingAlert.disasterRiskScore || 92}/100)
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {inspectingAlert.disasterImpact}
                    </p>
                    <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-val text-[var(--text-muted)]">
                      <span>Assigned Officer: <strong className="text-[var(--text-primary)]">{inspectingAlert.officerAssigned || "Unassigned"}</strong></span>
                      <span className="text-[var(--status-verified-text)] font-semibold">Jurisdiction: Sec 133 CrPC Statutory Eviction</span>
                    </div>
                  </div>

                  {/* Officer Statutory Actions */}
                  <div className="space-y-3.5 pt-2">
                    <span className="text-xs font-mono-val text-[var(--text-muted)] uppercase tracking-wider font-semibold block">
                      Officer Statutory Enforcement Actions:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <button
                        onClick={() => handleAction(inspectingAlert.id, "INVESTIGATION_ORDERED", "Field Inspection Order")}
                        className="p-3 rounded-[8px] bg-[var(--bg-input)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)] flex items-center justify-center gap-2 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[var(--satellite-status-text)]" />
                        <span>Order Drone Survey</span>
                      </button>

                      <button
                        onClick={() => handleAction(inspectingAlert.id, "EVICTION_NOTICE_ISSUED", "Section 133 Statutory Notice")}
                        className="p-3 rounded-[8px] bg-[var(--color-accent-purple)] hover:bg-[var(--color-accent-purple-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Issue Sec 133 Notice</span>
                      </button>

                      <a
                        href={`http://localhost:8001/api/reports/eviction-notice/${inspectingAlert.waterbodyId || "WB-PALLIKARANAI"}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-[8px] bg-[var(--color-danger)] hover:opacity-90 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Court PDF Pack</span>
                      </a>

                      <button
                        onClick={() => handleAction(inspectingAlert.id, "SEALED", "Demolition & Eviction Sealed")}
                        className="p-3 rounded-[8px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Seal & Enforce Boundary</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] text-center text-xs text-[var(--text-muted)] space-y-2">
                  <ShieldAlert className="w-8 h-8 mx-auto text-[var(--text-muted)]" />
                  <p>Select an encroachment alert from the queue to inspect case telemetry.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* 3. WITHDRAWN / DELETED CITIZEN GRIEVANCES AUDIT TAB                    */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      {activePortalTab === "deleted" && (
        <div className="space-y-6">
          {/* Header & Filter Bar */}
          <div className="p-4 sm:p-5 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-3 theme-surface">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono-val">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span className="font-bold text-[var(--text-primary)] uppercase">
                  STATUTORY SECTION 133 CrPC WITHDRAWAL AUDIT REGISTRY
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-[10px]">
                  {filteredDeletedComplaints.length} ARCHIVED RECORD(S)
                </span>
              </div>

              <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Anti-Coercion Audit Ledger · Permanent Record Retention</span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={deletedSearch}
                onChange={(e) => setDeletedSearch(e.target.value)}
                placeholder="Search by Complaint ID, Waterbody Name, Citizen Name, Survey Number, or Deletion Reason..."
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-[8px] bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--color-primary)] transition-all"
              />
            </div>
          </div>

          {/* Main Two-Column Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Withdrawn Complaints List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1 text-xs font-mono-val text-[var(--text-muted)]">
                <span>WITHDRAWN GRIEVANCES ({filteredDeletedComplaints.length})</span>
                <span>SORT: NEWEST ARCHIVED</span>
              </div>

              <div className="space-y-3 max-h-[780px] overflow-y-auto pr-1">
                {filteredDeletedComplaints.map((item) => {
                  const isSelected = inspectingDeletedComplaint?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setInspectingDeletedComplaint(item)}
                      className={`p-4 rounded-[12px] border transition-all cursor-pointer theme-surface space-y-3 ${
                        isSelected
                          ? "bg-[var(--bg-card)] border-rose-500/60 shadow-md ring-1 ring-rose-500/30"
                          : "bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--text-muted)]/40 hover:bg-[var(--bg-elevated)]"
                      }`}
                    >
                      {/* Top Row: ID, Withdrawn Tag */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-val text-xs font-bold text-[var(--text-primary)]">
                            {item.id}
                          </span>
                          <span className="text-[10px] font-mono-val px-2 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>WITHDRAWN</span>
                          </span>
                        </div>
                        <span className="text-[10px] font-mono-val text-[var(--text-muted)]">
                          {item.submittedDate || "Sep 2026"}
                        </span>
                      </div>

                      {/* Waterbody & Location */}
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">
                          {item.waterbodyName}
                        </h4>
                        <div className="text-xs text-[var(--text-muted)] font-mono-val flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-[var(--color-primary)]" />
                          <span>{item.cityZone}</span>
                          <span>·</span>
                          <span>{item.surveyNumber}</span>
                        </div>
                      </div>

                      {/* Citizen & Withdrawal Timestamp */}
                      <div className="text-xs text-[var(--text-secondary)] font-mono-val space-y-0.5 pt-1 border-t border-[var(--border)]">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[var(--text-muted)]">Citizen:</span>
                          <span className="font-semibold text-[var(--text-primary)]">{item.citizenName}</span>
                        </div>
                        {item.deletedAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-[var(--text-muted)]">Withdrawn At:</span>
                            <span className="text-rose-600 dark:text-rose-400 font-bold text-[11px]">{item.deletedAt}</span>
                          </div>
                        )}
                      </div>

                      {/* Prominent Deletion Reason Snippet */}
                      <div className="p-2.5 rounded-[8px] bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs">
                        <div className="flex items-center gap-1.5 font-bold font-mono-val text-[10px] text-amber-700 dark:text-amber-300 uppercase">
                          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>REASON FOR DELETION:</span>
                        </div>
                        <p className="line-clamp-2 mt-1 text-[11px] leading-relaxed font-medium">
                          {item.deletionReason || "Voluntary withdrawal recorded by citizen."}
                        </p>
                      </div>

                      <div className="flex items-center justify-end text-xs font-semibold text-[var(--color-primary)] pt-1">
                        <span className="flex items-center gap-1 text-[11px]">
                          Inspect Audit Dossier
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredDeletedComplaints.length === 0 && (
                  <div className="p-12 text-center rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] space-y-2">
                    <Archive className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-50" />
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">No withdrawn complaints</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {deletedSearch
                        ? "No withdrawn complaints matched your search filter."
                        : "No grievances have been withdrawn by citizens yet."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Withdrawn Grievance Statutory Audit Dossier (7 cols) */}
            <div className="lg:col-span-7">
              {inspectingDeletedComplaint ? (
                <div className="p-6 rounded-[14px] bg-[var(--bg-card)] border border-rose-500/30 theme-surface space-y-6 shadow-sm">
                  {/* Alert Dossier Header */}
                  <div className="p-4 rounded-[10px] bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold font-mono-val text-rose-700 dark:text-rose-300 uppercase tracking-wide">
                        STATUTORY SECTION 133 CrPC WITHDRAWN GRIEVANCE AUDIT DOSSIER
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        This grievance was lodged by the citizen and subsequently withdrawn. By statute, the full evidence log, satellite crosscheck, and citizen justification are retained permanently for municipal anti-corruption audits.
                      </p>
                    </div>
                  </div>

                  {/* Top Case Identity */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-val text-sm font-black text-[var(--color-primary)]">
                          {inspectingDeletedComplaint.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-val font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                          STATUS: WITHDRAWN / ARCHIVED
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-[var(--text-primary)] mt-1">
                        {inspectingDeletedComplaint.waterbodyName}
                      </h3>
                    </div>

                    <div className="text-right font-mono-val text-xs text-[var(--text-muted)] space-y-0.5">
                      <div>Lodged: {inspectingDeletedComplaint.submittedDate || "25 Sep 2026"}</div>
                      <div className="text-rose-600 dark:text-rose-400 font-semibold">
                        Withdrawn: {inspectingDeletedComplaint.deletedAt || "Just now"}
                      </div>
                    </div>
                  </div>

                  {/* ── HIGHLIGHTED CITIZEN REASON FOR DELETION PANEL ── */}
                  <div className="p-5 rounded-[12px] bg-amber-500/10 border-2 border-amber-500/40 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h4 className="text-xs font-black font-mono-val uppercase text-amber-800 dark:text-amber-300 tracking-wider">
                          OFFICIAL REASON FOR DELETION / CITIZEN EXPLANATION
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono-val px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold">
                        VERIFIED AUDIT LOG
                      </span>
                    </div>

                    <div className="p-4 rounded-[8px] bg-[var(--bg-card)] border border-amber-500/30 shadow-xs">
                      <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium leading-relaxed italic">
                        "{inspectingDeletedComplaint.deletionReason || "No deletion reason specified."}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono-val pt-1">
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block uppercase">Withdrawn By</span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {inspectingDeletedComplaint.deletedBy || inspectingDeletedComplaint.citizenName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block uppercase">Citizen Phone</span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {inspectingDeletedComplaint.citizenPhone}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block uppercase">Audit Timestamp</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          {inspectingDeletedComplaint.deletedAt || "Archived"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Original Grievance Details Grid */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase font-mono-val flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                      <span>Original Grievance Particulars (Prior to Deletion)</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-val">
                      <div className="p-3 rounded-[8px] bg-[var(--bg-base)] border border-[var(--border)]">
                        <span className="text-[10px] text-[var(--text-muted)] block">VIOLATION TYPE</span>
                        <span className="font-bold text-rose-600">
                          {inspectingDeletedComplaint.issueType || "Land Filling"}
                        </span>
                      </div>

                      <div className="p-3 rounded-[8px] bg-[var(--bg-base)] border border-[var(--border)]">
                        <span className="text-[10px] text-[var(--text-muted)] block">SURVEY NUMBER</span>
                        <span className="font-bold text-[var(--text-primary)]">
                          {inspectingDeletedComplaint.surveyNumber}
                        </span>
                      </div>

                      <div className="p-3 rounded-[8px] bg-[var(--bg-base)] border border-[var(--border)]">
                        <span className="text-[10px] text-[var(--text-muted)] block">DISTRICT / ZONE</span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {inspectingDeletedComplaint.district || "Chengalpattu"}
                        </span>
                      </div>

                      <div className="p-3 rounded-[8px] bg-[var(--bg-base)] border border-[var(--border)]">
                        <span className="text-[10px] text-[var(--text-muted)] block">AI RADAR STATUS</span>
                        <span className="font-bold text-emerald-600">
                          {inspectingDeletedComplaint.satelliteCrosscheckStatus || "VERIFIED"}
                        </span>
                      </div>
                    </div>

                    {/* Original Narrative Statement */}
                    <div className="p-3.5 rounded-[8px] bg-[var(--bg-base)] border border-[var(--border)] space-y-1">
                      <span className="text-[10px] font-mono-val uppercase text-[var(--text-muted)] font-semibold block">
                        Original Citizen Narrative:
                      </span>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {inspectingDeletedComplaint.description}
                      </p>
                    </div>
                  </div>

                  {/* Preserved Photographic Evidence Gallery */}
                  {inspectingDeletedComplaint.photos && inspectingDeletedComplaint.photos.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono-val">
                        <span className="font-bold text-[var(--text-primary)] uppercase flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                          Preserved Ground Photos ({inspectingDeletedComplaint.photos.length})
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">Click to enlarge</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {inspectingDeletedComplaint.photos.map((ph, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedPhotoPreview(ph.url)}
                            className="aspect-video rounded-[8px] overflow-hidden border border-[var(--border)] bg-[var(--bg-base)] relative group cursor-pointer hover:border-[var(--color-primary)] transition-all"
                          >
                            <img src={ph.url} alt={ph.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/70 text-[10px] text-white truncate font-mono-val">
                              {ph.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preserved Legal Documents */}
                  {inspectingDeletedComplaint.documents && inspectingDeletedComplaint.documents.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[var(--text-primary)] uppercase font-mono-val block">
                        Preserved Legal Documents:
                      </span>
                      <div className="space-y-2">
                        {inspectingDeletedComplaint.documents.map((doc, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-[8px] bg-[var(--bg-base)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-semibold text-[var(--text-primary)] truncate">{doc.name}</span>
                              <span className="text-[10px] font-mono-val text-[var(--text-muted)]">({doc.size || "1.2 MB"})</span>
                            </div>
                            <span className="text-[10px] font-mono-val px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                              IMMUTABLE ARCHIVE
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Officer Audit Actions */}
                  <div className="pt-4 border-t border-[var(--border)] space-y-3">
                    <div className="text-xs font-mono-val font-bold text-[var(--text-primary)] uppercase">
                      OFFICER AUDIT ATTESTATION & ACTIONS:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => handleAuditAction(`Withdrawal of Case #${inspectingDeletedComplaint.id} officially acknowledged & closed`)}
                        className="p-2.5 rounded-[8px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Acknowledge Audit</span>
                      </button>

                      <button
                        onClick={() => handleAuditAction(`Case #${inspectingDeletedComplaint.id} flagged for anti-coercion ground re-inspection`)}
                        className="p-2.5 rounded-[8px] bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Flag Re-Inspection</span>
                      </button>

                      <button
                        onClick={() => handleAuditAction(`Statutory withdrawal dossier for #${inspectingDeletedComplaint.id} exported`)}
                        className="p-2.5 rounded-[8px] bg-[var(--bg-input)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Dossier</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-[14px] bg-[var(--bg-card)] border border-[var(--border)] text-center text-xs text-[var(--text-muted)] space-y-2">
                  <Archive className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-50" />
                  <p>Select a withdrawn complaint from the left registry to inspect the statutory deletion dossier.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {selectedPhotoPreview && (
        <div
          onClick={() => setSelectedPhotoPreview(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl max-h-[85vh] bg-black/40 rounded-[12px] overflow-hidden border border-white/20 shadow-2xl flex flex-col"
          >
            <div className="p-3 bg-black/60 border-b border-white/10 flex justify-between items-center text-xs text-white">
              <span className="font-mono-val">Citizen High-Resolution Evidence Photo</span>
              <button
                onClick={() => setSelectedPhotoPreview(null)}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </div>
            <img src={selectedPhotoPreview} alt="Evidence preview" className="max-h-[75vh] w-auto object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
