import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaInstallService } from '../../../core/services/pwa-install.service';
import { AuthService } from '../../../core/services/auth.service';
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
  private hasTriggeredPrompt = false;

  constructor(
    public pwaInstall: PwaInstallService,
    private auth: AuthService
  ) {
    effect(() => {
      const user = this.auth.user();
      const loggedIn = !!user;
      
      if (loggedIn && !this.hasTriggeredPrompt) {
        this.hasTriggeredPrompt = true;
        setTimeout(() => {
          this.checkAndShowPrompt();
        }, 4000);
      }
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  private checkAndShowPrompt(): void {
    const isLoggedIn = !!this.auth.user();
    
    if (!isLoggedIn) {
      return;
    }
    
    if (this.pwaInstall.isIOS()) {
      this.showIOSModal.set(true);
    } else if (this.pwaInstall.canInstall()) {
      this.showInstallButton.set(true);
    }
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

