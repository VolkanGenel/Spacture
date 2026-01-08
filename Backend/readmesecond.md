Video Clip Editor Application
A full-stack video clip editing application with Angular frontend and FastAPI backend. Upload MP4 videos, create clips by selecting time ranges, and manage your saved clips.

🎥 Features
Video Upload: Upload MP4 videos up to 100MB

Video Player: Play uploaded videos with navigation controls

Clip Creation: Select start and end times to create video clips

Clip Management: Save, download, and delete clips

Responsive Design: Works on desktop browsers

📁 Project Structure
text
Spacture/
├── Backend/          # FastAPI backend
│   ├── main.py      # Main API server
│   ├── uploads/     # Uploaded videos
│   ├── clips/       # Generated clips
│   └── video_clips.db # SQLite database
└── Frontend/        # Angular frontend
    └── video-clip-frontend/
        ├── src/app/
        │   ├── components/
        │   └── services/
        └── angular.json
⚙️ Prerequisites
Before starting, make sure you have the following installed:

For Backend:
Python 3.8 or higher

pip (Python package manager)

FFmpeg (for video processing)

For Frontend:
Node.js 18.x or higher

npm 9.x or higher

Angular CLI 19.x

🚀 Installation & Setup
Step 1: Clone or Setup Project Structure
Ensure your project has this structure:

text
/Users/sezaigenel/Desktop/Python/Spacture/
├── Backend/
└── Frontend/video-clip-frontend/
Step 2: Backend Setup
1. Navigate to Backend Directory
bash
cd /Users/sezaigenel/Desktop/Python/Spacture/Backend
2. Create Virtual Environment (Optional but Recommended)
bash
python -m venv venv
source venv/bin/activate  # On Mac/Linux
# venv\Scripts\activate   # On Windows
3. Install Dependencies
bash
pip install fastapi uvicorn python-multipart ffmpeg-python pydantic sqlite3 numpy==1.24.4
4. Install FFmpeg (Mac)
bash
brew install ffmpeg
5. Create Required Directories
bash
mkdir -p uploads clips
6. Start Backend Server
bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
The backend will be available at: http://localhost:8000

7. Verify Backend is Running
Open browser and go to: http://localhost:8000

You should see: {"message": "Video Clip API is running"}

Step 3: Frontend Setup
1. Navigate to Frontend Directory
bash
cd /Users/sezaigenel/Desktop/Python/Spacture/Frontend/video-clip-frontend
2. Install Dependencies
bash
npm install
3. Start Frontend Development Server
bash
ng serve
The frontend will be available at: http://localhost:4200

📖 Usage Guide
1. Access the Application
Open your browser and navigate to: http://localhost:4200

2. Upload a Video
Click "Choose File" in the Video Upload section

Select an MP4 video file (max 100MB)

Click "Upload Video"

Wait for upload to complete

3. Create a Clip
After uploading, set start and end times

Click "Create Clip"

Wait for processing

Optional: Name and save the clip

4. Download Clip
After creating a clip, click "Download Clip"

The clip will download to your computer

5. Manage Clips
View all saved clips in "Saved Clips" section

Download saved clips

Delete unwanted clips

🔧 Troubleshooting
Common Issues
1. Backend Won't Start
Error: ModuleNotFoundError: No module named 'fastapi'
Solution: Ensure you're in the virtual environment and dependencies are installed:

bash
source venv/bin/activate
pip install -r requirements.txt
2. Frontend Won't Start
Error: ng: command not found
Solution: Install Angular CLI globally:

bash
npm install -g @angular/cli@19
3. Video Upload Fails
Error: "Only MP4 files are supported"
Solution: Ensure you're uploading actual MP4 files, not files with just .mp4 extension

4. Video Player Not Working
Check:

Backend is running on port 8000

Video file exists in Backend/uploads/ directory

CORS is properly configured

5. Clip Creation Fails
Check:

Start time is less than end time

End time is not longer than video duration

FFmpeg is installed: ffmpeg -version

Port Conflicts
If ports are already in use:

Change backend port (to 8001):

bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001
Change frontend port (to 4201):

bash
ng serve --port 4201
Then update API URL in Frontend/video-clip-frontend/src/app/services/video.service.ts:

typescript
private apiUrl = 'http://localhost:8001/api';
🗄️ Database
The application uses SQLite for storing clip information. The database file (video_clips.db) is automatically created in the Backend directory.

View Database Contents:
bash
cd /Users/sezaigenel/Desktop/Python/Spacture/Backend
sqlite3 video_clips.db

# Inside SQLite:
.tables
SELECT * FROM clips;
.exit
📁 File Storage
Uploaded videos: Backend/uploads/

Generated clips: Backend/clips/

Database: Backend/video_clips.db

Note: These folders are created automatically. To clear all data, you can delete these folders (they will be recreated).

🌐 API Documentation
When backend is running, visit: http://localhost:8000/docs

Available endpoints:

POST /api/upload - Upload video

POST /api/clip/{video_id} - Create clip

GET /api/download/{clip_filename} - Download clip

POST /api/clips/save - Save clip info

GET /api/clips - Get saved clips

DELETE /api/clips/{clip_id} - Delete clip

🔒 Security Notes (Development Only)
⚠️ This setup is for development only:

CORS is configured to allow all origins

No authentication/authorization

SQLite database in same directory

File uploads with minimal validation

For production, consider:

Adding authentication

Implementing proper file validation

Using a production database (PostgreSQL, MySQL)

Setting up HTTPS

Implementing rate limiting

Adding proper logging

🧹 Cleanup
To remove all uploaded files and reset the application:

bash
# Stop both servers (Ctrl+C in each terminal)

# Backend cleanup
cd /Users/sezaigenel/Desktop/Python/Spacture/Backend
rm -rf uploads/* clips/* video_clips.db

# Frontend cleanup (optional)
cd ../Frontend/video-clip-frontend
rm -rf node_modules dist .angular
🐛 Debugging
Check Backend Logs
Look for error messages in the terminal where backend is running.

Check Frontend Logs
Open browser console (F12 → Console)

Check for errors

Monitor network requests (F12 → Network)

Verify FFmpeg Installation
bash
ffmpeg -version
# Should show version info without errors
🤝 Contributing
To add features or fix bugs:

Fork the repository

Create a feature branch

Make your changes

Test thoroughly

Submit a pull request

📄 License
This project is for educational purposes.

🙏 Acknowledgments
FastAPI for the backend framework

Angular for the frontend framework

FFmpeg for video processing

Bootstrap for UI components

Need Help?

Check the troubleshooting section above

Verify all prerequisites are installed

Ensure both backend and frontend are running

Check browser console for errors

Verify network connectivity between frontend and backend

Happy video clipping! 🎬