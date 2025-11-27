# Weather Dashboard

Real-time weather monitoring dashboard with advanced filtering capabilities.

## Tech Stack

- **React** + **TypeScript** + **Vite**
- **TailwindCSS** + **shadcn/ui**
- **Axios** for API communication
- **JWT Authentication**

## Features

✅ Real-time weather data visualization  
✅ Advanced filtering (date range, temperature, humidity)  
✅ Paginated data display  
✅ Export to CSV/XLSX  
✅ Responsive design  
✅ JWT-protected routes

## Project Structure

```
src/
├── features/
│   ├── auth/           # Authentication
│   ├── dashboard/      # Main dashboard
│   ├── users/          # User management
│   └── weather/        # Weather feature
│       ├── components/ # UI components
│       ├── constants/  # Configuration
│       ├── hooks/      # Custom hooks
│       ├── types/      # TypeScript types
│       └── utils/      # Helper functions
├── components/         # Shared UI components
├── services/          # API services
├── lib/               # Utilities
└── styles/            # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:9090
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## API Integration

Connects to NestJS backend at `http://localhost:9090/api/v1`

**Endpoints:**
- `GET /weather/logs/filtered` - Filtered weather data
- `GET /weather/export/csv` - Export CSV
- `GET /weather/export/xlsx` - Export XLSX
- `POST /auth/login` - Authentication
- `GET /users` - User management

## Architecture

**Feature-based structure** with:
- Types centralized in `/types`
- Constants in `/constants`
- Utilities in `/utils`
- Business logic in `/hooks`
- Presentation in `/components`

**Benefits:**
- Clear separation of concerns
- Easy to maintain and scale
- Reusable components
- Type-safe development

---

## 📚 Navegação

| Serviço | Descrição | Link |
|---------|-----------|------|
| 📖 **Principal** | Visão geral e setup completo | [README.md](../README.md) |
| 🟢 **NestJS API** | Backend principal com AI | [nest-weather-api/](../nest-weather-api/README.md) |
| 🐍 **Python Worker** | Coleta de dados OpenMeteo | [py-openmeteo-api/](../py-openmeteo-api/README.md) |
| 🔵 **Go Worker** | Processamento em Go | [go-worker-api/](../go-worker-api/README.md) |
| ⚛️ **React Dashboard** | Frontend web | 👉 *Você está aqui* |

---

## License

MIT
