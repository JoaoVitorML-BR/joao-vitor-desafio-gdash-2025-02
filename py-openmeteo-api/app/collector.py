import asyncio
import logging
import signal
from .publisher import RabbitPublisher
from .worker import worker_loop

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
LOG = logging.getLogger("collector_main")

async def main() -> None:
    publisher = RabbitPublisher()
    stop_event = asyncio.Event()

    def _handle_stop(*_: int) -> None:
        LOG.info("Shutdown signal received")
        stop_event.set()

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, _handle_stop)
        except NotImplementedError:
            pass

    worker_task = asyncio.create_task(worker_loop(publisher))
    await stop_event.wait()
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass
    await publisher.close()

if __name__ == "__main__":
    asyncio.run(main())
