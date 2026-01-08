from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
import os
import shutil
import uuid
from datetime import datetime
import ffmpeg
import json
from typing import List, Optional
from pydantic import BaseModel
import sqlite3
import subprocess
from pathlib import Path

# FastAPI uygulamasını bir kere oluştur (max upload size ile birlikte)
app = FastAPI(
    title="Video Clip API",
    max_upload_size=100 * 1024 * 1024  # 100MB
)

# CORS ayarları - CHROME İÇİN GÜNCELLENDİ
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:4200", "http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "Accept-Ranges", "Content-Length", "Content-Type"],
    max_age=3600
)

# ÖNCE KLASÖRLERİ OLUŞTUR
UPLOAD_FOLDER = "uploads"
CLIPS_FOLDER = "clips"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CLIPS_FOLDER, exist_ok=True)


# VIDEO STREAMING İÇİN ÖZEL ROUTE
@app.get("/uploads/{filename}")
async def stream_video(filename: str, request: Request):
    """Video streaming endpoint with range request support for Chrome"""
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video not found")

    # Get file size
    file_size = os.path.getsize(file_path)

    # Check if it's a range request
    range_header = request.headers.get("range")

    if range_header:
        # Parse range header
        try:
            byte1, byte2 = 0, None
            range_ = range_header.replace("bytes=", "").split("-")
            byte1 = int(range_[0])
            if len(range_) == 2 and range_[1]:
                byte2 = int(range_[1])

            if byte2 is None:
                byte2 = file_size - 1

            # Ensure byte1 <= byte2
            if byte1 > byte2:
                byte1, byte2 = byte2, byte1

            # Ensure byte2 is within file size
            if byte2 >= file_size:
                byte2 = file_size - 1

            length = byte2 - byte1 + 1

            # Read file chunk
            def iterfile():
                with open(file_path, "rb") as f:
                    f.seek(byte1)
                    remaining = length
                    while remaining > 0:
                        chunk_size = min(4096, remaining)
                        chunk = f.read(chunk_size)
                        if not chunk:
                            break
                        remaining -= len(chunk)
                        yield chunk

            # Return partial content response
            headers = {
                "Content-Range": f"bytes {byte1}-{byte2}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(length),
                "Content-Type": "video/mp4",
                "Access-Control-Expose-Headers": "Content-Range, Accept-Ranges, Content-Length",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, HEAD",
                "Access-Control-Allow-Headers": "Range",
                "Cache-Control": "no-cache"
            }

            return StreamingResponse(
                iterfile(),
                status_code=206,
                headers=headers,
                media_type="video/mp4"
            )

        except Exception as e:
            print(f"Range request error: {e}")
            # Fall back to full file response
            pass

    # Full file response (non-range request)
    headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": str(file_size),
        "Content-Type": "video/mp4",
        "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, max-age=0"
    }

    def iterfile():
        with open(file_path, "rb") as f:
            while chunk := f.read(4096):
                yield chunk

    return StreamingResponse(
        iterfile(),
        media_type="video/mp4",
        headers=headers
    )


# Clips için de streaming endpoint
@app.get("/clips/{filename}")
async def stream_clip(filename: str, request: Request):
    """Clip streaming endpoint with range request support"""
    file_path = os.path.join(CLIPS_FOLDER, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Clip not found")

    # Get file size
    file_size = os.path.getsize(file_path)

    # Check if it's a range request
    range_header = request.headers.get("range")

    if range_header:
        try:
            byte1, byte2 = 0, None
            range_ = range_header.replace("bytes=", "").split("-")
            byte1 = int(range_[0])
            if len(range_) == 2 and range_[1]:
                byte2 = int(range_[1])

            if byte2 is None:
                byte2 = file_size - 1

            if byte1 > byte2:
                byte1, byte2 = byte2, byte1

            if byte2 >= file_size:
                byte2 = file_size - 1

            length = byte2 - byte1 + 1

            def iterfile():
                with open(file_path, "rb") as f:
                    f.seek(byte1)
                    remaining = length
                    while remaining > 0:
                        chunk_size = min(4096, remaining)
                        chunk = f.read(chunk_size)
                        if not chunk:
                            break
                        remaining -= len(chunk)
                        yield chunk

            headers = {
                "Content-Range": f"bytes {byte1}-{byte2}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(length),
                "Content-Type": "video/mp4",
                "Access-Control-Expose-Headers": "Content-Range, Accept-Ranges, Content-Length",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache"
            }

            return StreamingResponse(
                iterfile(),
                status_code=206,
                headers=headers,
                media_type="video/mp4"
            )

        except Exception as e:
            print(f"Range request error for clip: {e}")

    # Full file response
    headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": str(file_size),
        "Content-Type": "video/mp4",
        "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, max-age=0"
    }

    def iterfile():
        with open(file_path, "rb") as f:
            while chunk := f.read(4096):
                yield chunk

    return StreamingResponse(
        iterfile(),
        media_type="video/mp4",
        headers=headers
    )


