import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { VideoService } from '../../services/video.service';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css'],
  standalone: false
})
export class VideoPlayerComponent implements OnInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  currentVideo: any = null;
  userInteracted = false;
  
  // Debug için
  debugMessages: string[] = [];

  constructor(private videoService: VideoService) { }

  // ngOnInit(): void {
  //   this.addDebugMessage('Component initialized');
    
  //   this.videoService.currentVideo$.subscribe(video => {
  //     this.addDebugMessage('Video received: ' + (video ? video.filename : 'null'));
  //     this.currentVideo = video;
  //     this.userInteracted = false; // Yeni video yüklendiğinde resetle
  //   });
  // }

  ngOnInit(): void {
  this.addDebugMessage('Component initialized');

  this.videoService.currentVideo$.subscribe(video => {
    this.addDebugMessage(
      'New video received from service: ' + (video ? video.filename : 'null')
    );

    // 👇 eski videoyu düşür (video element yeniden render edilsin)
    this.addDebugMessage('Resetting currentVideo to force video reload');
    this.currentVideo = null;

    setTimeout(() => {
      this.currentVideo = video;
      this.userInteracted = false;

      this.addDebugMessage('New video assigned to player');

      if (this.videoPlayer?.nativeElement) {
        this.addDebugMessage('Calling video.load() to refresh source');
        this.videoPlayer.nativeElement.load();
      } else {
        this.addDebugMessage('Video element not available yet');
      }
    });
  });
}


  // Video element'ine tıklanınca çağrılacak
  onVideoClick(): void {
    this.addDebugMessage('Video clicked - user interaction registered');
    this.userInteracted = true;
  }

  // Video oynatılmaya başlayınca çağrılacak
  onVideoPlay(): void {
    this.addDebugMessage('Video started playing - user interaction registered');
    this.userInteracted = true;
  }

  setCurrentTime(seconds: number): void {
    this.addDebugMessage(`setCurrentTime called with seconds: ${seconds}`);
    this.addDebugMessage(`Video element available: ${!!this.videoPlayer?.nativeElement}`);
    this.addDebugMessage(`Current video: ${JSON.stringify(this.currentVideo?.filename)}`);
    this.addDebugMessage(`User interacted: ${this.userInteracted}`);
    
    if (!this.videoPlayer || !this.videoPlayer.nativeElement) {
      this.addDebugMessage('ERROR: Video player element not found');
      return;
    }
    
    if (!this.currentVideo) {
      this.addDebugMessage('ERROR: No current video');
      return;
    }
    
    // Süre sınırlaması
    if (seconds > this.currentVideo.duration) {
      seconds = this.currentVideo.duration;
    }
    
    try {
      this.addDebugMessage(`Setting currentTime to: ${seconds}`);
      this.videoPlayer.nativeElement.currentTime = seconds;
      
      // Chrome'un otomatik oynatma politikası
      if (this.userInteracted) {
        const playPromise = this.videoPlayer.nativeElement.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.addDebugMessage('Video started playing successfully');
          }).catch(error => {
            this.addDebugMessage(`Play failed: ${error.message}`);
            // Oynatma başarısız olsa bile zaman atlaması yapıldı
          });
        }
      } else {
        this.addDebugMessage('User has not interacted yet. Video time set but not playing.');
        // Kullanıcıya bilgi ver
        this.showUserInteractionPrompt();
      }
    } catch (error: any) {
      this.addDebugMessage(`ERROR: ${error.message}`);
    }
  }

  goToMiddle(): void {
    this.addDebugMessage('goToMiddle called');
    if (this.currentVideo) {
      const middle = this.currentVideo.duration / 2;
      this.addDebugMessage(`Middle point: ${middle}`);
      this.setCurrentTime(middle);
    }
  }

  // Kullanıcı etkileşimi için uyarı göster
  showUserInteractionPrompt(): void {
    // Küçük bir bildirim göster (isteğe bağlı)
    const promptElement = document.createElement('div');
    promptElement.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: #ffc107; color: #000; padding: 10px; border-radius: 5px; z-index: 10000; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
        <strong>Note:</strong> Click the video first to enable playback controls
      </div>
    `;
    document.body.appendChild(promptElement);
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
      if (promptElement.parentNode) {
        promptElement.parentNode.removeChild(promptElement);
      }
    }, 3000);
  }

  // Debug mesajları
  private addDebugMessage(message: string): void {
    console.log('VideoPlayer Debug:', message);
    this.debugMessages.push(`${new Date().toLocaleTimeString()}: ${message}`);
    
    if (this.debugMessages.length > 10) {
      this.debugMessages.shift();
    }
  }

  clearDebugMessages(): void {
    this.debugMessages = [];
  }

  get videoSrc(): string {
  if (!this.currentVideo) return '';
  const src = `http://localhost:8000/uploads/${this.currentVideo.filename}?t=${Date.now()}`;
  this.addDebugMessage('Video src generated: ' + src);
  return src;
}
}
// İLK VERSİYON
// import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
// import { VideoService } from '../../services/video.service';

