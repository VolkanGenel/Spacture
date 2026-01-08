@echo off
chcp 65001 >nul
echo 📊 Video Clip Creator Log'ları
echo ================================
echo.
echo Log'lar gösteriliyor. Çıkmak için Ctrl+C tuşuna basın.
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

REM Log'ları göster
%COMPOSE_CMD% logs -f
