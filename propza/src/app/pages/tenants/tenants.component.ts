import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderBannerComponent } from '../../shared/header-banner/header-banner.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { TranslationService } from '../../core/translation.service';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, HeaderBannerComponent, BottomNavComponent],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.scss'
})
export class TenantsComponent {
  constructor(public translate: TranslationService) {}
}
