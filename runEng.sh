#!/bin/bash

echo ""
echo "========================================"
echo "   SPACTURE VIDEO EDITOR - STARTING"
echo "========================================"
echo ""

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker is not installed!"
    echo ""
    echo "Please install Docker first:"
    echo "  Windows/Mac: https://www.docker.com/products/docker-desktop/"
    echo "  Linux: sudo apt install docker.io docker-compose"
    echo ""
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ ERROR: Docker is not running!"
    echo ""
    echo "Please start Docker Desktop first."
    echo "Check system tray for Docker icon."
    echo ""
    exit 1
fi

echo "✅ Docker is ready"
echo ""
echo "🚀 Starting Spacture Video Editor..."
echo ""
echo "⚠️  First time setup: 3-5 minutes"
echo "    Docker will download ~1.5GB of images"
echo "    Please wait..."
echo ""

# Start the application
docker-compose up -d

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ ERROR: Failed to start application!"
    echo ""
    echo "Check logs with: docker-compose logs"
    echo ""
    exit 1
fi

echo ""
echo "✅ Application started successfully!"
echo ""
echo "⏳ Waiting for services to initialize..."
echo "This may take 30 seconds..."
echo ""

for i in {30..1}; do
    echo -ne "⏰ $i seconds remaining...\r"
    sleep 1
done
echo ""

echo ""
echo "========================================"
echo "    🎉 SPACTURE IS READY TO USE!"
echo "========================================"
echo ""
echo "🌐 Open your browser and go to:"
echo ""
echo "    🔗 http://localhost"
echo ""
echo "📚 API Documentation:"
echo "    🔗 http://localhost:8000/docs"
echo ""
echo "🛠️  Useful commands:"
echo "    View logs:     docker-compose logs -f"
echo "    Stop app:      docker-compose down"
echo "    Check status:  docker-compose ps"
echo "    Restart:       docker-compose restart"
echo ""
echo "🎬 Quick start guide:"
echo "    1. Click 'Upload Video'"
echo "    2. Select MP4 file (max 100MB)"
echo "    3. Set start/end times on timeline"
echo "    4. Click 'Create Clip'"
echo "    5. Name and save your clip"
echo "    6. View clips in 'My Clips' section"
echo ""

# Ask to open browser
read -p "Open in browser now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost
    elif [[ "$OSTYPE" == "linux"* ]]; then
        xdg-open http://localhost 2>/dev/null || \
        gnome-open http://localhost 2>/dev/null || \
        echo "Please manually open: http://localhost"
    else
        echo "Please open: http://localhost"
    fi
fi

echo ""
echo "Need help? Check logs: docker-compose logs"
echo ""
