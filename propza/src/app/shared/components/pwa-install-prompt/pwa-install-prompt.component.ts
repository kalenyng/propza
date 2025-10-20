import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaInstallService } from '../../../core/services/pwa-install.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-pwa-install-prompt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pwa-install-prompt.component.html',
  styleUrl: './pwa-install-prompt.component.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(-20px)' }))
      ])
    ])
  ]
})
export class PwaInstallPromptComponent implements OnInit {
  showInstallButton = signal<boolean>(false);

  constructor(public pwaInstall: PwaInstallService) {}

  ngOnInit(): void {
    console.log('[PWA Install Component] Component initialized');
    
    // Show install button after 4 second delay if PWA can be installed
    setTimeout(() => {
      console.log('[PWA Install Component] Checking if install is available:', this.pwaInstall.canInstall());
      if (this.pwaInstall.canInstall()) {
        this.showInstallButton.set(true);
        console.log('[PWA Install Component] Showing install button');
      } else {
        console.log('[PWA Install Component] Install not available - button will not show');
      }
    }, 4000); // 4 seconds delay
  }

  async onInstallClick(): Promise<void> {
    await this.pwaInstall.promptInstall();
    this.showInstallButton.set(false);
  }

  onDismissInstall(): void {
    this.pwaInstall.dismissPrompt();
    this.showInstallButton.set(false);
  }
}

