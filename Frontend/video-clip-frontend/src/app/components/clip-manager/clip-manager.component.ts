import { Component, OnInit } from '@angular/core';
import { VideoService, ClipInfo } from '../../services/video.service';

@Component({
  selector: 'app-clip-manager',
  templateUrl: './clip-manager.component.html',
  styleUrls: ['./clip-manager.component.css'],
  standalone: false
})
export class ClipManagerComponent implements OnInit {
  clips: ClipInfo[] = [];
  isLoading = false;
  errorMessage: string = '';

  constructor(private videoService: VideoService) { }

  ngOnInit(): void {
    this.loadClips();

    this.videoService.clipSaved$.subscribe(() => {
      console.log('Yeni klip haberi geldi, liste yenileniyor...');
      this.loadClips(); // Haberi alınca listeyi otomatik tazele
    });
  }

  loadClips(): void {
    this.isLoading = true;
    this.videoService.getClips().subscribe({
      next: (clips) => {
        this.clips = clips;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load clips:', error);
        this.isLoading = false;
      }
    });
  }
  
downloadSavedClip(clip: ClipInfo): void {
  this.videoService.downloadClip(clip.clip_filename).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = clip.name || clip.clip_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    error: (error) => {
      if (error.status === 404) {
        this.errorMessage = 'Clip file not found on server.';
      } else {
        this.errorMessage = 'Unexpected error occurred.';
      }
      setTimeout(() => this.errorMessage = '', 5000);
    }
  });
}

  deleteClip(clipId: string): void {
    if (confirm('Are you sure you want to delete this clip?')) {
      this.videoService.deleteClip(clipId).subscribe({
        next: () => {
          this.clips = this.clips.filter(c => c.id !== clipId);
        },
        error: (error) => {
          console.error('Failed to delete clip:', error);
          alert('Failed to delete clip. Please try again.');
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }


}