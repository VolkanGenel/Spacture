# 🎬 Spacture - Video Clip Editor

Professional video clipping and editing web application built with Angular 17 and FastAPI.

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Installation
```bash
# Clone repository
git clone https://github.com/VolkanGenel/Spacture.git
cd spacture

# Start application
# Windows: Double-click run.bat
# Mac/Linux: ./run.sh

# Wait 2-3 minutes, then open:
# http://localhost
🌐 Access URLs
Main App: http://localhost

API Docs: http://localhost:8000/docs

Health Check: http://localhost:8000/api/health

✨ Features
Upload MP4 videos (max 100MB)

Preview videos with timeline

Create clips with precise timing

Save, download, and delete clips

🛠️ Technical Stack
Frontend: Angular 17

Backend: FastAPI (Python)

Database: SQLite

Video Processing: FFmpeg

📖 Usage Guide
Click "Upload Video" and select MP4 file

Set start/end times on timeline

Click "Create Clip"

Name and save your clip

Manage clips in "My Clips" section

🐳 Docker Commands
bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Check status
docker-compose ps
🔧 Troubleshooting
Port 80 busy: Edit docker-compose.yml ports

Docker not running: Start Docker Desktop

Check logs: docker-compose logs

📞 Support
For issues, check Docker logs first.
