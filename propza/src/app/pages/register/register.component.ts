import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
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

    const { error } = await this.auth.supabase.supabase.auth.signUp({
      email: this.email,
      password: this.password
    });

    this.loading = false;

    if (error) {
      this.errorMsg = error.message;
    } else {
      this.message = 'Account created! You can now log in.';
      setTimeout(() => this.router.navigateByUrl('/login'), 1500);
    }
  }
}
