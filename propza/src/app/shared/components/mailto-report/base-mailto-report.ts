import { Input, Directive } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../core/services/translation.service';

const SUPPORT_EMAIL = 'kalenyoung03@gmail.com';

/**
 * Shared base for the three "send via email" report modals
 * (feedback, bug report, feature request). Extracts the duplicated
 * `submitting` flag, `close()`, and mailto dispatch pattern.
 *
 * Subclasses implement their own templates and call `sendMailto` with
 * the composed subject and body strings.
 */
@Directive()
export abstract class BaseMailtoReportComponent {
  @Input() userEmail = '';

  submitting = false;

  constructor(
    public activeModal: NgbActiveModal,
    public translate: TranslationService
  ) {}

  close(): void {
    this.activeModal.close();
  }

  protected async sendMailto(subject: string, body: string): Promise<void> {
    this.submitting = true;
    try {
      window.location.href =
        `mailto:${SUPPORT_EMAIL}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;
      this.activeModal.close();
    } finally {
      this.submitting = false;
    }
  }

  protected buildUserInfo(): string {
    return `---\nUser: ${this.userEmail}\nDate: ${new Date().toLocaleString()}\nApp Version: 1.0.0`;
  }
}
