import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [],
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.scss'
})
export class SummaryCardComponent {
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() subtitle: string = '';
}
