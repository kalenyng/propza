import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { TenantService, Tenant } from '../../../../core/services/tenant.service';
import { PropertyService } from '../../../../core/services/property.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { RentHelperService } from '../../../../core/services/rent-helper.service';

interface Payment {
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

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-detail.component.html',
  styleUrl: './tenant-detail.component.scss'
})
export class TenantDetailComponent implements OnInit, OnDestroy {
  tenant: Tenant | null = null;
  payments: Payment[] = [];
  propertyName: string = '';
  propertyAddress: string = '';
  loading = true;
  editing = false;
  tenantId: string = '';
  saving = false;
  deleting = false;
  
  private destroy$ = new Subject<void>();

  // Edit form fields
  editName: string = '';
  editEmail: string = '';
  editPhone: string = '';
  editRentAmount: number = 0;
  editDeposit: number = 0;
  editRentDueDate: string = '';
  editLeaseStartDate: string = '';
  editLeaseEndDate: string = '';
  editNotes: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenantService: TenantService,
    private propertyService: PropertyService,
    private supabase: SupabaseService,
    private rentHelper: RentHelperService,
    public translate: TranslationService
  ) {}

  ngOnInit(): void {
    this.tenantId = this.route.snapshot.paramMap.get('id') || '';
    
    if (this.tenantId) {
      // Check if we have cached data - if so, show it immediately
      const cachedTenant = this.tenantService.getTenantById(this.tenantId);
      if (cachedTenant) {
        this.loading = false;
      }

      // Subscribe to tenant changes
      this.tenantService.tenants$
        .pipe(takeUntil(this.destroy$))
        .subscribe(tenants => {
          const tenant = tenants.find(t => t.id === this.tenantId);
          if (tenant) {
            this.updateTenantData(tenant);
            this.loading = false; // Hide loading when we get data
          }
        });

      // Subscribe to property changes for property name
      this.propertyService.properties$
        .pipe(takeUntil(this.destroy$))
        .subscribe(properties => {
          if (this.tenant) {
            const property = properties.find(p => p.id === this.tenant!.property_id);
            if (property) {
              this.propertyName = property.name || '';
              this.propertyAddress = property.address || '';
            }
          }
        });

      // Subscribe to payments
      this.propertyService.payments$
        .pipe(takeUntil(this.destroy$))
        .subscribe(payments => {
          if (this.tenant) {
            this.payments = payments.filter(p => p.property_id === this.tenant!.property_id);
          }
        });

      // Don't subscribe to global loading$ - use local loading state only

      // Fetch payments
      this.fetchPayments();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateTenantData(tenant: Tenant): void {
    this.tenant = tenant;
    this.editName = tenant.name;
    this.editEmail = tenant.email || '';
    this.editPhone = tenant.phone || '';
    this.editRentAmount = tenant.rent_amount;
    this.editDeposit = tenant.deposit_amount || 0;
    this.editRentDueDate = tenant.rent_due_date || '';
    this.editLeaseStartDate = tenant.lease_start_date || '';
    this.editLeaseEndDate = tenant.lease_end_date || '';
    this.editNotes = tenant.notes || '';
  }

  private async fetchPayments(): Promise<void> {
    if (!this.tenant) return;

    try {
      const { data, error } = await this.supabase.supabase
        .from('payments')
        .select('*')
        .eq('property_id', this.tenant.property_id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      this.payments = (data || []) as Payment[];
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  }

  get formattedRent(): string {
    if (!this.tenant) return '';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(this.tenant.rent_amount);
  }

  get formattedDeposit(): string {
    if (!this.tenant?.deposit_amount) return 'No deposit';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(this.tenant.deposit_amount);
  }

  get formattedLeaseStart(): string {
    if (!this.tenant?.lease_start_date) return 'No start date';
    return new Date(this.tenant.lease_start_date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  get formattedLeaseEnd(): string {
    if (!this.tenant?.lease_end_date) return 'No end date';
    return new Date(this.tenant.lease_end_date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  get formattedRentDueDate(): string {
    if (!this.tenant?.rent_due_date) return 'Not set';
    return new Date(this.tenant.rent_due_date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  get statusLabel(): string {
    if (!this.tenant) return '';
    return this.tenant.rent_status.replace('_', ' ').charAt(0).toUpperCase() + 
           this.tenant.rent_status.replace('_', ' ').slice(1);
  }

  get statusColor(): string {
    if (!this.tenant) return 'gray';
    return this.rentHelper.getStatusColor(this.tenant.rent_status as any);
  }

  startEdit(): void {
    this.editing = true;
  }

  cancelEdit(): void {
    this.editing = false;
    if (this.tenant) {
      this.updateTenantData(this.tenant);
    }
  }

  async saveChanges(): Promise<void> {
    if (!this.tenant || this.saving) return;

    this.saving = true;
    try {
      await this.tenantService.updateTenant(this.tenantId, {
        name: this.editName,
        email: this.editEmail || null,
        phone: this.editPhone || null,
        rent_amount: this.editRentAmount,
        deposit_amount: this.editDeposit,
        rent_due_date: this.editRentDueDate,
        lease_start_date: this.editLeaseStartDate,
        lease_end_date: this.editLeaseEndDate || null,
        notes: this.editNotes || null
      });

      this.editing = false;
    } catch (error) {
      console.error('Error updating tenant:', error);
    } finally {
      this.saving = false;
    }
  }

  async deleteTenant(): Promise<void> {
    if (!this.tenant || this.deleting) return;

    const confirmed = confirm('Are you sure you want to delete this tenant? This action cannot be undone.');
    if (!confirmed) return;

    this.deleting = true;
    try {
      await this.tenantService.deleteTenant(this.tenantId);
      await this.router.navigate(['/tenants']);
    } catch (error) {
      console.error('Error deleting tenant:', error);
      this.deleting = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/tenants']);
  }

  goToProperty(): void {
    if (this.tenant?.property_id) {
      this.router.navigate(['/property', this.tenant.property_id]);
    }
  }

  formatPaymentDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatPaymentAmount(amount: number): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}
