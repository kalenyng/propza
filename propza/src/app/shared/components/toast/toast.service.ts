import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  leaving?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private toastsSubject = new BehaviorSubject<Toast[]>([]);

  readonly toasts$ = this.toastsSubject.asObservable();

  show(title: string, type: ToastType = 'info', message?: string, duration = 4000): void {
    const id = ++this.counter;
    const toast: Toast = { id, type, title, message, duration };

    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  success(title: string, message?: string): void {
    this.show(title, 'success', message);
  }

  error(title: string, message?: string): void {
    this.show(title, 'error', message, 6000);
  }

  warning(title: string, message?: string): void {
    this.show(title, 'warning', message, 5000);
  }

  info(title: string, message?: string): void {
    this.show(title, 'info', message);
  }

  dismiss(id: number): void {
    // Mark as leaving for exit animation
    const updated = this.toastsSubject.value.map(t =>
      t.id === id ? { ...t, leaving: true } : t
    );
    this.toastsSubject.next(updated);

    // Remove after animation completes
    setTimeout(() => {
      this.toastsSubject.next(
        this.toastsSubject.value.filter(t => t.id !== id)
      );
    }, 220);
  }
}