# Statik dosyalar için mount (artık stream_video endpoint'imiz var, bu opsiyonel)
# app.mount("/uploads", StaticFiles(directory="uploads", html=True), name="uploads")
# app.mount("/clips", StaticFiles(directory="clips", html=True), name="clips")

# Database setup
def init_db():
    conn = sqlite3.connect('video_clips.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS clips
                 (
                     id
                     TEXT
                     PRIMARY
                     KEY,
                     name
                     TEXT,
                     source_video
                     TEXT,
                     start_time
                     REAL,
                     end_time
                     REAL,
                     clip_filename
                     TEXT,
                     created_at
                     TEXT
                 )''')
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

    # Video için ön izleme oluştur (opsiyonel)
    # create_video_thumbnail(file_path, file_id)

    return {
        "id": file_id,
        "filename": filename,
        "original_name": file.filename,
        "file_size": file_size,
        "file_path": f"/uploads/{filename}",  # Streaming endpoint'e işaret ediyor
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

        # FPS'i hesapla
        fps = 0
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

        # Frame sayısını hesapla
        frame_count = int(video_stream.get('nb_frames', 0))
        if frame_count == 0 and fps > 0 and duration > 0:
            frame_count = int(duration * fps)

        # Codec bilgisi
        codec = video_stream.get('codec_name', 'unknown')

        # Bitrate
        bitrate = int(video_stream.get('bit_rate', 0))

        return {
            "duration": round(duration, 2),
            "frame_count": frame_count,
            "resolution": f"{width}x{height}",
            "fps": round(fps, 2) if fps > 0 else 0,
            "width": width,
            "height": height,
            "codec": codec,
            "bitrate": bitrate,
            "file_size": os.path.getsize(file_path)
        }
    except Exception as e:
        print(f"Error getting metadata: {e}")
        import traceback
        traceback.print_exc()

        # Fallback
        try:
            file_size = os.path.getsize(file_path)
            return {
                "duration": 0,
                "frame_count": 0,
                "resolution": "Unknown",
                "fps": 0,
                "width": 0,
                "height": 0,
                "codec": "unknown",
                "bitrate": 0,
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
                "codec": "unknown",
                "bitrate": 0,
                "file_size": 0
            }


@app.get("/api/download/{filename}")
async def download_clip(filename: str):
    """Download clip file"""
    file_path = os.path.join(CLIPS_FOLDER, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="video/mp4"
    )

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
            .output(clip_path, vcodec="libx264", acodec="aac", preset="fast", movflags="faststart")
            .run(quiet=True, overwrite_output=True)
        )

        return {
            "clip_id": clip_id,
            "clip_filename": clip_filename,
            "clip_path": f"/clips/{clip_filename}",
            "message": "Clip created successfully",
            "duration": round(duration, 2)
        }
    except Exception as e:
        raise HTTPException(500, f"Error creating clip: {str(e)}")


# Bonus: Video info endpoint
@app.get("/api/video/{video_id}/info")
async def get_video_info(video_id: str):
    video_path = os.path.join(UPLOAD_FOLDER, f"{video_id}.mp4")

    if not os.path.exists(video_path):
        raise HTTPException(404, "Video not found")

    metadata = get_video_metadata(video_path)

    return {
        "id": video_id,
        "filename": f"{video_id}.mp4",
        **metadata
    }


# Bonus: Video preload endpoint (ilk 1MB)
@app.get("/api/video/{video_id}/preload")
async def preload_video(video_id: str):
    video_path = os.path.join(UPLOAD_FOLDER, f"{video_id}.mp4")

    if not os.path.exists(video_path):
        raise HTTPException(404, "Video not found")

    # İlk 1MB'ı oku
    chunk_size = 1024 * 1024  # 1MB
    try:
        with open(video_path, "rb") as f:
            chunk = f.read(chunk_size)

        return Response(
            content=chunk,
            media_type="video/mp4",
            headers={
                "Content-Type": "video/mp4",
                "Cache-Control": "no-cache"
            }
        )
    except Exception as e:
        raise HTTPException(500, f"Error reading video: {str(e)}")


# Clip Management Endpoints
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
            try:
                os.remove(clip_path)
            except:
                pass

    # Database'den sil
    c.execute("DELETE FROM clips WHERE id = ?", (clip_id,))

    conn.commit()
    conn.close()

    return {"message": "Clip deleted successfully"}


# OPTIONS endpoints for CORS preflight
@app.options("/uploads/{filename}")
async def options_upload_stream():
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
        }
    )


@app.options("/clips/{filename}")
async def options_clip_stream():
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "86400"
        }
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")