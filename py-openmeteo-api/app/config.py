from dotenv import load_dotenv
import os
import json
import random

load_dotenv()

# Coordinates (strings preserved until cast)
OPENMETEO_LAT = os.getenv("OPENMETEO_LAT")
OPENMETEO_LON = os.getenv("OPENMETEO_LON")
INTERVAL_MINUTES = int(os.getenv("OPENMETEO_INTERVAL_MINUTES", "1"))

# RabbitMQ settings
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "weather_logs_queue")

# Local storage (unused now, legacy kept)
DATA_DIR = os.getenv("DATA_DIR", "data")

# Schema versioning for payloads
SCHEMA_VERSION = int(os.getenv("SCHEMA_VERSION", "1"))

# Publish retry/backoff settings
PUBLISH_MAX_RETRIES = int(os.getenv("PUBLISH_MAX_RETRIES", "3"))
PUBLISH_BASE_BACKOFF_SECONDS = float(os.getenv("PUBLISH_BASE_BACKOFF_SECONDS", "1.0"))

def coords_defined() -> bool:
    return bool(OPENMETEO_LAT and OPENMETEO_LON)

def json_dumps(obj: object) -> str:
    """Compact JSON dumps used for message body."""
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))

def compute_backoff(attempt: int) -> float:
    """Exponential backoff with small jitter component."""
    base = PUBLISH_BASE_BACKOFF_SECONDS * (2 ** (attempt - 1))
    jitter = random.uniform(0, PUBLISH_BASE_BACKOFF_SECONDS * 0.25)
    return base + jitter
