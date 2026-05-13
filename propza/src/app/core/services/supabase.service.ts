import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient;

  private refreshAllSubject = new Subject<void>();
  /** Emits whenever a full data refresh is requested across all services. */
  readonly refreshAll$ = this.refreshAllSubject.asObservable();

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        debug: false, // Disables internal SDK logs in production to suppress lock warnings
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    });
  }

  get supabase(): SupabaseClient {
    return this.client;
  }

  /** Signals all subscribed services to refresh their data. */
  triggerRefreshAll(): void {
    this.refreshAllSubject.next();
  }
}


