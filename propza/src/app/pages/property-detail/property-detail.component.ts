import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../core/supabase.service';
import { RentHelperService } from '../../core/rent-helper.service';
import { FormsModule } from '@angular/forms';

interface Property {
  id: string;
  name: string;
  address: string;
  rent_amount: number;
  currency: string;
  tenant: string | null;
  status: string;
  lease_url: string | null;
  notes: string | null;
}

interface Tenancy {
  id: string;
  start_date: string;
  end_date: string | null;
  rent_due_day: number;
}

interface Payment {
  id: string;
  property_id: string;
  period: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  notes?: string;
  paid_at: string;
}

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.scss'
})
export class PropertyDetailComponent implements OnInit {
  property: Property | null = null;
  tenancy: Tenancy | null = null;
  payments: Payment[] = [];
  loading = true;
  editing = false;
  propertyId: string = '';
  showPaymentForm = false;

  // Edit form fields
  editName: string = '';
  editRentAmount: number = 0;
  editTenant: string = '';
  editNotes: string = '';
  editNextPaymentDue: string = '';

  // Payment form fields
  paymentAmount: number = 0;
  paymentDate: string = new Date().toISOString().split('T')[0];
  paymentMethod: string = 'cash';
  paymentNotes: string = '';
  editingPaymentId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabase: SupabaseService,
    private rentHelper: RentHelperService
  ) {}

  async ngOnInit(): Promise<void> {
    this.propertyId = this.route.snapshot.paramMap.get('id') || '';
    if (this.propertyId) {
      await this.loadPropertyDetails();
    }
  }

  get displayStatus(): string {
    if (!this.property) return 'Vacant';
    
    if (this.tenancy) {
      return 'Occupied';
    }
    return 'Vacant';
  }

  async loadPropertyDetails(): Promise<void> {
    this.loading = true;

    // Load property
    const { data: property, error: propError } = await this.supabase.supabase
      .from('properties')
      .select('*')
      .eq('id', this.propertyId)
      .single();

    if (propError || !property) {
      console.error('Error loading property:', propError);
      this.router.navigate(['/']);
      return;
    }

    this.property = property;

    // Load active tenancy
    const { data: tenancies } = await this.supabase.supabase
      .from('tenancies')
      .select('*')
      .eq('property_id', this.propertyId)
      .order('start_date', { ascending: false })
      .limit(1);

    if (tenancies && tenancies.length > 0) {
      const tenancy = tenancies[0];
      // Check if tenancy is actually active (not ended or end date in future)
      const isActive = this.rentHelper.isActive(tenancy.start_date, tenancy.end_date);
      
      if (isActive) {
        this.tenancy = tenancy;
      } else {
        // Tenancy has ended, property is vacant
        this.tenancy = null;
      }
    } else {
      // No tenancy found, property is vacant
      this.tenancy = null;
    }

    // Load payment history
    await this.loadPayments();

    this.loading = false;
  }

  async loadPayments(): Promise<void> {
    const { data, error } = await this.supabase.supabase
      .from('payments')
      .select('*')
      .eq('property_id', this.propertyId)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error loading payments:', error);
      this.payments = [];
    } else {
      this.payments = data || [];
    }
  }

  openPaymentForm(): void {
    this.showPaymentForm = true;
    this.editingPaymentId = null;
    this.paymentAmount = this.property?.rent_amount || 0;
    this.paymentDate = new Date().toISOString().split('T')[0];
    this.paymentMethod = 'cash';
    this.paymentNotes = '';
  }

  editPayment(payment: Payment): void {
    this.showPaymentForm = true;
    this.editingPaymentId = payment.id;
    this.paymentAmount = payment.amount;
    this.paymentDate = payment.payment_date;
    this.paymentMethod = payment.payment_method || 'cash';
    this.paymentNotes = payment.notes || '';
  }

  cancelPayment(): void {
    this.showPaymentForm = false;
    this.editingPaymentId = null;
  }

  async deletePayment(paymentId: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this payment record?')) {
      return;
    }

    const { error } = await this.supabase.supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);

    if (error) {
      console.error('Error deleting payment:', error);
      alert(`Failed to delete payment: ${error.message}`);
      return;
    }

    await this.loadPropertyDetails();
  }

  async savePayment(): Promise<void> {
    if (!this.property || !this.tenancy || this.paymentAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    // Calculate the current rent period (the one we're paying for)
    const period = this.rentHelper.getCurrentRentPeriod(this.tenancy.rent_due_day);

    let error: any;

    if (this.editingPaymentId) {
      // Update existing payment
      const result = await this.supabase.supabase
        .from('payments')
        .update({
          amount: this.paymentAmount,
          payment_date: this.paymentDate,
          payment_method: this.paymentMethod,
          notes: this.paymentNotes || null
        })
        .eq('id', this.editingPaymentId);
      
      error = result.error;
    } else {
      // Create new payment
      const result = await this.supabase.supabase
        .from('payments')
        .insert({
          property_id: this.propertyId,
          period: period,
          amount: this.paymentAmount,
          payment_date: this.paymentDate,
          payment_method: this.paymentMethod,
          notes: this.paymentNotes || null
        });
      
      error = result.error;
    }

    if (error) {
      console.error('Error saving payment:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === '42P01') {
        alert('Payments table not found. Please run the database migration first.');
      } else {
        alert(`Failed to save payment: ${error.message}`);
      }
      return;
    }

    this.showPaymentForm = false;
    this.editingPaymentId = null;
    await this.loadPropertyDetails();
  }

  get tenancyLength(): string {
    if (!this.tenancy) return 'N/A';
    
    const start = new Date(this.tenancy.start_date);
    const end = this.tenancy.end_date ? new Date(this.tenancy.end_date) : new Date();
    
    const months = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
    return `${months} month${months !== 1 ? 's' : ''}`;
  }

  startEdit(): void {
    if (!this.property) return;
    this.editing = true;
    this.editName = this.property.name;
    this.editRentAmount = this.property.rent_amount;
    this.editTenant = this.property.tenant || '';
    this.editNotes = this.property.notes || '';
    
    // Calculate current next payment due for editing
    if (this.tenancy) {
      const nextDue = this.rentHelper.nextDueDate(
        this.tenancy.rent_due_day,
        this.tenancy.start_date
      );
      this.editNextPaymentDue = nextDue.toISOString().split('T')[0];
    }
  }

  cancelEdit(): void {
    this.editing = false;
  }

  async saveChanges(): Promise<void> {
    if (!this.property) return;

    // Update basic property info
    const updateData: any = {
      name: this.editName,
      address: this.editName,
      rent_amount: this.editRentAmount,
      tenant: this.editTenant || null
    };

    const { error } = await this.supabase.supabase
      .from('properties')
      .update(updateData)
      .eq('id', this.propertyId);

    if (error) {
      console.error('Error updating property:', error);
      alert(`Failed to update property: ${error.message}`);
      return;
    }

    // Try to update notes separately if we have them
    if (this.editNotes) {
      await this.supabase.supabase
        .from('properties')
        .update({ notes: this.editNotes })
        .eq('id', this.propertyId);
      // Ignore error if notes column doesn't exist
    }

    // Update tenancy rent_due_day if changed
    if (this.tenancy && this.editNextPaymentDue) {
      const newDueDate = new Date(this.editNextPaymentDue);
      const newDueDay = newDueDate.getDate();
      
      if (newDueDay !== this.tenancy.rent_due_day) {
        await this.supabase.supabase
          .from('tenancies')
          .update({ rent_due_day: newDueDay })
          .eq('id', this.tenancy.id);
      }
    }

    this.editing = false;
    await this.loadPropertyDetails();
  }

  async deleteProperty(): Promise<void> {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    // Delete tenancies first (foreign key constraint)
    await this.supabase.supabase
      .from('tenancies')
      .delete()
      .eq('property_id', this.propertyId);

    // Delete property
    const { error } = await this.supabase.supabase
      .from('properties')
      .delete()
      .eq('id', this.propertyId);

    if (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
      return;
    }

    this.router.navigate(['/']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  formatMoney(amount: number, currency: string): string {
    const locale = currency === 'ZAR' ? 'en-ZA' : 'en-US';
    const code = currency === 'ZAR' ? 'ZAR' : currency;
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 0
      }).format(amount ?? 0);
    } catch {
      return `${currency === 'ZAR' ? 'R' : ''}${(amount ?? 0).toLocaleString(locale)}`;
    }
  }
}
