import { Injectable, signal } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Injectable({
  providedIn: 'root'
})
export class PwaInstallService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private readonly DISMISS_KEY = 'pwa-install-dismissed';
  
  // Signal to indicate if install is available
  canInstall = signal<boolean>(false);

  constructor() {
    this.initializePromptListener();
  }

  private initializePromptListener(): void {
    // Check if already dismissed in this session
    if (this.isDismissed()) {
      return;
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      
      // Update the signal to show the install button
      this.canInstall.set(true);
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstall.set(false);
      this.markDismissed();
    });
  }

  async promptInstall(): Promise<void> {
    if (!this.deferredPrompt) {
      return;
    }

    // Show the install prompt
    await this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await this.deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt for next time
    this.deferredPrompt = null;
    this.canInstall.set(false);
    this.markDismissed();
  }

  dismissPrompt(): void {
    this.canInstall.set(false);
    this.markDismissed();
  }

  private isDismissed(): boolean {
    return sessionStorage.getItem(this.DISMISS_KEY) === 'true';
  }

  private markDismissed(): void {
    sessionStorage.setItem(this.DISMISS_KEY, 'true');
  }
}

