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
  showIOSModal = signal<boolean>(false);

  constructor(public pwaInstall: PwaInstallService) {}

  ngOnInit(): void {
    console.log('[PWA Install Component] Component initialized');
    
    // Show install prompt after 4 second delay
    setTimeout(() => {
      if (this.pwaInstall.isIOS()) {
        // Show iOS instructions modal
        console.log('[PWA Install Component] Showing iOS instructions modal');
        this.showIOSModal.set(true);
      } else if (this.pwaInstall.canInstall()) {
        // Show regular install button for Android/Desktop
        console.log('[PWA Install Component] Showing install button');
        this.showInstallButton.set(true);
      } else {
        console.log('[PWA Install Component] Install not available - nothing will show');
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

  onDismissIOSModal(): void {
    this.pwaInstall.dismissPrompt();
    this.showIOSModal.set(false);
  }

  onIOSGotIt(): void {
    this.pwaInstall.dismissPrompt();
    this.showIOSModal.set(false);
  }
}

