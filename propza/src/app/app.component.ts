import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './core/services/theme.service';
import { PreloaderComponent } from './shared/components/preloader/preloader.component';
import { AuthService } from './core/services/auth.service';
import { BetaAccessService } from './core/services/beta-access.service';
import { Router } from '@angular/router';
import { LoggerService } from './core/services/logger.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, PreloaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Propza';
  showPreloader = true;
  
  constructor(
    private theme: ThemeService,
    private auth: AuthService,
    private betaAccess: BetaAccessService,
    private router: Router,
    private logger: LoggerService
  ) {
    void this.theme.loadTheme();
  }

  async ngOnInit(): Promise<void> {
    const displayTime = 4000; // 20 seconds for testing
    let appReady = false;
    
    try {
      // Wait for authentication to be checked
      await this.auth.waitForSession();
      
      // Check if user should be redirected
      const currentUrl = this.router.url;
      
      // If we're on the root path and user is authenticated, redirect appropriately
      if (currentUrl === '/' || currentUrl === '') {
        if (this.auth.user() && !this.betaAccess.isBetaAccessRequired()) {
          await this.router.navigateByUrl('/home');
        } else if (this.auth.user() && this.betaAccess.hasAccess()) {
          await this.router.navigateByUrl('/home');
        }
      }
      
      appReady = true;
    } catch (error) {
      this.logger.error('Error during app initialization:', error);
      appReady = true; // Still hide preloader even if there's an error
    } finally {
      setTimeout(() => {
        this.showPreloader = false;
      }, displayTime);
    }
  }
}
