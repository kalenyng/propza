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
  
  // Signal to indicate if this is iOS
  isIOS = signal<boolean>(false);

  constructor() {
    console.log('🚀 PWA INSTALL SERVICE CONSTRUCTOR CALLED - CODE IS LOADING!');
    console.log('Current URL:', window.location.href);
    console.log('User Agent:', window.navigator.userAgent);
    
    try {
      this.detectIOS();
      this.initializePromptListener();
    } catch (error) {
      console.error('❌ Error in PWA service initialization:', error);
    }
  }

  private detectIOS(): void {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = (window.navigator as any).standalone === true || 
                        window.matchMedia('(display-mode: standalone)').matches;
    const isDismissed = this.isDismissed();
    
    console.log('[PWA Install] Detection details:', {
      userAgent: userAgent,
      isIOSDevice: isIOSDevice,
      isStandalone: isStandalone,
      isDismissed: isDismissed,
      navigatorStandalone: (window.navigator as any).standalone,
      displayMode: window.matchMedia('(display-mode: standalone)').matches
    });
    
    // Show iOS prompt if on iOS device and NOT already installed
    if (isIOSDevice && !isStandalone && !isDismissed) {
      this.isIOS.set(true);
      console.log('[PWA Install] ✅ iOS prompt ENABLED');
    } else {
      console.log('[PWA Install] ❌ iOS prompt NOT enabled because:', {
        notIOS: !isIOSDevice,
        alreadyInstalled: isStandalone,
        wasDismissed: isDismissed
      });
    }
  }

  private initializePromptListener(): void {
    console.log('[PWA Install] Service initialized');
    
    // Check if already dismissed in this session
    if (this.isDismissed()) {
      console.log('[PWA Install] Already dismissed in this session');
      return;
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      console.log('[PWA Install] beforeinstallprompt event fired');
      
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      
      // Update the signal to show the install button
      this.canInstall.set(true);
      console.log('[PWA Install] Install button should now be visible');
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('[PWA Install] App successfully installed');
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

