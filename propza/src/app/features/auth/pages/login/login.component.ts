import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../../core/services/auth.service';
import { PasswordResetModalComponent } from '../../../settings/components/password-reset-modal/password-reset-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(
    private auth: AuthService, 
    private router: Router,
    private modal: NgbModal
  ) {}

  async submit(): Promise<void> {
    this.loading = true;
    this.errorMsg = '';
    const err = await this.auth.signInWithPassword(this.email, this.password);
    this.loading = false;

    if (err) {
      this.errorMsg = err.message;
    } else {
      this.router.navigateByUrl('/home');
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

  openForgotPassword(): void {
    this.modal.open(PasswordResetModalComponent, {
      size: 'md',
      centered: true,
      windowClass: 'modal-zoom'
    });
  }
}
