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

  ngOnInit(): void {
    console.log('Preloader initialized, showing GIF');
    
    // Switch to PNG after GIF completes (3200ms - exactly 3.2 seconds)
    setTimeout(() => {
      console.log('Switching to PNG (final frame) with breathing animation');
      this.showGif = false;
      this.showPng = true;
    }, 3200);
  }
}
