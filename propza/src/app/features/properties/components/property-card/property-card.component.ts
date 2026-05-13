import { Component, Input } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { TranslationService } from '../../../../core/services/translation.service';
import { RentStatus } from '../../../../core/services/rent-helper.service';
import { PROPERTY_CARD_STATUS_PRESENTATION } from './property-status.config';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss'
})
export class PropertyCardComponent {
  /** Non-breaking space — keeps reserved rows from collapsing when empty. */
  readonly nbsp = '\u00a0';

  @Input() address!: string;
  @Input() tenant!: string;
  @Input() rent!: string;
  @Input() status: RentStatus = 'paid';
  @Input() rentDueDay?: number;
  @Input() nextDueDate?: Date;
  @Input() remainingAmount?: number;
  @Input() collectedAmount?: number;

  constructor(public translate: TranslationService) {}

  /**
   * UI rule: widgets only show the first address line (street + number).
   * We treat commas/newlines as separators and keep the first segment.
   */
  get addressLine1(): string {
    const raw = (this.address || '').trim();
    if (!raw) return '';
    return raw
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)[0] || raw;
  }

  get presentation() {
    return PROPERTY_CARD_STATUS_PRESENTATION[this.status];
  }
}
