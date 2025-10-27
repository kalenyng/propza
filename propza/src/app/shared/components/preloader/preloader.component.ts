import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import lottie from 'lottie-web';

@Component({
  selector: 'app-preloader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preloader.component.html',
  styleUrl: './preloader.component.scss'
})
export class PreloaderComponent implements OnInit, AfterViewInit {
  @ViewChild('lottieContainer', { static: true }) lottieContainer!: ElementRef<HTMLDivElement>;
  animationComplete = false;
  startTime = Date.now();
  
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('Preloader initialized');
  }

  ngAfterViewInit(): void {
    const anim = lottie.loadAnimation({
      container: this.lottieContainer.nativeElement,
      path: '/propza-logo.json',
      renderer: 'svg',
      loop: false, // Play once and freeze on last frame
      autoplay: true
    });

    anim.addEventListener('complete', () => {
      console.log('✅ Lottie animation completed, frozen on final frame');
      this.animationComplete = true;
      
      // Force Angular change detection to apply breathing class
      this.cdr.detectChanges();
      console.log('Applied breathing animation');
    });
    
    console.log('📦 Lottie animation loaded');
  }
}
