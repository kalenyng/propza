import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-delete-account-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delete-account-modal.component.html',
  styleUrl: './delete-account-modal.component.scss'
})
export class DeleteAccountModalComponent {
  @Input() onConfirm: () => Promise<void> = async () => {};

  confirmationText = '';
  understandConsequences = false;
  submitting = false;

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslationService
  ) {}

  close(): void {
    this.activeModal.close();
  }

  async confirmDelete(): Promise<void> {
    if (this.confirmationText.toLowerCase() !== 'delete' || !this.understandConsequences) return;
    
    this.submitting = true;
    
    try {
      await this.onConfirm();
      this.activeModal.close();
    } catch (error) {
      console.error('Delete account error:', error);
    } finally {
      this.submitting = false;
    }
  }
}
