import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { VideoUploadComponent } from './components/video-upload/video-upload.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { ClipCreatorComponent } from './components/clip-creator/clip-creator.component';

@NgModule({
  declarations: [
    AppComponent,
    VideoUploadComponent,
    VideoPlayerComponent,
    ClipCreatorComponent
    // ClipManagerComponent silindi
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }