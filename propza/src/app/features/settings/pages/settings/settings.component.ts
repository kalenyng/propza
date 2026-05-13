import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { SettingsMobileComponent } from '../settings-mobile/settings-mobile-main.component';
import { SettingsDesktopComponent } from '../settings-desktop/settings-desktop.component';

const SETTINGS_DESKTOP_MQ = '(min-width: 1024px)';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SettingsMobileComponent, SettingsDesktopComponent],
  template: `
    @if (useDesktopLayout()) {
      <app-settings-desktop />
    } @else {
      <app-settings-mobile />
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
      }
    `
  ]
})
export class SettingsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly mediaQuery = window.matchMedia(SETTINGS_DESKTOP_MQ);

  /** Desktop and mobile are separate component trees; only one mounts at a time. */
  readonly useDesktopLayout = signal(this.mediaQuery.matches);

  ngOnInit(): void {
    fromEvent<MediaQueryListEvent>(this.mediaQuery, 'change')
      .pipe(map((e) => e.matches), takeUntilDestroyed(this.destroyRef))
      .subscribe((matches) => this.useDesktopLayout.set(matches));
  }
}
