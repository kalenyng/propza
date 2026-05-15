import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import lottie, { type AnimationItem } from 'lottie-web';

/**
 * Lottie SVG renderer applies rectangular clip-paths to comps (root + nested precomps),
 * which trims Gaussian-blur glow. Removing those clip-path attrs keeps the halo intact.
 */
function stripSvgCompClipping(container: HTMLElement): void {
  const svg = container.querySelector('svg');
  if (!svg) {
    return;
  }
  svg.querySelectorAll<SVGElement>('[clip-path]').forEach((el) =>
    el.removeAttribute('clip-path')
  );
}

@Component({
  selector: 'app-preloader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preloader.component.html',
  styleUrl: './preloader.component.scss'
})
export class PreloaderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lottieContainer', { static: true }) lottieContainer!: ElementRef<HTMLDivElement>;
  animationComplete = false;
  startTime = Date.now();

  private lottieAnimation: AnimationItem | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('Preloader initialized');
  }

  ngAfterViewInit(): void {
    const anim = lottie.loadAnimation({
      container: this.lottieContainer.nativeElement,
      path: '/Propza.json',
      renderer: 'svg',
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet'
      },
      loop: false, // Play once and freeze on last frame
      autoplay: true
    });
    this.lottieAnimation = anim;

    anim.addEventListener('DOMLoaded', () => {
      stripSvgCompClipping(this.lottieContainer.nativeElement);
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

  ngOnDestroy(): void {
    this.lottieAnimation?.destroy();
    this.lottieAnimation = null;
  }
}
