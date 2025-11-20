import logging
from datetime import datetime, timezone
import httpx

LOG = logging.getLogger("weather_fetcher")


async def fetch_open_meteo(lat: str, lon: str) -> dict:
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&hourly=relativehumidity_2m,precipitation_probability"
        "&current_weather=true&timezone=UTC"
    )

    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.get(url)
        r.raise_for_status()
        data = r.json()

    now_iso = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

    current = data.get("current_weather", {})

    humidity = None
    precipitation_probability = None
    try:
        hourly = data.get("hourly", {})
        rh = hourly.get("relativehumidity_2m", [])
        pp = hourly.get("precipitation_probability", [])
        if rh:
            humidity = rh[-1]
        if pp:
            precipitation_probability = pp[-1]
    except Exception:
        LOG.debug("Failed to extract hourly humidity/precipitation", exc_info=True)

    payload = {
        "fetched_at": now_iso,
        "latitude": float(lat),
        "longitude": float(lon),
        "temperature": current.get("temperature"),
        "wind_speed": current.get("windspeed"),
        "wind_direction": current.get("winddirection"),
        "weather_code": current.get("weathercode"),
        "humidity": humidity,
        "precipitation_probability": precipitation_probability,
        "source": "OpenMeteo",
        "raw": data,
    }
    return payload
