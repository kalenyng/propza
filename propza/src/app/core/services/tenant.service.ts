import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Tenant } from '../models/tenant.model';

export type { Tenant };

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private tenantsSubject = new BehaviorSubject<Tenant[]>([]);
  public tenants$ = this.tenantsSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /** After the first authenticated load finishes, empty lists refetch silently (no blocking skeleton). */
  private tenantsInitialLoadDone = false;

  constructor(private supabaseService: SupabaseService) {
    this.supabaseService.refreshAll$.subscribe(() => this.refreshTenants());
    this.loadTenants();
  }

  async loadTenants(): Promise<void> {
    const silent = this.tenantsSubject.value.length > 0 || this.tenantsInitialLoadDone;
    if (!silent) {
      this.loadingSubject.next(true);
    }

    let completedAuthenticatedFetch = false;

    try {
      const { data: userData } = await this.supabaseService.supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        this.tenantsSubject.next([]);
        this.tenantsInitialLoadDone = false;
        return;
      }

      completedAuthenticatedFetch = true;

      const { data, error } = await this.supabaseService.supabase
        .from('tenants')
        .select(`
          *,
          properties!inner(address, owner_id)
        `)
        .eq('properties.owner_id', userId)
        .order('rent_due_date', { ascending: true });

      if (error) {
        console.error('Error loading tenants:', error);
        this.tenantsSubject.next([]);
      } else {
        this.tenantsSubject.next(data || []);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      this.tenantsSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
      if (completedAuthenticatedFetch) {
        this.tenantsInitialLoadDone = true;
      }
    }
  }

  getTenants() {
    return this.tenantsSubject.value;
  }

  getTenantById(id: string): Tenant | undefined {
    return this.tenantsSubject.value.find(tenant => tenant.id === id);
  }

  async addTenant(tenant: Omit<Tenant, 'id' | 'created_at'>): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('tenants')
        .insert([{
          name: tenant.name,
          email: tenant.email,
          phone: tenant.phone,
          property_id: tenant.property_id,
          rent_amount: tenant.rent_amount,
          rent_status: tenant.rent_status,
          rent_due_date: tenant.rent_due_date,
          lease_start_date: tenant.lease_start_date,
          lease_end_date: tenant.lease_end_date,
          notes: tenant.notes
        }])
        .select(`
          *,
          properties(address)
        `)
        .single();

      if (error) {
        console.error('Error adding tenant:', error);
        throw error;
      }

      // Refresh the tenants list
      await this.loadTenants();
    } catch (error) {
      console.error('Error adding tenant:', error);
      throw error;
    }
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<void> {
    try {
      const { error } = await this.supabaseService.supabase
        .from('tenants')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating tenant:', error);
        throw error;
      }

      // Refresh the tenants list
      await this.loadTenants();
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  }

  async deleteTenant(id: string): Promise<void> {
    try {
      // Get tenant to find property_id before deleting
      const tenant = this.getTenantById(id);
      const propertyId = tenant?.property_id;

      // Delete tenant
      const { error } = await this.supabaseService.supabase
        .from('tenants')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting tenant:', error);
        throw error;
      }

      // Update property status to vacant and clear tenant name
      if (propertyId) {
        await this.supabaseService.supabase
          .from('properties')
          .update({
            status: 'vacant',
            tenant: null
          })
          .eq('id', propertyId);
      }

      // Signal all services to refresh — properties need updating too after tenant deletion
      this.supabaseService.triggerRefreshAll();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw error;
    }
  }

  getTenantStats() {
    const tenants = this.tenantsSubject.value;
    return {
      total: tenants.length,
      active: tenants.filter(t => t.rent_status === 'paid' || t.rent_status === 'upcoming').length,
      overdue: tenants.filter(t => t.rent_status === 'overdue').length,
      vacated: tenants.filter(t => t.rent_status === 'vacant').length
    };
  }

  // Helper method to refresh data
  async refreshTenants(): Promise<void> {
    await this.loadTenants();
  }
}
