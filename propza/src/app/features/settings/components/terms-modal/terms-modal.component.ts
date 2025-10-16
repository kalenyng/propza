import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-terms-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-modal.component.html',
  styleUrl: './terms-modal.component.scss'
})
export class TermsModalComponent {
  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslationService
  ) {}

  close(): void {
    this.activeModal.close();
  }
}
