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
   * Check if user has beta access stored in localStorage or sessionStorage
   */
  private checkStoredAccess(): void {
    const localAccess = localStorage.getItem(this.STORAGE_KEY);
    const sessionAccess = sessionStorage.getItem(this.STORAGE_KEY);
    this.hasAccessSignal.set(localAccess === 'granted' || sessionAccess === 'granted');
  }

  /**
   * Validate the entered access code
   */
  validateCode(code: string): boolean {
    const isValid = code === environment.betaAccessCode;
    
    if (isValid) {
      // Store in both localStorage and sessionStorage for reliability
      localStorage.setItem(this.STORAGE_KEY, 'granted');
      sessionStorage.setItem(this.STORAGE_KEY, 'granted');
      this.hasAccessSignal.set(true);
    }
    
    return isValid;
  }

  /**
   * Check if user has beta access
   */
  hasAccess(): boolean {
    // Re-check storage each time to ensure it's current
    const localAccess = localStorage.getItem(this.STORAGE_KEY);
    const sessionAccess = sessionStorage.getItem(this.STORAGE_KEY);
    const hasAccess = localAccess === 'granted' || sessionAccess === 'granted';
    this.hasAccessSignal.set(hasAccess);
    return hasAccess;
  }

  /**
   * Grant beta access (for OAuth flow)
   */
  grantAccess(): void {
    localStorage.setItem(this.STORAGE_KEY, 'granted');
    sessionStorage.setItem(this.STORAGE_KEY, 'granted');
    this.hasAccessSignal.set(true);
  }

  /**
   * Revoke beta access (useful for testing)
   */
  revokeAccess(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.hasAccessSignal.set(false);
  }
}

