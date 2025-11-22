import json
import logging
import random
import asyncio
from typing import Optional

import aio_pika

LOG = logging.getLogger("weather_publisher")

_connection: Optional[aio_pika.RobustConnection] = None
_channel: Optional[aio_pika.RobustChannel] = None
_queue: Optional[aio_pika.Queue] = None


async def _ensure_connection(url: str, queue_name: str):
    global _connection, _channel, _queue

    if _connection is not None:
        try:
            if not getattr(_connection, "is_closed", False):
                return
        except Exception:
            pass

    _connection = await aio_pika.connect_robust(url)
    _channel = await _connection.channel()
    _queue = await _channel.declare_queue(queue_name, durable=True)


async def send_to_rabbitmq(payload: dict, url: str, queue_name: str) -> bool:
    try:
        await _ensure_connection(url, queue_name)

        message_body = json.dumps(payload, ensure_ascii=False).encode()

        message = aio_pika.Message(
            body=message_body,
            content_type="application/json",
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
        )

        await _channel.default_exchange.publish(message, routing_key=_queue.name)
        LOG.info("Mensagem enviada para RabbitMQ: %s", payload.get("fetched_at"))
        return True

    except Exception as e:
        LOG.error("Falha ao enviar mensagem para RabbitMQ: %s", e)
        return False


async def publish_with_retry(payload: dict, url: str, queue_name: str, max_retries: int, base_backoff: float) -> bool:
    """Attempt to publish with exponential backoff and jitter.

    Backoff formula (attempt starting at 1): delay = base_backoff * (2 ** (attempt-1)) + jitter(0..0.25)
    """
    for attempt in range(1, max_retries + 1):
        ok = await send_to_rabbitmq(payload, url, queue_name)
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


async def close_publisher():
    global _connection
    if _connection is not None:
        try:
            await _connection.close()
        except Exception:
            pass
