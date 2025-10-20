import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { PropertyService, Property as PropertyData, Payment } from '../../../../core/services/property.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { RentHelperService } from '../../../../core/services/rent-helper.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { FormsModule } from '@angular/forms';

// Extended Property interface with additional fields for detail view
interface Property extends Omit<PropertyData, 'tenants'> {
  lease_url: string | null;
  notes: string | null;
}

interface Tenancy {
  id: string;
  start_date: string;
  end_date: string | null;
  rent_due_day: number;
}

interface TenantData {
  email: string | null;
  phone: string | null;
  lease_start_date: string;
  lease_end_date: string | null;
  rent_due_date: string;
}

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.scss'
})
export class PropertyDetailComponent implements OnInit, OnDestroy {
  property: Property | null = null;
  tenancy: Tenancy | null = null;
  tenantData: TenantData | null = null;
  payments: Payment[] = [];
  loading = true;
  editing = false;
  propertyId: string = '';
  showPaymentForm = false;
  saving = false;
  deletingProperty = false;
  deletingTenant = false;
  savingPayment = false;
  
  private destroy$ = new Subject<void>();

  // Edit form fields
  editName: string = '';
  editRentAmount: number = 0;
  editTenant: string = '';
  editTenantEmail: string = '';
  editLeaseStartDate: string = '';
  editLeaseEndDate: string = '';
  editRentDueDate: string = '';
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
    private propertyService: PropertyService,
    private tenantService: TenantService,
    private rentHelper: RentHelperService,
    public translate: TranslationService
  ) {}

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id') || '';
    
    if (this.propertyId) {
      // Check if we have cached data - if so, show it immediately
      const cachedProperty = this.propertyService.getPropertyById(this.propertyId);
      if (cachedProperty) {
        this.loading = false;
      }

      // Subscribe to property changes
      this.propertyService.properties$
        .pipe(takeUntil(this.destroy$))
        .subscribe(properties => {
          const prop = properties.find(p => p.id === this.propertyId);
          if (prop) {
            this.updatePropertyData(prop);
            this.loading = false; // Hide loading when we get data
          }
        });

      // Subscribe to payment changes
      this.propertyService.payments$
        .pipe(takeUntil(this.destroy$))
        .subscribe(payments => {
          this.payments = payments.filter(p => p.property_id === this.propertyId);
        });

      // Don't subscribe to global loading$ - use local loading state only

      // Initial load
      this.loadPropertyDetails();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updatePropertyData(prop: PropertyData): void {
    // Map PropertyData to local Property interface
    this.property = {
      id: prop.id,
      name: prop.name,
      address: prop.address,
      rent_amount: prop.rent_amount,
      currency: prop.currency,
      tenant: prop.tenant,
      status: prop.status,
      owner_id: prop.owner_id,
      created_at: prop.created_at,
      lease_url: null, // Not in PropertyData interface
      notes: null // Not in PropertyData interface
    };

    // Extract tenant data from nested tenants array
    if (prop.tenants && prop.tenants.length > 0) {
      const tenant = prop.tenants[0];
      this.tenantData = {
        email: null, // Need to get from full tenant record
        phone: null,
        lease_start_date: tenant.lease_start_date || '',
        lease_end_date: tenant.lease_end_date,
        rent_due_date: tenant.rent_due_date
      };
    } else {
      this.tenantData = null;
    }
  }

  get displayStatus(): string {
    if (!this.property) return 'Vacant';
    
    // Check property status first (new system)
    if (this.property.status === 'occupied') {
      return 'Occupied';
    }
    
    // Fallback to tenancy check (legacy system)
    if (this.tenancy) {
      return 'Occupied';
    }
    
    return 'Vacant';
  }

  async loadPropertyDetails(): Promise<void> {
    // Load tenant data with full details (email, phone)
    if (this.property?.status === 'occupied') {
      const { data: tenant } = await this.supabase.supabase
        .from('tenants')
        .select('email, phone, lease_start_date, lease_end_date, rent_due_date')
        .eq('property_id', this.propertyId)
        .single();
      
      if (tenant) {
        this.tenantData = tenant;
      }
    }

    // Load active tenancy (legacy system)
    const { data: tenancies } = await this.supabase.supabase
      .from('tenancies')
      .select('*')
      .eq('property_id', this.propertyId)
      .order('start_date', { ascending: false })
      .limit(1);

    if (tenancies && tenancies.length > 0) {
      const tenancy = tenancies[0];
      const isActive = this.rentHelper.isActive(tenancy.start_date, tenancy.end_date);
      this.tenancy = isActive ? tenancy : null;
    } else {
      this.tenancy = null;
    }

    // Trigger a refresh to get latest data
    await this.propertyService.refreshAll();
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

    try {
      await this.propertyService.deletePayment(paymentId);
      // Service automatically refreshes, no need for manual refresh
    } catch (error) {
      alert('Failed to delete payment. Please try again.');
    }
  }

  async savePayment(): Promise<void> {
    if (!this.property || this.paymentAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    this.savingPayment = true;

    try {
      // Calculate the current rent period (the one we're paying for)
      // Use tenantData rent_due_date if available, otherwise use property rent_amount as fallback
      const rentDueDay = this.tenantData?.rent_due_date ? 
        new Date(this.tenantData.rent_due_date).getDate() : 
        new Date().getDate();
      const period = this.rentHelper.getCurrentRentPeriod(rentDueDay);

      if (this.editingPaymentId) {
        // Update existing payment using service
        await this.propertyService.updatePayment(this.editingPaymentId, {
          amount: this.paymentAmount,
          payment_date: this.paymentDate,
          payment_method: this.paymentMethod,
          notes: this.paymentNotes || null
        } as any);
      } else {
        // Create new payment using service
        await this.propertyService.addPayment({
          property_id: this.propertyId,
          period: period,
          amount: this.paymentAmount,
          payment_date: this.paymentDate,
          payment_method: this.paymentMethod,
          notes: this.paymentNotes || null
        } as any);
      }

      this.showPaymentForm = false;
      this.editingPaymentId = null;
      // Service automatically refreshes, observable will update payments array
    } catch (error: any) {
      console.error('Error saving payment:', error);
      
      if (error.code === '42P01') {
        alert('Payments table not found. Please run the database migration first.');
      } else if (error.message?.includes('NavigatorLockAcquireTimeoutError')) {
        alert('Authentication timeout. Please try again.');
      } else {
        alert(`Failed to save payment: ${error.message || 'Unknown error'}`);
      }
    } finally {
      this.savingPayment = false;
    }
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

  async startEdit(): Promise<void> {
    if (!this.property) return;
    this.editing = true;
    this.editName = this.property.name;
    this.editRentAmount = this.property.rent_amount;
    this.editTenant = this.property.tenant || '';
    this.editNotes = this.property.notes || '';
    
    // Load tenant data if exists
    if (this.property.tenant && this.property.status === 'occupied') {
      const { data: tenant } = await this.supabase.supabase
        .from('tenants')
        .select('email, lease_start_date, lease_end_date, rent_due_date')
        .eq('property_id', this.propertyId)
        .single();
      
      if (tenant) {
        this.editTenantEmail = tenant.email || '';
        this.editLeaseStartDate = tenant.lease_start_date || '';
        this.editLeaseEndDate = tenant.lease_end_date || '';
        this.editRentDueDate = tenant.rent_due_date || '';
      }
    } else {
      // Clear fields for new tenant
      this.editTenantEmail = '';
      this.editLeaseStartDate = new Date().toISOString().split('T')[0];
      this.editLeaseEndDate = '';
      this.editRentDueDate = new Date().toISOString().split('T')[0];
    }
    
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

    this.saving = true;
    const hasTenant = !!this.editTenant?.trim();

    try {
      // Update basic property info using service
      await this.propertyService.updateProperty(this.propertyId, {
        name: this.editName,
        address: this.editName,
        rent_amount: this.editRentAmount,
        tenant: hasTenant ? this.editTenant : null,
        status: hasTenant ? 'occupied' : 'vacant'
      } as any);

      // Try to update notes separately if we have them
      if (this.editNotes) {
        await this.supabase.supabase
          .from('properties')
          .update({ notes: this.editNotes })
          .eq('id', this.propertyId);
        // Ignore error if notes column doesn't exist
      }

      // Handle tenant record in tenants table
      if (hasTenant) {
        // Validate required tenant fields
        if (!this.editLeaseStartDate || !this.editRentDueDate) {
          alert('Please fill in the Lease Start Date and Rent Due Date for the tenant.');
          return;
        }

        // Check if tenant record exists
        const existingTenants = this.tenantService.getTenants().filter(t => t.property_id === this.propertyId);
        const existingTenant = existingTenants.length > 0 ? existingTenants[0] : null;

        const tenantData = {
          name: this.editTenant,
          email: this.editTenantEmail || null,
          phone: null,
          property_id: this.propertyId,
          rent_amount: this.editRentAmount,
          rent_status: 'upcoming' as const,
          rent_due_date: this.editRentDueDate,
          lease_start_date: this.editLeaseStartDate,
          lease_end_date: this.editLeaseEndDate || null,
          deposit_amount: 0,
          notes: null
        };

        if (existingTenant) {
          // Update existing tenant using service
          await this.tenantService.updateTenant(existingTenant.id, tenantData);
        } else {
          // Create new tenant using service
          await this.tenantService.addTenant(tenantData);
        }
      } else {
        // Remove tenant if property is now vacant
        const existingTenants = this.tenantService.getTenants().filter(t => t.property_id === this.propertyId);
        if (existingTenants.length > 0) {
          await this.tenantService.deleteTenant(existingTenants[0].id);
        }
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
      
      // Reload tenant details (services already refreshed via updateProperty/addTenant/updateTenant)
      await this.loadPropertyDetails();
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      this.saving = false;
    }
  }

  async deleteTenant(): Promise<void> {
    if (!confirm('Are you sure you want to remove this tenant? The property will be marked as vacant.')) {
      return;
    }

    this.deletingTenant = true;

    try {
      // Find the tenant record for this property
      const tenants = this.tenantService.getTenants().filter(t => t.property_id === this.propertyId);
      
      if (tenants.length > 0) {
        await this.tenantService.deleteTenant(tenants[0].id);
        // Service automatically refreshes all data
      } else {
        // No tenant record, just update property status
        await this.propertyService.updateProperty(this.propertyId, {
          status: 'vacant',
          tenant: null
        } as any);
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      alert('Failed to remove tenant');
    } finally {
      this.deletingTenant = false;
    }
  }

  async deleteProperty(): Promise<void> {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    this.deletingProperty = true;

    try {
      // Delete tenancies first (foreign key constraint)
      await this.supabase.supabase
        .from('tenancies')
        .delete()
        .eq('property_id', this.propertyId);

      // Delete property using service
      await this.propertyService.deleteProperty(this.propertyId);

      // Navigate away (refresh happens automatically in service)
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    } finally {
      this.deletingProperty = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
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
