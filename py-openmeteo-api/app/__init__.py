"""Application package for weather data collection.
"""

__version__ = "0.1.0"

from .collector import main
from .publisher import RabbitPublisher
from .fetcher import fetch_open_meteo

__all__ = ["main", "RabbitPublisher", "fetch_open_meteo", "__version__"]
