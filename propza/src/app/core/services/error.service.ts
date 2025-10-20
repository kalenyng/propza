import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  handleError(error: unknown, context?: string): AppError {
    const errorMessage = this.extractErrorMessage(error);
    const errorCode = this.extractErrorCode(error);
    
    // Log to console only in development
    if (!environment.production) {
      console.error(`[${context || 'Error'}]`, error);
    }
    
    // In production, you would send to monitoring service (e.g., Sentry)
    // this.sendToMonitoring(error, context);
    
    return {
      message: errorMessage,
      code: errorCode,
      details: !environment.production ? error : undefined
    };
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }
    return 'An unexpected error occurred';
  }

  private extractErrorCode(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'code' in error) {
      return String((error as { code: unknown }).code);
    }
    return undefined;
  }

  logDebug(message: string, ...args: unknown[]): void {
    if (!environment.production) {
      console.log(message, ...args);
    }
  }

  logInfo(message: string, ...args: unknown[]): void {
    if (!environment.production) {
      console.info(message, ...args);
    }
  }

  logWarning(message: string, ...args: unknown[]): void {
    if (!environment.production) {
      console.warn(message, ...args);
    }
  }
}

