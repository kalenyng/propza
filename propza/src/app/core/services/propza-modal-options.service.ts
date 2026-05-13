import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

/**
 * Responsive NgbModal presets aligned with the UX plan:
 * mobile (<1024px): fullscreen sheet-style chrome (reuses settings modal global styles)
 * desktop: constrained centered dialogs
 */
@Injectable({ providedIn: 'root' })
export class PropzaModalOptionsService {
  private readonly platformId = inject(PLATFORM_ID);

  /** Matches authenticated shell mobile breakpoint. */
  isMobileShell(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    try {
      return window.matchMedia('(max-width: 1023px)').matches;
    } catch {
      return false;
    }
  }

  /**
   * Add property / add tenant and similar multi-field creates.
   */
  createEntityFlow(): NgbModalOptions {
    if (this.isMobileShell()) {
      return {
        fullscreen: true,
        scrollable: true,
        centered: false,
        backdrop: 'static',
        keyboard: true,
        windowClass: 'propza-settings-modal',
        modalDialogClass: 'propza-settings-modal-dialog'
      };
    }
    return {
      size: 'lg',
      centered: true,
      backdrop: 'static',
      scrollable: true,
      keyboard: true
    };
  }

  /**
   * Short auth-adjacent flows (e.g. password reset from login).
   */
  authAuxiliaryModal(): NgbModalOptions {
    if (this.isMobileShell()) {
      return {
        fullscreen: true,
        scrollable: true,
        centered: false,
        backdrop: true,
        keyboard: true,
        windowClass: 'propza-settings-modal modal-zoom',
        modalDialogClass: 'propza-settings-modal-dialog'
      };
    }
    return {
      size: 'md',
      centered: true,
      backdrop: true,
      keyboard: true,
      windowClass: 'modal-zoom'
    };
  }
}
