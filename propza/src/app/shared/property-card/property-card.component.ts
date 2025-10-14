import { Component, Input } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RentHelperService, RentStatus } from '../../core/rent-helper.service';
import { TranslationService } from '../../core/translation.service';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss'
})
export class PropertyCardComponent {
  @Input() address!: string;
  @Input() tenant!: string;
  @Input() rent!: string;
  @Input() status: RentStatus = 'paid';
  @Input() rentDueDay?: number;
  @Input() nextDueDate?: Date;
  @Input() remainingAmount?: number;
  @Input() collectedAmount?: number;

  constructor(private rentHelper: RentHelperService, public translate: TranslationService) {}

  // Translated status label
  get i18nStatusLabel(): string {
    switch (this.status) {
      case 'paid': return this.translate.t('status.paid');
      case 'overdue': return this.translate.t('status.overdue');
      case 'grace': return this.translate.t('status.late');
      case 'due_today': return this.translate.t('status.dueToday');
      case 'due_soon': return this.translate.t('status.dueSoon');
      case 'partially_paid': return this.translate.t('status.partiallyPaid');
      case 'upcoming': return this.translate.t('status.upcoming');
      case 'vacant': return this.translate.t('status.vacant');
      default: return this.translate.t('status.paid');
    }
  }

  get statusColor(): string {
    return this.rentHelper.getStatusColor(this.status);
  }

  // We now standardize the prefix to a single translated "Due"
  get duePrefix(): string {
    return this.translate.t('property.due');
  }
}
