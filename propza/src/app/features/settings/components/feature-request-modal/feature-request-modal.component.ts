import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-feature-request-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feature-request-modal.component.html',
  styleUrl: './feature-request-modal.component.scss'
})
export class FeatureRequestModalComponent {
  @Input() userEmail: string = '';

  featureTitle = '';
  featureDescription = '';
  submitting = false;

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslationService
  ) {}

  close(): void {
    this.activeModal.close();
  }

  async submitRequest(): Promise<void> {
    if (!this.featureTitle.trim() || !this.featureDescription.trim()) return;
    
    this.submitting = true;
    
    try {
      // Create feature request
      const request = `Feature Request: ${this.featureTitle.trim()}\n\n`;
      const description = `Description:\n${this.featureDescription.trim()}\n\n`;
      const userInfo = `---\nUser: ${this.userEmail}\nDate: ${new Date().toLocaleString()}\nApp Version: 1.0.0`;
      
      const subject = 'Feature Request - Propza App';
      const body = `${request}${description}${userInfo}`;
      
      // Open email client
      window.location.href = `mailto:kalenyoung03@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      this.activeModal.close();
    } finally {
      this.submitting = false;
    }
  }
}
