import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService, Language } from '../../../../core/services/translation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService, Theme } from '../../../../core/services/theme.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { EditNameModalComponent } from '../../components/edit-name-modal/edit-name-modal.component';
import { QuickStartModalComponent } from '../../components/quick-start-modal/quick-start-modal.component';
import { BugReportModalComponent } from '../../components/bug-report-modal/bug-report-modal.component';
import { FeatureRequestModalComponent } from '../../components/feature-request-modal/feature-request-modal.component';
import { PrivacyPolicyModalComponent } from '../../components/privacy-policy-modal/privacy-policy-modal.component';
import { TermsModalComponent } from '../../components/terms-modal/terms-modal.component';
import { ContactSupportModalComponent } from '../../components/contact-support-modal/contact-support-modal.component';
import { DeleteAccountModalComponent } from '../../components/delete-account-modal/delete-account-modal.component';
import { ToastService } from '../../../../shared/components/toast/toast.service';

export type SettingsDesktopSection = 'account' | 'property' | 'appearance' | 'notifications' | 'data' | 'support';

const DESKTOP_SECTION_KEY = 'settings_desktop_section';

@Component({
  selector: 'app-settings-desktop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-desktop.component.html',
  styleUrl: './settings-desktop.component.scss'
})
export class SettingsDesktopComponent implements OnInit {
  constructor(
    public translate: TranslationService,
    private auth: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private supabase: SupabaseService,
    private modal: NgbModal,
    private toast: ToastService
  ) {}

  readonly nav: { id: SettingsDesktopSection; labelKey: string }[] = [
    { id: 'account', labelKey: 'settings.sectionAccount' },
    { id: 'property', labelKey: 'settings.sectionProperty' },
    { id: 'appearance', labelKey: 'settings.sectionAppearance' },
    { id: 'notifications', labelKey: 'settings.notifications' },
    { id: 'data', labelKey: 'settings.data' },
    { id: 'support', labelKey: 'settings.support' }
  ];

  section: SettingsDesktopSection = 'account';

  error = '';
  message = '';
  selectedTheme: Theme = 'light';

  userEmail = '';
  firstName = '';
  lastName = '';
  createdAt = '';
  displayName = '';
  avatarUrl = '';

  languageCode: Language = 'en';
  compactUi = false;
  reduceMotionUi = false;
  notificationsEnabled = false;

  passwordResetEmail = '';
  passwordResetSubmitting = false;
  passwordResetSuccess = false;
  passwordResetError = '';

  signingOut = false;
  deletingAccount = false;
  exportingData = false;

  private readonly settingsFullscreenModal: NgbModalOptions = {
    fullscreen: true,
    scrollable: true,
    centered: false,
    windowClass: 'propza-settings-modal',
    modalDialogClass: 'propza-settings-modal-dialog'
  };

  private readonly supportModal: NgbModalOptions = {
    size: 'lg',
    centered: true,
    scrollable: true,
    keyboard: true,
    windowClass: 'propza-support-modal'
  };

  ngOnInit(): void {
    this.selectedTheme = this.themeService.theme();
    this.languageCode = this.translate.currentLanguage();
    this.compactUi = localStorage.getItem('propza_settings_compact') === '1';
    this.reduceMotionUi = localStorage.getItem('propza_settings_reduce_motion') === '1';
    document.documentElement.classList.toggle('propza-compact-ui', this.compactUi);
    document.documentElement.classList.toggle('propza-reduce-motion', this.reduceMotionUi);

    const saved = localStorage.getItem(DESKTOP_SECTION_KEY);
    if (
      saved === 'account' ||
      saved === 'property' ||
      saved === 'appearance' ||
      saved === 'notifications' ||
      saved === 'data' ||
      saved === 'support'
    ) {
      this.section = saved;
    }

    void this.loadProfile();
  }

  selectSection(next: SettingsDesktopSection): void {
    if (this.section === next) {
      return;
    }
    this.section = next;
    try {
      localStorage.setItem(DESKTOP_SECTION_KEY, next);
    } catch {
      /* ignore */
    }
    if (next === 'account') {
      this.preparePasswordResetPage();
    }
  }

  changeLanguage(lang: Language): void {
    this.languageCode = lang;
    this.translate.setLanguage(lang);
  }

  private readonly languageCycle: Language[] = ['en', 'af', 'zu', 'xh'];

  cycleLanguage(): void {
    const cur = this.translate.currentLanguage();
    const idx = this.languageCycle.indexOf(cur);
    const next = this.languageCycle[(idx + 1) % this.languageCycle.length];
    this.changeLanguage(next);
  }

  setTheme(theme: Theme): void {
    if (this.selectedTheme === theme) {
      return;
    }
    this.selectedTheme = theme;
    void this.themeService.setTheme(theme);
  }

  languageDisplayLabel(): string {
    const lang = this.translate.currentLanguage();
    const labels: Record<Language, string> = {
      en: 'English',
      af: 'Afrikaans',
      zu: 'isiZulu',
      xh: 'isiXhosa'
    };
    return labels[lang];
  }

