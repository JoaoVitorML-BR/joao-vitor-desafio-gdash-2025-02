import asyncio
import logging
from typing import Any, Dict
import aio_pika
from aio_pika import Message, DeliveryMode
from . import config

LOG = logging.getLogger("rabbit_publisher")

class RabbitPublisher:
    def __init__(self) -> None:
        self._connection: aio_pika.RobustConnection | None = None
        self._channel: aio_pika.RobustChannel | None = None
        self._queue: aio_pika.RobustQueue | None = None
        self._lock = asyncio.Lock()
        self._closed = False

    async def _connect(self) -> None:
        LOG.info("Connecting to RabbitMQ %s", config.RABBITMQ_URL)
        self._connection = await aio_pika.connect_robust(config.RABBITMQ_URL)

    async def _ensure_channel(self) -> None:
        if self._closed:
            raise RuntimeError("Publisher already closed")
        if not self._connection or self._connection.is_closed:
            await self._connect()
        if not self._channel or self._channel.is_closed:
            self._channel = await self._connection.channel()
            await self._channel.set_qos(prefetch_count=10)
        if not self._queue or self._queue.closed:
            self._queue = await self._channel.declare_queue(
                config.RABBITMQ_QUEUE,
                durable=True,
            )

    async def _publish_once(self, payload: Dict[str, Any]) -> None:
        await self._ensure_channel()
        body = config.json_dumps(payload).encode()
        msg = Message(
            body,
            delivery_mode=DeliveryMode.PERSISTENT,
            content_type="application/json",
            headers={"schema_version": config.SCHEMA_VERSION},
        )
        await self._channel.default_exchange.publish(msg, routing_key=config.RABBITMQ_QUEUE)

    async def publish_with_retry(self, payload: Dict[str, Any]) -> bool:
        attempt = 0
        while attempt < config.PUBLISH_MAX_RETRIES:
            attempt += 1
            try:
                async with self._lock:
                    await self._publish_once(payload)
                LOG.info("Published message id=%s attempt=%d", payload.get("id"), attempt)
                return True
            except Exception as e:  # noqa: BLE001
                backoff = config.compute_backoff(attempt)
                LOG.warning(
                    "Publish failed attempt=%d error=%s backoff=%.2fs", attempt, e, backoff,
                    exc_info=True,
                )
                await asyncio.sleep(backoff)
                # force channel recreation next loop
                if self._channel and not self._channel.is_closed:
                    try:
                        await self._channel.close()
                    except Exception:  # noqa: BLE001
                        pass
                self._channel = None
        LOG.error("Giving up publishing id=%s after %d attempts", payload.get("id"), attempt)
        return False

    async def close(self) -> None:
        self._closed = True
        try:
            if self._channel and not self._channel.is_closed:
                await self._channel.close()
        except Exception:  # noqa: BLE001
            pass
        try:
            if self._connection and not self._connection.is_closed:
                await self._connection.close()
        except Exception:  # noqa: BLE001
            pass
        LOG.info("RabbitPublisher closed")
