@echo off
echo ========================================
echo  GDASH 2025 - Starting All Services
echo ========================================
echo.

echo [1/3] Starting Docker services...
docker-compose up -d --build

echo.
echo [2/3] Waiting for services to be ready...
timeout /t 10 /nobreak > nul

echo.
echo [3/3] Checking service status...
docker-compose ps

echo.
echo ========================================
echo  All services started successfully!
echo ========================================
echo.
echo Services available at:
echo   - NestJS API:       http://localhost:9090
echo   - Swagger Docs:     http://localhost:9090/api
echo   - RabbitMQ UI:      http://localhost:15672
echo   - Mongo Express:    http://localhost:9091
echo   - Go Worker Health: http://localhost:8001
echo.
echo To view logs: docker-compose logs -f [service-name]
echo To stop all:  stop-all.bat (RECOMMENDED for complete cleanup)
echo.
echo Info: Ctrl+C stops containers (if run in foreground) but
echo       does NOT remove containers/networks. Use stop-all.bat for complete cleanup.
echo ========================================
