import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../../core/services/translation.service';
import { BaseMailtoReportComponent } from '../../../../shared/components/mailto-report/base-mailto-report';

@Component({
  selector: 'app-feature-request-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feature-request-modal.component.html',
  styleUrl: './feature-request-modal.component.scss'
})
export class FeatureRequestModalComponent extends BaseMailtoReportComponent {
  featureTitle = '';
  featureDescription = '';

  constructor(activeModal: NgbActiveModal, translate: TranslationService) {
    super(activeModal, translate);
  }

  async submitRequest(): Promise<void> {
    if (!this.featureTitle.trim() || !this.featureDescription.trim()) return;
    const request = `Feature Request: ${this.featureTitle.trim()}\n\n`;
    const description = `Description:\n${this.featureDescription.trim()}\n\n`;
    await this.sendMailto('Feature Request - Propza App', `${request}${description}${this.buildUserInfo()}`);
  }
}
