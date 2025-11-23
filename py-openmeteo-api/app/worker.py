import asyncio
import logging
from . import config
from .fetcher import fetch_open_meteo
from .publisher import RabbitPublisher

LOG = logging.getLogger("collector_worker")

async def worker_loop(publisher: RabbitPublisher) -> None:
    interval = config.INTERVAL_MINUTES * 60
    lat = config.OPENMETEO_LAT
    lon = config.OPENMETEO_LON
    while True:
        try:
            payload = await fetch_open_meteo(lat, lon)
            ok = await publisher.publish_with_retry(payload)
            if not ok:
                LOG.error("Failed to publish after retries id=%s", payload.get("id"))
            else:
                LOG.debug("Loop finished publish id=%s", payload.get("id"))
        except Exception as e:  # noqa: BLE001
            LOG.error("Unexpected error in worker loop: %s", e, exc_info=True)
        await asyncio.sleep(interval)
