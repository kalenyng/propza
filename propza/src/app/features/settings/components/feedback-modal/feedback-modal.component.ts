import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback-modal.component.html',
  styleUrl: './feedback-modal.component.scss'
})
export class FeedbackModalComponent {
  @Input() userEmail: string = '';

  feedbackText = '';
  feedbackType = 'general';
  submitting = false;

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslationService
  ) {}

  close(): void {
    this.activeModal.close();
  }

  async submitFeedback(): Promise<void> {
    if (!this.feedbackText.trim()) return;
    
    this.submitting = true;
    
    try {
      // Create detailed feedback
      const feedback = `Feedback Type: ${this.feedbackType}\n\n`;
      const message = `Message:\n${this.feedbackText.trim()}\n\n`;
      const userInfo = `User: ${this.userEmail}\nDate: ${new Date().toLocaleString()}\nApp Version: 1.0.0`;
      
      const subject = 'User Feedback - Propza App';
      const body = `${feedback}${message}${userInfo}`;
      
      // Open email client
      window.location.href = `mailto:kalenyoung03@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      this.activeModal.close();
    } finally {
      this.submitting = false;
    }
  }
}
