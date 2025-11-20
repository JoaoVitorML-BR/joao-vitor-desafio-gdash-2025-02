from dotenv import load_dotenv
import os

load_dotenv()

# Open-Meteo coordinates (strings to preserve formatting)
OPENMETEO_LAT = os.getenv("OPENMETEO_LAT")
OPENMETEO_LON = os.getenv("OPENMETEO_LON")

INTERVAL_MINUTES = int(os.getenv("OPENMETEO_INTERVAL_MINUTES", "60"))

# RabbitMQ settings
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "weather_logs_queue")

# Local storage
DATA_DIR = os.getenv("DATA_DIR", "data")

def coords_defined() -> bool:
    return bool(OPENMETEO_LAT and OPENMETEO_LON)
