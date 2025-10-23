/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

// Suppress known harmless warnings in production
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const msg = args.join(' ');
  // Only suppress these specific non-critical warnings
  if (msg.includes('Navigator LockManager lock') || 
      msg.includes('apple-mobile-web-app-capable')) {
    return; // Silently ignore these known harmless warnings
  }
  originalConsoleError(...args);
};

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
