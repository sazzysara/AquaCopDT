"""
AquaCop – OSM Overpass API Client
Fetches water polygons, building footprints, and coastline data from OpenStreetMap.
Results are cached locally to reduce API load.
"""
import json
import logging
import os
import hashlib
from datetime import datetime
from typing import Optional
import httpx

logger = logging.getLogger("aquacop.overpass")

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
CACHE_DIR = os.getenv("CACHE_DIR", "./cache/overpass")
USER_AGENT = "AquaCop/1.0 (waterbody-sentinel)"


def _cache_key(query: str) -> str:
    return hashlib.md5(query.encode()).hexdigest()


def _load_cache(key: str, max_age_hrs: float = 24) -> Optional[dict]:
    path = os.path.join(CACHE_DIR, f"{key}.json")
    if os.path.exists(path):
        age_hrs = (datetime.now().timestamp() - os.path.getmtime(path)) / 3600
        if age_hrs < max_age_hrs:
            with open(path, "r") as f:
                return json.load(f)
    return None


def _save_cache(key: str, data: dict):
    os.makedirs(CACHE_DIR, exist_ok=True)
    path = os.path.join(CACHE_DIR, f"{key}.json")
    with open(path, "w") as f:
        json.dump(data, f)


async def fetch_water_polygons(bbox: list[float]) -> dict:
    """
    Fetch water polygons from OSM for a given bbox.
    bbox: [lon_min, lat_min, lon_max, lat_max]
    Returns parsed GeoJSON-like structure.
    """
    # OSM bbox format: (south, west, north, east) = (lat_min, lon_min, lat_max, lon_max)
    south, west, north, east = bbox[1], bbox[0], bbox[3], bbox[2]

    query = f"""
    [out:json][timeout:30];
    (
      way["natural"="water"]({south},{west},{north},{east});
      relation["natural"="water"]({south},{west},{north},{east});
      way["natural"="coastline"]({south},{west},{north},{east});
      way["waterway"]({south},{west},{north},{east});
    );
    out body;
    >;
    out skel qt;
    """

    cache_key = _cache_key(query)
    cached = _load_cache(cache_key)
    if cached:
        logger.info("Overpass water polygons cache hit")
        return cached

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                OVERPASS_URL,
                data={"data": query},
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": USER_AGENT,
                },
            )
            if resp.status_code == 200:
                raw = resp.json()
                result = _parse_water_elements(raw)
                _save_cache(cache_key, result)
                return result
            else:
                logger.warning("Overpass returned %d: %s", resp.status_code, resp.text[:200])
                return {"source": "OSM Overpass", "status": "unavailable", "error": f"HTTP {resp.status_code}", "features": []}
    except Exception as e:
        logger.error("Overpass request failed: %s", e)
        return {"source": "OSM Overpass", "status": "unavailable", "error": str(e), "features": []}


async def fetch_buildings(bbox: list[float]) -> dict:
    """Fetch building footprints from OSM for encroachment detection."""
    south, west, north, east = bbox[1], bbox[0], bbox[3], bbox[2]

    query = f"""
    [out:json][timeout:30];
    (
      way["building"]({south},{west},{north},{east});
    );
    out body;
    >;
    out skel qt;
    """

    cache_key = _cache_key(query)
    cached = _load_cache(cache_key)
    if cached:
        return cached

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                OVERPASS_URL,
                data={"data": query},
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": USER_AGENT,
                },
            )
            if resp.status_code == 200:
                raw = resp.json()
                result = _parse_building_elements(raw)
                _save_cache(cache_key, result)
                return result
            else:
                return {"source": "OSM Overpass", "status": "unavailable", "features": [], "count": 0}
    except Exception as e:
        logger.error("Overpass buildings failed: %s", e)
        return {"source": "OSM Overpass", "status": "unavailable", "features": [], "count": 0}


def _parse_water_elements(raw: dict) -> dict:
    """Parse Overpass JSON into a simplified water features structure."""
    elements = raw.get("elements", [])
    nodes = {}
    ways = []
    relations = []

    for el in elements:
        if el["type"] == "node":
            nodes[el["id"]] = {"lat": el["lat"], "lon": el["lon"]}
        elif el["type"] == "way":
            coords = []
            for nd_id in el.get("nodes", []):
                if nd_id in nodes:
                    n = nodes[nd_id]
                    coords.append([n["lon"], n["lat"]])
            if coords:
                tags = el.get("tags", {})
                ways.append({
                    "id": el["id"],
                    "type": "water_polygon",
                    "name": tags.get("name", "Unnamed water body"),
                    "water_type": tags.get("water", tags.get("natural", "water")),
                    "coordinates": coords,
                })
        elif el["type"] == "relation":
            tags = el.get("tags", {})
            relations.append({
                "id": el["id"],
                "type": "water_relation",
                "name": tags.get("name", "Unnamed water body"),
                "water_type": tags.get("water", tags.get("natural", "water")),
            })

    return {
        "source": "OSM Overpass API",
        "source_url": OVERPASS_URL,
        "status": "ok",
        "fetched_at": datetime.utcnow().isoformat(),
        "total_elements": len(elements),
        "water_ways": len(ways),
        "water_relations": len(relations),
        "features": ways[:100],  # Cap to avoid massive payloads
    }


def _parse_building_elements(raw: dict) -> dict:
    """Parse building footprints from Overpass."""
    elements = raw.get("elements", [])
    nodes = {}
    buildings = []

    for el in elements:
        if el["type"] == "node":
            nodes[el["id"]] = {"lat": el["lat"], "lon": el["lon"]}
        elif el["type"] == "way":
            coords = []
            for nd_id in el.get("nodes", []):
                if nd_id in nodes:
                    n = nodes[nd_id]
                    coords.append([n["lon"], n["lat"]])
            if coords:
                tags = el.get("tags", {})
                buildings.append({
                    "id": el["id"],
                    "type": tags.get("building", "yes"),
                    "name": tags.get("name", ""),
                    "coordinates": coords,
                })

    return {
        "source": "OSM Overpass API",
        "status": "ok",
        "fetched_at": datetime.utcnow().isoformat(),
        "count": len(buildings),
        "features": buildings[:200],
    }
