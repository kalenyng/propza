import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BetaAccessService } from '../../core/services/beta-access.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  constructor(
    private router: Router,
    private auth: AuthService,
    private betaAccess: BetaAccessService
  ) {}

  async ngOnInit(): Promise<void> {
    // Wait for auth session to initialize
    await this.auth.waitForSession();
    
    // If user is logged in and has beta access, redirect to home
    if (this.auth.user() && this.betaAccess.hasAccess()) {
      console.log('[LANDING] User is logged in with beta access - redirecting to /home');
      this.router.navigateByUrl('/home');
    }
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

