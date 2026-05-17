import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../../core/services/translation.service';
import { BaseMailtoReportComponent } from '../../../../shared/components/mailto-report/base-mailto-report';

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback-modal.component.html',
  styleUrl: './feedback-modal.component.scss'
})
export class FeedbackModalComponent extends BaseMailtoReportComponent {
  feedbackText = '';
  feedbackType = 'general';

  constructor(activeModal: NgbActiveModal, translate: TranslationService) {
    super(activeModal, translate);
  }

  async submitFeedback(): Promise<void> {
    if (!this.feedbackText.trim()) return;
    const feedback = `Feedback Type: ${this.feedbackType}\n\n`;
    const message = `Message:\n${this.feedbackText.trim()}\n\n`;
    await this.sendMailto('User Feedback - Propza App', `${feedback}${message}${this.buildUserInfo()}`);
  }
}
