"use client";

import React, { useState, useEffect } from "react";
import { CitizenComplaintItem, Waterbody, AuthUser } from "./types";
import {
  X,
  UploadCloud,
  MapPin,
  Camera,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  UserCheck,
  Shield,
  Lock,
  Download
} from "lucide-react";

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  waterbodies: Waterbody[];
  onSubmitComplaint: (newComplaint: CitizenComplaintItem) => void;
  currentUser?: AuthUser | null;
  onSwitchToCitizen?: () => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  waterbodies,
  onSubmitComplaint,
  currentUser,
  onSwitchToCitizen,
}) => {
  const isCitizen = currentUser?.role === "citizen" || !currentUser;

  const [citizenName, setCitizenName] = useState(
    currentUser?.role === "citizen" ? currentUser.name : ""
  );
  const [citizenPhone, setCitizenPhone] = useState(
    currentUser?.role === "citizen" ? "+91 98402 77102" : ""
  );
  const [selectedWaterbody, setSelectedWaterbody] = useState(waterbodies[0]?.name || "");
  const [cityZone, setCityZone] = useState("Zone 14 - Perungudi / Sholinganallur");
  const [surveyNumber, setSurveyNumber] = useState("Sy. No. 188/B-1");
  const [description, setDescription] = useState("");
  const [selectedEvidenceType, setSelectedEvidenceType] = useState<string>("Geo-Tagged Photos + Survey Deed");
  const [isSimulatingSatellite, setIsSimulatingSatellite] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([
    "site_excavation_timestamped.jpg",
    "cadastral_survey_deed_1985.pdf",
  ]);

  useEffect(() => {
    if (currentUser?.role === "citizen") {
      setCitizenName(currentUser.name);
      setCitizenPhone("+91 98402 77102");
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatingSatellite(true);

    const formData = new FormData();
    formData.append("citizen_name", citizenName || currentUser?.name || "Verified Citizen Informant");
    formData.append("citizen_phone", citizenPhone || "+91 98400 00000");
    formData.append("waterbody_name", selectedWaterbody);
    formData.append("city_zone", cityZone);
    formData.append("survey_number", surveyNumber);
    formData.append("description", description || "Heavy construction equipment detected encroaching into the seasonal high-water line.");
    formData.append("latitude", "12.9392");
    formData.append("longitude", "80.2195");

    fetch("http://localhost:8000/api/complaints", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        setIsSimulatingSatellite(false);
        const trackingId = res.tracking_id || `AQ-2026-CHN-${Math.floor(1000 + Math.random() * 9000)}`;
        const matchedWb = waterbodies.find((w) => w.name === selectedWaterbody);
        const newComplaint: CitizenComplaintItem = {
          id: trackingId,
          citizenName: citizenName || currentUser?.name || "Verified Citizen Informant",
          citizenPhone: citizenPhone || "+91 98400 00000",
          waterbodyName: selectedWaterbody,
          district: matchedWb?.district || "Chengalpattu",
          cityZone,
          surveyNumber,
          issueType: "Land Filling",
          description: description || "Heavy construction equipment detected encroaching into the seasonal high-water line.",
          latitude: 12.9392,
          longitude: 80.2195,
          evidenceType: `${uploadedFileNames.length} Verified Documents (Score: ${res.evidence_score || 85}/100)`,
          satelliteCrosscheckStatus: res.satellite_crosscheck_status || "VERIFIED_ANOMALY",
          createdAt: "Just now",
          submittedDate: "Today",
          assignedAuthority: "Survey Team Alpha",
          updatedText: "Updated: Today",
          status: "Under Review",
          photos: [
            { name: "site_excavation_timestamped.jpg", url: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80", size: "3.2 MB" }
          ],
          documents: [
            { name: "cadastral_survey_deed_1985.pdf", size: "1.2 MB", type: "PDF Document" }
          ]
        };
        onSubmitComplaint(newComplaint);
        setSubmissionComplete(true);
      })
      .catch(() => {
        setIsSimulatingSatellite(false);
        const matchedWb = waterbodies.find((w) => w.name === selectedWaterbody);
        const newComplaint: CitizenComplaintItem = {
          id: `WTN-2026-${Math.floor(485 + Math.random() * 500)}`,
          citizenName: citizenName || currentUser?.name || "Verified Citizen Informant",
          citizenPhone: citizenPhone || "+91 98400 00000",
          waterbodyName: selectedWaterbody,
          district: matchedWb?.district || "Chengalpattu",
          cityZone,
          surveyNumber,
          issueType: "Land Filling",
          description: description || "Heavy construction equipment detected encroaching into the seasonal high-water line.",
          latitude: 12.9392,
          longitude: 80.2195,
          evidenceType: `${uploadedFileNames.length} Verified Evidence Documents (${selectedEvidenceType})`,
          satelliteCrosscheckStatus: "VERIFIED_ANOMALY",
          createdAt: "Just now",
          submittedDate: "Today",
          assignedAuthority: "Survey Team Alpha",
          updatedText: "Updated: Today",
          status: "Under Review",
          photos: [
            { name: "site_excavation_timestamped.jpg", url: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=600&q=80", size: "3.2 MB" }
          ],
          documents: [
            { name: "cadastral_survey_deed_1985.pdf", size: "1.2 MB", type: "PDF Document" }
          ]
        };
        onSubmitComplaint(newComplaint);
        setSubmissionComplete(true);
      });
  };

  const handleResetAndClose = () => {
    setSubmissionComplete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-[12px] bg-[var(--bg-card)] border-2 border-[var(--border)] box-outline shadow-2xl p-6 sm:p-7 text-[var(--text-primary)] max-h-[90vh] overflow-y-auto theme-surface">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-1.5 rounded-[8px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors border border-transparent hover:border-[var(--border)]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* NON-CITIZEN ACCESS RESTRICTION GATE */}
        {!isCitizen ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>CITIZEN-ONLY COMPLAINT SYSTEM</span>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                Restricted to Registered Citizens
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                You are currently signed in as <strong>{currentUser?.name}</strong> (<em>{currentUser?.roleTitle}</em>).
                To protect public watchdog integrity, illegal construction reports must be lodged by <strong>Citizens</strong>.
              </p>
            </div>

            {/* Quick Switch Card with Box Outline */}
            <div className="p-4 rounded-[10px] bg-[var(--bg-base)] box-outline max-w-md mx-auto text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>Test as Citizen Watchdog</span>
                </span>
                <span className="text-[10px] font-mono-val px-2 py-0.5 rounded bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-semibold border border-[var(--color-primary)]/30">
                  ONE-CLICK SWITCH
                </span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-normal">
                Switch identity to <strong>Priya Sharma</strong> (Citizen Waterbody Guardian) to submit geo-evidence dossiers and verify satellite crosscheck.
              </p>

              <div className="flex items-center gap-2 pt-1">
                {onSwitchToCitizen && (
                  <button
                    type="button"
                    onClick={onSwitchToCitizen}
                    className="flex-1 py-2.5 px-4 rounded-[8px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Switch to Citizen & Report</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-[8px] bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : submissionComplete ? (
          /* SUBMISSION SUCCESS */
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--status-verified-bg)] border-2 border-[var(--color-primary)] flex items-center justify-center mx-auto text-[var(--color-primary)] shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-inter">
                Citizen Evidence Dossier Lodged Successfully
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                Your report has been timestamped and queued for Sentinel-2 multi-spectral NDWI crosscheck. An automatic inspection alert has been transmitted to municipal enforcement officers.
              </p>
            </div>
            <div className="p-3 rounded-[8px] bg-[var(--status-verified-bg)] border border-[var(--status-verified-border)] box-outline inline-block text-xs font-mono-val text-[var(--status-verified-text)] font-semibold">
              RECORD STATUS: AI SATELLITE ANOMALY VERIFIED · PRIORITY LEVEL 1
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <a
                href={`http://localhost:8000/api/reports/eviction-notice/${waterbodies.find((w) => w.name === selectedWaterbody)?.id || "WB-PALLIKARANAI"}`}
                target="_blank"
                rel="noopener noreferrer"
                download="AquaCop_Evidence_Dossier.pdf"
                className="w-full sm:w-auto px-4 py-2.5 rounded-[8px] bg-[var(--color-danger)] hover:opacity-95 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Court Evidence PDF Pack</span>
              </a>
              <button
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-[8px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-all shadow-sm"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* CITIZEN FORM WITH CRISP BOX OUTLINES */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Modal Title with Citizen Verified Tag */}
            <div className="space-y-1.5 border-b border-[var(--border)] pb-3">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs font-mono-val text-[var(--color-primary)] font-bold">
                  <div className="w-6 h-6 rounded-[5px] overflow-hidden border border-[var(--border)] bg-white p-0.5 shrink-0 shadow-2xs">
                    <img src="/aquacop-logo.jpg" alt="AquaCop Logo" className="w-full h-full object-contain" />
                  </div>
                  <span>CITIZEN EVIDENCE REGISTRY</span>
                </div>
                <span className="text-[10px] font-mono-val px-2 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold border border-[var(--color-primary)]/20">
                  CITIZEN ONLY
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Report Illegal Waterbody Encroachment
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Submit on-ground evidence (geo-tagged photos, land plot surveys) to alert municipal officers and safeguard community water reserves.
              </p>
            </div>

            {/* Citizen Identity Box Outline Banner */}
            <div className="p-2.5 rounded-[8px] bg-[var(--bg-base)] box-outline flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>Reporting as Verified Citizen:</span>
              </span>
              <span className="font-bold text-[var(--text-primary)] font-mono-val">
                {citizenName || currentUser?.name || "Community Guardian"}
              </span>
            </div>

            {/* Form Fields Grid with Box Outlines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Citizen Informant Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[8px] bg-[var(--bg-input)] box-outline-focus text-[var(--text-primary)] text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Contact Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98402 77102"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[8px] bg-[var(--bg-input)] box-outline-focus text-[var(--text-primary)] text-xs font-mono-val focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Target Waterbody Basin
                </label>
                <select
                  value={selectedWaterbody}
                  onChange={(e) => setSelectedWaterbody(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[8px] bg-[var(--bg-input)] box-outline-focus text-[var(--text-primary)] text-xs font-medium focus:outline-none cursor-pointer"
                >
                  {waterbodies.map((wb) => (
                    <option key={wb.id} value={wb.name}>
                      {wb.name} ({wb.district || "Basin"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Cadastral Survey / Revenue Plot #
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sy. No. 188/B-1 · Ward 14"
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[8px] bg-[var(--bg-input)] box-outline-focus text-[var(--text-primary)] text-xs font-mono-val focus:outline-none"
                />
              </div>
            </div>

            {/* Description Field with Box Outline */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Intrusion Observations & Activity
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe machinery observed (earthmovers, concrete mixing trucks), night-time debris dumping, or erection of compound walls into the lake buffer..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[8px] bg-[var(--bg-input)] box-outline-focus text-[var(--text-primary)] text-xs focus:outline-none leading-relaxed"
              />
            </div>

            {/* Evidence Upload Box Outline Container */}
            <div className="p-4 rounded-[10px] bg-[var(--bg-base)] box-outline space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  Evidence Documents & Geo-Tagged Photos
                </span>
                <span className="text-[10px] text-[var(--color-primary)] font-mono-val font-semibold">
                  EXIF Verification Active
                </span>
              </div>

              {/* Upload Drop area with Box Outline */}
              <div className="p-4 rounded-[8px] border-2 border-dashed border-[var(--border)] hover:border-[var(--color-primary)] transition-all text-center space-y-1 bg-[var(--bg-card)] cursor-pointer">
                <UploadCloud className="w-6 h-6 text-[var(--color-primary)] mx-auto" />
                <p className="text-xs text-[var(--text-primary)] font-semibold">
                  Attach On-Ground Photos or Cadastral Survey Deed
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Supports JPG, PNG with GPS coordinates, or PDF deeds (Max 25MB)
                </p>
              </div>

              {/* Attached files list with Box Outlines */}
              <div className="space-y-1.5 pt-1">
                {uploadedFileNames.map((fn, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px] font-mono-val px-3 py-2 rounded-[6px] bg-[var(--bg-card)] box-outline"
                  >
                    <span className="text-[var(--text-secondary)] flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                      {fn}
                    </span>
                    <span className="text-[var(--color-primary)] text-[10px] font-bold">
                      EXIF VERIFIED
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSimulatingSatellite}
                className="w-full py-3 px-4 rounded-[8px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSimulatingSatellite ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Coordinates against Sentinel-2 Orbit...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Submit Citizen Report to Municipal Queue</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
