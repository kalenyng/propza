import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  loading = false;
  message = '';
  errorMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  async register(): Promise<void> {
    this.loading = true;
    this.errorMsg = '';
    this.message = '';

    // Extract first name from full name (everything before first space)
    const firstName = this.fullName.trim().split(' ')[0];

    const { error } = await this.auth.signUp(this.email, this.password, firstName, this.fullName);

    this.loading = false;

    if (error) {
      this.errorMsg = error.message;
    } else {
      this.message = 'Account created! Check your email to confirm.';
      setTimeout(() => this.router.navigateByUrl('/login'), 2000);
    }
  }

  async signInWithGoogle(): Promise<void> {
    this.loading = true;
    this.errorMsg = '';
    
    const error = await this.auth.signInWithGoogle();
    
    if (error) {
      this.errorMsg = error.message;
      this.loading = false;
    }
    // No need to handle success - Supabase will redirect automatically
  }
}
