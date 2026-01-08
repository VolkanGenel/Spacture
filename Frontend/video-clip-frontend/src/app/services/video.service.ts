import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VideoMetadata {
  id: string;
  filename: string;
  original_name: string;
  duration: number;
  frame_count: number;
  resolution: string;
  fps: number;
  width: number;
  height: number;
  file_size: number;
  file_path: string;
}

export interface ClipResponse {
  clip_id: string;
  clip_filename: string;
  clip_path: string;
  message: string;
  duration: number;
}

export interface ClipInfo {
  id: string;
  name: string;
  source_video: string;
  start_time: number;
  end_time: number;
  clip_filename: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private apiUrl = environment.apiUrl;
  private currentVideoSubject = new BehaviorSubject<VideoMetadata | null>(null);
  private clipSavedSource = new Subject<void>();
  clipSaved$ = this.clipSavedSource.asObservable();
  currentVideo$ = this.currentVideoSubject.asObservable();

  constructor(private http: HttpClient) { 
    console.log('API URL:', this.apiUrl);
  }

  uploadVideo(file: File): Observable<VideoMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<VideoMetadata>(`${this.apiUrl}/upload`, formData);
  }

  createClip(videoId: string, startTime: number, endTime: number): Observable<ClipResponse> {
    const request = { start_time: startTime, end_time: endTime };
    return this.http.post<ClipResponse>(`${this.apiUrl}/clip/${videoId}`, request);
  }

  downloadClip(clipFilename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${clipFilename}`, {
      responseType: 'blob'
    });
  }

  getClips(): Observable<ClipInfo[]> {
    return this.http.get<ClipInfo[]>(`${this.apiUrl}/clips`);
  }

  saveClip(clipData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clips/save`, clipData);
  }

  deleteClip(clipId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clips/${clipId}`);
  }

  setCurrentVideo(video: VideoMetadata): void {
    this.currentVideoSubject.next(video);
  }

  getCurrentVideo(): VideoMetadata | null {
    return this.currentVideoSubject.getValue();
  }
  
  notifyClipSaved() {
    this.clipSavedSource.next();
  }
}
