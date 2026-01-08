import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { VideoService } from '../../services/video.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css'],
  standalone: false
})
export class VideoPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('plyrPlayer') plyrPlayer!: ElementRef<HTMLDivElement>;
  
  currentVideo: any = null;
  userInteracted = false;
  selectedPlayer: 'native' | 'plyr' = 'native';
  plyrInstance: any = null;
  plyrInitialized = false;
  currentTime = 0;
  plyrScriptLoaded = false;
  
  // Play/Pause durumu
  isPaused = true;
  
  // Video URL
  videoUrl: string = '';
  
  // State
  isLoading = false;
  isSeeking = false;
  lastSetTime = 0;
  
  // Debug - sadece development'da aktif
  debugMessages: string[] = [];
  private readonly isDev = !window.location.href.includes('production');

  constructor(
    private videoService: VideoService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.log('Video Player Component Initialized');
    
    this.videoService.currentVideo$.subscribe(video => {
      this.handleNewVideo(video);
    });
  }

  ngAfterViewInit(): void {
    this.checkPlyrScript();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private handleNewVideo(video: any): void {
    this.log(`New video received: ${video ? video.id : 'null'}`);
    
    // Temizlik
    this.cleanup();
    
    if (!video) {
      this.currentVideo = null;
      this.videoUrl = '';
      this.cdr.detectChanges();
      return;
    }
    
    this.currentVideo = video;
    this.userInteracted = false;
    this.currentTime = 0;
    this.isPaused = true;
    
    const timestamp = new Date().getTime();
    this.videoUrl = `http://localhost:8000/uploads/${video.filename}?t=${timestamp}`;
    
    this.log(`Video URL: ${this.videoUrl}`);
    
    setTimeout(() => this.initializePlayer(), 100);
  }

  private initializePlayer(): void {
    if (!this.currentVideo) return;
    
    if (this.selectedPlayer === 'native') {
      this.setupNativePlayer();
    } else if (this.selectedPlayer === 'plyr') {
      if (this.plyrScriptLoaded) {
        this.initializePlyr();
      } else {
        this.loadPlyrScript();
      }
    }
  }

  private setupNativePlayer(): void {
    if (!this.videoPlayer?.nativeElement) {
      this.log('Native video element not available yet');
      setTimeout(() => this.setupNativePlayer(), 100);
      return;
    }
    
    const video = this.videoPlayer.nativeElement;
    
    // Event listener'ları ekle
    video.addEventListener('loadedmetadata', this.onMetadataLoaded.bind(this));
    video.addEventListener('timeupdate', this.onTimeUpdate.bind(this));
    video.addEventListener('seeking', this.onSeeking.bind(this));
    video.addEventListener('seeked', this.onSeeked.bind(this));
    video.addEventListener('error', this.onVideoError.bind(this));
    video.addEventListener('canplay', this.onCanPlay.bind(this));
    video.addEventListener('play', this.onPlay.bind(this));
    video.addEventListener('pause', this.onPause.bind(this));
    
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';
    video.playsInline = true;
    video.src = this.videoUrl;
    video.load();
    
    this.log('Native player setup complete');
  }

  private onMetadataLoaded(): void {
    this.log(`Video metadata loaded. Duration: ${this.videoPlayer?.nativeElement.duration}`);
    this.cdr.detectChanges();
  }

  private onTimeUpdate(): void {
    if (this.videoPlayer?.nativeElement) {
      this.currentTime = this.videoPlayer.nativeElement.currentTime;
      this.cdr.markForCheck();
    }
  }

  private onSeeking(): void {
    this.isSeeking = true;
    this.log(`Seeking started`);
  }

  private onSeeked(): void {
    this.isSeeking = false;
    this.log(`Seeking completed`);
  }

  private onVideoError(event: any): void {
    const video = this.videoPlayer?.nativeElement;
    if (video) {
      this.log(`Video error: ${video.error?.message || 'Unknown error'}`);
      if (this.isDev) {
        console.error('Video error details:', video.error);
      }
    }
  }

  private onCanPlay(): void {
    this.log('Video can play');
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private onPlay(): void {
    this.isPaused = false;
    this.userInteracted = true;
    this.log('Video playing');
    this.cdr.markForCheck();
  }

  private onPause(): void {
    this.isPaused = true;
    this.log('Video paused');
    this.cdr.markForCheck();
  }

  private checkPlyrScript(): void {
    if (typeof (window as any).Plyr !== 'undefined') {
      this.plyrScriptLoaded = true;
      this.log('Plyr already loaded');
    }
  }

  private loadPlyrScript(): void {
    if (this.plyrScriptLoaded) return;
    
    if (document.querySelector('script[src*="plyr.io"]')) {
      this.log('Plyr script already loading');
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.plyr.io/3.7.8/plyr.js';
    script.async = true;
    
    script.onload = () => {
      this.plyrScriptLoaded = true;
      this.log('Plyr script loaded successfully');
      
      if (this.selectedPlayer === 'plyr' && this.currentVideo) {
        this.initializePlyr();
      }
      this.cdr.detectChanges();
    };
    
    script.onerror = () => {
      this.log('Failed to load Plyr script');
      this.selectedPlayer = 'native';
      this.cdr.detectChanges();
    };
    
    document.head.appendChild(script);
  }

  private initializePlyr(): void {
    if (!this.plyrScriptLoaded || !this.plyrPlayer?.nativeElement || !this.currentVideo) {
      return;
    }
    
    try {
      const Plyr = (window as any).Plyr;
      this.log('Initializing Plyr player...');
      
      const container = this.plyrPlayer.nativeElement;
      container.innerHTML = '';
      
      const videoElement = document.createElement('video');
      videoElement.setAttribute('playsinline', '');
      videoElement.setAttribute('controls', '');
      videoElement.setAttribute('crossorigin', 'anonymous');
      videoElement.setAttribute('preload', 'metadata');
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'contain';
      videoElement.style.backgroundColor = '#000';
      
      const source = document.createElement('source');
      source.src = this.videoUrl;
      source.type = 'video/mp4';
      
      videoElement.appendChild(source);
      container.appendChild(videoElement);
      
      const plyrOptions = {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'duration',
          'mute',
          'volume',
          'settings',
          'fullscreen'
        ],
        settings: ['speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        ratio: '16:9',
        fullscreen: { enabled: true, fallback: true, iosNative: true },
        keyboard: { focused: true, global: false },
        tooltips: { controls: true },
        hideControls: false,
        resetOnEnd: false,
        disableContextMenu: false,
        loadSprite: true,
        iconPrefix: 'plyr',
        iconUrl: 'https://cdn.plyr.io/3.7.8/plyr.svg',
        blankVideo: 'https://cdn.plyr.io/static/blank.mp4',
        autoplay: false,
        clickToPlay: true,
        seekTime: 10,
        volume: 0.85,
        muted: false,
        storage: { enabled: true, key: 'plyr' }
      };
      
      this.plyrInstance = new Plyr(videoElement, plyrOptions);
      
      this.checkPlyrStyles();
      
      this.plyrInstance.on('ready', () => {
        this.log('✅ Plyr player READY!');
        this.plyrInitialized = true;
        container.classList.add('plyr--video', 'plyr--html5');
        this.cdr.detectChanges();
      });
      
      this.plyrInstance.on('timeupdate', () => {
        if (this.plyrInstance) {
          this.currentTime = this.plyrInstance.currentTime;
          this.cdr.markForCheck();
        }
      });
      
      this.plyrInstance.on('play', () => {
        this.isPaused = false;
        this.userInteracted = true;
        this.log('Plyr: Video playing');
        this.cdr.markForCheck();
      });
      
      this.plyrInstance.on('pause', () => {
        this.isPaused = true;
        this.log('Plyr: Video paused');
        this.cdr.markForCheck();
      });
      
      this.plyrInstance.on('error', (event: any) => {
        this.log(`Plyr error: ${event.detail.plyr.error || 'Unknown error'}`);
        this.cdr.detectChanges();
      });
      
      this.plyrInstance.on('enterfullscreen', () => {
        this.log('Entered fullscreen mode');
      });
      
      this.plyrInstance.on('exitfullscreen', () => {
        this.log('Exited fullscreen mode');
      });
      
      this.log('Plyr instance created');
      
    } catch (error: any) {
      this.log(`ERROR initializing Plyr: ${error.message}`);
      if (this.isDev) {
        console.error('Plyr error:', error);
      }
      this.selectedPlayer = 'native';
      this.setupNativePlayer();
      this.cdr.detectChanges();
    }
  }

  private checkPlyrStyles(): void {
    if (!document.querySelector('link[href*="plyr.css"]')) {
      this.log('Plyr CSS not found, loading...');
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
      link.onload = () => {
        this.log('Plyr CSS loaded');
      };
      link.onerror = () => {
        this.log('Failed to load Plyr CSS');
      };
      
      document.head.appendChild(link);
    }
  }

  private cleanup(): void {
    if (this.videoPlayer?.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      video.pause();
      video.src = '';
      video.load();
      
      video.removeEventListener('loadedmetadata', this.onMetadataLoaded.bind(this));
      video.removeEventListener('timeupdate', this.onTimeUpdate.bind(this));
      video.removeEventListener('seeking', this.onSeeking.bind(this));
      video.removeEventListener('seeked', this.onSeeked.bind(this));
      video.removeEventListener('error', this.onVideoError.bind(this));
      video.removeEventListener('canplay', this.onCanPlay.bind(this));
      video.removeEventListener('play', this.onPlay.bind(this));
      video.removeEventListener('pause', this.onPause.bind(this));
    }
    
    if (this.plyrInstance) {
      try {
        if (this.plyrPlayer?.nativeElement) {
          this.plyrPlayer.nativeElement.innerHTML = '';
          this.plyrPlayer.nativeElement.classList.remove('plyr--video', 'plyr--html5');
        }
        this.plyrInstance.destroy();
        this.log('Plyr instance destroyed');
      } catch (e: any) {
        this.log(`Error destroying Plyr: ${e.message}`);
      }
      this.plyrInstance = null;
      this.plyrInitialized = false;
    }
    
    this.isPaused = true;
  }

  selectPlayer(playerType: 'native' | 'plyr'): void {
    if (this.selectedPlayer === playerType) return;
    
    this.log(`Switching to ${playerType} player`);
    this.selectedPlayer = playerType;
    
    this.cleanup();
    
    if (this.currentVideo) {
      setTimeout(() => this.initializePlayer(), 100);
    }
    
    this.cdr.detectChanges();
  }

  onVideoClick(): void {
    this.userInteracted = true;
    this.log('User interaction registered (click)');
  }

  onVideoPlay(): void {
    // artık onPlay() tarafından handle ediliyor
  }

  togglePlay(): void {
    if (this.selectedPlayer === 'native' && this.videoPlayer?.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      if (video.paused) {
        video.play().catch(e => this.log(`Play failed: ${e.message}`));
      } else {
        video.pause();
      }
    } else if (this.selectedPlayer === 'plyr' && this.plyrInstance) {
      if (this.plyrInstance.playing) {
        this.plyrInstance.pause();
      } else {
        this.plyrInstance.play().catch((e: any) => {
          this.log(`Plyr play failed: ${e.message}`);
        });
      }
    }
  }

  setCurrentTime(seconds: number): void {
    if (!this.currentVideo) return;
    
    const duration = this.currentVideo.duration || 0;
    if (seconds > duration) seconds = duration;
    if (seconds < 0) seconds = 0;
    
    this.log(`Setting time to ${seconds}s`);
    this.lastSetTime = seconds;
    
    if (this.selectedPlayer === 'native') {
      this.setNativePlayerTime(seconds);
    } else if (this.selectedPlayer === 'plyr') {
      this.setPlyrPlayerTime(seconds);
    }
  }

  private setNativePlayerTime(seconds: number): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) {
      this.log('Native video element not available');
      return;
    }
    
    try {
      if (video.readyState >= 2) {
        video.currentTime = seconds;
        
        if (this.userInteracted) {
          video.play().catch(error => {
            this.log(`Auto-play prevented: ${error.message}`);
          });
        }
        
        this.currentTime = seconds;
        this.log(`Native time set to ${seconds}s`);
      } else {
        this.log(`Video not ready (readyState: ${video.readyState}), waiting...`);
        setTimeout(() => this.setNativePlayerTime(seconds), 100);
      }
    } catch (error: any) {
      this.log(`Error setting native player time: ${error.message}`);
    }
  }

  private setPlyrPlayerTime(seconds: number): void {
    if (!this.plyrInstance) {
      this.log('Plyr instance not available');
      return;
    }
    
    try {
      this.plyrInstance.currentTime = seconds;
      this.currentTime = seconds;
      
      if (this.userInteracted) {
        this.plyrInstance.play().catch((error: any) => {
          this.log(`Plyr play failed: ${error.message}`);
        });
      }
      
      this.log(`Plyr time set to ${seconds}s`);
    } catch (error: any) {
      this.log(`Error setting Plyr time: ${error.message}`);
    }
  }

  skipBackward(seconds: number): void {
    if (this.selectedPlayer === 'native' && this.videoPlayer?.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      const newTime = Math.max(0, video.currentTime - seconds);
      this.setCurrentTime(newTime);
    } else if (this.selectedPlayer === 'plyr' && this.plyrInstance) {
      const newTime = Math.max(0, this.plyrInstance.currentTime - seconds);
      this.setCurrentTime(newTime);
    }
  }

  skipForward(seconds: number): void {
    if (this.selectedPlayer === 'native' && this.videoPlayer?.nativeElement) {
      const video = this.videoPlayer.nativeElement;
      const duration = video.duration || this.currentVideo?.duration || 0;
      const newTime = Math.min(duration, video.currentTime + seconds);
      this.setCurrentTime(newTime);
    } else if (this.selectedPlayer === 'plyr' && this.plyrInstance) {
      const duration = this.plyrInstance.duration || this.currentVideo?.duration || 0;
      const newTime = Math.min(duration, this.plyrInstance.currentTime + seconds);
      this.setCurrentTime(newTime);
    }
  }

  goToMiddle(): void {
    if (this.currentVideo?.duration) {
      const middle = this.currentVideo.duration / 2;
      this.setCurrentTime(middle);
    }
  }

  // Debug - sadece development'da
  private log(message: string): void {
    if (this.isDev) {
      const timestamp = new Date().toLocaleTimeString();
      const fullMessage = `${timestamp}: ${message}`;
      
      console.log('VideoPlayer:', message);
      
      this.debugMessages.push(fullMessage);
      if (this.debugMessages.length > 15) {
        this.debugMessages.shift();
      }
    }
  }

  clearDebugMessages(): void {
    if (this.isDev) {
      this.debugMessages = [];
      this.cdr.detectChanges();
    }
  }

  // Getters
  get isPlayerReady(): boolean {
    if (this.selectedPlayer === 'native') {
      return !!(this.videoPlayer?.nativeElement && this.videoPlayer.nativeElement.readyState >= 2);
    } else {
      return this.plyrInitialized;
    }
  }

  get videoSrc(): string {
    return this.videoUrl;
  }

  get safeVideoSrc(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl);
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