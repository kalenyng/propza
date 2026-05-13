import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './core/services/theme.service';
import { PreloaderComponent } from './shared/components/preloader/preloader.component';
import { ConfirmationModalComponent } from './shared/components/confirmation-modal/confirmation-modal.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';
import { BetaAccessService } from './core/services/beta-access.service';
import { LoggerService } from './core/services/logger.service';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, PreloaderComponent, ConfirmationModalComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Propza';
  showPreloader = true;
  isNavigating = false;

  private destroy$ = new Subject<void>();

  constructor(
    private theme: ThemeService,
    private auth: AuthService,
    private betaAccess: BetaAccessService,
    private router: Router,
    private logger: LoggerService
  ) {
    void this.theme.loadTheme();
    this.setupRouteTransitions();
  }

  private setupRouteTransitions(): void {
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this.isNavigating = true;
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.isNavigating = false;
        }
      });
  }

  async ngOnInit(): Promise<void> {
    const displayTime = 4000;

    try {
      await this.auth.waitForSession();

      const currentUrl = this.router.url;

      if (currentUrl === '/' || currentUrl === '') {
        if (this.auth.user() && !this.betaAccess.isBetaAccessRequired()) {
          await this.router.navigateByUrl('/dashboard');
        } else if (this.auth.user() && this.betaAccess.hasAccess()) {
          await this.router.navigateByUrl('/dashboard');
        }
      }
    } catch (error) {
      this.logger.error('Error during app initialization:', error);
    } finally {
      setTimeout(() => {
        this.showPreloader = false;
      }, displayTime);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
