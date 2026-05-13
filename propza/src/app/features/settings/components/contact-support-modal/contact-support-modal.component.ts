import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../../core/services/translation.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { PROPZA_SUPPORT_EMAIL } from '../../support-email';

@Component({
  selector: 'app-contact-support-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-support-modal.component.html',
  styleUrl: './contact-support-modal.component.scss'
})
export class ContactSupportModalComponent {
  @Input() userEmail = '';
  @Input() userId = '';

  readonly supportEmail = PROPZA_SUPPORT_EMAIL;

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslationService,
    private toast: ToastService
  ) {}

  get mailtoHref(): string {
    const userInfo = this.userId
      ? `User ID: ${this.userId}\nEmail: ${this.userEmail || '—'}`
      : 'User: Not logged in';
    const subject = 'Support Request - Propza App';
    const body = `Support Request:\n\nPlease describe your issue or question below:\n\n\n\n---\n${userInfo}\nDate: ${new Date().toLocaleString()}\nApp Version: 1.0.0`;
    return `mailto:${PROPZA_SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  close(): void {
    this.activeModal.close();
  }

  async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.supportEmail);
      this.toast.show(this.translate.t('support.emailCopied'), 'success');
    } catch {
      this.toast.show(this.translate.t('support.emailCopyFailed'), 'error');
    }
  }
}
