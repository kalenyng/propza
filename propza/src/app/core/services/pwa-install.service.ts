import { Injectable, signal } from '@angular/core';
import { ErrorService } from './error.service';

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
  
  canInstall = signal<boolean>(false);
  isIOS = signal<boolean>(false);

  constructor(private errorService: ErrorService) {
    try {
      this.detectIOS();
      this.initializePromptListener();
    } catch (error) {
      this.errorService.handleError(error, 'PWA Install Service Initialization');
    }
  }

  private detectIOS(): void {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = (window.navigator as any).standalone === true || 
                        window.matchMedia('(display-mode: standalone)').matches;
    const isDismissed = this.isDismissed();
    
    if (isIOSDevice && !isStandalone && !isDismissed) {
      this.isIOS.set(true);
    }
  }

  private initializePromptListener(): void {
    if (this.isDismissed()) {
      return;
    }

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.canInstall.set(true);
    });

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

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      this.deferredPrompt = null;
      this.canInstall.set(false);
      
      if (choiceResult.outcome === 'dismissed') {
        this.markDismissed();
      }
    } catch (error) {
      this.errorService.handleError(error, 'PWA Install Prompt');
    }
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

