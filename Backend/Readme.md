# Video Clipping Tool

A full-stack web application for uploading videos, extracting metadata, and creating clips with download functionality.

## Features

- Upload MP4 video files
- Display video metadata (duration, resolution, FPS, frame count)
- Play videos in browser with controls
- Create clips by specifying start/end timestamps
- Download generated clips
- Save and manage clips (Bonus feature)
- Responsive UI with Bootstrap

## Tech Stack

### Backend
- Python 3.8+
- FastAPI (web framework)
- FFmpeg (video processing)
- OpenCV (video metadata extraction)
- SQLite (clip storage)

### Frontend
- Angular 15+
- TypeScript
- Bootstrap 5
- RxJS

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- FFmpeg installed system-wide

### Install FFmpeg

**Windows:**
- Download from https://ffmpeg.org/download.html
- Add to PATH

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg