import { Component } from '@angular/core';
import { trigger, transition, style, animate, group, query } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderBannerComponent } from '../../../../shared/components/header-banner/header-banner.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { TranslationService, Language } from '../../../../core/services/translation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { ThemeService, Theme } from '../../../../core/services/theme.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditNameModalComponent } from '../../components/edit-name-modal/edit-name-modal.component';
import { QuickStartModalComponent } from '../../components/quick-start-modal/quick-start-modal.component';
import { BugReportModalComponent } from '../../components/bug-report-modal/bug-report-modal.component';
import { FeatureRequestModalComponent } from '../../components/feature-request-modal/feature-request-modal.component';
import { PasswordResetModalComponent } from '../../components/password-reset-modal/password-reset-modal.component';
import { PrivacyPolicyModalComponent } from '../../components/privacy-policy-modal/privacy-policy-modal.component';
import { TermsModalComponent } from '../../components/terms-modal/terms-modal.component';
import { FeedbackModalComponent } from '../../components/feedback-modal/feedback-modal.component';
import { DeleteAccountModalComponent } from '../../components/delete-account-modal/delete-account-modal.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderBannerComponent, BottomNavComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  animations: [
    trigger('sectionTransition', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(6px)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('120ms ease-in', style({ opacity: 0, transform: 'translateY(-6px)' }))
      ])
    ]),
    trigger('slideAnimation', [
      transition('main => account, main => preferences, main => data, main => support', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({ position: 'absolute', top: 0, left: 0, width: '100%' }),
        ]),
        query(':enter', [style({ transform: 'translateX(100%)', opacity: 0 })]),
        group([
          query(':leave', [animate('250ms ease', style({ transform: 'translateX(-30%)', opacity: 0 }))]),
          query(':enter', [animate('300ms ease', style({ transform: 'translateX(0)', opacity: 1 }))]),
        ]),
      ]),
      transition('account => main, preferences => main, data => main, support => main', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({ position: 'absolute', top: 0, left: 0, width: '100%' }),
        ]),
        query(':enter', [style({ transform: 'translateX(-30%)', opacity: 0 })]),
        group([
          query(':leave', [animate('250ms ease', style({ transform: 'translateX(100%)', opacity: 0 }))]),
          query(':enter', [animate('300ms ease', style({ transform: 'translateX(0)', opacity: 1 }))]),
        ]),
      ]),
    ])
  ]
})
export class SettingsComponent {
  constructor(
    public translate: TranslationService,
    private auth: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private supabase: SupabaseService,
    private modal: NgbModal
  ) {}

  // Profile form model
  fullName = '';
  email = '';
  message = '';
  error = '';

  // Theme
  selectedTheme: Theme = 'light';

  // Account/Profile state
  userEmail = '';
  firstName = '';
  lastName = '';
  createdAt = '';
  displayName = '';
  avatarUrl = '';
  greetingName = '';

  // Preferences
  notificationsEnabled = false;

  // Loading states
  signingOut = false;
  deletingAccount = false;
  exportingData = false;

  // UI section state
  section: 'account' | 'preferences' | 'data' | 'support' = 'account';
  activePage: 'main' | 'account' | 'preferences' | 'data' | 'support' = 'main';

  changeLanguage(lang: Language): void {
    this.translate.setLanguage(lang);
  }

  async signOut(): Promise<void> {
    this.signingOut = true;
    try {
      await this.auth.signOut();
      this.router.navigateByUrl('/login');
    } finally {
      this.signingOut = false;
    }
  }

  ngOnInit(): void {
    this.selectedTheme = this.themeService.theme();
    const saved = localStorage.getItem('settings_section');
    if (saved === 'account' || saved === 'preferences' || saved === 'data' || saved === 'support') {
      this.section = saved;
    }
    const savedPage = localStorage.getItem('settings_active_page');
    if (savedPage === 'main' || savedPage === 'account' || savedPage === 'preferences' || savedPage === 'data' || savedPage === 'support') {
      this.activePage = savedPage;
    }
    void this.loadProfile();
  }

  onThemeChange(next: Theme): void {
    this.selectedTheme = next;
    void this.themeService.setTheme(next);
  }

  setSection(name: 'account' | 'preferences' | 'data' | 'support'): void {
    this.section = name;
    localStorage.setItem('settings_section', name);
  }

  goTo(page: 'main' | 'account' | 'preferences' | 'data' | 'support'): void {
    this.activePage = page;
    localStorage.setItem('settings_active_page', page);
  }

  async loadProfile(): Promise<void> {
    await this.auth.waitForSession();
    const user = this.auth.user();
    if (!user) return;
    this.userEmail = user.email || '';
    this.createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString() : '';

    const { data } = await this.supabase.supabase
      .from('profiles')
      .select('first_name, last_name, notifications_enabled')
      .eq('id', user.id)
      .single();
    this.firstName = data?.first_name || '';
    this.lastName = data?.last_name || '';
    this.notificationsEnabled = !!data?.notifications_enabled;

    const meta = (user as any).user_metadata || {};
    const fullMetaName: string = (meta['full_name'] || '').toString().trim();
    const combined = `${this.firstName} ${this.lastName}`.trim();
    const otherFallback = (meta['name'] || meta['first_name'] || '').toString().trim();
    this.displayName = fullMetaName || combined || otherFallback || '';

    // Avatar URL and greeting name
    this.avatarUrl = (meta['avatar_url'] || meta['picture'] || '/propza-logo.png') as string;
    this.greetingName = (this.displayName || '').split(' ')[0] || '';
  }

