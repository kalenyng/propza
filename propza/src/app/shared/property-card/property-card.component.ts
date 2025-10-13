import { Component, Input } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { RentHelperService, RentStatus } from '../../core/rent-helper.service';

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

  constructor(private rentHelper: RentHelperService) {}

  get statusLabel(): string {
    return this.rentHelper.getStatusLabel(this.status);
  }

  get statusColor(): string {
    return this.rentHelper.getStatusColor(this.status);
  }

  get dueDateLabel(): string {
    if (!this.nextDueDate || this.status === 'vacant') return '';
    return this.rentHelper.getDueDateText(this.status, this.nextDueDate);
  }
}
