import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-quick-start-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-start-modal.component.html',
  styleUrl: './quick-start-modal.component.scss'
})
export class QuickStartModalComponent {
  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslationService
  ) {}

  close(): void {
    this.activeModal.close();
  }
}