// @Component({
//   selector: 'app-video-player',
//   templateUrl: './video-player.component.html',
//   styleUrls: ['./video-player.component.css'],
//   standalone: false
// })
// export class VideoPlayerComponent implements OnInit {
//   @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
//   currentVideo: any = null;

//   constructor(private videoService: VideoService) { }

//   ngOnInit(): void {
//     this.videoService.currentVideo$.subscribe(video => {
//       this.currentVideo = video;
//     });
//   }

//   setCurrentTime(seconds: number): void {
//     if (this.videoPlayer && this.videoPlayer.nativeElement && this.currentVideo) {
//       if (seconds > this.currentVideo.duration) {
//         seconds = this.currentVideo.duration;
//       }
//       this.videoPlayer.nativeElement.currentTime = seconds;
//       this.videoPlayer.nativeElement.play();
//     }
//   }

//   goToMiddle(): void {
//     if (this.currentVideo && this.videoPlayer?.nativeElement) {
//       const middle = this.currentVideo.duration / 2;
//       this.setCurrentTime(middle);
//     }
//   }
// }



// import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
// import { VideoService } from '../../services/video.service';

// @Component({
//   selector: 'app-video-player',
//   templateUrl: './video-player.component.html',
//   styleUrls: ['./video-player.component.css'],
//   standalone: false
// })
// export class VideoPlayerComponent implements OnInit {
//   @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
//   currentVideo: any = null;
//   isVideoReady = false;
//   userInteracted = false;

//   constructor(
//     private videoService: VideoService,
//     private cdr: ChangeDetectorRef
//   ) { }

//   ngOnInit(): void {
//     this.videoService.currentVideo$.subscribe(video => {
//       console.log('VideoPlayer: New video received', video);
//       this.currentVideo = video;
//       this.isVideoReady = false;
//       this.userInteracted = false;
      
//       // Video metadata yüklendiğinde
//       if (this.videoPlayer?.nativeElement) {
//         this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
//           console.log('Video metadata loaded');
//           this.isVideoReady = true;
//           this.cdr.detectChanges();
//         });
//       }
//     });
//   }

//   // Kullanıcı etkileşimini kaydet
//   handleUserInteraction(): void {
//     console.log('User interaction recorded');
//     this.userInteracted = true;
//   }

//   setCurrentTime(seconds: number): void {
//     console.log('setCurrentTime called with seconds:', seconds);
//     console.log('Video element available:', !!this.videoPlayer?.nativeElement);
//     console.log('Current video:', this.currentVideo);
//     console.log('User interacted:', this.userInteracted);

//     if (!this.videoPlayer || !this.videoPlayer.nativeElement || !this.currentVideo) {
//       console.error('Video player, nativeElement or currentVideo is missing');
//       return;
//     }

//     // Süre sınırlaması
//     if (seconds > this.currentVideo.duration) {
//       seconds = this.currentVideo.duration;
//     }
//     if (seconds < 0) {
//       seconds = 0;
//     }

//     console.log('Setting currentTime to:', seconds);
//     this.videoPlayer.nativeElement.currentTime = seconds;
    
//     // Chrome'un otomatik oynatma politikası için
//     // Sadece kullanıcı etkileşiminden sonra oynat
//     if (this.userInteracted) {
//       console.log('Attempting to play video...');
//       const playPromise = this.videoPlayer.nativeElement.play();
      
//       // Chrome'un Promise tabanlı play() metodunu handle et
//       if (playPromise !== undefined) {
//         playPromise.then(() => {
//           console.log('Video playing successfully');
//         }).catch(error => {
//           console.log('Auto-play prevented:', error);
//           // Chrome otomatik oynatmaya izin vermiyorsa, sadece zamanı ayarla
//           // Kullanıcı manuel play butonuna basabilir
//         });
//       }
//     } else {
//       console.log('User has not interacted yet. Video time set but not playing.');
//       // Kullanıcı henüz etkileşimde bulunmadıysa, bir dialog göster
//       // this.requestUserInteraction(); // Bu satırı isteğe bağlı olarak açabilirsiniz
//     }
//   }

//   goToMiddle(): void {
//     console.log('goToMiddle called');
//     if (this.currentVideo && this.videoPlayer?.nativeElement) {
//       const middle = this.currentVideo.duration / 2;
//       this.setCurrentTime(middle);
//     }
//   }
// }