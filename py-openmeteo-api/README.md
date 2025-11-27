# 🐍 Python Weather Collector

Python-based microservice that fetches real-time weather data from the OpenMeteo API and publishes it to RabbitMQ for processing.

## 📋 Overview

This service is responsible for:
- Fetching weather data from OpenMeteo API at configurable intervals
- Publishing complete weather data to RabbitMQ queue
- Running continuously with automatic error recovery

## 🏗️ Architecture

```
┌─────────────────┐
│  OpenMeteo API  │ (External weather data)
└────────┬────────┘
         │ HTTP GET
         ▼
┌─────────────────┐
│   collector.py  │ (Fetch & parse)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  publisher.py   │ (Prepare message)
└────────┬────────┘
         │ AMQP
         ▼
┌─────────────────┐
│   RabbitMQ      │ (Queue: weather_logs_queue)
└─────────────────┘
```

## 📦 Technologies

- **Python 3.11**: Base runtime
- **asyncio**: Asynchronous execution
- **aiohttp**: Async HTTP client
- **aio_pika**: Async RabbitMQ client (AMQP)

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Individual development
docker-compose up -d

# View logs
docker-compose logs -f python-collector
```

### Local Development

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run collector
python -m app.worker
```

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENMETEO_LAT` | Latitude for weather data | `-9.747399554832585` (Alagoas, Brazil) |
| `OPENMETEO_LON` | Longitude for weather data | `-36.666791770043595` (Alagoas, Brazil) |
| `OPENMETEO_INTERVAL_MINUTES` | Fetch interval in minutes | `1` |
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://guest:guest@rabbitmq:5672/` |
| `RABBITMQ_QUEUE` | Queue name for publishing | `weather_logs_queue` |

## 📂 Project Structure

```
py-openmeteo-api/
├── Dockerfile                  # Container definition
├── docker-compose.yml          # Individual dev setup
├── requirements.txt            # Python dependencies
└── app/
    ├── __init__.py
    ├── collector.py            # Fetches data from OpenMeteo
    ├── fetcher.py              # HTTP request handler
    ├── publisher.py            # Publishes to RabbitMQ
    ├── config.py               # Configuration loader
    └── worker.py               # Main loop orchestrator
```

## 📝 Module Details

### `collector.py`
Fetches weather data from OpenMeteo API.

**Features:**
- Builds OpenMeteo API URL with coordinates
- Requests current weather data
- Parses JSON response
- Returns structured weather data

**Collected Fields:**
```python
{
    "id": str,                          # Unique UUID
    "fetched_at": str,                  # ISO 8601 timestamp
    "latitude": float,
    "longitude": float,
    "temperature": float,               # °C
    "humidity": float,                  # %
    "precipitation_probability": float, # %
    "wind_speed": float,                # km/h
    "wind_direction": float,            # degrees
    "weather_code": int,                # WMO code
    "schema_version": str,              # "1.0"
    "source": str,                      # "open-meteo"
    "raw": dict                         # Complete API response
}
```

### `publisher.py`
Publishes messages to RabbitMQ.

**Features:**
- Establishes connection to RabbitMQ
- Declares queue (durable)
- Publishes JSON messages
- Handles connection errors

### `worker.py`
Main orchestration loop.

**Features:**
- Runs infinite loop with configurable interval
- Calls collector → publisher pipeline
- Error handling and logging
- Graceful shutdown on SIGINT/SIGTERM

## 🔄 Data Flow

1. **Timer triggers** every `OPENMETEO_INTERVAL_MINUTES` minutes
2. `collector.collect_weather_data()` **fetches** from OpenMeteo API
3. Data is **enriched** with metadata (id, timestamp, schema_version, source)
4. `publisher.publish_to_queue()` **publishes** to RabbitMQ
5. Go Worker **consumes** and processes the message

## 🐛 Troubleshooting

### Connection refused to RabbitMQ
```bash
# Check RabbitMQ is running
docker ps | grep rabbitmq

# Check RabbitMQ logs
docker-compose logs rabbitmq

# Restart RabbitMQ
docker-compose restart rabbitmq
```

### OpenMeteo API errors
```bash
# Check API URL
echo "https://api.open-meteo.com/v1/forecast?latitude=${OPENMETEO_LAT}&longitude=${OPENMETEO_LON}&current=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,wind_direction_10m,weather_code"

# Test manually
curl "https://api.open-meteo.com/v1/forecast?latitude=-9.747&longitude=-36.667&current=temperature_2m,relative_humidity_2m"
```

### Module import errors
```bash
# Ensure you're in the venv
which python  # Should show venv path

# Reinstall dependencies
pip install --force-reinstall -r requirements.txt

# Run from project root
python -m app.worker
```

## 📊 Example Output

```
[2025-11-24 10:30:00] INFO: Connecting to RabbitMQ...
[2025-11-24 10:30:01] INFO: Connected to RabbitMQ
[2025-11-24 10:30:01] INFO: Starting weather collector...
[2025-11-24 10:30:02] INFO: Weather data collected successfully
[2025-11-24 10:30:02] INFO: Published to queue: weather_logs_queue
[2025-11-24 10:30:02] INFO: Waiting 60 seconds until next fetch...
```

## 🔗 Integration

**Downstream consumers:**
- **Go Worker** (`go-worker-api`) consumes from `weather_logs_queue`

**External dependencies:**
- OpenMeteo API (https://api.open-meteo.com)
- RabbitMQ message broker

## 📖 References

- [OpenMeteo API Documentation](https://open-meteo.com/en/docs)
- [aio_pika Documentation](https://aio-pika.readthedocs.io/)
- [asyncio Documentation](https://docs.python.org/3/library/asyncio.html)

---

## 📚 Navegação

| Serviço | Descrição | Link |
|---------|-----------|------|
| 📖 **Principal** | Visão geral e setup completo | [README.md](../README.md) |
| 🟢 **NestJS API** | Backend principal com AI | [nest-weather-api/](../nest-weather-api/README.md) |
| 🐍 **Python Worker** | Coleta de dados OpenMeteo | 👉 *Você está aqui* |
| 🔵 **Go Worker** | Processamento em Go | [go-worker-api/](../go-worker-api/README.md) |
| ⚛️ **React Dashboard** | Frontend web | [react-weather-dashboard/](../react-weather-dashboard/README.md) |

---

[← Back to main README](../README.md)
