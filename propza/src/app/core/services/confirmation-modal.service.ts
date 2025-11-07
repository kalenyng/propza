import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger';
}

interface ConfirmationState {
  options: ConfirmationOptions;
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationModalService {
  private stateSubject = new BehaviorSubject<ConfirmationState | null>(null);

  state$: Observable<ConfirmationState | null> = this.stateSubject.asObservable();

  confirm(options: ConfirmationOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.stateSubject.next({
        options: {
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          type: 'warning',
          ...options
        },
        resolve
      });
    });
  }

  hide(): void {
    this.stateSubject.next(null);
  }
}

