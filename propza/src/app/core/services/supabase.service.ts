import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

interface ServiceWithRefresh {
  refreshProperties?: () => Promise<void>;
  refreshTenants?: () => Promise<void>;
  refreshPayments?: () => Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient;
  private _propertyService?: ServiceWithRefresh;
  private _tenantService?: ServiceWithRefresh;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    });
  }

  get supabase(): SupabaseClient {
    return this.client;
  }

  registerPropertyService(service: ServiceWithRefresh): void {
    this._propertyService = service;
  }

  registerTenantService(service: ServiceWithRefresh): void {
    this._tenantService = service;
  }

  async refreshProperties(): Promise<void> {
    if (this._propertyService?.refreshProperties) {
      await this._propertyService.refreshProperties();
    }
  }

  async refreshTenants(): Promise<void> {
    if (this._tenantService?.refreshTenants) {
      await this._tenantService.refreshTenants();
    }
  }

  async refreshPayments(): Promise<void> {
    if (this._propertyService?.refreshPayments) {
      await this._propertyService.refreshPayments();
    }
  }

  // Refresh everything - useful after operations that affect multiple entities
  async refreshAll(): Promise<void> {
    await Promise.all([
      this.refreshProperties(),
      this.refreshTenants(),
      this.refreshPayments()
    ]);
  }
}


