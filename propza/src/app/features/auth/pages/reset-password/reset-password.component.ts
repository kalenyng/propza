import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { SupabaseService } from '../../../../core/services/supabase.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (!password || !confirm) return null;
  return password.value === confirm.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  form;
  loading = false;
  success = false;
  errorMsg = '';
  validSession = false;
  checkingSession = true;

  private authSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private supabase: SupabaseService,
    private router: Router
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    // Supabase fires PASSWORD_RECOVERY event when user arrives via reset link.
    // We listen here so the form only shows when the recovery session is active.
    const { data } = this.supabase.supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        this.validSession = true;
        this.checkingSession = false;
      }
    });

    // Also handle the case where the page loads after the event has already fired
    // (e.g. hard refresh). Give Supabase a moment to process the hash.
    setTimeout(async () => {
      if (!this.validSession) {
        const { data: sessionData } = await this.supabase.supabase.auth.getSession();
        if (sessionData.session) {
          this.validSession = true;
        }
        this.checkingSession = false;
      }
    }, 800);

    this.authSub = new Subscription(() => data.subscription.unsubscribe());
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (!field || !field.touched || !field.errors) return null;
    if (field.errors['required']) return 'This field is required';
    if (field.errors['minlength']) return `Must be at least ${field.errors['minlength'].requiredLength} characters`;
    return null;
  }

  get passwordMismatch(): boolean {
    return !!(this.form.errors?.['passwordMismatch'] &&
      this.form.get('confirmPassword')?.touched);
  }

  async submit(): Promise<void> {
    Object.keys(this.form.controls).forEach(k => this.form.get(k)?.markAsTouched());
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMsg = '';

    const error = await this.auth.updatePassword(this.form.value.password!);

    this.loading = false;

    if (error) {
      this.errorMsg = error.message;
    } else {
      this.success = true;
      setTimeout(() => this.router.navigateByUrl('/dashboard'), 2000);
    }
  }
}
