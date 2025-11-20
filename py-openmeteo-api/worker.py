import asyncio
import logging
from typing import Optional

import config
import fetcher
import publisher
import storage

LOG = logging.getLogger("weather_worker")


async def worker_loop():
    if not config.coords_defined():
        LOG.warning("Worker aguardando coordenadas serem definidas.")

    while True:
        try:
            if config.coords_defined():
                payload = await fetcher.fetch_open_meteo(config.OPENMETEO_LAT, config.OPENMETEO_LON)

                # write locally (optional)
                try:
                    storage.write_latest(config.DATA_DIR, payload)
                    storage.append_log(config.DATA_DIR, payload)
                except Exception:
                    LOG.debug("Falha ao gravar dados localmente", exc_info=True)

                # publish to RabbitMQ
                sent = await publisher.send_to_rabbitmq(payload, config.RABBITMQ_URL, config.RABBITMQ_QUEUE)
                if not sent:
                    LOG.info("Mensagem não enviada — será ignorada (publisher retornou False)")
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
