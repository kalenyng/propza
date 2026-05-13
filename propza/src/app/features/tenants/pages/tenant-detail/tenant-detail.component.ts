import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { TenantService, Tenant } from '../../../../core/services/tenant.service';
import { PropertyService } from '../../../../core/services/property.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { RentHelperService, RentStatus } from '../../../../core/services/rent-helper.service';
import { RentDueService, TenantStatus } from '../../../../core/services/rent-due.service';
import { ConfirmationModalService } from '../../../../core/services/confirmation-modal.service';

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
  property: any = null; // Store property for status calculation
  loading = true;
  editing = false;
  tenantId: string = '';
  saving = false;
  deleting = false;

  /** When set via router `state`, `goBack` returns here (e.g. from property detail). */
  private backUrl: string | null = null;

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
    private location: Location,
    private tenantService: TenantService,
    private propertyService: PropertyService,
    private supabase: SupabaseService,
    private rentHelper: RentHelperService,
    public translate: TranslationService,
    private rentDueService: RentDueService,
    private confirmationService: ConfirmationModalService
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { backUrl?: string } | undefined;
    this.backUrl = state?.backUrl?.trim() ? state.backUrl.trim() : null;
  }

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
              this.property = property;
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
    
    // Update property reference when tenant updates
    const property = this.propertyService.getProperties().find(p => p.id === tenant.property_id);
    if (property) {
      this.property = property;
      this.propertyName = property.name || '';
      this.propertyAddress = property.address || '';
    }
    
    // Fetch payments for this tenant's property
    this.fetchPayments();
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
    
    // Calculate status dynamically using the same logic as property page
    const calculatedStatus = this.getCalculatedStatus();
    const displayStatus = this.mapTenantStatusToRentStatus(calculatedStatus);
    
    return displayStatus.replace('_', ' ').charAt(0).toUpperCase() + 
           displayStatus.replace('_', ' ').slice(1);
  }

  get statusColor(): string {
    if (!this.tenant) return 'gray';
    
    // Calculate status dynamically using the same logic as property page
    const calculatedStatus = this.getCalculatedStatus();
    const displayStatus = this.mapTenantStatusToRentStatus(calculatedStatus);
    
    return this.rentHelper.getStatusColor(displayStatus);
  }

  /**
   * Calculates the current tenant status using RentDueService (same as property page)
   */
  private getCalculatedStatus(): TenantStatus {
    if (!this.tenant) return 'upcoming';
    
    // Use the same calculation method as property page
    return this.rentDueService.getStatusForTenant(
      this.tenant,
      this.payments,
      this.property
    );
  }

  /**
   * Maps TenantStatus from RentDueService to RentStatus for display compatibility.
   */
  private mapTenantStatusToRentStatus(tenantStatus: TenantStatus): RentStatus {
    switch (tenantStatus) {
      case 'vacant':
        return 'vacant';
      case 'paid':
        return 'paid';
      case 'partially_paid':
        return 'partially_paid';
      case 'upcoming':
        return 'upcoming';
      case 'due_soon':
        return 'due_soon';
      case 'due_today':
        return 'due_today';
      case 'overdue':
        return 'overdue';
      default:
        return 'upcoming';
    }
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

    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Tenant',
      message: 'Are you sure you want to delete this tenant? This action cannot be undone.',
      type: 'danger'
    });
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
    if (this.backUrl) {
      void this.router.navigateByUrl(this.backUrl);
      return;
    }
    this.location.back();
  }

  goToProperty(): void {
    if (this.tenant?.property_id) {
      void this.router.navigate(['/property', this.tenant.property_id], {
        state: { backUrl: `/tenant/${this.tenantId}` }
      });
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
