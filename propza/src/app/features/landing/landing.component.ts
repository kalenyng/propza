import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BetaAccessService } from '../../core/services/beta-access.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  constructor(
    private router: Router,
    public betaAccess: BetaAccessService
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
}

