import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  loading = false;
  message = '';
  errorMsg = '';
  form;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (!field || !field.touched || !field.errors) {
      return null;
    }

    const errors = field.errors;
    if (errors['required']) {
      return 'This field is required';
    }
    if (errors['email']) {
      return 'Invalid email format';
    }
    if (errors['minlength']) {
      const minLength = errors['minlength'].requiredLength;
      return `Must be at least ${minLength} characters`;
    }
    return null;
  }

  async register(): Promise<void> {
    // Mark all fields as touched to show validation errors
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.message = '';

    const { fullName, email, password } = this.form.value;

    // Extract first name from full name (everything before first space)
    const firstName = fullName!.trim().split(' ')[0];

    const { error } = await this.auth.signUp(email!, password!, firstName, fullName!);

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
