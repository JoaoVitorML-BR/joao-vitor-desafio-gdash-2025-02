import asyncio
import logging

import worker as worker_mod

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
LOG = logging.getLogger("collector")

def main() -> None:
    LOG.info("Iniciando Worker de Coleta de Clima...")
    try:
        asyncio.run(worker_mod.worker_loop())
    except KeyboardInterrupt:
        LOG.info("Worker interrompido.")


if __name__ == "__main__":
    main()