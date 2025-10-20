import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BetaAccessService {
  private readonly STORAGE_KEY = 'propza_beta_access';
  private hasAccessSignal = signal<boolean>(false);

  constructor() {
    this.checkStoredAccess();
  }

  /**
   * Check if user has beta access stored in localStorage
   */
  private checkStoredAccess(): void {
    const storedAccess = localStorage.getItem(this.STORAGE_KEY);
    this.hasAccessSignal.set(storedAccess === 'granted');
  }

  /**
   * Validate the entered access code
   */
  validateCode(code: string): boolean {
    const isValid = code === environment.betaAccessCode;
    
    if (isValid) {
      localStorage.setItem(this.STORAGE_KEY, 'granted');
      this.hasAccessSignal.set(true);
    }
    
    return isValid;
  }

  /**
   * Check if user has beta access
   */
  hasAccess(): boolean {
    return this.hasAccessSignal();
  }

  /**
   * Grant beta access (for OAuth flow)
   */
  grantAccess(): void {
    localStorage.setItem(this.STORAGE_KEY, 'granted');
    this.hasAccessSignal.set(true);
  }

  /**
   * Revoke beta access (useful for testing)
   */
  revokeAccess(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.hasAccessSignal.set(false);
  }
}

