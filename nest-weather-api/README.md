# 🟢 NestJS Weather API

Modern REST API built with NestJS, providing weather data management, user authentication, and comprehensive API documentation with Swagger.

## 📋 Overview

This service is responsible for:
- Receiving and validating weather data from Go Worker
- Managing user authentication with JWT
- Storing weather logs in MongoDB
- Providing REST API for data access
- Exposing interactive API documentation

## 🏗️ Architecture

```
┌─────────────────┐
│   Go Worker     │ (HTTP POST /api/weather/logs)
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│ NestJS API      │
├─────────────────┤
│  Controllers    │ ← HTTP Requests
│  Services       │ ← Business Logic
│  Schemas        │ ← MongoDB Models
│  DTOs           │ ← Validation
│  Guards         │ ← JWT Auth
└────────┬────────┘
         │ MongoDB Driver
         ▼
┌─────────────────┐
│   MongoDB       │ (Collections: users, weatherlogs)
└─────────────────┘
```

### Module Structure

```
src/
├── main.ts                    # Bootstrap
├── app.module.ts              # Root module
│
└── modules/
    ├── auth/                  # Authentication
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── guards/
    │   │   ├── jwt-auth.guard.ts
    │   │   ├── local-auth.guard.ts
    │   │   └── admin.guard.ts
    │   ├── strategies/
    │   │   ├── jwt.strategy.ts
    │   │   └── local.strategy.ts
    │   └── dto/
    │       └── login.dto.ts
    │
    ├── users/                 # User management
    │   ├── users.controller.ts
    │   ├── users.service.ts
    │   ├── schemas/
    │   │   └── user.schema.ts
    │   └── dto/
    │       ├── create-user.dto.ts
    │       ├── update-user.dto.ts
    │       └── user-response.dto.ts
    │
    └── weather/               # Weather logs
        ├── weather.controller.ts
        ├── weather.service.ts
        ├── schemas/
        │   └── weather-log.schema.ts
        └── dto/
            ├── create-weather-log.dto.ts
            └── update-weather-log.dto.ts
```

## 📦 Technologies

- **NestJS 11**: Modern Node.js framework
- **TypeScript 5**: Type-safe development
- **MongoDB 6**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **Passport JWT**: Authentication strategy
- **class-validator**: DTO validation
- **Swagger/OpenAPI**: API documentation
- **OpenRouter AI**: AI-powered weather insights with Grok 4.1

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Individual development
cd nest-weather-api
docker-compose up -d

# View logs
docker-compose logs -f nest-api
```

### Local Development

```bash
# Install dependencies
npm install

# Development mode (hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `9090` |
| `MONGO_URI` | MongoDB connection string | `mongodb://admin:12345@mongodb:27017/weather_data?authSource=admin` |
| `JWT_SECRET` | Secret for JWT signing | (required) |
| `API_VERSION` | API version prefix | `v1` |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI insights | (optional) |
| `SITE_URL` | Site URL for OpenRouter | `http://localhost:9090` |
| `SITE_NAME` | Site name for OpenRouter | `GDASH Weather API` |

## 📚 API Endpoints

### 🔓 Public Endpoints

#### Authentication
```bash
# Register new user
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure123",
  "role": "user"  # Optional: "user" | "admin"
}

# Login
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Weather Logs (Write)
```bash
# Create weather log (used by Go Worker)
POST /api/weather/logs
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "fetched_at": "2025-11-24T10:30:00Z",
  "latitude": -9.747399554832585,
  "longitude": -36.666791770043595,
  "temperature": 28.5,
  "humidity": 65.2,
  "precipitation_probability": 15.0
}
```

### 🔒 Protected Endpoints (Require JWT)

#### Users
```bash
# List all users (admin only)
GET /api/users
Authorization: Bearer YOUR_TOKEN

# Get user by ID
GET /api/users/:id
Authorization: Bearer YOUR_TOKEN

# Create user (admin only)
POST /api/users
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "username": "new_user",
  "email": "user@example.com",
  "password": "pass123",
  "role": "user"
}

# Update user
PATCH /api/users/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "email": "newemail@example.com"
}

# Delete user (admin only)
DELETE /api/users/:id
Authorization: Bearer YOUR_TOKEN
```

#### Weather Logs (Read)
```bash
# List all weather logs
GET /api/weather/logs
Authorization: Bearer YOUR_TOKEN

# Query parameters:
# - page: number (default: 1)
# - limit: number (default: 10)
# - sortBy: string (default: "fetchedAt")
# - order: "asc" | "desc" (default: "desc")

# Get weather log by ID
GET /api/weather/logs/:id
Authorization: Bearer YOUR_TOKEN

# Get filtered weather logs with pagination
GET /api/weather/logs/filtered?startDate=2025-11-24&endDate=2025-11-25&page=1&limit=20
Authorization: Bearer YOUR_TOKEN

# Get AI-powered weather insights
GET /api/weather/insights?startDate=2025-11-24&endDate=2025-11-25
Authorization: Bearer YOUR_TOKEN

