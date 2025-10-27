import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BetaAccessService } from '../../core/services/beta-access.service';
import { AuthService } from '../../core/services/auth.service';
import { PwaInstallService } from '../../core/services/pwa-install.service';
import { IosInstallModalComponent } from '../../shared/components/ios-install-modal/ios-install-modal.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, IosInstallModalComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  showIOSModal = false;

  constructor(
    private router: Router,
    public betaAccess: BetaAccessService,
    public auth: AuthService,
    public pwaInstall: PwaInstallService
  ) {}

  goToRegister(): void {
    this.router.navigateByUrl('/register');
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  goToBetaAccess(): void {
    this.router.navigateByUrl('/beta-access');
  }

  joinBeta(): void {
    // Open email client to request beta access
    window.location.href = 'mailto:kalenyoung03@gmail.com?subject=Propza Beta Access Request&body=Hi, I would like to request access to the Propza beta program.';
  }

  scrollToNextSection(): void {
    const nextSection = document.querySelector('.how-it-works-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Check if user should see install prompt
  shouldShowInstallPrompt(): boolean {
    // Only show button on mobile screen sizes and when PWA is supported
    const isMobileScreen = window.innerWidth <= 768;
    return isMobileScreen;
  }

  // Handle install button click
  async onInstallClick(): Promise<void> {
    if (this.pwaInstall.isIOS()) {
      // For iOS, show the modal with instructions
      this.showIOSModal = true;
    } else if (this.pwaInstall.canInstall()) {
      // For Android/Desktop, use the native browser prompt
      await this.pwaInstall.promptInstall();
    }
    // If neither, button won't appear or nothing happens
  }

  // Handle iOS modal dismissal
  onDismissIOSModal(): void {
    this.showIOSModal = false;
    this.pwaInstall.dismissPrompt();
  }

  // Handle iOS modal completion
  onIOSGotIt(): void {
    this.showIOSModal = false;
    this.pwaInstall.dismissPrompt();
  }
}

