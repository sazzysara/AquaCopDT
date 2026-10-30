"""
AquaCop – Open-Meteo Weather & Elevation API Client
Fetches rainfall forecasts, temperature, and DEM elevation for disaster risk scoring.
Source: Open-Meteo (no key required).
"""
import json
import logging
import os
import hashlib
from datetime import datetime
from typing import Optional
import httpx

logger = logging.getLogger("aquacop.weather")

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
ELEVATION_URL = "https://api.open-meteo.com/v1/elevation"
CACHE_DIR = os.getenv("CACHE_DIR", "./cache/weather")


def _cache_key(prefix: str, lat: float, lon: float) -> str:
    today = datetime.utcnow().strftime("%Y-%m-%d")
    return hashlib.md5(f"{prefix}-{lat}-{lon}-{today}".encode()).hexdigest()


def _load_cache(key: str, max_age_hrs: float = 3) -> Optional[dict]:
    path = os.path.join(CACHE_DIR, f"{key}.json")
    if os.path.exists(path):
        age_hrs = (datetime.now().timestamp() - os.path.getmtime(path)) / 3600
        if age_hrs < max_age_hrs:
            with open(path, "r") as f:
                return json.load(f)
    return None


def _save_cache(key: str, data: dict):
    os.makedirs(CACHE_DIR, exist_ok=True)
    with open(os.path.join(CACHE_DIR, f"{key}.json"), "w") as f:
        json.dump(data, f)


async def get_weather_forecast(lat: float, lon: float, days: int = 7) -> dict:
    """
    Get 7-day weather forecast including precipitation for flood risk.
    Returns daily precipitation_sum, temperature_max, wind_speed.
    """
    cache_key = _cache_key("forecast", lat, lon)
    cached = _load_cache(cache_key)
    if cached:
        return cached

    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "precipitation_sum,temperature_2m_max,wind_speed_10m_max",
        "timezone": "Asia/Kolkata",
        "forecast_days": days,
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(FORECAST_URL, params=params)
            if resp.status_code == 200:
                raw = resp.json()
                daily = raw.get("daily", {})
                result = {
                    "source": "Open-Meteo Forecast API",
                    "source_url": FORECAST_URL,
                    "status": "ok",
                    "fetched_at": datetime.utcnow().isoformat(),
                    "latitude": raw.get("latitude"),
                    "longitude": raw.get("longitude"),
                    "timezone": raw.get("timezone"),
                    "daily": {
                        "dates": daily.get("time", []),
                        "precipitation_mm": daily.get("precipitation_sum", []),
                        "temp_max_c": daily.get("temperature_2m_max", []),
                        "wind_max_kmh": daily.get("wind_speed_10m_max", []),
                    },
                    "total_7day_rain_mm": sum(daily.get("precipitation_sum", [])),
                }
                _save_cache(cache_key, result)
                return result
            else:
                return {"source": "Open-Meteo", "status": "unavailable", "error": f"HTTP {resp.status_code}"}
    except Exception as e:
        logger.error("Weather forecast failed: %s", e)
        return {"source": "Open-Meteo", "status": "unavailable", "error": str(e)}


async def get_elevation(lat: float, lon: float) -> dict:
    """Get DEM elevation for a point using Open-Meteo elevation API."""
    cache_key = _cache_key("elevation", lat, lon)
    cached = _load_cache(cache_key, max_age_hrs=168)  # Cache elevation for a week
    if cached:
        return cached

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(ELEVATION_URL, params={"latitude": lat, "longitude": lon})
            if resp.status_code == 200:
                raw = resp.json()
                elev = raw.get("elevation", [None])
                result = {
                    "source": "Open-Meteo Elevation API (Copernicus DEM)",
                    "status": "ok",
                    "elevation_m": elev[0] if isinstance(elev, list) else elev,
                    "latitude": lat,
                    "longitude": lon,
                }
                _save_cache(cache_key, result)
                return result
            else:
                return {"source": "Open-Meteo Elevation", "status": "unavailable", "elevation_m": None}
    except Exception as e:
        logger.error("Elevation fetch failed: %s", e)
        return {"source": "Open-Meteo Elevation", "status": "unavailable", "elevation_m": None}


async def compute_flood_risk(lat: float, lon: float, distance_to_water_m: float = 50) -> dict:
    """
    Compute a composite flood risk score from:
    - DEM elevation
    - 7-day rainfall forecast
    - Distance to nearest water body
    """
    weather = await get_weather_forecast(lat, lon)
    elevation = await get_elevation(lat, lon)

    # Base risk from elevation (lower = higher risk)
    elev_m = elevation.get("elevation_m", 10)
    if elev_m is None:
        elev_m = 10
    elev_risk = max(0, min(40, 40 - (elev_m * 2)))  # 0-40 points

    # Rain risk from 7-day forecast
    total_rain = weather.get("total_7day_rain_mm", 0) or 0
    rain_risk = max(0, min(30, total_rain / 3))  # 0-30 points

    # Proximity risk
    prox_risk = max(0, min(30, 30 - (distance_to_water_m / 5)))  # 0-30 points

    total_score = int(elev_risk + rain_risk + prox_risk)

    return {
        "flood_risk_score": min(100, total_score),
        "elevation_m": elev_m,
        "total_7day_rain_mm": total_rain,
        "distance_to_water_m": distance_to_water_m,
        "components": {
            "elevation_risk": round(elev_risk, 1),
            "rainfall_risk": round(rain_risk, 1),
            "proximity_risk": round(prox_risk, 1),
        },
        "data_sources": {
            "elevation": elevation.get("source", "unavailable"),
            "weather": weather.get("source", "unavailable"),
        },
    }
