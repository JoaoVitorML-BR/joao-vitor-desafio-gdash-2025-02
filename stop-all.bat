@echo off
echo ========================================
echo  GDASH 2025 - Stopping All Services
echo ========================================
echo.

echo Stopping all Docker containers...
docker-compose down

echo.
echo ========================================
echo  All services stopped!
echo ========================================
