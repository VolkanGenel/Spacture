import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  getVideoInfo(videoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/video/${videoId}/info`);
  }

  preloadVideo(videoId: string): Observable<ArrayBuffer> {
    return this.http.get(`${this.apiUrl}/api/video/${videoId}/preload`, {
      responseType: 'arraybuffer'
    });
  }
}