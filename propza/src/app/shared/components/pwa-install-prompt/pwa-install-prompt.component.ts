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
  isLoggedIn = signal<boolean>(false);

  constructor(
    public pwaInstall: PwaInstallService,
    private auth: AuthService
  ) {
    console.log('🎯 PWA INSTALL PROMPT COMPONENT CONSTRUCTOR CALLED!');
    
    // Watch for auth state changes
    effect(() => {
      const user = this.auth.user();
      const loggedIn = !!user;
      this.isLoggedIn.set(loggedIn);
      console.log('[PWA Install Component] Auth state changed - Logged in:', loggedIn);
    });
  }

  ngOnInit(): void {
    console.log('[PWA Install Component] Component initialized');
    console.log('[PWA Install Component] Initial state:', {
      isIOS: this.pwaInstall.isIOS(),
      canInstall: this.pwaInstall.canInstall(),
      isLoggedIn: this.isLoggedIn()
    });
    
    // Show install prompt after 4 second delay - ONLY if logged in
    setTimeout(() => {
      console.log('[PWA Install Component] After 4s delay - checking state:', {
        isIOS: this.pwaInstall.isIOS(),
        canInstall: this.pwaInstall.canInstall(),
        isLoggedIn: this.isLoggedIn(),
        showIOSModal: this.showIOSModal(),
        showInstallButton: this.showInstallButton()
      });
      
      // Only show if user is logged in
      if (!this.isLoggedIn()) {
        console.log('[PWA Install Component] ❌ User not logged in - not showing prompt');
        return;
      }
      
      if (this.pwaInstall.isIOS()) {
        // Show iOS instructions modal
        console.log('[PWA Install Component] ✅ Showing iOS instructions modal');
        this.showIOSModal.set(true);
        console.log('[PWA Install Component] Modal signal set to:', this.showIOSModal());
      } else if (this.pwaInstall.canInstall()) {
        // Show regular install button for Android/Desktop
        console.log('[PWA Install Component] ✅ Showing install button');
        this.showInstallButton.set(true);
      } else {
        console.log('[PWA Install Component] ❌ Install not available - nothing will show');
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

