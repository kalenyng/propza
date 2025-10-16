import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient;
  
  // Services will be injected lazily to avoid circular dependencies
  private _propertyService?: any;
  private _tenantService?: any;

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

  // Register services to avoid circular dependency
  registerPropertyService(service: any): void {
    this._propertyService = service;
  }

  registerTenantService(service: any): void {
    this._tenantService = service;
  }

  // Centralized refresh methods that coordinate both services
  async refreshProperties(): Promise<void> {
    if (this._propertyService) {
      await this._propertyService.refreshProperties();
    }
  }

  async refreshTenants(): Promise<void> {
    if (this._tenantService) {
      await this._tenantService.refreshTenants();
    }
  }

  async refreshPayments(): Promise<void> {
    if (this._propertyService) {
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


