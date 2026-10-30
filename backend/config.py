"""
AquaCop Configuration
Default AOI: Chennai coast + Pallikaranai marsh.
Everything is configurable — change the bbox and waterbody list for any region.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ── JWT & Auth ───────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "aquacop-dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# ── Default Bounding Box (Chennai coast + Pallikaranai marsh) ────────────────
# Format: [west, south, east, north]  (lon_min, lat_min, lon_max, lat_max)
DEFAULT_BBOX = [80.00, 12.80, 80.35, 13.45]

# ── Named Water Bodies (Chennai region) ──────────────────────────────────────
WATER_BODIES = [
    {
        "id": "WB-PALLIKARANAI",
        "name": "Pallikaranai Marshland",
        "center": [12.936, 80.218],
        "bbox": [80.19, 12.91, 80.25, 12.96],
        "district": "Chengalpattu",
        "type": "Freshwater Marsh",
        "historical_area_sqkm": 50.0,
    },
    {
        "id": "WB-CHEMBARAMBAKKAM",
        "name": "Chembarambakkam Lake",
        "center": [13.011, 80.057],
        "bbox": [80.02, 12.98, 80.10, 13.04],
        "district": "Kancheepuram",
        "type": "Reservoir",
        "historical_area_sqkm": 15.8,
    },
    {
        "id": "WB-PULICAT",
        "name": "Pulicat Lagoon",
        "center": [13.418, 80.312],
        "bbox": [80.25, 13.35, 80.35, 13.50],
        "district": "Tiruvallur",
        "type": "Coastal Lagoon",
        "historical_area_sqkm": 461.2,
    },
    {
        "id": "WB-PORUR",
        "name": "Porur Lake",
        "center": [13.038, 80.149],
        "bbox": [80.13, 13.02, 80.17, 13.06],
        "district": "Chennai",
        "type": "Urban Lake",
        "historical_area_sqkm": 3.2,
    },
    {
        "id": "WB-MUTTUKADU",
        "name": "Muttukadu Backwater",
        "center": [12.822, 80.245],
        "bbox": [80.22, 12.80, 80.27, 12.85],
        "district": "Chengalpattu",
        "type": "Coastal Backwater",
        "historical_area_sqkm": 8.4,
    },
]

# ── STAC Endpoints ───────────────────────────────────────────────────────────
STAC_PRIMARY = "https://earth-search.aws.element84.com/v1"
STAC_FALLBACK = "https://planetarycomputer.microsoft.com/api/stac/v1"
SENTINEL2_COLLECTION = "sentinel-2-l2a"
MAX_CLOUD_COVER = 20  # percent

# ── JRC Global Surface Water ────────────────────────────────────────────────
JRC_TILE_URL = "https://storage.googleapis.com/global-surface-water/tiles2021/occurrence/{z}/{x}/{y}.png"

# ── OSM Overpass API ─────────────────────────────────────────────────────────
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# ── Open-Meteo Weather API ──────────────────────────────────────────────────
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# ── Basemap Tiles ────────────────────────────────────────────────────────────
BASEMAP_ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
BASEMAP_OSM = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

# ── Cache settings ───────────────────────────────────────────────────────────
CACHE_DIR = os.getenv("CACHE_DIR", "./cache")
CACHE_TTL_HOURS = 6

# ── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aquacop.db")
