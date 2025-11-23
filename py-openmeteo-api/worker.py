import asyncio
import logging
from typing import Optional

import config
import fetcher
from publisher import RabbitPublisher
import config

LOG = logging.getLogger("weather_worker")


async def worker_loop(publisher: RabbitPublisher):
    if not config.coords_defined():
        LOG.warning("Worker aguardando coordenadas serem definidas.")

    while True:
        try:
            if config.coords_defined():
                payload = await fetcher.fetch_open_meteo(config.OPENMETEO_LAT, config.OPENMETEO_LON)

                # publish to RabbitMQ
                sent = await publisher.publish_with_retry(
                    payload,
                    config.PUBLISH_MAX_RETRIES,
                    config.PUBLISH_BASE_BACKOFF_SECONDS,
                )
                if not sent:
                    LOG.warning("Mensagem não publicada após retries. id=%s", payload.get("id"))
            else:
                LOG.info("Pulando coleta — coordenadas não definidas.")

        except Exception as e:
            LOG.exception("Erro durante o ciclo do worker: %s", e)

        LOG.info("💤 Próxima coleta em %s minutos.", config.INTERVAL_MINUTES)
        await asyncio.sleep(config.INTERVAL_MINUTES * 60)


async def run_forever():
    task = asyncio.create_task(worker_loop())
    try:
        await task
    except asyncio.CancelledError:
        LOG.info("Worker cancelado")
