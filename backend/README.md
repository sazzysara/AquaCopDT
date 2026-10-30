# AquaCop – Satellite Waterbody Sentinel & Encroachment Response Engine

> **State-Grade Coastal & Inland Waterbody Protection Platform**  
> Developed for Senior Government & Revenue Officers, Water Resources Department (WRD), and Citizen Environmental Guardians.

Every number displayed on screen originates from **real, verified satellite and meteorological data sources**. No synthetic or fabricated statistics are used. If an external service is unreachable, clear *"Data Unavailable"* indicators and fallback datasets are presented with source attribution.

---

## Architecture & Real Data Sources

| Layer / Purpose | Real Data Source | Endpoint / Provider | Fallback Strategy |
|---|---|---|---|
| **Multi-Spectral Satellite Imagery** | Copernicus Sentinel-2 L2A (10m) | Element84 Earth Search STAC (`earth-search.aws.element84.com/v1`) | Microsoft Planetary Computer STAC (`planetarycomputer.microsoft.com/api/stac/v1`) |
| **Water Index Mask (NDWI)** | Band 03 (Green) + Band 08 (NIR) | Automated NDWI = (B03 - B08)/(B03 + B08) computed per scene | Cached GeoTIFF analytical masks |
| **Historical Baseline (1984–2021)** | EC Joint Research Centre (JRC) | Global Surface Water Occurrence & Seasonality (`global-surface-water`) | 38-Year Chennai Benchmark Dataset |
| **Cadastral Water & Coastline** | OpenStreetMap (OSM) | Overpass API (`overpass-api.de/api/interpreter`) | Local GeoJSON boundary cache with TTL |
| **Precipitation & Drought Defense** | Open-Meteo Global Forecasting | Open-Meteo API (`api.open-meteo.com/v1/forecast`) | 7-day weather trend cache with TTL |
| **Digital Elevation Model (DEM)** | Copernicus 30m Global DEM | Open-Meteo Elevation API (`api.open-meteo.com/v1/elevation`) | Regional elevation benchmark matrix |
| **Marine Wave Energy & Coastal Surge**| Open-Meteo Marine Weather | Marine API (`marine-api.open-meteo.com/v1/marine`) | Chennai Marina–Kovalam Coastal Transects |
| **Tamper-Resistant Evidence** | SHA-256 + Perceptual pHash | Python `imagehash` + EXIF metadata extraction | GPS Proximity buffer verification |
| **Court-Ready Eviction Notice Packs** | Government of Tamil Nadu WRD | Python `reportlab` with digital QR code verification | Direct PDF stream download |

---

## Quickstart & Run Steps

### 1. Requirements & Prerequisites
- Python 3.11 or 3.12
- Node.js 18+ and npm

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run Step 0 Smoke Test (Verifies connectivity to all 9 real data providers)
python scripts/check_sources.py

# Initialize SQLite database and seed waterbody geometries & demo users
python scripts/seed_db.py

# Launch FastAPI development server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

FastAPI interactive documentation is available at:  
👉 **`http://localhost:8000/docs`**

### 3. Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Start Next.js development server
npm run dev
```

Next.js frontend application is available at:  
👉 **`http://localhost:3000`**

---

## Step-by-Step Feature Specifications

### Step 0: Data Source Smoke Test (`scripts/check_sources.py`)
Tests latency, HTTP status, and payload integrity across:
- Sentinel-2 STAC Root Catalog
- Sentinel-2 STAC Chennai Scene Search (Cloud cover < 20%)
- Microsoft Planetary Computer STAC
- JRC Global Surface Water Occurrence Tiles
- OSM Overpass Water & Coastline Polygons
- Open-Meteo 7-Day Rainfall Forecast
- Esri World Imagery Basemap Tiles
- OpenStreetMap Street Tiles
- Copernicus DEM Elevation API

### Step 1: Real-Time Satellite Detection Pipeline & Tile Cache
- Computes NDWI for latest cloud-free Sentinel-2 orbit scene against baseline (6–12 months prior).
- Detects water spread loss within 50m legal buffer zones.
- Provides on-the-fly Slippy Tile endpoint: `GET /api/tiles/{z}/{x}/{y}.png`:
  - **Blue**: Stable legal water spread
  - **Red**: Detected encroachment (lost water area)
  - **Orange**: 50m High-risk buffer zone
- Background worker: APScheduler scans for new Sentinel-2 orbit passes every 6 hours.

### Step 2: Officer Map & Case Dossier
- Inspector card displays survey plots, % water loss, and 12-month temporal trendline.
- Correlates with Open-Meteo precipitation:
  - If rainfall is normal/high and water shrunk $\rightarrow$ **HIGH Confidence** (Unlawful reclamation).
  - If drought conditions exist $\rightarrow$ **LOW Confidence** (Seasonal drying).
- Instant eviction pack PDF generator & survey dispatch.

### Step 3: Citizen Reporting with Tamper-Resistant Evidence
- Public submission portal at `/complaint`.
- Duplicate image detection using perceptual hashing (`imagehash` Hamming distance < 10).
- Evidence Score (0–100):
  - EXIF GPS within waterbody buffer: +35
  - Timestamp within last 7 days: +15
  - Corroborating satellite anomaly within 200m: +30
  - Verified citizen informant: +20
- Sequential tracking ID (e.g. `AQ-2026-CHN-0042`) with chain-of-custody SHA-256 hash.

### Step 4: Alert & Incident Management Workflow
- Severity categories: `CRITICAL` (>500 sqm loss / Ramsar wetland), `HIGH`, `MEDIUM`, `LOW`.
- Official officer actions: *"Verified Encroachment"*, *"False Positive - Vegetation"*, *"Seasonal Variation"*, *"Licensed Construction"*.
- Webhook endpoint (`POST /api/alerts/{id}/dispatch-webhook`) formatting payloads for SMS / State e-Governance gateways.

### Step 5: Legal Evidence Pack (PDF Generator)
- Endpoint: `GET /api/reports/eviction-notice/{waterbody_id}`
- Generates official Government of Tamil Nadu formatted PDF using `reportlab`.
- Contains Sentinel-2 scene IDs, before/after loss calculation table, 30-day rainfall audit, citizen geo-coordinates, and verification QR code.

### Step 6: Coastline Sentinel & Erosion / Surge Risk
- Endpoint: `GET /api/coastal-sentinel`
- Monitors ~35 km from Marina Beach to Kovalam.
- Integrates Open-Meteo Marine API (wave height, wave period, swell) with shoreline shifts.
- Computes Coastal Vulnerability Index (CVI) per sector.

---

## Authentication & Demo Roles

| Role | Email | Password | Scope |
|---|---|---|---|
| **Officer** | `raman.officer@aquacop.gov.in` | `officer123` | Full statutory powers, Sec 133 notices, survey dispatch |
| **Officer** | `kavitha@aquacop.gov.in` | `officer123` | Water Resources Division enforcement |
| **Citizen** | `priya.citizen@aquaguard.org` | `citizen123` | Citizen Water Guardians Network, evidence filing |
| **Citizen** | `karthik@gmail.com` | `citizen123` | Civic complaint tracking |
