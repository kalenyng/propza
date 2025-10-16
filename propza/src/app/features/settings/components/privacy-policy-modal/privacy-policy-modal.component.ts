import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-privacy-policy-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-policy-modal.component.html',
  styleUrl: './privacy-policy-modal.component.scss'
})
export class PrivacyPolicyModalComponent {
  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslationService
  ) {}

  close(): void {
    this.activeModal.close();
  }
}
