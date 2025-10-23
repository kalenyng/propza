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
   * Check if beta access is required based on environment
   */
  isBetaAccessRequired(): boolean {
    return environment.requiresBetaAccess;
  }

  /**
   * Check if user has beta access stored in localStorage
   */
  private checkStoredAccess(): void {
    const localAccess = localStorage.getItem(this.STORAGE_KEY);
    this.hasAccessSignal.set(localAccess === 'granted');
  }

  /**
   * Encode code using base64
   */
  private encodeCode(code: string): string {
    return btoa(code);
  }

  /**
   * Validate the entered access code using base64 comparison
   */
  async validateCode(code: string): Promise<boolean> {
    const encodedCode = this.encodeCode(code);
    const isValid = encodedCode === environment.betaAccessCodeHash;
    
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
    const localAccess = localStorage.getItem(this.STORAGE_KEY);
    const hasAccess = localAccess === 'granted';
    this.hasAccessSignal.set(hasAccess);
    return hasAccess;
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

