import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';

const SIDEBAR_COLLAPSED_KEY = 'propza.sidebarCollapsed';

function readSidebarCollapsedPreference(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

@Component({
  selector: 'app-authenticated-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './authenticated-shell.component.html',
  styleUrl: './authenticated-shell.component.scss'
})
export class AuthenticatedShellComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly mobileShellTitle = signal('Propza');
  /** Route-driven: full-bleed content (e.g. settings) without fixed green hero + spacer. */
  readonly hideMobileHero = signal(false);
  readonly sidebarCollapsed = signal(readSidebarCollapsedPreference());
  /** List + detail share different URL prefixes (`/properties` vs `/property/:id`). */
  readonly propertiesNavActive = signal(false);
  readonly tenantsNavActive = signal(false);

  userDisplayName = '';
  /** Profile / metadata name only (no `'Profile'` placeholder) — used for sidebar initial. */
  nameForInitials = '';
  userEmail = '';
  avatarUrl = '';

  /** First letter of the user's name, else first from email local part, else `P`. */
  get avatarInitialLetter(): string {
    const fromName = this.firstSignificantChar(this.nameForInitials, false);
    if (fromName) {
      return fromName;
    }
    const local = (this.userEmail.split('@')[0] || '').trim();
    const fromEmail = this.firstSignificantChar(local, true);
    if (fromEmail) {
      return fromEmail;
    }
    return 'P';
  }

  private firstSignificantChar(s: string, allowDigit: boolean): string {
    const t = s.trim();
    if (!t) {
      return '';
    }
    const re = allowDigit ? /[\p{L}\p{N}]/u : /\p{L}/u;
    const m = t.match(re);
    return m ? m[0].toLocaleUpperCase('en-ZA') : '';
  }

  constructor(
    private auth: AuthService,
    private supabase: SupabaseService
  ) {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.syncMobileShellFromRoute());
  }

  async ngOnInit(): Promise<void> {
    this.syncMobileShellFromRoute();

    await this.auth.waitForSession();
    const user = this.auth.user();
    if (!user) {
      return;
    }

    this.userEmail = user.email || '';

    const metadata = user.user_metadata || {};
    const metadataName =
      String(metadata['full_name'] || metadata['name'] || metadata['first_name'] || '').trim();
    this.avatarUrl = String(metadata['avatar_url'] || metadata['picture'] || '').trim();

    try {
      const { data } = await this.supabase.supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      const profileName = String(data?.full_name || '').trim();
      this.nameForInitials = profileName || metadataName;
      this.userDisplayName = this.nameForInitials || 'Profile';
    } catch {
      this.nameForInitials = metadataName;
      this.userDisplayName = this.nameForInitials || 'Profile';
    }
  }

  openSettings(): void {
    void this.router.navigateByUrl('/settings');
  }

  toggleSidebarCollapsed(): void {
    this.sidebarCollapsed.update((v) => !v);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, this.sidebarCollapsed() ? '1' : '0');
      }
    } catch {
      /* ignore quota / privacy mode */
    }
  }

  private syncMobileShellFromRoute(): void {
    this.mobileShellTitle.set(this.resolveMobileShellTitle());
    this.hideMobileHero.set(this.resolveHideMobileHero());
    this.syncPrimaryNavActiveFromUrl();
  }

  private syncPrimaryNavActiveFromUrl(): void {
    const path = this.router.url.split(/[?#]/)[0] || '';
    this.propertiesNavActive.set(
      path === '/properties' || path === '/home' || path.startsWith('/property/')
    );
    this.tenantsNavActive.set(path === '/tenants' || path.startsWith('/tenant/'));
  }

  private resolveMobileShellTitle(): string {
    let node: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let title = 'Propza';
    while (node) {
      const fromData = node.data['mobileShellTitle'];
      if (typeof fromData === 'string' && fromData.trim()) {
        title = fromData.trim();
      }
      node = node.firstChild;
    }
    return title;
  }

  private resolveHideMobileHero(): boolean {
    let node: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    while (node) {
      if (node.data['hideMobileHero'] === true) {
        return true;
      }
      node = node.firstChild;
    }
    return false;
  }
}
