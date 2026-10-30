import { NextRequest, NextResponse } from "next/server";
import { INITIAL_COMPLAINTS } from "../../../components/mockData";

// In-memory complaint storage for serverless runtime
let complaintsCache = [...INITIAL_COMPLAINTS];

export async function GET() {
  return NextResponse.json(complaintsCache);
}

export async function POST(req: NextRequest) {
  try {
    let payload: any = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        if (typeof value === "string") {
          payload[key] = value;
        }
      });
    }

    const anonSuffix = Math.floor(1000 + Math.random() * 9000);
    const anonId = `ANON-CTZ-${anonSuffix}`;
    const id = `WTN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newComplaint = {
      id,
      anonymousId: anonId,
      citizenName: payload.citizenName || payload.citizen_name || "Citizen Reporter",
      citizenPhone: payload.citizenPhone || payload.citizen_phone || "+91 98401 23456",
      waterbodyName: payload.waterbodyName || payload.waterbody_name || "Pallikaranai Marshland",
      district: payload.district || "Chennai Region",
      cityZone: payload.cityZone || payload.city_zone || "Zone 14 - Perungudi",
      surveyNumber: payload.surveyNumber || payload.survey_number || "Sy. No. 142/A-2",
      issueType: payload.issueType || payload.issue_type || "Construction Encroachment",
      description: payload.description || "Unauthorized earth bunding and construction activity within statutory buffer zone.",
      latitude: parseFloat(payload.latitude || payload.lat || "12.9362"),
      longitude: parseFloat(payload.longitude || payload.lon || "80.2184"),
      evidenceType: "Smartphone Photo + EXIF Telemetry",
      satelliteCrosscheckStatus: "VERIFIED_ANOMALY" as const,
      createdAt: new Date().toISOString(),
      submittedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Under Review" as const,
      photos: payload.photoEvidenceUrl ? [{ name: "Ground Evidence.jpg", url: payload.photoEvidenceUrl }] : []
    };

    complaintsCache.unshift(newComplaint);

    return NextResponse.json(newComplaint, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process complaint", detail: err.message }, { status: 500 });
  }
}
