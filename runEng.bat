@echo off
chcp 65001 >nul
cls

echo.
echo ========================================
echo    SPACTURE VIDEO EDITOR - STARTING
echo ========================================
echo.

REM Check Docker installation
where docker >nul 2>nul
if errorlevel 1 (
    echo ❌ ERROR: Docker is not installed!
    echo.
    echo Please install Docker Desktop first:
    echo.
    echo 1. Download from: https://www.docker.com/products/docker-desktop/
    echo 2. Run the installer
    echo 3. Restart your computer
    echo 4. Run Docker Desktop from Start Menu
    echo.
    echo After Docker is installed, run this script again.
    echo.
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>nul
if errorlevel 1 (
    echo ❌ ERROR: Docker is not running!
    echo.
    echo Please:
    echo 1. Open Docker Desktop from Start Menu
    echo 2. Wait for "Docker Desktop is running" message
    echo 3. Try again
    echo.
    pause
    exit /b 1
)

echo ✅ Docker is ready
echo.
echo 🚀 Starting Spacture Video Editor...
echo.
echo ⚠️  First time setup: 3-5 minutes
echo    Docker will download ~1.5GB of images
echo    Please wait...
echo.

docker-compose up -d

if errorlevel 1 (
    echo.
    echo ❌ ERROR: Failed to start application!
    echo.
    echo Check logs with: docker-compose logs
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Application started successfully!
echo.
echo ⏳ Waiting for services to initialize...
echo This may take 30 seconds...
echo.

timeout /t 30 /nobreak >nul

echo.
echo ========================================
echo    🎉 SPACTURE IS READY TO USE!
echo ========================================
echo.
echo 🌐 Open your browser and go to:
echo.
echo    🔗 http://localhost
echo.
echo 📚 API Documentation:
echo    🔗 http://localhost:8000/docs
echo.
echo 🛠️  Useful commands:
echo    View logs:     docker-compose logs -f
echo    Stop app:      docker-compose down
echo    Check status:  docker-compose ps
echo    Restart:       docker-compose restart
echo.
echo 🎬 Quick start guide:
echo    1. Click 'Upload Video'
echo    2. Select MP4 file (max 100MB)
echo    3. Set start/end times on timeline
echo    4. Click 'Create Clip'
echo    5. Name and save your clip
echo    6. View clips in 'My Clips' section
echo.

set /p choice="Open browser now? (y/n): "
if /i "%choice%"=="y" (
    start http://localhost
    echo.
    echo Browser opened! If it doesn't open automatically:
    echo Manually go to: http://localhost
) else (
    echo.
    echo Please open: http://localhost
)

echo.
pause
