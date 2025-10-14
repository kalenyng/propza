import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderBannerComponent } from '../../shared/header-banner/header-banner.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { TranslationService, Language } from '../../core/translation.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, HeaderBannerComponent, BottomNavComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  constructor(
    public translate: TranslationService,
    private auth: AuthService,
    private router: Router
  ) {}

  changeLanguage(lang: Language): void {
    this.translate.setLanguage(lang);
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    this.router.navigateByUrl('/login');
  }
}
