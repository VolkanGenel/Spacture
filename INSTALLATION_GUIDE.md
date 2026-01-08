# 📦 Spacture - Complete Installation Guide

## 🎯 System Requirements

### Minimum Requirements
- **OS:** Windows 10/11, macOS 10.15+, Linux Ubuntu 20.04+
- **RAM:** 4GB (8GB recommended for video processing)
- **Storage:** 10GB free space
- **Internet:** Required for initial Docker download (~1.5GB)

### Software Requirements
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Git (optional, for cloning)

## 🔧 Step 1: Install Docker

### For Windows Users
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Run the installer (.exe file)
3. Follow installation wizard
4. Restart computer when prompted
5. After restart, run Docker Desktop from Start Menu
6. Wait for Docker to start (check system tray for whale icon)

**Important for Windows:**
- Enable WSL 2 during installation (recommended)
- Allow through Windows Firewall if prompted

### For macOS Users
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Open the .dmg file
3. Drag Docker to Applications folder
4. Open Docker from Applications
5. Follow setup instructions
6. Enter password when prompted for permissions

### For Linux Users (Ubuntu/Debian)
```bash
# Update package index
sudo apt update

# Install Docker
sudo apt install docker.io docker-compose

# Add user to docker group (to run without sudo)
sudo usermod -aG docker $USER

# Log out and log back in for changes to take effect
# After logging back in, start Docker:
sudo systemctl start docker
sudo systemctl enable docker
📥 Step 2: Get the Project
Option A: Clone with Git (Recommended)
bash
git clone https://github.com/YOUR_USERNAME/spacture.git
cd spacture
Option B: Download ZIP
Go to GitHub repository

Click "Code" → "Download ZIP"

Extract ZIP to desired location

Open terminal in extracted folder

🚀 Step 3: Start the Application
Windows Users
bash
# Method 1: Double-click run.bat
# Just double-click the run.bat file in the project folder

# Method 2: Command Prompt
# Open Command Prompt in project folder, then:
docker-compose up -d
Mac/Linux Users
bash
# Method 1: Use the startup script
chmod +x run.sh      # Make executable (first time only)
./run.sh             # Run the script

# Method 2: Manual start
docker-compose up -d
⏳ Step 4: Initial Setup Wait Time
First-time startup takes 3-5 minutes because:

Docker images download (~1.5GB total)

Containers build and initialize

Services start up

Progress indicators:

Terminal shows download progress

Docker Desktop shows container status

No error messages in terminal

🌐 Step 5: Access the Application
After startup completes, open your web browser to:

Primary URL:
Main Application: http://localhost

Alternative URLs:
http://127.0.0.1

http://0.0.0.0

Additional URLs:
API Documentation: http://localhost:8000/docs

API Health Check: http://localhost:8000/api/health

✅ Step 6: Verification
Verify everything is working:

Check Docker:

bash
docker --version
# Should show: Docker version 24.0.0 or higher
Check Containers:

bash
docker ps
# Should show 2 running containers
Test API:

bash
curl http://localhost:8000/api/health
# Should return: {"status":"healthy","service":"video-clip-api"}
Open Browser:

Navigate to http://localhost

Should see Spacture Video Editor interface

🎬 Step 7: First-Time Usage
1. Upload Your First Video
Click "Upload Video" button

Select MP4 file (maximum 100MB)

Wait for upload and processing

2. Create Your First Clip
Play video in preview player

Drag timeline markers to set start/end times

Click "Create Clip"

Enter clip name and click "Save"

3. Manage Clips
Navigate to "My Clips"

View all saved clips

Download or delete as needed

🐳 Docker Management Commands
Basic Commands
bash
# Start application
docker-compose up -d

# Stop application (preserves data)
docker-compose down

# Stop and remove all data
docker-compose down -v

# View real-time logs
docker-compose logs -f

# View specific service logs
docker-compose logs frontend
docker-compose logs backend

# Check container status
docker-compose ps

# Restart services
docker-compose restart
Advanced Commands
bash
# Rebuild containers
docker-compose build --no-cache

# Execute command in container
docker-compose exec backend python --version

# View resource usage
docker stats

# Clean up unused Docker data
docker system prune -a
🔧 Troubleshooting Guide
Common Issues & Solutions
Issue 1: "Port 80 is already in use"
Causes: Skype, IIS, Apache, Nginx, other web servers
Solutions:

Close the application using port 80

Or change port in docker-compose.yml:

yaml
frontend:
  ports:
    - "8080:80"  # Use port 8080 instead
Issue 2: "Docker Desktop is not running"
Solutions:

Windows: Open Docker Desktop from Start Menu

macOS: Open Docker from Applications

Check system tray for Docker icon

Restart Docker Desktop

Issue 3: "Out of memory" errors
Solutions:

Close other applications

Increase Docker memory limit:

Docker Desktop → Settings → Resources → Memory

Set to at least 4GB (8192MB recommended)

Issue 4: "Permission denied" on Linux
Solutions:

bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in
# Or run commands with sudo
sudo docker-compose up -d
Issue 5: "WSL 2 installation is incomplete" (Windows)
Solutions:

Install WSL 2: https://docs.microsoft.com/en-us/windows/wsl/install

Or use Docker with Hyper-V (older Windows versions)

Diagnostic Commands
bash
# Check if Docker is running
docker info

# Check Docker Compose version
docker-compose --version

# Check port usage
# Windows:
netstat -ano | findstr :80

# Mac/Linux:
lsof -i :80
sudo netstat -tulpn | grep :80
📊 Application Information
Data Storage
Uploaded videos: Stored in Docker volume uploads

Created clips: Stored in Docker volume clips

Database: SQLite file in container

Logs: Available via docker-compose logs

Supported Video Formats
Primary: MP4 (recommended)

Maximum size: 100MB

Codecs: H.264, AAC (standard MP4 codecs)

Performance Tips
First clip creation: May take longer as FFmpeg initializes

Large videos: Process in smaller clips for better performance

Browser: Use Chrome/Firefox for best compatibility

System: Close other applications during video processing

🗑️ Uninstallation
Remove Application (Keep Data)
bash
docker-compose down
Remove Application and All Data
bash
docker-compose down -v
docker rmi spacture-frontend spacture-backend
Complete Cleanup
bash
# Remove containers
docker-compose down -v

# Remove images
docker rmi spacture-frontend spacture-backend

# Remove unused Docker data
docker system prune -a

# Remove project folder
# Delete the spacture folder from your computer
📞 Support & Help
Getting Help
Check Logs: docker-compose logs

Verify Installation: docker run hello-world

Check Ports: Ensure ports 80 and 8000 are free

Check Resources: Ensure sufficient RAM and disk space

Common Questions
Q: Why is first startup so slow?
A: Docker downloads ~1.5GB of images. Subsequent starts are fast.

Q: Can I change the port?
A: Yes, edit docker-compose.yml and change port mapping.

Q: Where are my videos stored?
A: In Docker volumes. Use docker volume ls to see them.

Q: How do I update the application?
A: Pull latest code and run docker-compose build --no-cache

Q: Can I use it without Docker?
A: Not recommended. Docker ensures consistent environment.

🔐 Security Notes
Development Use Only
This application is configured for development use:

CORS allows all origins (*)

No authentication required

SQLite database in container

For Production Use
Consider adding:

User authentication

HTTPS/SSL

Database encryption

Rate limiting

Input validation

🚀 Next Steps After Installation
Test with sample video: Upload a short MP4 file

Create test clips: Practice with different time ranges

Explore API: Visit http://localhost:8000/docs

Check logs: Verify no errors in docker-compose logs

Share feedback: Report any issues on GitHub

📝 Final Checklist
Docker installed and running

Project downloaded/cloned

Application started with ./run.sh or run.bat

Waited 3-5 minutes for initial setup

Can access http://localhost

Can upload MP4 video

Can create and save clip

Can view clips in "My Clips"

🎉 Congratulations! You've successfully installed Spacture Video Editor.

For video editing, clipping, and management - start creating at http://localhost

Need help? Check docker-compose logs or open an issue on GitHub.
