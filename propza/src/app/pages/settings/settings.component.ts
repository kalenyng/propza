import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderBannerComponent } from '../../shared/header-banner/header-banner.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { TranslationService, Language } from '../../core/translation.service';
import { AuthService } from '../../core/auth.service';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderBannerComponent, BottomNavComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  constructor(
    public translate: TranslationService,
    private auth: AuthService,
    private router: Router,
    public theme: ThemeService
  ) {}

  // Profile form model
  fullName = '';
  email = '';
  message = '';
  error = '';

  changeLanguage(lang: Language): void {
    this.translate.setLanguage(lang);
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    this.router.navigateByUrl('/login');
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
    const ok = window.confirm('This will permanently delete your account and data. Are you sure?');
    if (!ok) return;
    const err = await this.auth.deleteAccount();
    if (err) {
      this.error = err;
      return;
    }
    await this.auth.signOut();
    this.router.navigateByUrl('/register');
  }
}