Response:
{
  "summary": {
    "avgTemperature": 33.1,
    "minTemperature": 33,
    "maxTemperature": 33.3,
    "avgHumidity": 82,
    "totalRecords": 54,
    "dateRange": {
      "from": "2025-11-24T15:26:06.000Z",
      "to": "2025-11-24T16:21:57.000Z"
    }
  },
  "trends": {
    "temperatureTrend": "stable",
    "temperatureChange": 0.3
  },
  "classification": "O período foi marcado por temperaturas elevadas...",
  "alerts": ["Risco de sobreaquecimento em inversores..."],
  "aiInsights": {
    "trends": ["Temperatura excepcionalmente estável..."],
    "recommendations": ["Maximize a produção inclinando painéis..."]
  }
}

# Export to CSV
GET /api/weather/export/csv?startDate=2025-11-01&endDate=2025-11-30
Authorization: Bearer YOUR_TOKEN

# Export to Excel
GET /api/weather/export/xlsx?startDate=2025-11-01&endDate=2025-11-30
Authorization: Bearer YOUR_TOKEN

# Delete weather log (admin only)
DELETE /api/weather/logs/:id
Authorization: Bearer YOUR_TOKEN
```

## 🤖 AI-Powered Weather Insights

### Overview
The API integrates with **OpenRouter** (using free **Grok 4.1 Fast** model) to generate intelligent weather analysis focused on solar panel optimization.

### Configuration

1. **Get OpenRouter API Key** (free):
   - Sign up at [OpenRouter](https://openrouter.ai/)
   - Navigate to API Keys section
   - Create a new key

2. **Set environment variable**:
```bash
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxx
```

### Features

- **Statistical Analysis**: Calculates averages, min/max for temperature, humidity, and precipitation
- **Trend Detection**: Identifies increasing, decreasing, or stable temperature patterns
- **Solar Panel Recommendations**: AI generates specific advice for optimizing solar energy production
- **Risk Alerts**: Identifies potential issues (overheating, corrosion, efficiency loss)
- **Portuguese Support**: All insights are in Brazilian Portuguese

### API Call Example

```bash
curl -X GET "http://localhost:9090/api/v1/weather/insights?startDate=2025-11-24&endDate=2025-11-25" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Fallback Behavior

If `OPENROUTER_API_KEY` is not configured:
- API still returns statistical summary
- `classification` shows: "Configure OPENROUTER_API_KEY for advanced AI insights"
- `aiInsights` will be `undefined`

### Cost

- **Free tier**: Using `x-ai/grok-4.1-fast:free` model
- **No credit card required** for basic usage
- Check [OpenRouter pricing](https://openrouter.ai/docs#models) for rate limits

### Architecture

```
WeatherController
    ↓
WeatherService.getInsights()
    ↓
1. Query MongoDB (filtered by date range)
2. Calculate statistics
3. Build AI prompt
    ↓
OpenRouterService.generateCompletion()
    ↓
POST https://openrouter.ai/api/v1/chat/completions
    ↓
4. Parse JSON response
5. Return structured insights
```

## 🌐 Swagger Documentation

### Access
http://localhost:9090/api

### Features
- **Interactive UI**: Test endpoints directly
- **Authentication**: JWT bearer token support
- **Schemas**: Request/response examples
- **Try it out**: Execute real API calls

## 🐛 Troubleshooting

### Cannot connect to MongoDB
```bash
# Check MongoDB is running
docker ps | grep mongodb

# Test connection
docker exec -it gdash-mongodb mongosh \
  -u admin -p 12345 --authenticationDatabase admin

# Check logs
docker-compose logs mongodb
```

### JWT validation errors
```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET

# Test token generation
curl -X POST http://localhost:9090/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"senha123"}'

# Decode token (jwt.io)
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov
```

## 📈 Performance

### Database Indexes
- `users`: `username` (unique), `email` (unique)
- `weatherlogs`: `{ fetchedAt: -1, latitude: 1, longitude: 1 }` (compound)

### Optimization Tips
- Use pagination for large datasets
- Enable MongoDB connection pooling
- Implement caching for frequently accessed data
- Use projection to return only needed fields

## 🔗 Integration

**Upstream producers:**
- **Go Worker** (`go-worker-api`) sends weather data via HTTP POST

**Downstream consumers:**
- **Frontend** (future) will consume REST API
- **Analytics tools** can query aggregated data

**Infrastructure dependencies:**
- MongoDB (data persistence)
- JWT secret (authentication)

## 📖 References

- [NestJS Documentation](https://docs.nestjs.com/)
- [Passport JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
- [Mongoose ODM](https://mongoosejs.com/)
- [class-validator](https://github.com/typestack/class-validator)
- [Swagger/OpenAPI](https://swagger.io/specification/)

---

## 📚 Navegação

| Serviço | Descrição | Link |
|---------|-----------|------|
| 📖 **Principal** | Visão geral e setup completo | [README.md](../README.md) |
| 🟢 **NestJS API** | Backend principal com AI | 👉 *Você está aqui* |
| 🐍 **Python Worker** | Coleta de dados OpenMeteo | [py-openmeteo-api/](../py-openmeteo-api/README.md) |
| 🔵 **Go Worker** | Processamento em Go | [go-worker-api/](../go-worker-api/README.md) |
| ⚛️ **React Dashboard** | Frontend web | [react-weather-dashboard/](../react-weather-dashboard/README.md) |

---

[← Back to main README](../README.md)
