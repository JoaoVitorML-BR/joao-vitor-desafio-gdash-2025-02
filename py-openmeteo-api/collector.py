import asyncio
import logging

import worker as worker_mod
from publisher import RabbitPublisher
import config

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
LOG = logging.getLogger("collector")

def main() -> None:
    LOG.info("Iniciando Worker de Coleta de Clima...")
    publisher = RabbitPublisher(config.RABBITMQ_URL, config.RABBITMQ_QUEUE)

    async def _run():
        try:
            await worker_mod.worker_loop(publisher)
        except asyncio.CancelledError:
            LOG.info("Execução cancelada.")
        finally:
            await publisher.close()
            LOG.info("Publisher fechado.")

    try:
        asyncio.run(_run())
    except KeyboardInterrupt:
        LOG.info("Worker interrompido pelo usuário.")


if __name__ == "__main__":
    main()