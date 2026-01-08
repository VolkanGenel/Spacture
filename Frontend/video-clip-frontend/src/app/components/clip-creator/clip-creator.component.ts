import { Component, OnInit } from '@angular/core';
import { VideoService, ClipInfo } from '../../services/video.service';

@Component({
  selector: 'app-clip-creator',
  templateUrl: './clip-creator.component.html',
  styleUrls: ['./clip-creator.component.css'],
  standalone: false
})
export class ClipCreatorComponent implements OnInit {
  currentVideo: any = null;
  startTime = 0;
  endTime = 5;
  clipName = '';
  generatedClip: any = null;
  isProcessing = false;
  errorMessage = '';
  successMessage = '';
  clips: ClipInfo[] = [];
  isLoading = false;

  constructor(private videoService: VideoService) { }

  ngOnInit(): void {
    this.videoService.currentVideo$.subscribe(video => {
      this.currentVideo = video;
      if (video) {
        this.endTime = Math.min(5, video.duration);
      }
      this.resetForm();
    });

    // Clipleri yükle
    this.loadClips();

    // Yeni klip kaydedildiğinde
    this.videoService.clipSaved$.subscribe(() => {
      console.log('Yeni klip haberi geldi, liste yenileniyor...');
      this.loadClips();
    });
  }

  getClipDuration(): number {
    if (this.endTime > this.startTime) {
      return this.endTime - this.startTime;
    }
    return 0;
  }

  isFormValid(): boolean {
    if (!this.currentVideo) return false;
    if (this.startTime >= this.endTime) return false;
    if (this.endTime > this.currentVideo.duration) return false;
    if (this.getClipDuration() <= 0) return false;
    return true;
  }

  createClip(): void {
    if (!this.currentVideo || !this.isFormValid()) return;

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.videoService.createClip(this.currentVideo.id, this.startTime, this.endTime)
      .subscribe({
        next: (response) => {
          this.generatedClip = response;
          this.successMessage = `Clip created successfully! Duration: ${response.duration.toFixed(2)}s`;
          this.isProcessing = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.detail || 'Failed to create clip. Please try again.';
          this.isProcessing = false;
        }
      });
  }

  downloadClip(): void {
    if (!this.generatedClip) return;

    this.videoService.downloadClip(this.generatedClip.clip_filename).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.clipName.trim() || this.generatedClip.clip_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  saveClip(): void {
    if (!this.generatedClip || !this.clipName.trim() || !this.currentVideo) return;

    const clipData = {
      name: this.clipName,
      source_video: this.currentVideo.original_name,
      start_time: this.startTime,
      end_time: this.endTime,
      clip_filename: this.generatedClip.clip_filename
    };

    this.videoService.saveClip(clipData).subscribe({
      next: () => {
        this.successMessage = 'Clip saved successfully! You can find it in the Saved Clips section.';
        this.videoService.notifyClipSaved();
        this.resetForm();
      },
      error: (error) => {
        this.errorMessage = 'Failed to save clip. Please try again.';
      }
    });
  }

  resetForm(): void {
    this.generatedClip = null;
    this.clipName = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Clip Manager metodları buraya taşınıyor
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
          this.errorMessage = 'İndirilecek dosya sunucuda bulunamadı.';
        } else {
          this.errorMessage = 'Beklenmedik bir hata oluştu.';
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
          this.successMessage = 'Clip deleted successfully!';
        },
        error: (error) => {
          console.error('Failed to delete clip:', error);
          this.errorMessage = 'Failed to delete clip. Please try again.';
        }
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' }) + ', ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  scrollToCreate(): void {
    const leftPanel = document.querySelector('.left-panel');
    if (leftPanel) {
      leftPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}