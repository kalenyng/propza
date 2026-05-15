import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Tenant } from '../../../../core/services/tenant.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TENANT_CARD_PRESENTATION, type TenantCardComputedStatus } from './tenant-status.config';

@Component({
  selector: 'app-tenant-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './tenant-card.component.html',
  styleUrl: './tenant-card.component.scss'
})
export class TenantCardComponent {
  @Input() tenant!: Tenant;
  @Output() cardClick = new EventEmitter<string>();

  constructor(public translate: TranslationService) {}

  get actualStatus(): TenantCardComputedStatus {
    if (this.tenant.rent_status === 'paid') {
      return 'paid';
    }
    if (this.tenant.rent_status === 'vacant') {
      return 'vacant';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(this.tenant.rent_due_date);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      return 'overdue';
    }

    return 'upcoming';
  }

  get presentation() {
    return TENANT_CARD_PRESENTATION[this.actualStatus];
  }

  get formattedRent(): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(this.tenant.rent_amount);
  }

  get isOverdue(): boolean {
    return this.actualStatus === 'overdue';
  }

  get propertyAddress(): string {
    const address = this.tenant.properties?.address?.trim();
    if (!address) {
      return '';
    }
    return address.split(',')[0].trim();
  }

  get emailDisplay(): string {
    const v = this.tenant.email?.trim();
    return v ? v : this.translate.t('tenant.noEmailProvided');
  }

  get phoneDisplay(): string {
    const v = this.tenant.phone?.trim();
    return v ? v : this.translate.t('tenant.noPhoneProvided');
  }

  get emailIsPlaceholder(): boolean {
    return !this.tenant.email?.trim();
  }

  get phoneIsPlaceholder(): boolean {
    return !this.tenant.phone?.trim();
  }

  onCardClick(): void {
    this.cardClick.emit(this.tenant.id);
  }
}
