import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './core/services/theme.service';
import { PreloaderComponent } from './shared/components/preloader/preloader.component';
import { AuthService } from './core/services/auth.service';
import { BetaAccessService } from './core/services/beta-access.service';
import { Router } from '@angular/router';

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
    private router: Router
  ) {
    void this.theme.loadTheme();
  }

  async ngOnInit(): Promise<void> {
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
    } catch (error) {
      console.error('Error during app initialization:', error);
    } finally {
      // Hide preloader after a minimum delay to prevent flash
      setTimeout(() => {
        this.showPreloader = false;
      }, 500);
    }
  }
}
