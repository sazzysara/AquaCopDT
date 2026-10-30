"""
AquaCop – Sentinel-2 STAC Client
Searches for cloud-free Sentinel-2 L2A scenes over a given bbox,
and extracts band URLs for NDWI / NDBI / change detection.

Source: Element84 earth-search (no key). Fallback: Planetary Computer.
"""
import json
import logging
import os
import hashlib
from datetime import datetime, timedelta
from typing import Optional
import httpx

logger = logging.getLogger("aquacop.stac")

STAC_PRIMARY = "https://earth-search.aws.element84.com/v1"
STAC_FALLBACK = "https://planetarycomputer.microsoft.com/api/stac/v1"
COLLECTION = "sentinel-2-l2a"
CACHE_DIR = os.getenv("CACHE_DIR", "./cache/stac")


def _cache_key(bbox: list, days: int) -> str:
    raw = f"{bbox}-{days}"
    return hashlib.md5(raw.encode()).hexdigest()


def _load_cache(key: str) -> Optional[dict]:
    path = os.path.join(CACHE_DIR, f"{key}.json")
    if os.path.exists(path):
        age_hrs = (datetime.now().timestamp() - os.path.getmtime(path)) / 3600
        if age_hrs < 6:
            with open(path, "r") as f:
                return json.load(f)
    return None


def _save_cache(key: str, data: dict):
    os.makedirs(CACHE_DIR, exist_ok=True)
    path = os.path.join(CACHE_DIR, f"{key}.json")
    with open(path, "w") as f:
        json.dump(data, f)


async def search_scenes(
    bbox: list[float],
    max_cloud_cover: int = 20,
    days_back: int = 90,
    limit: int = 5,
) -> dict:
    """
    Search Sentinel-2 L2A scenes over bbox with cloud cover filter.
    Returns STAC FeatureCollection with band asset links.
    """
    cache_key = _cache_key(bbox, days_back)
    cached = _load_cache(cache_key)
    if cached:
        logger.info("STAC search cache hit: %s", cache_key)
        return cached

    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days_back)
    datetime_range = f"{start_date.strftime('%Y-%m-%dT00:00:00Z')}/{end_date.strftime('%Y-%m-%dT23:59:59Z')}"

    search_body = {
        "collections": [COLLECTION],
        "bbox": bbox,
        "datetime": datetime_range,
        "limit": limit,
        "query": {"eo:cloud_cover": {"lt": max_cloud_cover}},
        "sortby": [{"field": "properties.datetime", "direction": "desc"}],
    }

    for endpoint in [STAC_PRIMARY, STAC_FALLBACK]:
        try:
            async with httpx.AsyncClient(timeout=30, verify=False) as client:
                resp = await client.post(
                    f"{endpoint}/search",
                    json=search_body,
                    headers={"Content-Type": "application/json"},
                )
                if resp.status_code == 200:
                    data = resp.json()
                    result = _parse_scenes(data, endpoint)
                    _save_cache(cache_key, result)
                    logger.info(
                        "STAC search OK from %s: %d scenes",
                        endpoint, len(result.get("scenes", []))
                    )
                    return result
                else:
                    logger.warning("STAC %s returned %d", endpoint, resp.status_code)
        except Exception as e:
            logger.warning("STAC %s failed: %s", endpoint, e)

    return {
        "source": "STAC",
        "status": "unavailable",
        "error": "Both STAC endpoints failed",
        "scenes": [],
    }


def _parse_scenes(data: dict, source_url: str) -> dict:
    """Extract useful scene metadata from STAC search results."""
    scenes = []
    for feature in data.get("features", []):
        props = feature.get("properties", {})
        assets = feature.get("assets", {})
        scene = {
            "id": feature.get("id", "unknown"),
            "datetime": props.get("datetime"),
            "cloud_cover": props.get("eo:cloud_cover"),
            "platform": props.get("platform", "sentinel-2"),
            "bbox": feature.get("bbox"),
            "bands": {},
        }
        # Extract band URLs for NDWI computation
        band_map = {
            "green": ["green", "B03", "b03"],
            "red": ["red", "B04", "b04"],
            "nir": ["nir", "B08", "b08", "nir08"],
            "swir": ["swir16", "B11", "b11", "swir"],
            "scl": ["scl", "SCL"],
            "visual": ["visual", "TCI"],
        }
        for band_name, keys in band_map.items():
            for key in keys:
                if key in assets:
                    asset = assets[key]
                    scene["bands"][band_name] = {
                        "href": asset.get("href"),
                        "type": asset.get("type", "image/tiff"),
                    }
                    break
        scenes.append(scene)

    return {
        "source": source_url,
        "source_name": "Element84 Earth Search" if "element84" in source_url else "Planetary Computer",
        "status": "ok",
        "collection": COLLECTION,
        "matched": data.get("numberMatched", len(scenes)),
        "returned": len(scenes),
        "scenes": scenes,
    }


async def get_latest_scene(bbox: list[float], max_cloud_cover: int = 20) -> Optional[dict]:
    """Get the most recent cloud-free scene for a bbox."""
    result = await search_scenes(bbox, max_cloud_cover=max_cloud_cover, limit=1)
    if result["status"] == "ok" and result["scenes"]:
        return result["scenes"][0]
    return None
