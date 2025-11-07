import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ConfirmationModalService, ConfirmationOptions } from '../../../core/services/confirmation-modal.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.95)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px) scale(0.95)' }))
      ])
    ])
  ]
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {
  isVisible = signal<boolean>(false);
  options = signal<ConfirmationOptions | null>(null);
  resolvePromise: ((value: boolean) => void) | null = null;
  private destroy$ = new Subject<void>();

  constructor(private confirmationService: ConfirmationModalService) {}

  ngOnInit(): void {
    this.confirmationService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state) {
          this.options.set(state.options);
          this.resolvePromise = state.resolve;
          this.isVisible.set(true);
        } else {
          this.isVisible.set(false);
          this.options.set(null);
          this.resolvePromise = null;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onConfirm(): void {
    if (this.resolvePromise) {
      this.resolvePromise(true);
      this.resolvePromise = null;
    }
    this.isVisible.set(false);
    this.confirmationService.hide();
  }

  onCancel(): void {
    if (this.resolvePromise) {
      this.resolvePromise(false);
      this.resolvePromise = null;
    }
    this.isVisible.set(false);
    this.confirmationService.hide();
  }

  onOverlayClick(): void {
    // Prevent closing on overlay click for confirmation modals
    // User must explicitly choose an action
  }
}

