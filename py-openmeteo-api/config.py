from dotenv import load_dotenv
import os

load_dotenv()

# Open-Meteo coordinates (strings to preserve formatting)
OPENMETEO_LAT = os.getenv("OPENMETEO_LAT")
OPENMETEO_LON = os.getenv("OPENMETEO_LON")

INTERVAL_MINUTES = int(os.getenv("OPENMETEO_INTERVAL_MINUTES", "1"))

# RabbitMQ settings
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "weather_logs_queue")

# Local storage
DATA_DIR = os.getenv("DATA_DIR", "data")

# Schema version for emitted weather payloads (increment if structure changes)
SCHEMA_VERSION = int(os.getenv("SCHEMA_VERSION", "1"))

# Publish retry settings
PUBLISH_MAX_RETRIES = int(os.getenv("PUBLISH_MAX_RETRIES", "3"))
PUBLISH_BASE_BACKOFF_SECONDS = float(os.getenv("PUBLISH_BASE_BACKOFF_SECONDS", "1.0"))

def coords_defined() -> bool:
    return bool(OPENMETEO_LAT and OPENMETEO_LON)
