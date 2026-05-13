import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService, Language } from '../../../../core/services/translation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService, Theme } from '../../../../core/services/theme.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { EditNameModalComponent } from '../../components/edit-name-modal/edit-name-modal.component';
import { QuickStartModalComponent } from '../../components/quick-start-modal/quick-start-modal.component';
import { BugReportModalComponent } from '../../components/bug-report-modal/bug-report-modal.component';
import { FeatureRequestModalComponent } from '../../components/feature-request-modal/feature-request-modal.component';
import { PrivacyPolicyModalComponent } from '../../components/privacy-policy-modal/privacy-policy-modal.component';
import { TermsModalComponent } from '../../components/terms-modal/terms-modal.component';
import { FeedbackModalComponent } from '../../components/feedback-modal/feedback-modal.component';
import { ContactSupportModalComponent } from '../../components/contact-support-modal/contact-support-modal.component';
import { DeleteAccountModalComponent } from '../../components/delete-account-modal/delete-account-modal.component';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { environment } from '../../../../../environments/environment';

export type SettingsMobilePage = 'main' | 'account' | 'password' | 'preferences' | 'data';

const SETTINGS_SUB_CHROME_CLASS = 'propza-settings-sub';
const SETTINGS_DOC_SCROLL_LOCK_CLASS = 'propza-settings-doc-scroll-lock';
const SETTINGS_MAIN_SCROLL_KEY = 'propza_settings_main_scroll';

/**
 * Settings scroll debug — filter console by `[Propza settings scroll]`.
 * - Development builds: logging on by default. Silence: `localStorage.setItem('propza_settings_scroll_debug','0')`.
 * - Production: `localStorage.setItem('propza_settings_scroll_debug','1')` then reload.
 */
const SETTINGS_SCROLL_DEBUG_LS = 'propza_settings_scroll_debug';

