"""
AquaCop – STEP 0: Smoke Test for Every Data Source
Run this FIRST to verify all external APIs respond before building on them.
Usage:  python scripts/check_sources.py
"""
import sys
import os
import json
import time
import urllib.request
import urllib.parse
import ssl
import io

# Force UTF-8 stdout on Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# ── Colours for terminal output ──────────────────────────────────────────────
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RESET = "\033[0m"
BOLD = "\033[1m"

results = []

def test_source(name: str, url: str, method: str = "GET", data: bytes = None,
                headers: dict = None, timeout: int = 30):
    """Call a source and print OK / FAIL with response size."""
    print(f"\n{CYAN}{'-'*60}{RESET}")
    print(f"{BOLD}Testing: {name}{RESET}")
    print(f"  URL: {url[:120]}{'...' if len(url) > 120 else ''}")

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
        start = time.time()
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            body = resp.read()
            elapsed = time.time() - start
            status = resp.status
            size = len(body)

            if status < 400:
                print(f"  {GREEN}✓ OK{RESET}  status={status}  size={size:,} bytes  time={elapsed:.2f}s")
                results.append({"source": name, "status": "OK", "size": size, "time_s": round(elapsed, 2)})
                return body
            else:
                print(f"  {RED}✗ FAIL{RESET}  status={status}  size={size:,} bytes")
                results.append({"source": name, "status": "FAIL", "http_status": status})
                return None
    except Exception as e:
        print(f"  {RED}✗ FAIL{RESET}  {type(e).__name__}: {e}")
        results.append({"source": name, "status": "FAIL", "error": str(e)})
        return None


def main():
    print(f"\n{BOLD}{'='*60}")
    print(f"  AquaCop – Data Source Smoke Test")
    print(f"{'='*60}{RESET}")

    # ── 1. Sentinel-2 STAC (primary – Element84 earth-search) ────────────
    stac_url = "https://earth-search.aws.element84.com/v1"
    body = test_source("Sentinel-2 STAC – Root Catalog", stac_url)
    if body:
        try:
            catalog = json.loads(body)
            print(f"  Catalog ID: {catalog.get('id', 'N/A')}")
            print(f"  Description: {catalog.get('description', 'N/A')[:80]}")
        except Exception:
            pass

    # STAC search – Sentinel-2 L2A for Chennai bbox
    search_body = json.dumps({
        "collections": ["sentinel-2-l2a"],
        "bbox": [80.00, 12.80, 80.35, 13.45],
        "datetime": "2025-01-01T00:00:00Z/2025-12-31T23:59:59Z",
        "limit": 3,
        "query": {"eo:cloud_cover": {"lt": 20}}
    }).encode()
    body = test_source(
        "Sentinel-2 STAC – Scene Search (Chennai)",
        f"{stac_url}/search",
        method="POST",
        data=search_body,
        headers={"Content-Type": "application/json"}
    )
    if body:
        try:
            result = json.loads(body)
            features = result.get("features", [])
            print(f"  Scenes returned: {len(features)}")
            for f in features[:2]:
                props = f.get("properties", {})
                print(f"    - {props.get('datetime', 'N/A')}  cloud={props.get('eo:cloud_cover', 'N/A')}%")
        except Exception:
            pass

    # ── 2. Planetary Computer STAC (fallback) ────────────────────────────
    test_source(
        "Planetary Computer STAC – Root",
        "https://planetarycomputer.microsoft.com/api/stac/v1"
    )

    # ── 3. JRC Global Surface Water tiles ────────────────────────────────
    # Tile at z=10 containing Chennai area
    test_source(
        "JRC Global Surface Water – Occurrence Tile (z10)",
        "https://storage.googleapis.com/global-surface-water/tiles2021/occurrence/10/726/467.png"
    )

    # ── 4. OSM Overpass API – water polygons ─────────────────────────────
    overpass_query = """
    [out:json][timeout:25];
    (
      way["natural"="water"](12.90,80.18,12.96,80.25);
      relation["natural"="water"](12.90,80.18,12.96,80.25);
    );
    out body;
    >;
    out skel qt;
    """
    overpass_url = "https://overpass-api.de/api/interpreter"
    encoded = urllib.parse.urlencode({"data": overpass_query}).encode()
    body = test_source(
        "OSM Overpass API – Water Polygons (Pallikaranai)",
        overpass_url,
        method="POST",
        data=encoded,
        headers={"Content-Type": "application/x-www-form-urlencoded", "User-Agent": "AquaCop/1.0 (smoke-test)"}
    )
    if body:
        try:
            data = json.loads(body)
            elements = data.get("elements", [])
            print(f"  Elements returned: {len(elements)}")
            ways = [e for e in elements if e.get("type") == "way"]
            print(f"  Water ways: {len(ways)}")
        except Exception:
            pass

    # ── 5. Open-Meteo Weather API ────────────────────────────────────────
    weather_url = (
        "https://api.open-meteo.com/v1/forecast?"
        "latitude=12.936&longitude=80.218"
        "&daily=precipitation_sum,temperature_2m_max"
        "&timezone=Asia/Kolkata&forecast_days=7"
    )
    body = test_source("Open-Meteo Weather API – 7-Day Forecast (Pallikaranai)", weather_url)
    if body:
        try:
            data = json.loads(body)
            daily = data.get("daily", {})
            precip = daily.get("precipitation_sum", [])
            print(f"  Precipitation (7 days): {precip}")
        except Exception:
            pass

    # ── 6. Esri World Imagery basemap ────────────────────────────────────
    test_source(
        "Esri World Imagery – Tile (z12 Chennai)",
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/12/1562/2909"
    )

    # ── 7. OpenStreetMap tile ────────────────────────────────────────────
    test_source(
        "OSM Street Tile – (z12 Chennai)",
        "https://a.tile.openstreetmap.org/12/2909/1562.png",
        headers={"User-Agent": "AquaCop/1.0 (smoke-test)"}
    )

    # ── 8. Copernicus DEM (Open-Meteo elevation API) ─────────────────────
    elev_url = (
        "https://api.open-meteo.com/v1/elevation?"
        "latitude=12.936&longitude=80.218"
    )
    body = test_source("Open-Meteo Elevation API – DEM (Pallikaranai)", elev_url)
    if body:
        try:
            data = json.loads(body)
            print(f"  Elevation: {data.get('elevation', 'N/A')} m")
        except Exception:
            pass

    # ── Summary ──────────────────────────────────────────────────────────
    print(f"\n\n{BOLD}{'='*60}")
    print(f"  SMOKE TEST SUMMARY")
    print(f"{'='*60}{RESET}")

    ok_count = sum(1 for r in results if r["status"] == "OK")
    fail_count = sum(1 for r in results if r["status"] == "FAIL")

    for r in results:
        icon = f"{GREEN}✓{RESET}" if r["status"] == "OK" else f"{RED}✗{RESET}"
        size_str = f"  {r.get('size', 0):>10,} bytes" if r["status"] == "OK" else f"  {r.get('error', 'HTTP error')[:50]}"
        print(f"  {icon} {r['source']:<55}{size_str}")

    print(f"\n  {GREEN}{ok_count} passed{RESET}  |  {RED}{fail_count} failed{RESET}  |  Total: {len(results)}")

    if fail_count > 0:
        print(f"\n  {YELLOW}⚠ Some sources failed. Check network/firewall. The app will show")
        print(f"    'data unavailable' for failed sources.{RESET}")
    else:
        print(f"\n  {GREEN}All sources operational. Ready to build.{RESET}")

    print()
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
