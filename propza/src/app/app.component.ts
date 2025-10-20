import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { PwaInstallService } from './core/services/pwa-install.service';
import { PwaInstallPromptComponent } from './shared/components/pwa-install-prompt/pwa-install-prompt.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PwaInstallPromptComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Propza';
  constructor(
    private theme: ThemeService,
    private pwaInstall: PwaInstallService
  ) {
    console.log('📱 APP COMPONENT CONSTRUCTOR - Initializing PWA service');
    void this.theme.loadTheme();
    // PWA service is injected to initialize early and capture beforeinstallprompt event
    console.log('PWA Service isIOS:', this.pwaInstall.isIOS());
    console.log('PWA Service canInstall:', this.pwaInstall.canInstall());
  }
}
