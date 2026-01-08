import { Component } from '@angular/core';
import { VideoService, VideoMetadata } from '../../services/video.service';

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.css'],
  standalone: false
})
export class VideoUploadComponent {
  selectedFile: File | null = null;
  isUploading = false;
  errorMessage = '';
  videoMetadata: VideoMetadata | null = null;
  isDragover = false;

  constructor(private videoService: VideoService) { }

  // onFileSelected(event: any): void {
  //   const file = event.target.files[0];
  //   if (!file) return;
    
  //   const fileName = file.name.toLowerCase();
  //   const allowedExtensions = ['.mp4', '.mp3'];
  //   const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));
    
  //   if (!isAllowed) {
  //     this.errorMessage = 'Only MP4 and MP3 files are supported';
  //     this.selectedFile = null;
  //     return;
  //   }
    
  //   // Dosya boyutu kontrolü (100MB)
  //   if (file.size > 100 * 1024 * 1024) {
  //     this.errorMessage = 'File size too large. Maximum 100MB allowed';
  //     this.selectedFile = null;
  //     return;
  //   }
    
  //   this.selectedFile = file;
  //   this.errorMessage = '';
  //   this.videoMetadata = null;
  //   this.uploadVideo();
  // }

  uploadVideo(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.errorMessage = '';

    this.videoService.uploadVideo(this.selectedFile).subscribe({
      next: (metadata) => {
        this.videoMetadata = metadata;
        this.videoService.setCurrentVideo(metadata);
        this.isUploading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.detail || 'Upload failed. Please try again.';
        this.isUploading = false;
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Yeni metod: süreyi formatla
  formatDuration(seconds: number): string {
    if (!seconds) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  
  // Yeni metod: dosya tipini al
  getFileType(file: File | null): string {
    if (!file || !file.type) return 'Unknown';
    
    const type = file.type.split('/')[1];
    return type ? type.toUpperCase() : 'Unknown';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = false;
    
    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      this.handleFileSelection(file);
    }
  }

  private handleFileSelection(file: File): void {
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.mp4', '.mp3'];
    const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isAllowed) {
      this.errorMessage = 'Only MP4 and MP3 files are supported';
      this.selectedFile = null;
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) {
      this.errorMessage = 'File size too large. Maximum 100MB allowed';
      this.selectedFile = null;
      return;
    }
    
    this.selectedFile = file;
    this.errorMessage = '';
    this.videoMetadata = null;
  }
  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

}


// import { Component } from '@angular/core';
// import { VideoService, VideoMetadata } from '../../services/video.service';

// @Component({
//   selector: 'app-video-upload',
//   templateUrl: './video-upload.component.html',
//   styleUrls: ['./video-upload.component.css'],
//   standalone: false
// })
// export class VideoUploadComponent {
//   selectedFile: File | null = null;
//   isUploading = false;
//   errorMessage = '';
//   videoMetadata: VideoMetadata | null = null;

//   constructor(private videoService: VideoService) { }

//   onFileSelected(event: any): void {
//     const file = event.target.files[0];
//      if (!file) return;
//     const fileName = file.name.toLowerCase();
//     const allowedExtensions = ['.mp4', '.mp3'];
//     const isAllowed = allowedExtensions.some(ext =>
//     fileName.endsWith(ext)
//   );
//     if (file) {
//       // Sadece MP4 kontrolü
//       // if (!file.name.toLowerCase().endsWith('.mp4')) {
//       if (!isAllowed) {
//         this.errorMessage = 'Only MP4 files are supported';
//         this.selectedFile = null;
//         return;
//       }
      
//       // Dosya boyutu kontrolü (100MB)
//       if (file.size > 100 * 1024 * 1024) {
//         this.errorMessage = 'File size too large. Maximum 100MB allowed';
//         this.selectedFile = null;
//         return;
//       }
      
//       this.selectedFile = file;
//       this.errorMessage = '';
//       this.videoMetadata = null;
//     }
//   }

//   uploadVideo(): void {
//     if (!this.selectedFile) return;

//     this.isUploading = true;
//     this.errorMessage = '';

//     this.videoService.uploadVideo(this.selectedFile).subscribe({
//       next: (metadata) => {
//         this.videoMetadata = metadata;
//         this.videoService.setCurrentVideo(metadata);
//         this.isUploading = false;
//       },
//       error: (error) => {
//         this.errorMessage = error.error?.detail || 'Upload failed. Please try again.';
//         this.isUploading = false;
//       }
//     });
//   }

//   formatFileSize(bytes: number): string {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   }
// }