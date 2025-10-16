import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tenant } from '../../../../core/services/tenant.service';

@Component({
  selector: 'app-tenant-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-card.component.html',
  styleUrl: './tenant-card.component.scss'
})
export class TenantCardComponent {
  @Input() tenant!: Tenant;
  @Output() cardClick = new EventEmitter<string>();

  get statusColor(): string {
    switch (this.tenant.rent_status) {
      case 'overdue': return 'red';
      default: return 'gray';
    }
  }

  get statusLabel(): string {
    switch (this.tenant.rent_status) {
      case 'overdue': return 'Overdue';
      default: return '';
    }
  }

  get formattedRent(): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(this.tenant.rent_amount);
  }

  get formattedDueDate(): string {
    return new Date(this.tenant.rent_due_date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  get isOverdue(): boolean {
    return this.tenant.rent_status === 'overdue';
  }

  get propertyAddress(): string {
    return this.tenant.properties?.address || 'Unknown Property';
  }

  get displayEmail(): string {
    return this.tenant.email || 'No email';
  }

  get displayPhone(): string {
    return this.tenant.phone || 'No phone';
  }

  onCardClick(): void {
    this.cardClick.emit(this.tenant.id);
  }
}