  profileInitials(): string {
    const n = (this.displayName || `${this.firstName} ${this.lastName}`).trim();
    if (!n) return 'P';
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
    }
    return n.slice(0, 2).toUpperCase();
  }

  showAvatarImage(): boolean {
    const u = (this.avatarUrl || '').trim();
    return u.startsWith('http://') || u.startsWith('https://');
  }

  featureComingSoon(): void {
    this.toast.show(this.translate.t('settings.comingSoon'), 'info');
  }

  toggleCompactUi(): void {
    this.compactUi = !this.compactUi;
    localStorage.setItem('propza_settings_compact', this.compactUi ? '1' : '0');
    document.documentElement.classList.toggle('propza-compact-ui', this.compactUi);
  }

  toggleReduceMotionUi(): void {
    this.reduceMotionUi = !this.reduceMotionUi;
    localStorage.setItem('propza_settings_reduce_motion', this.reduceMotionUi ? '1' : '0');
    document.documentElement.classList.toggle('propza-reduce-motion', this.reduceMotionUi);
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

  private preparePasswordResetPage(): void {
    this.passwordResetEmail = (this.userEmail || '').trim();
    this.passwordResetSubmitting = false;
    this.passwordResetSuccess = false;
    this.passwordResetError = '';
  }

  async submitPasswordReset(): Promise<void> {
    const mail = this.passwordResetEmail.trim();
    if (!mail) {
      this.passwordResetError = this.translate.t('passwordReset.emailRequired');
      return;
    }
    this.passwordResetSubmitting = true;
    this.passwordResetError = '';
    try {
      const err = await this.auth.sendPasswordReset(mail);
      if (err) {
        this.passwordResetError = err.message;
      } else {
        this.passwordResetSuccess = true;
        this.passwordResetError = '';
      }
    } catch {
      this.passwordResetError = 'An unexpected error occurred. Please try again.';
    } finally {
      this.passwordResetSubmitting = false;
    }
  }

  async loadProfile(): Promise<void> {
    await this.auth.waitForSession();
    const user = this.auth.user();
    if (!user) return;
    this.userEmail = user.email || '';
    this.createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString() : '';

    const { data } = await this.supabase.supabase
      .from('profiles')
      .select('full_name, notifications_enabled')
      .eq('id', user.id)
      .single();
    this.firstName = data?.full_name?.split(' ')[0] || '';
    this.lastName = data?.full_name?.split(' ').slice(1).join(' ') || '';
    this.notificationsEnabled = !!data?.notifications_enabled;

    const meta = (user as any).user_metadata || {};
    const fullMetaName: string = (meta['full_name'] || '').toString().trim();
    const combined = `${this.firstName} ${this.lastName}`.trim();
    const otherFallback = (meta['name'] || meta['first_name'] || '').toString().trim();
    this.displayName = fullMetaName || combined || otherFallback || '';
    this.avatarUrl = (meta['avatar_url'] || meta['picture'] || '/propza-logo.png') as string;
    this.preparePasswordResetPage();
  }

  currentSectionLabelKey(): string {
    return this.nav.find((n) => n.id === this.section)?.labelKey ?? 'settings.title';
  }

  async openEditName(): Promise<void> {
    const user = this.auth.user();
    const meta = user?.user_metadata || {};
    const currentFull = String(meta['full_name'] || this.displayName || '');

    const ref = this.modal.open(EditNameModalComponent, { ...this.settingsFullscreenModal });
    (ref.componentInstance as EditNameModalComponent).setInitial(currentFull);

    try {
      const result = (await ref.result) as { full_name?: string };
      const full = (result?.full_name || '').trim();
      if (!full) return;

      const err = await this.auth.updateProfile({ fullName: full });
      if (err) {
        this.error = err.message;
        return;
      }

      const userId = user?.id;
      if (userId) {
        await this.supabase.supabase.from('profiles').update({ full_name: full }).eq('id', userId);
      }

      this.displayName = full;
      this.firstName = full.split(' ')[0] || '';
      this.lastName = full.split(' ').slice(1).join(' ') || '';
      this.message = 'Name updated';
    } catch {
      /* dismissed */
    }
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
        this.supabase.supabase.from('tenancies').select('*').in(
          'property_id',
          (await this.supabase.supabase.from('properties').select('id').eq('owner_id', user.id)).data?.map((p) => p.id as string) || []
        )
      ]);

      const blob = new Blob([JSON.stringify({ properties: properties.data, payments: payments.data, tenancies: tenancies.data }, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'propza-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      this.exportingData = false;
    }
  }

  contactSupport(): void {
    const user = this.auth.user();
    const ref = this.modal.open(ContactSupportModalComponent, { ...this.supportModal });
    const inst = ref.componentInstance as ContactSupportModalComponent;
    inst.userEmail = this.userEmail;
    inst.userId = user?.id || '';
  }

  openQuickStartGuide(): void {
    this.modal.open(QuickStartModalComponent, { ...this.supportModal });
  }

  openBugReport(): void {
    const modalRef = this.modal.open(BugReportModalComponent, { ...this.supportModal });
    modalRef.componentInstance.userEmail = this.userEmail;
  }

  openFeatureRequest(): void {
    const modalRef = this.modal.open(FeatureRequestModalComponent, { ...this.supportModal });
    modalRef.componentInstance.userEmail = this.userEmail;
  }

  openPrivacyPolicy(): void {
    this.modal.open(PrivacyPolicyModalComponent, { ...this.supportModal });
  }

  openTermsAndConditions(): void {
    this.modal.open(TermsModalComponent, { ...this.supportModal });
  }

  async confirmDelete(): Promise<void> {
    const modalRef = this.modal.open(DeleteAccountModalComponent, { ...this.settingsFullscreenModal });
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
