@echo off
echo ========================================
echo  GDASH 2025 - Service Logs
echo ========================================
echo.
echo Available services:
echo   1. python-collector
echo   2. go-worker
echo   3. nest-api
echo   4. rabbitmq
echo   5. mongodb
echo   6. all (all services)
echo.
set /p service="Enter service name or number: "

if "%service%"=="1" set service=python-collector
if "%service%"=="2" set service=go-worker
if "%service%"=="3" set service=nest-api
if "%service%"=="4" set service=rabbitmq
if "%service%"=="5" set service=mongodb
if "%service%"=="6" set service=

if "%service%"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %service%
)
