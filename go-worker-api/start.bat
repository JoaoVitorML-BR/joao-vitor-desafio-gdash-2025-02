@echo off
REM Carrega variáveis do .env e executa o worker Go

for /f "usebackq tokens=1,2 delims==" %%A in (".env") do (
    set "%%A=%%B"
)

start /wait go run cmd/worker/main.go