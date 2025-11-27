# ⚙️ Go Weather Worker

High-performance Go microservice that consumes weather data from RabbitMQ, filters unnecessary fields, and forwards simplified data to the NestJS API.

## 📋 Overview

This service is responsible for:
- Consuming messages from RabbitMQ queue
- Transforming full weather data into simplified format (13 → 7 fields)
- Forwarding processed data to NestJS API via HTTP
- Providing health check endpoint

## 🏗️ Architecture

```
┌─────────────────┐
│   RabbitMQ      │ (Queue: weather_logs_queue)
└────────┬────────┘
         │ AMQP
         ▼
┌─────────────────┐
│ consumer_service│ (Consumes & orchestrates)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  transformer    │ (13 fields → 7 fields)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  nest_client    │ (HTTP POST)
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   NestJS API    │ (Validates & stores)
└─────────────────┘
```

### Layered Architecture (SOLID Principles)

```
cmd/worker/
└── main.go                    # Entry point, DI setup

app/
├── model/
│   └── weather.go             # Data structures (Full & Simplified)
├── transformer/
│   └── weather_transformer.go # Business logic: transformation
├── client/
│   └── nest_client.go         # Infrastructure: HTTP client
├── service/
│   └── consumer_service.go    # Application: orchestration
└── controller/
    └── consumer_controller.go # Interface: RabbitMQ consumer
```

## 📦 Technologies

- **Go 1.24**: High-performance runtime
- **goroutines**: Concurrent processing
- **net/http**: HTTP client for NestJS
- **amqp (rabbitmq)**: RabbitMQ consumer
- **encoding/json**: JSON parsing

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Individual development
docker-compose up -d

# View logs
docker-compose logs -f worker
```

### Local Development

```bash
# Download dependencies
go mod download

# Run worker
go run cmd/worker/main.go

# Or build and run
go build -o worker cmd/worker/main.go
./worker
```

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://guest:guest@rabbitmq:5672/` |
| `RABBITMQ_QUEUE` | Queue name to consume from | `weather_logs_queue` |
| `NEST_API_URL` | NestJS API base URL | `http://nest-api:9090` |
| `PORT` | Health check endpoint port | `8001` |

## 📂 Project Structure

```
go-worker-api/
├── Dockerfile                         # Multi-stage build
├── docker-compose.yml                 # Individual dev setup
├── go.mod                             # Go modules
├── go.sum                             # Dependencies checksum
│
├── cmd/
│   └── worker/
│       └── main.go                    # Entry point, DI container
│
└── app/
    ├── model/
    │   └── weather.go                 # WeatherDataFull & WeatherDataSimplified
    │
    ├── transformer/
    │   └── weather_transformer.go     # ParseAndSimplify() & ToJSON()
    │
    ├── client/
    │   └── nest_client.go             # SendWeatherData()
    │
    ├── service/
    │   └── consumer_service.go        # Orchestrates transformation & forwarding
    │
    └── controller/
        └── consumer_controller.go     # Handles RabbitMQ messages
```

## 📝 Module Details

### `model/weather.go`
Defines data structures.

**Structs:**
```go
// Full data received from Python (13 fields)
type WeatherDataFull struct {
    ID                       string
    FetchedAt                string
    Latitude                 *float64
    Longitude                *float64
    Temperature              *float64
    Humidity                 *float64
    PrecipitationProbability *float64
    WindSpeed                *float64  // Removed in simplified
    WindDirection            *float64  // Removed in simplified
    WeatherCode              *int      // Removed in simplified
    SchemaVersion            string    // Removed in simplified
    Source                   string    // Removed in simplified
    Raw                      map[string]interface{} // Removed in simplified
}

// Simplified data sent to NestJS (7 fields)
type WeatherDataSimplified struct {
    ID                       string   `json:"id"`
    FetchedAt                string   `json:"fetched_at"`
    Latitude                 *float64 `json:"latitude"`
    Longitude                *float64 `json:"longitude"`
    Temperature              *float64 `json:"temperature"`
    Humidity                 *float64 `json:"humidity"`
    PrecipitationProbability *float64 `json:"precipitation_probability"`
}
```

### `transformer/weather_transformer.go`
Transforms data from full to simplified format.

**Methods:**
```go
// Parses JSON and extracts essential fields
func ParseAndSimplify(payload []byte) (*WeatherDataSimplified, error)

// Converts struct to JSON bytes
func ToJSON(data *WeatherDataSimplified) ([]byte, error)
```

**Transformation:**
- Unmarshals full JSON payload
- Extracts 7 essential fields
- Returns simplified struct
- Logs transformation statistics (original vs simplified bytes)

### `client/nest_client.go`
HTTP client for NestJS communication.

**Features:**
```go
type NestClient struct {
    baseURL string
    client  *http.Client
}

// Sends POST /api/weather/logs
func (c *NestClient) SendWeatherData(data []byte) error
```

**Configuration:**
- Timeout: 10 seconds
- Content-Type: application/json
- Retries: None (fail-fast)

