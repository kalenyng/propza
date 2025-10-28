import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async goHome(): Promise<void> {
    // Wait for session to be initialized
    await this.authService.waitForSession();
    
    // Check if user is authenticated by checking the user signal
    const isAuthenticated = !!this.authService.user();
    
    if (isAuthenticated) {
      // Logged in users go to dashboard
      this.router.navigate(['/home']);
    } else {
      // Not logged in users go to landing page
      this.router.navigate(['/']);
    }
  }
}