  async openEditName(): Promise<void> {
    const user = this.auth.user();
    const meta = (user as any)?.user_metadata || {};
    const currentFull = (meta['full_name'] || this.displayName || '').toString();

    const ref = this.modal.open(EditNameModalComponent, { centered: true });
    (ref.componentInstance as EditNameModalComponent).setInitial(currentFull);
    try {
      const result: any = await ref.result; // { full_name }
      const full = (result?.full_name || '').trim();
      if (!full) return;
      // Update auth metadata full_name
      const err = await this.auth.updateProfile({ fullName: full });
      if (err) { this.error = err.message; return; }
      // Backfill profiles first/last by splitting
      const [first, ...rest] = full.split(/\s+/);
      const last = rest.join(' ').trim();
      const userId = user?.id;
      if (userId) {
        await this.supabase.supabase.from('profiles').update({ first_name: first || null, last_name: last || null }).eq('id', userId);
      }
      this.displayName = full;
      this.firstName = first || '';
      this.lastName = last || '';
      this.greetingName = (full || '').split(' ')[0] || '';
      this.message = 'Name updated';
    } catch {}
  }

  private async updateName(first: string, last: string): Promise<void> {
    const user = this.auth.user();
    if (!user) return;
    await this.supabase.supabase
      .from('profiles')
      .update({ first_name: first, last_name: last })
      .eq('id', user.id);
    this.firstName = first;
    this.lastName = last;
    this.displayName = `${first} ${last}`.trim();
  }

  async toggleNotifications(): Promise<void> {
    const user = this.auth.user();
    if (!user) return;
    this.notificationsEnabled = !this.notificationsEnabled;
    await this.supabase.supabase
      .from('profiles')
      .update({ notifications_enabled: this.notificationsEnabled })
      .eq('id', user.id);
  }

  async exportMyData(): Promise<void> {
    this.exportingData = true;

    try {
      await this.auth.waitForSession();
      const user = this.auth.user();
      if (!user) return;

      const [properties, payments, tenancies] = await Promise.all([
        this.supabase.supabase.from('properties').select('*').eq('owner_id', user.id),
        this.supabase.supabase.from('payments').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
        this.supabase.supabase.from('tenancies').select('*').in('property_id', (
          await this.supabase.supabase.from('properties').select('id').eq('owner_id', user.id)
        ).data?.map((p: any) => p.id) || []),
      ]);

      const blob = new Blob([JSON.stringify({ properties: properties.data, payments: payments.data, tenancies: tenancies.data }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'propza-export.json'; a.click();
      URL.revokeObjectURL(url);
    } finally {
      this.exportingData = false;
    }
  }

  contactSupport(): void {
    const user = this.auth.user();
    const userInfo = user ? `User ID: ${user.id}\nEmail: ${this.userEmail}` : 'User: Not logged in';
    const subject = 'Support Request - Propza App';
    const body = `Support Request:\n\nPlease describe your issue or question below:\n\n\n\n---\n${userInfo}\nDate: ${new Date().toLocaleString()}\nApp Version: 1.0.0`;
    window.location.href = `mailto:kalenyoung03@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  sendFeedback(): void {
    const modalRef = this.modal.open(FeedbackModalComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'modal-zoom'
    });
    modalRef.componentInstance.userEmail = this.userEmail;
  }

  openQuickStartGuide(): void {
    const modalRef = this.modal.open(QuickStartModalComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'modal-zoom'
    });
  }

  openBugReport(): void {
    const modalRef = this.modal.open(BugReportModalComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'modal-zoom'
    });
    modalRef.componentInstance.userEmail = this.userEmail;
  }

  openFeatureRequest(): void {
    const modalRef = this.modal.open(FeatureRequestModalComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'modal-zoom'
    });
    modalRef.componentInstance.userEmail = this.userEmail;
  }

  openPasswordReset(): void {
    const modalRef = this.modal.open(PasswordResetModalComponent, {
      size: 'md',
      centered: true,
      windowClass: 'modal-zoom'
    });
  }

  openPrivacyPolicy(): void {
    const modalRef = this.modal.open(PrivacyPolicyModalComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'modal-zoom'
    });
  }

  openTermsAndConditions(): void {
    const modalRef = this.modal.open(TermsModalComponent, {
      size: 'lg',
      centered: true,
      windowClass: 'modal-zoom'
    });
  }

  async saveProfile(): Promise<void> {
    this.message = '';
    this.error = '';
    const firstName = this.fullName?.trim()?.split(' ')[0] || undefined;
    const err = await this.auth.updateProfile({ firstName, fullName: this.fullName, email: this.email || undefined });
    if (err) {
      this.error = err.message;
    } else {
      this.message = 'Saved';
    }
  }

  async sendResetLink(): Promise<void> {
    this.message = '';
    this.error = '';
    const mail = this.email?.trim();
    if (!mail) {
      this.error = 'Enter your email first';
      return;
    }
    const err = await this.auth.sendPasswordReset(mail);
    if (err) this.error = err.message; else this.message = 'Password reset link sent';
  }

  async confirmDelete(): Promise<void> {
    const modalRef = this.modal.open(DeleteAccountModalComponent, {
      size: 'md',
      centered: true,
      windowClass: 'modal-zoom'
    });
    
    // Pass the actual delete logic to the modal
    modalRef.componentInstance.onConfirm = async () => {
      this.deletingAccount = true;

      try {
        const err = await this.auth.deleteAccount();
        if (err) {
          this.error = err;
          return;
        }
        await this.auth.signOut();
        this.router.navigateByUrl('/register');
      } finally {
        this.deletingAccount = false;
      }
    };
  }
}
