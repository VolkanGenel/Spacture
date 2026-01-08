@echo off
chcp 65001 >nul
echo 🛑 Video Clip Creator durduruluyor...
echo.

REM Docker Compose komutunu belirle
where docker-compose >nul 2>nul
if errorlevel 1 (
    docker compose version >nul 2>nul
    if errorlevel 1 (
        echo ❌ Docker Compose bulunamadı!
        pause
        exit /b 1
    )
    set COMPOSE_CMD=docker compose
) else (
    set COMPOSE_CMD=docker-compose
)

REM Container'ları durdur
%COMPOSE_CMD% down

echo.
echo ✅ Container'lar durduruldu
echo.
pause
