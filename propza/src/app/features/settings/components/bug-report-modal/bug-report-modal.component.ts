import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-bug-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bug-report-modal.component.html',
  styleUrl: './bug-report-modal.component.scss'
})
export class BugReportModalComponent {
  @Input() userEmail: string = '';

  bugDescription = '';
  submitting = false;

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslationService
  ) {}

  close(): void {
    this.activeModal.close();
  }

  async submitReport(): Promise<void> {
    if (!this.bugDescription.trim()) return;
    
    this.submitting = true;
    
    try {
      // Create bug report
      const report = `Bug Report:\n${this.bugDescription.trim()}\n\n`;
      const userInfo = `---\nUser: ${this.userEmail}\nDate: ${new Date().toLocaleString()}\nApp Version: 1.0.0`;
      
      const subject = 'Bug Report - Propza App';
      const body = `${report}${userInfo}`;
      
      // Open email client
      window.location.href = `mailto:kalenyoung03@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      this.activeModal.close();
    } finally {
      this.submitting = false;
    }
  }
}
