import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface Property {
  id: string;
  address: string;
  tenant: string | null;
  rent_amount: number;
  currency: string;
  status: 'vacant' | 'occupied';
  owner_id: string;
  name: string;
  created_at: string;
  tenants?: Array<{
    rent_status: 'paid' | 'overdue' | 'upcoming' | 'vacant';
    rent_due_date: string;
    rent_amount: number;
    lease_start_date: string | null;
    lease_end_date: string | null;
  }>;
}

export interface Payment {
  id: string;
  property_id: string;
  amount: number;
  period: string;
  payment_date: string;
  payment_method?: string;
  notes?: string;
  paid_at: string;
  created_at: string;
}

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

  constructor(private supabaseService: SupabaseService) {
    // Register this service with SupabaseService to avoid circular dependencies
    this.supabaseService.registerPropertyService(this);
    this.loadProperties();
    this.loadPayments();
  }

  async loadProperties(): Promise<void> {
    this.loadingSubject.next(true);

    try {
      const { data: userData } = await this.supabaseService.supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        this.propertiesSubject.next([]);
        this.loadingSubject.next(false);
        return;
      }

      const { data, error } = await this.supabaseService.supabase
        .from('properties')
        .select(`
          id,
          address,
          tenant,
          rent_amount,
          currency,
          status,
          owner_id,
          name,
          created_at,
          tenants (
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
    }
  }

  async loadPayments(): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.supabase
        .from('payments')
        .select('*')
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
      const { error } = await this.supabaseService.supabase
        .from('payments')
        .insert([payment]);

      if (error) {
        console.error('Error adding payment:', error);
        throw error;
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

