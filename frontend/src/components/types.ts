export interface Waterbody {
  id: string;
  name: string;
  district: string; // e.g. "Chennai", "Kanchipuram", "Tiruvallur", "Chengalpattu"
  region: string;
  type: string;
  coordinates: [number, number];
  originalAreaSqkm: number;
  currentAreaSqkm: number;
  encroachedAreaSqkm: number;
  ndwiIndex: number; // -1 to +1
  floodRiskScore: number; // 0 to 100
  status: "CRITICAL_ALERT" | "HIGH_VULNERABILITY" | "MONITORED" | "HEALTHY";
  activeEncroachmentsCount: number;
  lastSatellitePass: string;
  historicalYears: { year: number; area: number; builtupDensity: number }[];
  description: string;
}

export type ThreatChangeClass = "CONSTRUCTION" | "LAND_FILLING" | "SAND_MINING" | "WASTE_DUMPING";

export interface EncroachmentAlertItem {
  id: string;
  waterbodyId: string;
  waterbodyName: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE";
  threatClass?: ThreatChangeClass;
  threatName?: string;
  threatColor?: string;
  confidenceLabel?: string;
  confidenceTier?: "HIGH" | "MEDIUM" | "LOW_MEDIUM";
  coordinates: [number, number];
  surveyPlot: string;
  detectedAt: string;
  encroachmentType: string;
  bufferDistanceMeters: number;
  disasterImpact: string;
  disasterRiskScore?: number;
  status: "PENDING_DISPATCH" | "INVESTIGATION_ORDERED" | "EVICTION_NOTICE_ISSUED" | "SEALED" | string;
  officerAssigned?: string;
  satelliteImageBefore: string;
  satelliteImageAfter: string;
  imageryDate?: string;
  flaggedDate?: string;
  detectionDelayDays?: number;
  complaintDate?: string;
  delaySavingsDays?: number;
  citizenReported?: boolean;
  complaintId?: string;
  citizenName?: string;
  anonymousId?: string;
}

export interface CitizenComplaintItem {
  id: string; // e.g. "WTN-2026-00482"
  anonymousId?: string; // e.g. "ANON-CTZ-0482" (Masked identifier visible to officer & citizen)
  citizenName: string;
  citizenPhone: string;
  waterbodyName: string;
  district?: string;
  cityZone: string;
  surveyNumber: string;
  issueType?: string; // e.g. "Land Filling", "Sand Mining", "Commercial Construction"
  description: string;
  latitude: number;
  longitude: number;
  evidenceType: string;
  satelliteCrosscheckStatus: "VERIFIED_ANOMALY" | "FLAGGED_FOR_AUDIT" | "PENDING_PASS";
  createdAt: string;
  submittedDate?: string; // e.g. "25 Sep 2026"
  assignedAuthority?: string; // e.g. "Rajesh Kumar (Field Officer)"
  updatedText?: string; // e.g. "Updated: Today"
  status: "Under Review" | "Assigned" | "Field Inspection" | "Action Taken" | "Field Verified" | "Notice Served" | "Restored" | string;
  photoEvidenceUrl?: string;
  photos?: { name: string; url: string; size?: string }[];
  documents?: { name: string; url?: string; size?: string; type?: string }[];
  isDeleted?: boolean;
  deletionReason?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "officer" | "analyst" | "citizen" | "admin";
  roleTitle: string;
  department?: string;
  badgeId?: string;
  avatarUrl?: string;
  provider?: "credentials" | "google";
}

