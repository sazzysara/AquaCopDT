import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const targetId = id || "WB-PALLIKARANAI";
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GOVERNMENT OF TAMIL NADU - STATUTORY EVICTION NOTICE</title>
  <style>
    body { font-family: 'Times New Roman', serif; margin: 40px; color: #111; line-height: 1.5; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
    .emblem { font-size: 14px; font-weight: bold; letter-spacing: 1px; }
    .dept { font-size: 12px; margin-top: 5px; }
    .title { font-size: 16px; font-weight: bold; margin-top: 15px; text-decoration: underline; }
    .metadata-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .metadata-table td { padding: 6px 10px; border: 1px solid #777; font-size: 12px; }
    .metadata-table td.label { font-weight: bold; width: 35%; background: #f4f4f4; }
    .content { font-size: 13px; text-align: justify; margin: 20px 0; }
    .stamp { margin-top: 40px; float: right; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="emblem">GOVERNMENT OF TAMIL NADU</div>
    <div class="dept">REVENUE ADMINISTRATION, DISASTER MANAGEMENT & WATER RESOURCES DEPARTMENT</div>
    <div class="title">STATUTORY EVICTION NOTICE UNDER SECTION 133 Cr.P.C. & RULE 6 OF TN TANKS ACT 2007</div>
  </div>

  <table class="metadata-table">
    <tr>
      <td class="label">Notice Dossier No:</td>
      <td>TN-WRD-EVIC-${targetId.toUpperCase()}-${new Date().getFullYear()}</td>
    </tr>
    <tr>
      <td class="label">Date of Service:</td>
      <td>${dateStr}</td>
    </tr>
    <tr>
      <td class="label">Waterbody / Basin Identifier:</td>
      <td>${targetId.toUpperCase()} (Pallikaranai / Chembarambakkam Catchment)</td>
    </tr>
    <tr>
      <td class="label">Satellite Detection Sensor:</td>
      <td>ESA Copernicus Sentinel-2 MSI (10m) & Multi-Spectral ΔNDWI Sensor</td>
    </tr>
    <tr>
      <td class="label">Statutory Buffer Breach:</td>
      <td>+18.5 Meters Intrusion Beyond Full Tank Level (FTL) High-Water Mark</td>
    </tr>
    <tr>
      <td class="label">Affected Survey Numbers:</td>
      <td>Survey Plot No. 142/A-2 & Plot No. 188/B-1</td>
    </tr>
  </table>

  <div class="content">
    <p><strong>WHEREAS</strong>, spaceborne multi-spectral radar analysis conducted via AquaCop Sentinel Surveillance has verified unauthorized earth bunding, illegal masonry plinth construction, and surface water obstruction within the statutory 50-meter protected buffer zone of the aforementioned waterbody;</p>
    <p><strong>AND WHEREAS</strong>, such unauthorized occupation constitutes a cognizable public nuisance causing severe ecological deterioration and immediate localized flood risk under Section 133 of the Code of Criminal Procedure, 1973 (CrPC) and Section 7 of the Tamil Nadu Protection of Tanks and Eviction of Encroachment Act, 2007;</p>
    <p><strong>NOW THEREFORE</strong>, you are hereby ordered to show cause within <strong>SEVEN (7) DAYS</strong> of the receipt of this notice, or immediately cease all construction and remove all unauthorized masonry, earth bunds, and debris, failing which summary eviction and demolition shall be executed by the Revenue Flying Squad with police assistance, and recovery costs shall be charged under the Revenue Recovery Act.</p>
  </div>

  <div class="stamp">
    <p><strong>Digitally Signed & Certified</strong><br>
    District Collector & Executive Magistrate<br>
    Revenue Department, Government of Tamil Nadu</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="AquaCop_Eviction_Notice_${targetId}.html"`,
    },
  });
}