### `service/consumer_service.go`
Orchestrates the processing pipeline.

**Workflow:**
1. Receives raw message from RabbitMQ
2. Calls `transformer.ParseAndSimplify()`
3. Converts to JSON via `transformer.ToJSON()`
4. Forwards to NestJS via `nestClient.SendWeatherData()`
5. Logs success/failure

**Dependencies:**
- `WeatherTransformer` (injected)
- `NestClient` (injected)

### `controller/consumer_controller.go`
RabbitMQ message handler.

**Features:**
- Connects to RabbitMQ
- Declares queue (durable)
- Consumes messages
- Auto-acknowledges on success
- Delegates to `ConsumerService`

## 🔄 Data Flow

```
1. RabbitMQ message arrives (full data, ~500 bytes)
        ↓
2. consumer_controller receives & delegates
        ↓
3. consumer_service orchestrates
        ↓
4. transformer extracts 7 essential fields
        ↓
5. Simplified data (~200 bytes) generated
        ↓
6. nest_client sends HTTP POST
        ↓
7. NestJS validates & stores in MongoDB
```

## 📊 Performance

**Data Reduction:**
- Original payload: ~450-600 bytes
- Simplified payload: ~180-250 bytes
- **Reduction: ~60%**

**Processing Speed:**
- Transformation: <1ms
- HTTP POST: ~10-50ms (network latency)
- Total: <100ms per message

## 🔍 Health Check

Endpoint: `GET http://localhost:8001/health`

**Response:**
```json
{
  "status": "ok",
  "service": "go-weather-worker",
  "timestamp": "2025-11-24T10:30:00Z"
}
```

## 🐛 Troubleshooting

### Cannot connect to RabbitMQ
```bash
# Check RabbitMQ is running
docker ps | grep rabbitmq

# Test connection
curl http://localhost:15672/api/queues/%2F/weather_logs_queue \
  -u guest:guest

# Check worker logs
docker-compose logs -f worker
```

### Cannot reach NestJS API
```bash
# Check NestJS is running
docker ps | grep nest-api

# Test endpoint
curl -X POST http://localhost:9090/api/weather/logs \
  -H "Content-Type: application/json" \
  -d '{"id":"test","fetched_at":"2025-11-24T10:00:00Z","latitude":-9.747,"longitude":-36.667,"temperature":25.5,"humidity":70.2,"precipitation_probability":30.0}'

# Check network connectivity
docker exec gdash-go-worker ping nest-api
```

### Build errors
```bash
# Clean module cache
go clean -modcache

# Re-download dependencies
go mod download

# Verify go.mod
go mod verify

# Build with verbose output
go build -v cmd/worker/main.go
```

## 📈 Monitoring

### Key Metrics
- Messages consumed/min
- Transformation latency
- HTTP POST latency
- Error rate

### Logging
```
[INFO] Conectado ao RabbitMQ
[INFO] Aguardando mensagens na fila: weather_logs_queue
[INFO] Mensagem recebida
[INFO] Dados transformados (original: 487 bytes → simplificado: 215 bytes)
[INFO] Dados enviados com sucesso para a API NestJS
```

## 🔗 Integration

**Upstream producers:**
- **Python Collector** (`py-openmeteo-api`) publishes to `weather_logs_queue`

**Downstream consumers:**
- **NestJS API** (`nest-weather-api`) receives HTTP POST at `/api/weather/logs`

**Infrastructure dependencies:**
- RabbitMQ (message broker)
- NestJS API (REST endpoint)

## 🧪 Testing

```bash
# Unit tests (when implemented)
go test ./...

# Integration test with curl
curl -X POST http://localhost:9090/api/weather/logs \
  -H "Content-Type: application/json" \
  -d '{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fetched_at": "2025-11-24T10:30:00Z",
    "latitude": -9.747399554832585,
    "longitude": -36.666791770043595,
    "temperature": 28.5,
    "humidity": 65.2,
    "precipitation_probability": 15.0
  }'
```

## 📖 References

- [Go Modules Documentation](https://go.dev/ref/mod)
- [RabbitMQ Go Client](https://github.com/rabbitmq/amqp091-go)
- [SOLID Principles in Go](https://dave.cheney.net/2016/08/20/solid-go-design)

---

## 📚 Navegação

| Serviço | Descrição | Link |
|---------|-----------|------|
| 📖 **Principal** | Visão geral e setup completo | [README.md](../README.md) |
| 🟢 **NestJS API** | Backend principal com AI | [nest-weather-api/](../nest-weather-api/README.md) |
| 🐍 **Python Worker** | Coleta de dados OpenMeteo | [py-openmeteo-api/](../py-openmeteo-api/README.md) |
| 🔵 **Go Worker** | Processamento em Go | 👉 *Você está aqui* |
| ⚛️ **React Dashboard** | Frontend web | [react-weather-dashboard/](../react-weather-dashboard/README.md) |

---

[← Back to main README](../README.md)
