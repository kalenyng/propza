import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../../core/services/translation.service';
import { BaseMailtoReportComponent } from '../../../../shared/components/mailto-report/base-mailto-report';

@Component({
  selector: 'app-bug-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bug-report-modal.component.html',
  styleUrl: './bug-report-modal.component.scss'
})
export class BugReportModalComponent extends BaseMailtoReportComponent {
  bugDescription = '';

  constructor(activeModal: NgbActiveModal, translate: TranslationService) {
    super(activeModal, translate);
  }

  async submitReport(): Promise<void> {
    if (!this.bugDescription.trim()) return;
    const report = `Bug Report:\n${this.bugDescription.trim()}\n\n`;
    await this.sendMailto('Bug Report - Propza App', `${report}${this.buildUserInfo()}`);
  }
}
