import json
import logging
import random
import asyncio
from typing import Optional

import aio_pika

LOG = logging.getLogger("weather_publisher")


class RabbitPublisher:
    def __init__(self, url: str, queue_name: str):
        self._url = url
        self._queue_name = queue_name
        self._connection: Optional[aio_pika.RobustConnection] = None
        self._channel: Optional[aio_pika.RobustChannel] = None
        self._queue: Optional[aio_pika.Queue] = None
        self._lock = asyncio.Lock()

    async def _ensure_channel(self):
        async with self._lock:
            recreate = False
            if self._connection is None or getattr(self._connection, "is_closed", True):
                recreate = True
            if self._channel is None or getattr(self._channel, "is_closed", True):
                recreate = True
            if recreate:
                LOG.debug("Recriando conexão/canal RabbitMQ")
                try:
                    self._connection = await aio_pika.connect_robust(self._url)
                    self._channel = await self._connection.channel()
                    self._queue = await self._channel.declare_queue(self._queue_name, durable=True)
                except Exception as e:
                    LOG.error("Erro ao recriar conexão/canal: %s", e)
                    raise

    async def _publish_once(self, payload: dict) -> bool:
        await self._ensure_channel()
        try:
            message_body = json.dumps(payload, ensure_ascii=False).encode()
            message = aio_pika.Message(
                body=message_body,
                content_type="application/json",
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            )
            await self._channel.default_exchange.publish(message, routing_key=self._queue.name)
            LOG.info("Mensagem enviada para RabbitMQ: %s id=%s", payload.get("fetched_at"), payload.get("id"))
            return True
        except Exception as e:
            LOG.error("Falha ao enviar mensagem (canal possivelmente fechado): %s", e)
            self._channel = None
            return False

    async def publish_with_retry(self, payload: dict, max_retries: int, base_backoff: float) -> bool:
        for attempt in range(1, max_retries + 1):
            ok = await self._publish_once(payload)
            if ok:
                if attempt > 1:
                    LOG.info("Publicação bem sucedida após retry (tentativa %d/%d) id=%s", attempt, max_retries, payload.get("id"))
                return True
            if attempt == max_retries:
                break
            delay = base_backoff * (2 ** (attempt - 1)) + random.uniform(0, 0.25)
            LOG.warning("Falha publicação (tentativa %d/%d) id=%s – novo retry em %.2fs", attempt, max_retries, payload.get("id"), delay)
            await asyncio.sleep(delay)
        LOG.error("Falha definitiva após %d tentativas. id=%s", max_retries, payload.get("id"))
        return False

    async def close(self):
        if self._connection is not None:
            try:
                await self._connection.close()
            except Exception:
                pass
