import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../../core/services/translation.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-password-reset-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-reset-modal.component.html',
  styleUrl: './password-reset-modal.component.scss'
})
export class PasswordResetModalComponent {
  resetEmail = '';
  submitting = false;
  success = false;
  error = '';

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslationService,
    private auth: AuthService
  ) {}

  close(): void {
    this.activeModal.close();
  }

  async submitReset(): Promise<void> {
    if (!this.resetEmail.trim()) return;
    
    this.submitting = true;
    this.error = '';
    
    try {
      const error = await this.auth.sendPasswordReset(this.resetEmail.trim());
      if (error) {
        this.error = error.message;
      } else {
        this.success = true;
        // Close modal after a short delay
        setTimeout(() => {
          this.activeModal.close();
        }, 2000);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      this.error = 'An unexpected error occurred. Please try again.';
    } finally {
      this.submitting = false;
    }
  }
}
