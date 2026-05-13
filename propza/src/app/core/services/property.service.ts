import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Property, Payment } from '../models/property.model';

export type { Property, Payment };

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private propertiesSubject = new BehaviorSubject<Property[]>([]);
  public properties$ = this.propertiesSubject.asObservable();
  
  private paymentsSubject = new BehaviorSubject<Payment[]>([]);
  public payments$ = this.paymentsSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /** After the first authenticated load finishes, empty lists refetch silently (no blocking skeleton). */
  private propertiesInitialLoadDone = false;

  constructor(private supabaseService: SupabaseService) {
    this.supabaseService.refreshAll$.subscribe(() => this.refreshAll());
    this.loadProperties().then(() => this.loadPayments());
  }

  async loadProperties(): Promise<void> {
    const silent =
      this.propertiesSubject.value.length > 0 || this.propertiesInitialLoadDone;
    if (!silent) {
      this.loadingSubject.next(true);
    }

    let completedAuthenticatedFetch = false;

    try {
      const { data: userData } = await this.supabaseService.supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        this.propertiesSubject.next([]);
        this.propertiesInitialLoadDone = false;
        return;
      }

      completedAuthenticatedFetch = true;

      const { data, error } = await this.supabaseService.supabase
        .from('properties')
        .select(`
          id,
          address,
          rent_amount,
          currency,
          status,
          owner_id,
          name,
          created_at,
          tenants (
            name,
            rent_status,
            rent_due_date,
            rent_amount,
            lease_start_date,
            lease_end_date
          )
        `)
        .eq('owner_id', userId)
        .order('address');

      if (error) {
        console.error('Error loading properties:', error);
        this.propertiesSubject.next([]);
      } else {
        this.propertiesSubject.next(data || []);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      this.propertiesSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
      if (completedAuthenticatedFetch) {
        this.propertiesInitialLoadDone = true;
      }
    }
  }

  async loadPayments(): Promise<void> {
    try {
      const { data: userData } = await this.supabaseService.supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        this.paymentsSubject.next([]);
        return;
      }

      const propertyIds = this.propertiesSubject.value.map(p => p.id);
      if (propertyIds.length === 0) {
        this.paymentsSubject.next([]);
        return;
      }

      const { data, error } = await this.supabaseService.supabase
        .from('payments')
        .select('*')
        .in('property_id', propertyIds)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error loading payments:', error);
        this.paymentsSubject.next([]);
      } else {
        this.paymentsSubject.next(data || []);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      this.paymentsSubject.next([]);
    }
  }

  getProperties(): Property[] {
    return this.propertiesSubject.value;
  }

  getPayments(): Payment[] {
    return this.paymentsSubject.value;
  }

  getPropertyById(id: string): Property | undefined {
    return this.propertiesSubject.value.find(property => property.id === id);
  }

  getVacantProperties(): Property[] {
    return this.propertiesSubject.value.filter(p => p.status === 'vacant');
  }

  async addProperty(property: Partial<Property>): Promise<void> {
    try {
      const { data: userData } = await this.supabaseService.supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { error } = await this.supabaseService.supabase
        .from('properties')
        .insert([{
          ...property,
          owner_id: userId
        }]);

      if (error) {
        console.error('Error adding property:', error);
        throw error;
      }

      // Refresh the properties list
      await this.loadProperties();
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<void> {
    try {
      const { error } = await this.supabaseService.supabase
        .from('properties')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating property:', error);
        throw error;
      }

      // Refresh the properties list
      await this.loadProperties();
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  async deleteProperty(id: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting property:', error);
        throw error;
      }

      // Refresh the properties list
      await this.loadProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  async addPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('payments')
        .insert([payment])
        .select()
        .single();

      if (error) {
        console.error('Error adding payment:', error);
        // Convert Supabase error to a more informative Error object
        const errorMessage = error.message || error.details || error.hint || 'Unknown error when creating payment';
        const enhancedError = new Error(errorMessage);
        (enhancedError as any).code = error.code;
        (enhancedError as any).details = error.details;
        (enhancedError as any).hint = error.hint;
        throw enhancedError;
      }

      // Refresh payments list
      await this.loadPayments();
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<void> {
    try {
      const { error } = await this.supabaseService.supabase
        .from('payments')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating payment:', error);
        throw error;
      }

      // Refresh payments list
      await this.loadPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  async deletePayment(id: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting payment:', error);
        throw error;
      }

      // Refresh payments list
      await this.loadPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  // Helper method to refresh data
  async refreshProperties(): Promise<void> {
    await this.loadProperties();
  }

  async refreshPayments(): Promise<void> {
    await this.loadPayments();
  }

  // Refresh both properties and payments
  async refreshAll(): Promise<void> {
    await Promise.all([
      this.loadProperties(),
      this.loadPayments()
    ]);
  }
}

