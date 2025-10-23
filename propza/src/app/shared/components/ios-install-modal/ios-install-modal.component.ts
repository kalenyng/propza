import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ios-install-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ios-install-modal.component.html',
  styleUrl: './ios-install-modal.component.scss'
})
export class IosInstallModalComponent {
  @Input() show = false;
  @Output() dismiss = new EventEmitter<void>();
  @Output() gotIt = new EventEmitter<void>();

  onDismiss(): void {
    this.dismiss.emit();
  }

  onGotIt(): void {
    this.gotIt.emit();
  }
}