@Component({
  selector: 'app-settings-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-mobile-main.component.html',
  styleUrl: './settings-mobile.component.scss'
})
export class SettingsMobileComponent implements OnInit, OnDestroy {
  constructor(
    public translate: TranslationService,
    private auth: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private supabase: SupabaseService,
    private modal: NgbModal,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => {
      this.logSettingsScroll('afterNextRender:beforeSyncScrollAfterNavigation', {});
      this.syncScrollAfterNavigation();
    });
  }

  fullName = '';
  email = '';
  message = '';
  error = '';

  selectedTheme: Theme = 'light';

  userEmail = '';
  firstName = '';
  lastName = '';
  createdAt = '';
  displayName = '';
  avatarUrl = '';
  greetingName = '';

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

  activePage: SettingsMobilePage = 'main';

  /** CardScroller-style detail panel: enters after double rAF; exits then DOM unmounts after transition. */
  detailEntered = false;
  pendingCloseDetail = false;
  private closeAfterTransition = false;

  private readonly TRANS_MS = 380;
  private readonly TRANS_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

  private readonly sectionScrollTop: Record<SettingsMobilePage, number> = {
    main: 0,
    account: 0,
    password: 0,
    preferences: 0,
    data: 0
  };

  @ViewChild('settingsScrollRoot', { static: false })
  settingsScrollRoot?: ElementRef<HTMLElement>;

  private mainScrollRestoreApplied = false;
  private mainScrollRestoreInFlight = false;

  /** Document scroll lock while a settings subpage is open (mobile window scroll only). */
  private settingsDocScrollLockOn = false;
  private savedWindowScrollYForDocLock: number | null = null;

  private shouldLogSettingsScroll(): boolean {
    try {
      if (typeof localStorage !== 'undefined') {
        const v = localStorage.getItem(SETTINGS_SCROLL_DEBUG_LS);
        if (v === '0') {
          return false;
        }
        if (v === '1') {
          return true;
        }
      }
    } catch {
      /* ignore */
    }
    return !environment.production;
  }

  private logSettingsScroll(event: string, detail: Record<string, unknown> = {}): void {
    if (!this.shouldLogSettingsScroll()) {
      return;
    }
    const vv =
      typeof window !== 'undefined' && window.visualViewport
        ? {
            vvOffsetTop: window.visualViewport.offsetTop,
            vvOffsetLeft: window.visualViewport.offsetLeft,
            vvHeight: window.visualViewport.height,
            vvScale: window.visualViewport.scale
          }
        : null;
    console.log(`[Propza settings scroll] ${event}`, {
      t: Math.round(performance.now()),
      activePage: this.activePage,
      htmlSubChrome: typeof document !== 'undefined' && document.documentElement.classList.contains(SETTINGS_SUB_CHROME_CLASS),
      htmlDocScrollLock:
        typeof document !== 'undefined' &&
        document.documentElement.classList.contains(SETTINGS_DOC_SCROLL_LOCK_CLASS),
      innerH: typeof window !== 'undefined' ? window.innerHeight : null,
      scrollY: typeof window !== 'undefined' ? window.scrollY : null,
      ...vv,
      ...detail
    });
  }

  private snapshotScrollTarget(t: { root: HTMLElement; useWindowScroll: boolean }): Record<string, unknown> {
    const { root, useWindowScroll } = t;
    return {
      useWindowScroll,
      rootTag: root.tagName,
      rootId: root.id || null,
      rootClassPreview:
        typeof root.className === 'string' ? String(root.className).slice(0, 140) : null,
      rootScrollTop: root.scrollTop,
      rootScrollHeight: root.scrollHeight,
      rootClientHeight: root.clientHeight
    };
  }

  private peekDocumentScrollY(t: { root: HTMLElement; useWindowScroll: boolean }): number {
    if (t.useWindowScroll) {
      return (
        window.scrollY ||
        window.pageYOffset ||
        t.root.scrollTop ||
        document.body.scrollTop ||
        0
      );
    }
    return t.root.scrollTop;
  }

  private readonly settingsFullscreenModal: NgbModalOptions = {
    fullscreen: true,
    scrollable: true,
    centered: false,
    windowClass: 'propza-settings-modal',
    modalDialogClass: 'propza-settings-modal-dialog'
  };

  changeLanguage(lang: Language): void {
    this.languageCode = lang;
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
    this.languageCode = this.translate.currentLanguage();
    this.compactUi = localStorage.getItem('propza_settings_compact') === '1';
    this.reduceMotionUi = localStorage.getItem('propza_settings_reduce_motion') === '1';
    document.documentElement.classList.toggle('propza-compact-ui', this.compactUi);
    document.documentElement.classList.toggle('propza-reduce-motion', this.reduceMotionUi);
    let savedPage = localStorage.getItem('settings_active_page');
    if (savedPage === 'support') {
      savedPage = 'main';
      try {
        localStorage.setItem('settings_active_page', 'main');
      } catch {
        /* ignore */
      }
    }
    if (
      savedPage === 'main' ||
      savedPage === 'account' ||
      savedPage === 'password' ||
      savedPage === 'preferences' ||
      savedPage === 'data'
    ) {
      this.activePage = savedPage;
    }
    if (this.activePage === 'main') {
      this.syncSettingsSubChrome();
    } else {
      this.ensureSettingsDocScrollLockActive('ngOnInit:restoredSub');
      this.startDetailOpenAnimation();
    }
    this.updateBodyOverflowForDetail();
    const t0 = this.getSettingsScrollTarget();
    this.logSettingsScroll('ngOnInit:afterRestore', {
      restoredActivePage: this.activePage,
      sectionScrollTopMain: this.sectionScrollTop.main,
      sessionMainScroll: (() => {
        try {
          return sessionStorage.getItem(SETTINGS_MAIN_SCROLL_KEY);
        } catch {
          return null;
        }
      })(),
      reduceMotionUi: this.reduceMotionUi,
      ...this.snapshotScrollTarget(t0),
      peekY: this.peekDocumentScrollY(t0)
    });
    void this.loadProfile();
  }

  ngOnDestroy(): void {
    this.logSettingsScroll('ngOnDestroy', { clearingSubChrome: true });
    this.releaseSettingsDocScrollLockIfActive('ngOnDestroy');
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    document.documentElement.classList.remove(SETTINGS_SUB_CHROME_CLASS);
    try {
      localStorage.setItem('settings_active_page', 'main');
    } catch {
      /* ignore */
    }
  }

  onThemeChange(next: Theme): void {
    this.selectedTheme = next;
    void this.themeService.setTheme(next);
  }

  setTheme(theme: Theme): void {
    if (this.selectedTheme === theme) {
      return;
    }
    this.onThemeChange(theme);
  }

  private readonly languageCycle: Language[] = ['en', 'af', 'zu', 'xh'];

  cycleLanguage(): void {
    const cur = this.translate.currentLanguage();
    const idx = this.languageCycle.indexOf(cur);
    const next = this.languageCycle[(idx + 1) % this.languageCycle.length];
    this.changeLanguage(next);
  }

  goTo(page: SettingsMobilePage): void {
    if (this.activePage === page) {
      return;
    }

    if (page === 'main') {
      this.beginCloseDetail();
      return;
    }

    const prev = this.activePage;
    this.logSettingsScroll('goTo:start', { from: prev, to: page });

    if (prev !== 'main') {
      this.sectionScrollTop[prev] = this.readSettingsScrollY('goTo:subToSub');
      this.activePage = page;
      localStorage.setItem('settings_active_page', page);
      if (page === 'password') {
        this.preparePasswordResetPage();
      }
      this.syncSettingsSubChrome(page);
      this.ensureSettingsDocScrollLockActive('goTo:sub-to-sub');
      this.updateBodyOverflowForDetail();
      this.cdr.detectChanges();
      this.logSettingsScroll('goTo:afterSubToSub', { from: prev, to: page });
      return;
    }

    const y = this.readSettingsScrollY('goTo:beforePageChange');
    this.sectionScrollTop.main = y;
    try {
      sessionStorage.setItem(SETTINGS_MAIN_SCROLL_KEY, String(y));
    } catch {
      /* ignore quota / privacy mode */
    }

    this.logSettingsScroll('goTo:capturedScroll', {
      from: prev,
      to: page,
      capturedY: y,
      sectionScrollTopSnapshot: { ...this.sectionScrollTop }
    });

    this.activePage = page;
    localStorage.setItem('settings_active_page', page);

    if (page === 'password') {
      this.preparePasswordResetPage();
    }

    this.applySettingsDocScrollLockFromMain(y);
    this.pendingCloseDetail = false;
    this.closeAfterTransition = false;
    this.startDetailOpenAnimation();

    this.cdr.detectChanges();
    this.syncScrollAfterGoTo(prev, page);
    this.updateBodyOverflowForDetail();
    this.logSettingsScroll('goTo:afterSyncScrollAfterGoTo', { from: prev, to: page });
  }

  showDetailPanel(): boolean {
    return this.activePage !== 'main' || this.pendingCloseDetail;
  }

  detailBarTitle(): string {
    switch (this.activePage) {
      case 'account':
        return this.translate.t('settings.accountSettings');
      case 'password':
        return this.translate.t('support.passwordReset');
      case 'preferences':
        return this.translate.t('settings.notifications');
      case 'data':
        return this.translate.t('settings.data');
      default:
        return this.translate.t('settings.title');
    }
  }

  get detailPanelTransform(): string {
    if (!this.showDetailPanel()) {
      return 'translateX(100%)';
    }
    if (!this.detailEntered && !this.reduceMotionUi) {
      return 'translateX(100%)';
    }
    return 'translateX(0)';
  }

  get detailPanelTransition(): string {
    return this.reduceMotionUi ? 'none' : `transform ${this.TRANS_MS}ms ${this.TRANS_EASE}`;
  }

  beginCloseDetail(): void {
    if (this.activePage === 'main' && !this.pendingCloseDetail) {
      return;
    }
    if (this.reduceMotionUi) {
      const prev = this.activePage;
      this.finalizeDetailClose(prev);
      return;
    }
    if (this.closeAfterTransition) {
      return;
    }
    this.closeAfterTransition = true;
    this.pendingCloseDetail = true;
    this.detailEntered = false;
    this.updateBodyOverflowForDetail();
    this.cdr.detectChanges();
  }

  private finalizeDetailClose(prev: SettingsMobilePage): void {
    this.activePage = 'main';
    this.pendingCloseDetail = false;
    this.closeAfterTransition = false;
    this.detailEntered = false;
    try {
      localStorage.setItem('settings_active_page', 'main');
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
    /* Unlock shell scroll before global chrome flip so the first frame after hero/bg change can already be at the saved Y. */
    this.releaseSettingsDocScrollLockIfActive('detailClose');
    this.syncSettingsSubChrome();
    this.cdr.detectChanges();
    this.syncScrollAfterGoTo(prev, 'main');
    this.updateBodyOverflowForDetail();
    this.logSettingsScroll('finalizeDetailClose', { closedFrom: prev });
  }

  onDetailTransitionEnd(event: TransitionEvent): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    const prop = event.propertyName;
    if (prop !== 'transform' && prop !== '-webkit-transform') {
      return;
    }
    if (this.closeAfterTransition && !this.detailEntered) {
      const prev = this.activePage;
      this.finalizeDetailClose(prev);
    }
  }

  private startDetailOpenAnimation(): void {
    this.detailEntered = false;
    if (this.reduceMotionUi) {
      this.detailEntered = true;
      this.syncSettingsSubChrome();
      this.updateBodyOverflowForDetail();
      this.cdr.detectChanges();
      return;
    }
    this.cdr.detectChanges();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        /* Turn on sub chrome after the sheet is committed to visible — avoids a frame of
         * `html.propza-settings-sub` while the panel is still translateX(100%). */
        this.detailEntered = true;
        this.syncSettingsSubChrome();
        this.updateBodyOverflowForDetail();
        this.cdr.detectChanges();
      });
    });
  }

  private updateBodyOverflowForDetail(): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.body.style.overflow = this.showDetailPanel() ? 'hidden' : '';
  }

  private syncSettingsSubChrome(chromePage?: SettingsMobilePage): void {
    const p = chromePage ?? this.activePage;
    const subOn = p !== 'main';
    document.documentElement.classList.toggle(SETTINGS_SUB_CHROME_CLASS, subOn);
    this.logSettingsScroll('syncSettingsSubChrome', { chromePage: p, subChromeClassOn: subOn });
  }

  private shouldUseSettingsDocScrollLock(): boolean {
    return this.getSettingsScrollTarget().useWindowScroll;
  }

  private addSettingsDocScrollLockClasses(): void {
    if (typeof document === 'undefined') {
      return;
    }
    /* Class on html; overflow lock targets `.mobile-app-shell` in styles.scss (not html — iOS nested scroll). */
    document.documentElement.classList.add(SETTINGS_DOC_SCROLL_LOCK_CLASS);
    this.settingsDocScrollLockOn = true;
  }

  private applySettingsDocScrollLockFromMain(capturedScrollY: number): void {
    if (!this.shouldUseSettingsDocScrollLock()) {
      return;
    }
    this.savedWindowScrollYForDocLock = capturedScrollY;
    this.addSettingsDocScrollLockClasses();
    this.logSettingsScroll('applySettingsDocScrollLockFromMain', {
      capturedScrollY,
      settingsDocScrollLockOn: this.settingsDocScrollLockOn
    });
  }

  private ensureSettingsDocScrollLockActive(reason: string): void {
    if (!this.shouldUseSettingsDocScrollLock()) {
      return;
    }
    if (!this.settingsDocScrollLockOn) {
      this.addSettingsDocScrollLockClasses();
    }
    this.logSettingsScroll('ensureSettingsDocScrollLockActive', {
      reason,
      settingsDocScrollLockOn: this.settingsDocScrollLockOn
    });
  }

  private releaseSettingsDocScrollLockIfActive(source: string): void {
    if (typeof document === 'undefined') {
      return;
    }
    if (!this.settingsDocScrollLockOn) {
      this.logSettingsScroll('releaseSettingsDocScrollLockIfActive:noop', { source });
      return;
    }
    const hadSavedY = this.savedWindowScrollYForDocLock;
    document.documentElement.classList.remove(SETTINGS_DOC_SCROLL_LOCK_CLASS);
    this.settingsDocScrollLockOn = false;
    this.savedWindowScrollYForDocLock = null;
    this.logSettingsScroll('releaseSettingsDocScrollLockIfActive', { source, hadSavedY });
  }

  /** After `writeSettingsScrollY` on the window path, wait for rAF then remove overflow lock. */
  private scheduleReleaseDocScrollLockAfterWindowWrite(source: string): void {
    if (!this.shouldUseSettingsDocScrollLock()) {
      this.releaseSettingsDocScrollLockIfActive(`${source}:wideSkip`);
      return;
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.releaseSettingsDocScrollLockIfActive(source);
      });
    });
  }

  /**
   * Mobile: document scroll (window). Wider viewports while this component is mounted:
   * nearest overflow ancestor from `.settings-scroll-root` (does not affect desktop Settings route).
   */
  private getSettingsScrollTarget(): { root: HTMLElement; useWindowScroll: boolean } {
    const narrow =
      typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;

    if (narrow) {
      const se = (document.scrollingElement ?? document.documentElement) as HTMLElement;
      return { root: se, useWindowScroll: true };
    }

    const start = this.settingsScrollRoot?.nativeElement;
    if (start) {
      let el: HTMLElement | null = start;
      for (let i = 0; i < 16 && el; i++) {
        const oy = getComputedStyle(el).overflowY;
        if (oy === 'auto' || oy === 'scroll') {
          return { root: el, useWindowScroll: false };
        }
        el = el.parentElement;
      }
    }

    const se = (document.scrollingElement ?? document.documentElement) as HTMLElement;
    return { root: se, useWindowScroll: true };
  }

  private readSettingsScrollY(reason = 'read'): number {
    const t = this.getSettingsScrollTarget();
    const narrow =
      typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;
    let y: number;
    if (t.useWindowScroll) {
      y =
        window.scrollY ||
        window.pageYOffset ||
        t.root.scrollTop ||
        document.body.scrollTop ||
        0;
    } else {
      y = t.root.scrollTop;
    }
    this.logSettingsScroll('readSettingsScrollY', {
      reason,
      resultY: y,
      narrowMq: narrow,
      ...this.snapshotScrollTarget(t),
      docElScrollH: document.documentElement.scrollHeight,
      bodyScrollH: document.body?.scrollHeight ?? null
    });
    return y;
  }

  private getViewportScrollMax(): number {
    const h = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight ?? 0
    );
    return Math.max(0, h - window.innerHeight);
  }

  private writeSettingsScrollY(y: number, reason = 'write'): void {
    const t = this.getSettingsScrollTarget();
    const narrow =
      typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;
    const beforeY = this.peekDocumentScrollY(t);
    this.logSettingsScroll('writeSettingsScrollY:start', {
      reason,
      yIn: y,
      beforeY,
      narrowMq: narrow,
      ...this.snapshotScrollTarget(t),
      docElScrollH: document.documentElement.scrollHeight,
      bodyScrollH: document.body?.scrollHeight ?? null
    });

    if (t.useWindowScroll) {
      const applyWindow = (phase: 'sync' | 'rAF') => {
        const max = this.getViewportScrollMax();
        const clamped = Math.min(Math.max(0, y), max);
        window.scrollTo(0, clamped);
        try {
          document.documentElement.scrollTop = clamped;
          document.body.scrollTop = clamped;
        } catch {
          /* ignore */
        }
        const afterY = this.peekDocumentScrollY(t);
        this.logSettingsScroll(`writeSettingsScrollY:window:${phase}`, {
          reason,
          yIn: y,
          clamped,
          max,
          afterY
        });
      };
      applyWindow('sync');
      requestAnimationFrame(() => {
        applyWindow('rAF');
      });
      return;
    }
    const max = Math.max(0, t.root.scrollHeight - t.root.clientHeight);
    const applied = Math.min(Math.max(0, y), max);
    t.root.scrollTop = applied;
    this.logSettingsScroll('writeSettingsScrollY:element', {
      reason,
      yIn: y,
      max,
      applied,
      afterY: t.root.scrollTop
    });
  }

  private syncScrollAfterNavigation(): void {
    this.logSettingsScroll('syncScrollAfterNavigation:enter', {
      activePage: this.activePage,
      reduceMotionUi: this.reduceMotionUi
    });
    if (this.activePage !== 'main') {
      this.logSettingsScroll('syncScrollAfterNavigation:branch', { branch: 'ensureDocScrollLock:notMain' });
      this.ensureSettingsDocScrollLockActive('syncAfterNav:notMain');
      return;
    }
    this.mainScrollRestoreApplied = false;
    if (this.reduceMotionUi) {
      this.logSettingsScroll('syncScrollAfterNavigation:branch', { branch: 'queueMicrotask:nav-reduce' });
      queueMicrotask(() => {
        this.cdr.detectChanges();
        this.runMainScrollRestore('nav-reduce');
      });
    } else {
      this.logSettingsScroll('syncScrollAfterNavigation:branch', { branch: 'rAF:nav' });
      requestAnimationFrame(() => {
        this.cdr.detectChanges();
        this.runMainScrollRestore('nav');
      });
    }
  }

  private syncScrollAfterGoTo(prev: SettingsMobilePage, page: SettingsMobilePage): void {
    this.logSettingsScroll('syncScrollAfterGoTo:enter', {
      prev,
      page,
      reduceMotionUi: this.reduceMotionUi,
      mainScrollRestoreApplied: this.mainScrollRestoreApplied,
      mainScrollRestoreInFlight: this.mainScrollRestoreInFlight
    });
    if (page !== 'main') {
      this.mainScrollRestoreApplied = false;
      this.logSettingsScroll('syncScrollAfterGoTo:branch', { branch: 'ensureDocScrollLock:leavingMain' });
      this.ensureSettingsDocScrollLockActive('syncAfterGoTo:toSub');
      return;
    }

    this.mainScrollRestoreApplied = false;

    if (prev !== 'main') {
      this.logSettingsScroll('syncScrollAfterGoTo:branch', { branch: 'detectChanges:fromSub' });
      this.cdr.detectChanges();
    }

    if (prev === 'main') {
      this.logSettingsScroll('syncScrollAfterGoTo:branch', { branch: 'stayOnMain:immediateRestore' });
      this.cdr.detectChanges();
      this.runMainScrollRestore('stay-main');
      return;
    }

    if (this.reduceMotionUi) {
      this.logSettingsScroll('syncScrollAfterGoTo:branch', { branch: 'queueMicrotask:reduce-sub-main' });
      queueMicrotask(() => {
        this.runMainScrollRestore('reduce-sub-main');
      });
      return;
    }

    this.logSettingsScroll('syncScrollAfterGoTo:branch', { branch: 'immediate:fromSub-main' });
    this.runMainScrollRestore('fromSub-main');
  }

  private runMainScrollRestore(source: string): void {
    if (this.activePage !== 'main' || this.mainScrollRestoreApplied) {
      this.logSettingsScroll('runMainScrollRestore:skip', {
        source,
        activePage: this.activePage,
        mainScrollRestoreApplied: this.mainScrollRestoreApplied
      });
      return;
    }
    if (this.mainScrollRestoreInFlight) {
      this.logSettingsScroll('runMainScrollRestore:skipInFlight', { source });
      return;
    }
    this.mainScrollRestoreInFlight = true;

    const target = this.getDesiredMainScrollY();
    let sessionSnap: string | null = null;
    try {
      sessionSnap = sessionStorage.getItem(SETTINGS_MAIN_SCROLL_KEY);
    } catch {
      sessionSnap = null;
    }
    this.logSettingsScroll('runMainScrollRestore:start', {
      source,
      target,
      sectionScrollTopMain: this.sectionScrollTop.main,
      sessionMainScroll: sessionSnap
    });

    if (target <= 0) {
      this.syncSettingsSubChrome();
      this.writeSettingsScrollY(0, `restoreMain:${source}:targetZero`);
      this.mainScrollRestoreApplied = true;
      this.mainScrollRestoreInFlight = false;
      this.logSettingsScroll('runMainScrollRestore:done', { source, outcome: 'wroteZero', target });
      this.scheduleReleaseDocScrollLockAfterWindowWrite(`restoreMain:${source}:targetZero`);
      return;
    }

    let tries = 0;
    const tick = () => {
      if (this.activePage !== 'main') {
        this.logSettingsScroll('runMainScrollRestore:tickAbort', { source, tries, reason: 'activePageChanged' });
        this.mainScrollRestoreInFlight = false;
        return;
      }
      if (this.mainScrollRestoreApplied) {
        this.mainScrollRestoreInFlight = false;
        return;
      }

      tries++;
      void this.settingsScrollRoot?.nativeElement?.offsetHeight;
      void document.documentElement.offsetHeight;

      const max = this.getScrollMaxForCurrentTarget();
      this.logSettingsScroll('runMainScrollRestore:tick', {
        source,
        tries,
        max,
        target,
        viewportMax: this.getViewportScrollMax(),
        ready: max + 8 >= target
      });
      if (max + 8 >= target) {
        this.syncSettingsSubChrome();
        const y = Math.min(target, max);
        this.writeSettingsScrollY(y, `restoreMain:${source}:layoutReady`);
        this.mainScrollRestoreApplied = true;
        this.mainScrollRestoreInFlight = false;
        this.logSettingsScroll('runMainScrollRestore:done', {
          source,
          outcome: 'restored',
          appliedY: y,
          target,
          max
        });
        this.scheduleReleaseDocScrollLockAfterWindowWrite(`restoreMain:${source}:layoutReady`);
        return;
      }
      if (tries > 60) {
        this.syncSettingsSubChrome();
        const maxBail = this.getScrollMaxForCurrentTarget();
        const yBail = Math.min(target, maxBail);
        this.writeSettingsScrollY(yBail, `restoreMain:${source}:bailMaxTries`);
        this.mainScrollRestoreApplied = true;
        this.mainScrollRestoreInFlight = false;
        this.logSettingsScroll('runMainScrollRestore:done', {
          source,
          outcome: 'bailMaxTries',
          tries,
          target,
          max: maxBail,
          appliedY: yBail
        });
        this.scheduleReleaseDocScrollLockAfterWindowWrite(`restoreMain:${source}:bailMaxTries`);
        return;
      }
      requestAnimationFrame(tick);
    };

    tick();
  }

  private getDesiredMainScrollY(): number {
    const sectionMain = this.sectionScrollTop.main ?? 0;
    let raw = sectionMain;
    let sessionRaw: string | null | undefined;
    let usedSession = false;
    if (raw === 0) {
      try {
        sessionRaw = sessionStorage.getItem(SETTINGS_MAIN_SCROLL_KEY);
        if (sessionRaw != null) {
          const n = parseInt(sessionRaw, 10);
          if (!Number.isNaN(n) && n > 0) {
            raw = n;
            usedSession = true;
          }
        }
      } catch {
        sessionRaw = '<read_error>';
      }
    }
    this.logSettingsScroll('getDesiredMainScrollY', {
      result: raw,
      sectionScrollTopMain: sectionMain,
      sessionRaw: sessionRaw ?? null,
      usedSession
    });
    return raw;
  }

  private getScrollMaxForCurrentTarget(): number {
    const t = this.getSettingsScrollTarget();
    if (t.useWindowScroll) {
      return this.getViewportScrollMax();
    }
    return Math.max(0, t.root.scrollHeight - t.root.clientHeight);
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

  openAbout(): void {
    this.toast.show('Propza', 'info', 'Version 1.0', 4000);
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
    this.greetingName = (this.displayName || '').split(' ')[0] || '';

    const t = this.getSettingsScrollTarget();
    this.logSettingsScroll('loadProfile:layoutDone', {
      activePage: this.activePage,
      ...this.snapshotScrollTarget(t),
      peekY: this.peekDocumentScrollY(t),
      docElScrollH: document.documentElement.scrollHeight,
      bodyScrollH: document.body?.scrollHeight ?? null
    });
    requestAnimationFrame(() => {
      const t2 = this.getSettingsScrollTarget();
      this.logSettingsScroll('loadProfile:afterRaf', {
        activePage: this.activePage,
        peekY: this.peekDocumentScrollY(t2),
        scrollY: typeof window !== 'undefined' ? window.scrollY : null
      });
    });
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

      if (!full) {
        return;
      }

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
      this.greetingName = full.split(' ')[0] || '';
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
    const ref = this.modal.open(ContactSupportModalComponent, { ...this.settingsFullscreenModal });
    const inst = ref.componentInstance as ContactSupportModalComponent;
    inst.userEmail = this.userEmail;
    inst.userId = user?.id || '';
  }

  sendFeedback(): void {
    const modalRef = this.modal.open(FeedbackModalComponent, { ...this.settingsFullscreenModal });
    modalRef.componentInstance.userEmail = this.userEmail;
  }

  openQuickStartGuide(): void {
    this.modal.open(QuickStartModalComponent, { ...this.settingsFullscreenModal });
  }

  openBugReport(): void {
    const modalRef = this.modal.open(BugReportModalComponent, { ...this.settingsFullscreenModal });
    modalRef.componentInstance.userEmail = this.userEmail;
  }

  openFeatureRequest(): void {
    const modalRef = this.modal.open(FeatureRequestModalComponent, { ...this.settingsFullscreenModal });
    modalRef.componentInstance.userEmail = this.userEmail;
  }

  openPrivacyPolicy(): void {
    this.modal.open(PrivacyPolicyModalComponent, { ...this.settingsFullscreenModal });
  }

  openTermsAndConditions(): void {
    this.modal.open(TermsModalComponent, { ...this.settingsFullscreenModal });
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
    if (err) this.error = err.message;
    else this.message = 'Password reset link sent';
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
