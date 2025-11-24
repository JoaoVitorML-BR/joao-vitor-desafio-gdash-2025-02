# 🌦️ GDASH 2025-02 - Weather Monitoring System

Real-time weather monitoring system developed for the GDASH 2025 challenge. Collects, processes, and stores climate data from Alagoas, Brazil using a microservices architecture.

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Microservices](#-microservices)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)

## 🏗️ Architecture

```
┌─────────────────┐
│  OpenMeteo API  │ (External data source)
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│ Python Collector│ (Fetches data every 1 min)
└────────┬────────┘
         │ AMQP
         ▼
┌─────────────────┐
│   RabbitMQ      │ (Message Broker)
└────────┬────────┘
         │ AMQP
         ▼
┌─────────────────┐
│   Go Worker     │ (Filters and transforms data)
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   NestJS API    │ (REST API + Validation)
└────────┬────────┘
         │ MongoDB
         ▼
┌─────────────────┐
│   MongoDB       │ (Persistence)
└─────────────────┘
```

### Data Flow

1. **Python Collector** fetches weather data from OpenMeteo API every 1 minute
2. Complete data is published to **RabbitMQ** (queue: `weather_logs_queue`)
3. **Go Worker** consumes messages, filters unnecessary fields and simplifies the payload
4. Simplified data is sent via HTTP POST to **NestJS API**
5. **NestJS** validates, processes and stores in **MongoDB**
6. Data becomes available via REST API with JWT authentication

### Collected Data

**Maintained fields** (7 essential):
- `id`: Unique identifier
- `fetched_at`: Collection timestamp
- `latitude` / `longitude`: Coordinates (Alagoas, Brazil)
- `temperature`: Temperature in °C
- `humidity`: Relative air humidity (%)
- `precipitation_probability`: Precipitation probability (%)

**Removed fields** (optimization):
- `schema_version`, `wind_speed`, `wind_direction`, `weather_code`, `source`, `raw`

## 🚀 Technologies

### Backend
- **Python 3.11**: Data collector (asyncio + aio_pika)
- **Go 1.24**: Transformation worker (goroutines + SOLID)
- **NestJS 11**: Main REST API (TypeScript + MongoDB)

### Infrastructure
- **RabbitMQ 3.11**: AMQP message broker
- **MongoDB 6**: NoSQL database
- **Docker Compose 3.8**: Container orchestration

### Tools
- **Swagger/OpenAPI**: Interactive API documentation
- **Mongo Express**: Web interface for MongoDB
- **JWT**: Stateless authentication

## 📦 Prerequisites

- [Docker](https://www.docker.com/get-started) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- Git

**Optional** (for development without Docker):
- Python 3.11+
- Go 1.24+
- Node.js 20+
- MongoDB 6+
- RabbitMQ 3.11+

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/JoaoVitorML-BR/joao-vitor-desafio-gdash-2025-02.git
cd joao-vitor-desafio-gdash-2025-02
```

### 2. Configure environment variables
```bash
# Copy the template
cp .env.example .env

# Edit .env with your settings (optional, defaults work out of the box)
```

### 3. Start all services
```bash
# Windows
./start-all.bat

# Linux/Mac
docker-compose up -d --build
```

### 4. Wait for initialization (~30 seconds)
```bash
# View logs in real-time
docker-compose logs -f

# Or use the script (Windows)
./logs.bat
```

### 5. Access the services

| Service | URL | Credentials |
|---------|-----|-------------|
| **NestJS API** | http://localhost:9090 | - |
| **Swagger Docs** | http://localhost:9090/api | - |
| **RabbitMQ UI** | http://localhost:15672 | `guest:guest` |
| **Mongo Express** | http://localhost:9091 | - |
| **Go Worker Health** | http://localhost:8001 | - |

## 🎯 Usage

### Create user (via API)
```bash
curl -X POST http://localhost:9090/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "senha123",
    "role": "admin"
  }'
```

### Login
```bash
curl -X POST http://localhost:9090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "senha123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Fetch weather logs
```bash
curl -X GET http://localhost:9090/api/weather/logs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Stop all services
```bash
# Windows
./stop-all.bat

# Linux/Mac
docker-compose down
```

## 📁 Project Structure

```
desafio-gdash-2025-02/
├── docker-compose.yml          # Complete orchestration
├── .env.example                # Variables template
├── start-all.bat               # Start script (Windows)
├── stop-all.bat                # Stop script (Windows)
├── logs.bat                    # Log viewer (Windows)
│
├── py-openmeteo-api/           # 🐍 Python Collector
│   ├── Dockerfile
│   ├── docker-compose.yml      # Individual dev
│   ├── requirements.txt
│   └── app/
│       ├── collector.py        # Fetches OpenMeteo data
│       ├── publisher.py        # Publishes to RabbitMQ
│       └── worker.py           # Main loop
│
├── go-worker-api/              # ⚙️ Go Worker
│   ├── Dockerfile
│   ├── docker-compose.yml      # Individual dev
│   ├── go.mod
│   ├── cmd/worker/main.go
│   └── app/
│       ├── model/              # Data structs
│       ├── transformer/        # Full→simplified transformation
│       ├── client/             # HTTP client for NestJS
│       ├── service/            # Consumer logic
│       └── controller/         # Consumer handler
│
└── nest-weather-api/           # 🟢 NestJS API
    ├── Dockerfile
    ├── docker-compose.yaml     # Individual dev
    ├── package.json
    └── src/
        ├── main.ts
        ├── app.module.ts
        └── modules/
            ├── auth/           # JWT authentication
            ├── users/          # User management
            └── weather/        # Weather logs
```

## 🔧 Microservices

### 1. Python Collector (`py-openmeteo-api`)
**Purpose**: Collects weather data from OpenMeteo API

- Fetches data every 1 minute
- Publishes complete payload to RabbitMQ
- Configurable coordinates (default: Alagoas, Brazil)

📖 [Full documentation](./py-openmeteo-api/README.md)

### 2. Go Worker (`go-worker-api`)
**Purpose**: Transforms and forwards data

- Consumes messages from RabbitMQ
- Filters unnecessary fields (13 → 7 fields)
- Sends simplified data to NestJS via HTTP

📖 [Full documentation](./go-worker-api/README.md)

### 3. NestJS API (`nest-weather-api`)
**Purpose**: REST API with authentication

- Authentication endpoints (login/register)
- User CRUD (admin only)
- Weather logs CRUD
- Validation with class-validator
- Swagger documentation

📖 [Full documentation](./nest-weather-api/README.md)

## 🌍 Environment Variables

Main configurable variables in `.env`:

```bash
# Database
DB_USER=admin
DB_PASS=12345
DB_NAME=weather_data

# NestJS
NODE_ENV=development
PORT=9090
JWT_SECRET=your_secret_here

# OpenMeteo (Coordinates)
OPENMETEO_LAT=-9.747399554832585      # Alagoas, Brazil
OPENMETEO_LON=-36.666791770043595
OPENMETEO_INTERVAL_MINUTES=1

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
RABBITMQ_QUEUE=weather_logs_queue

# Go Worker
NEST_API_URL=http://nest-api:9090
```

See `.env.example` for complete list.

## 💻 Development

### Individual Development

Each microservice has its own `docker-compose.yml` for isolated development:

#### Python Collector
```bash
cd py-openmeteo-api
docker-compose up -d
# Starts: Python + RabbitMQ
```

#### Go Worker
```bash
cd go-worker-api
docker-compose up -d
# Starts: Go Worker + RabbitMQ
# NEST_API_URL points to host.docker.internal:9090
```

#### NestJS API
```bash
cd nest-weather-api
docker-compose up -d
# Starts: NestJS + MongoDB + Mongo Express
```

### Local Development (without Docker)

#### Python
```bash
cd py-openmeteo-api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.worker
```

#### Go
```bash
cd go-worker-api
go mod download
go run cmd/worker/main.go
```

#### NestJS
```bash
cd nest-weather-api
npm install
npm run start:dev
```

### Branch Structure

- `main`: Stable production code
- `develop`: Main development branch
- `feat/*`: New features
- `fix/*`: Bug fixes
- `refactor/*`: Refactorings
- `test/*`: Test implementations

## 📚 API Documentation

### Swagger/OpenAPI
Access the interactive documentation at: http://localhost:9090/api

### Main Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Registration (public)

#### Users (requires authentication)
- `GET /api/users` - List users (admin)
- `POST /api/users` - Create user (admin)
- `GET /api/users/:id` - Get user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)

#### Weather Logs
- `GET /api/weather/logs` - List logs (authenticated)
- `POST /api/weather/logs` - Create log (public - used by Go Worker)
- `GET /api/weather/logs/:id` - Get specific log
- `DELETE /api/weather/logs/:id` - Delete log (admin)

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feat/new-feature`)
3. Commit your changes (`git commit -m 'feat: add new feature'`)
4. Push to the branch (`git push origin feat/new-feature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## 📝 License

This project was developed for the GDASH 2025-02 challenge.

## 👤 Author

**João Vitor**
- GitHub: [@JoaoVitorML-BR](https://github.com/JoaoVitorML-BR)

---

**Developed with ☕ for GDASH 2025**
