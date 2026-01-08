import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})


export class AppComponent { 
  // Drawer'ın başlangıç durumunu kapalı (false) kabul ediyoruz
  isDrawerOpen: boolean = false;

  // Drawer içinden gelen sinyale göre durumu güncelleyen metod
  toggleDrawer(isOpen: boolean) {
    this.isDrawerOpen = isOpen;
  }
}