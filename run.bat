@echo off
chcp 65001 >nul
echo ================================================
echo 🎬 VIDEO CLIP CREATOR - Docker ile Başlatılıyor
echo ================================================
echo.

REM Docker kontrolü
where docker >nul 2>nul
if errorlevel 1 (
    echo ❌ HATA: Docker yüklü değil!
    echo.
    echo 📦 Docker'ı yüklemek için:
    echo   1. Docker Desktop indirin: https://www.docker.com/products/docker-desktop/
    echo   2. Kurulum sihirbazını takip edin
    echo   3. Bilgisayarı yeniden başlatın
    echo.
    pause
    exit /b 1
)

REM Docker Compose kontrolü
where docker-compose >nul 2>nul
if errorlevel 1 (
    echo ⚠️  UYARI: docker-compose bulunamadı, Docker Compose V2 deneniyor...
    docker compose version >nul 2>nul
    if errorlevel 1 (
        echo ❌ HATA: Docker Compose da yüklü değil!
        echo.
        echo 📦 Docker Desktop ile birlikte gelmelidir.
        pause
        exit /b 1
    )
    set COMPOSE_CMD=docker compose
) else (
    set COMPOSE_CMD=docker-compose
)

echo ✅ Docker ve Docker Compose yüklü
echo.

REM Gerekli dosyaları kontrol et
echo 🔍 Gerekli dosyalar kontrol ediliyor...
set MISSING_FILES=0

if not exist "Dockerfile.backend" (
    echo ❌ Eksik dosya: Dockerfile.backend
    set MISSING_FILES=1
) else (
    echo ✅ Mevcut: Dockerfile.backend
)

if not exist "Dockerfile.frontend" (
    echo ❌ Eksik dosya: Dockerfile.frontend
    set MISSING_FILES=1
) else (
    echo ✅ Mevcut: Dockerfile.frontend
)

if not exist "nginx.conf" (
    echo ❌ Eksik dosya: nginx.conf
    set MISSING_FILES=1
) else (
    echo ✅ Mevcut: nginx.conf
)

if not exist "docker-compose.yml" (
    echo ❌ Eksik dosya: docker-compose.yml
    set MISSING_FILES=1
) else (
    echo ✅ Mevcut: docker-compose.yml
)

if %MISSING_FILES% equ 1 (
    echo.
    echo ❌ Bazı gerekli dosyalar eksik!
    pause
    exit /b 1
)

echo.
echo ✅ Tüm gerekli dosyalar mevcut
echo.

REM Docker imajlarını oluştur
echo 🔨 Docker imajları oluşturuluyor (ilk defa 5-10 dakika sürebilir)...
%COMPOSE_CMD% build

if errorlevel 1 (
    echo ❌ HATA: Docker build başarısız!
    pause
    exit /b 1
)

echo.
echo ✅ Docker imajları başarıyla oluşturuldu
echo.

REM Container'ları başlat
echo 🚀 Container'lar başlatılıyor...
%COMPOSE_CMD% up -d

if errorlevel 1 (
    echo ❌ HATA: Container'lar başlatılamadı!
    pause
    exit /b 1
)

echo.
echo ⏳ Servislerin başlaması bekleniyor (15 saniye)...
timeout /t 15 /nobreak >nul

echo.
echo 🔍 Servis durumu kontrol ediliyor...
%COMPOSE_CMD% ps

echo.
echo ================================================
echo 🎉 TEBRİKLER! Video Clip Creator hazır!
echo ================================================
echo.
echo 🌐 UYGULAMAYA ERİŞİM:
echo    • Ana Uygulama: http://localhost
echo    • Backend API: http://localhost:8000
echo    • API Dokümantasyonu: http://localhost:8000/docs
echo    • Swagger UI: http://localhost:8000/docs
echo.
echo 🛠️  KOMUTLAR:
echo    • Durdurmak: stop.bat
echo    • Log'ları görmek: logs.bat
echo    • Temizlemek: clean.bat
echo.
echo 📝 NOT:
echo    • İlk açılışta Angular build işlemi biraz zaman alabilir
echo    • Tarayıcınızı yenileyin (F5)
echo    • 30MB'a kadar video yükleyebilirsiniz
echo ================================================
echo.
echo 👨‍💻 İyi kesmeler! ✂️🎬
echo.
pause
