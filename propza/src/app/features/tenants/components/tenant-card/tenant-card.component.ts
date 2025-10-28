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

  /**
   * Compute the actual rent status based on current date
   */
  get actualStatus(): 'paid' | 'overdue' | 'upcoming' | 'vacant' {
    // If tenant has paid status, keep it (assuming payments are logged)
    if (this.tenant.rent_status === 'paid') {
      return 'paid';
    }

    // Check if rent is overdue by comparing today with rent_due_date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    const dueDate = new Date(this.tenant.rent_due_date);
    dueDate.setHours(0, 0, 0, 0);

    // If due date has passed, tenant is overdue (unless already paid)
    if (dueDate < today) {
      return 'overdue';
    }

    // Otherwise, rent is upcoming
    return 'upcoming';
  }

  get statusColor(): string {
    switch (this.actualStatus) {
      case 'overdue': return 'red';
      case 'paid': return 'green';
      case 'upcoming': return 'blue';
      default: return 'gray';
    }
  }

  get statusLabel(): string {
    switch (this.actualStatus) {
      case 'overdue': return 'Overdue';
      case 'paid': return 'Paid';
      case 'upcoming': return 'Upcoming';
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
    return this.actualStatus === 'overdue';
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
