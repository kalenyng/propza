import { Injectable, signal } from '@angular/core';

/**
 * Lets deep-linked pages (e.g. property detail) set the green mobile header title,
 * which is otherwise driven by static route `data.mobileShellTitle`.
 */
@Injectable({ providedIn: 'root' })
export class MobileShellTitleService {
  readonly mobileTitleOverride = signal<string | null>(null);

  setMobileTitleOverride(title: string | null): void {
    const t = (title || '').trim();
    this.mobileTitleOverride.set(t.length ? t : null);
  }

  clearMobileTitleOverride(): void {
    this.mobileTitleOverride.set(null);
  }
}
