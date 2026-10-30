import { NextResponse } from "next/server";

export async function GET() {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AquaCop - Technical Architecture & Operational System Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
    h1 { color: #0284c7; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    h2 { color: #0f172a; margin-top: 30px; }
    .badge { background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
    pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 13px; }
  </style>
</head>
<body>
  <h1>AquaCop Sentinel Architecture & Operational System Report</h1>
  <p><span class="badge">Government of Tamil Nadu · WRD & TNSDMA</span> · Published: ${new Date().toLocaleDateString("en-GB")}</p>
  
  <h2>1. Multi-Spectral Remote Sensing Foundation</h2>
  <p>AquaCop integrates ESA Copernicus Sentinel-2 MSI 10-meter ground resolution optical bands (B03 Green, B08 NIR, B11 SWIR) with Esri World Imagery to calculate:</p>
  <pre>NDWI = (Green - NIR) / (Green + NIR) = (B03 - B08) / (B03 + B08)
NDBI = (SWIR - NIR) / (SWIR + NIR) = (B11 - B08) / (B11 + B08)</pre>

  <h2>2. 37-Day Enforcement Lead Time</h2>
  <p>Conventional physical grievance queues take an average of 42 days to reach on-site revenue surveys. AquaCop automated orbital passes achieve detection in ~5 days, providing 37 days of legal lead time before concrete plinths cure.</p>

  <h2>3. Whistleblower Anonymity & Cadastral Mapping</h2>
  <p>Citizen grievances are decoupled via opaque cryptographic tokens (ANON-CTZ-XXXX). The officer portal presents only telemetry and parcel coordinates while masking private citizen identifiers.</p>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="AquaCop_Technical_Report.html"`,
    },
  });
}

