import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preloader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preloader.component.html',
  styleUrl: './preloader.component.scss'
})
export class PreloaderComponent implements OnInit {
  showGif = true;
  showPng = false;
  pngPreloaded = false;

  ngOnInit(): void {
    console.log('Preloader initialized, showing GIF');
    
    // Preload the PNG image while GIF is playing
    this.preloadPng();
    
    // Switch to PNG after GIF completes (3200ms - exactly 3.2 seconds)
    setTimeout(() => {
      console.log('Switching to PNG (final frame) with breathing animation');
      this.showGif = false;
      this.showPng = true;
    }, 3200);
  }

  private preloadPng(): void {
    const img = new Image();
    img.onload = () => {
      console.log('PNG preloaded successfully');
      this.pngPreloaded = true;
    };
    img.onerror = () => {
      console.error('Failed to preload PNG');
    };
    img.src = '/final-frame.png';
  }
}
