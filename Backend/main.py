from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

import os
import shutil
import uuid
from datetime import datetime
import ffmpeg
import json
from typing import List
from pydantic import BaseModel
import sqlite3
import subprocess

# FastAPI uygulamasını bir kere oluştur (max upload size ile birlikte)
app = FastAPI(
    title="Video Clip API",
    max_upload_size=100 * 1024 * 1024  # 100MB
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Docker
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Özel CORS middleware (ek güvenlik için)
@app.middleware("http")
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# ÖNCE KLASÖRLERİ OLUŞTUR
UPLOAD_FOLDER = "uploads"
CLIPS_FOLDER = "clips"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CLIPS_FOLDER, exist_ok=True)

# SONRA STATIC DOSYALARI MOUNT ET
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/clips", StaticFiles(directory="clips"), name="clips")


# Database setup
def init_db():
    conn = sqlite3.connect('video_clips.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS clips
                 (id TEXT PRIMARY KEY,
                  name TEXT,
                  source_video TEXT,
                  start_time REAL,
                  end_time REAL,
                  clip_filename TEXT,
                  created_at TEXT)''')
    conn.commit()
    conn.close()


init_db()


class ClipRequest(BaseModel):
    start_time: float
    end_time: float


class ClipSaveRequest(BaseModel):
    name: str
    source_video: str
    start_time: float
    end_time: float
    clip_filename: str


class ClipInfo(BaseModel):
    id: str
    name: str
    source_video: str
    start_time: float
    end_time: float
    clip_filename: str
    created_at: str


@app.get("/")
def read_root():
    return {"message": "Video Clip API is running"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "video-clip-api"}


@app.post("/api/upload")
async def upload_video(file: UploadFile = File(...)):
    # Sadece MP4 dosyalarını kabul et
    if not file.filename.lower().endswith('.mp4'):
        raise HTTPException(400, "Only MP4 files are supported")

    # Benzersiz dosya adı oluştur
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.mp4"
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    # Dosyayı kaydet
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Video metadata'sını al (OpenCV'siz)
    metadata = get_video_metadata(file_path)
    file_size = os.path.getsize(file_path)

    return {
        "id": file_id,
        "filename": filename,
        "original_name": file.filename,
        "file_size": file_size,
        "file_path": file_path,
        **metadata
    }


def get_video_metadata(file_path: str):
    """FFmpeg ile video metadata'sını çıkar (OpenCV olmadan)"""
    try:
        # FFmpeg ile video bilgilerini al
        probe = ffmpeg.probe(file_path)
        video_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'video'), None)

        if not video_stream:
            raise Exception("No video stream found")

        duration = float(video_stream.get('duration', 0))
        width = int(video_stream.get('width', 0))
        height = int(video_stream.get('height', 0))

        # FPS'i hesaplamak için birden fazla yöntem deneyelim
        fps = 0

        # 1. Yöntem: 'r' (avg_frame_rate veya r_frame_rate) alanından
        fps_str = video_stream.get('avg_frame_rate') or video_stream.get('r_frame_rate')
        if fps_str:
            try:
                if '/' in fps_str:
                    num, den = map(float, fps_str.split('/'))
                    fps = num / den if den != 0 else 0
                else:
                    fps = float(fps_str)
            except:
                fps = 0

        # 2. Yöntem: Eğer hala 0 ise, tags'tan bak
        if fps == 0 and 'tags' in video_stream:
            tags = video_stream['tags']
            if 'BPS' in tags:
                try:
                    fps = float(tags['BPS'])
                except:
                    pass

        # 3. Yöntem: codec_time_base'dan hesapla
        if fps == 0 and 'codec_time_base' in video_stream:
            try:
                time_base = video_stream['codec_time_base']
                if '/' in time_base:
                    num, den = map(float, time_base.split('/'))
                    fps = den / num if num != 0 else 0
            except:
                pass

        # 4. Yöntem: time_base'dan hesapla
        if fps == 0 and 'time_base' in video_stream:
            try:
                time_base = video_stream['time_base']
                if '/' in time_base:
                    num, den = map(float, time_base.split('/'))
                    fps = den / num if num != 0 else 0
            except:
                pass

        # Frame sayısını hesapla
        frame_count = int(video_stream.get('nb_frames', 0))
        if frame_count == 0 and fps > 0 and duration > 0:
            frame_count = int(duration * fps)

        # File size
        file_size = os.path.getsize(file_path)

        return {
            "duration": round(duration, 2),
            "frame_count": frame_count,
            "resolution": f"{width}x{height}",
            "fps": round(fps, 2) if fps > 0 else 0,
            "width": width,
            "height": height,
            "file_size": file_size
        }
    except Exception as e:
        print(f"Error getting metadata: {e}")
        import traceback
        traceback.print_exc()

        # Fallback: basit dosya bilgisi
        try:
            file_size = os.path.getsize(file_path)
            return {
                "duration": 0,
                "frame_count": 0,
                "resolution": "Unknown",
                "fps": 0,
                "width": 0,
                "height": 0,
                "file_size": file_size
            }
        except:
            return {
                "duration": 0,
                "frame_count": 0,
                "resolution": "Unknown",
                "fps": 0,
                "width": 0,
                "height": 0,
                "file_size": 0
            }


@app.post("/api/clip/{video_id}")
async def create_clip(video_id: str, clip_request: ClipRequest):
    video_path = os.path.join(UPLOAD_FOLDER, f"{video_id}.mp4")

    if not os.path.exists(video_path):
        raise HTTPException(404, "Video not found")

    # Kırpılmış video için benzersiz isim
    clip_id = str(uuid.uuid4())
    clip_filename = f"clip_{clip_id}.mp4"
    clip_path = os.path.join(CLIPS_FOLDER, clip_filename)

    # FFmpeg ile video kırpma
    try:
        start_time = clip_request.start_time
        end_time = clip_request.end_time

        # Süreyi kontrol et
        metadata = get_video_metadata(video_path)
        if end_time > metadata["duration"] or start_time < 0:
            raise HTTPException(400, "Invalid timestamp range")

        # Kırpma süresi
        duration = end_time - start_time

        # Video kırpma
        (
            ffmpeg
            .input(video_path, ss=start_time, t=duration)
            .output(clip_path, c="copy", acodec="copy")
            .run(quiet=True, overwrite_output=True)
        )

        return {
            "clip_id": clip_id,
            "clip_filename": clip_filename,
            "clip_path": clip_path,
            "message": "Clip created successfully",
            "duration": round(duration, 2)
        }
    except Exception as e:
        raise HTTPException(500, f"Error creating clip: {str(e)}")


@app.get("/api/download/{clip_filename}")
async def download_clip(clip_filename: str):
    clip_path = os.path.join(CLIPS_FOLDER, clip_filename)

    if not os.path.exists(clip_path):
        raise HTTPException(404, "Clip not found")

    return FileResponse(
        clip_path,
        media_type="video/mp4",
        filename=clip_filename
    )


# Bonus: Clip Management Endpoints
@app.post("/api/clips/save")
async def save_clip(request: ClipSaveRequest):
    conn = sqlite3.connect('video_clips.db')
    c = conn.cursor()

    clip_id = str(uuid.uuid4())
    created_at = datetime.now().isoformat()

    c.execute("""
              INSERT INTO clips (id, name, source_video, start_time, end_time, clip_filename, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              """, (clip_id, request.name, request.source_video, request.start_time,
                    request.end_time, request.clip_filename, created_at))

    conn.commit()
    conn.close()

    return {"id": clip_id, "message": "Clip saved successfully"}


@app.get("/api/clips", response_model=List[ClipInfo])
async def get_clips():
    conn = sqlite3.connect('video_clips.db')
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    c.execute("SELECT * FROM clips ORDER BY created_at DESC")
    rows = c.fetchall()

    clips = [dict(row) for row in rows]
    conn.close()

    return clips


@app.delete("/api/clips/{clip_id}")
async def delete_clip(clip_id: str):
    conn = sqlite3.connect('video_clips.db')
    c = conn.cursor()

    # Önce clip dosyasını sil
    c.execute("SELECT clip_filename FROM clips WHERE id = ?", (clip_id,))
    row = c.fetchone()

    if row:
        clip_path = os.path.join(CLIPS_FOLDER, row[0])
        if os.path.exists(clip_path):
            os.remove(clip_path)

    # Database'den sil
    c.execute("DELETE FROM clips WHERE id = ?", (clip_id,))

    conn.commit()
    conn.close()

    return {"message": "Clip deleted successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
