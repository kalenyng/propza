import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { PropertyService, Property as PropertyData, Payment } from '../../../../core/services/property.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { RentHelperService } from '../../../../core/services/rent-helper.service';
import { RentDueService } from '../../../../core/services/rent-due.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { ConfirmationModalService } from '../../../../core/services/confirmation-modal.service';
import { FormsModule } from '@angular/forms';
import { Tenant } from '../../../../core/services/tenant.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddTenantModalComponent } from '../../../tenants/components/add-tenant-modal/add-tenant-modal.component';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { PropzaModalOptionsService } from '../../../../core/services/propza-modal-options.service';

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
  id?: string;
  name: string | null;
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
  editAddressLine1 = '';
  editAddressLine2 = '';
  editCity = '';
  editPostcode = '';
  editRentAmount: number = 0;
  editTenant: string = '';
  editTenantEmail: string = '';
  editLeaseStartDate: string = '';
  editLeaseEndDate: string = '';
  editRentDueDate: string = '';
  editNotes: string = '';
  editNextPaymentDue: string = '';

  private parseAddressParts(address: string | null | undefined, fallbackLine1: string): {
    line1: string;
    line2: string;
    city: string;
    postcode: string;
  } {
    const raw = (address || '').trim();
    if (!raw) {
      return { line1: fallbackLine1, line2: '', city: '', postcode: '' };
    }
    const parts = raw
      .split(/,|\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    return {
      line1: parts[0] || fallbackLine1,
      line2: parts[1] || '',
      city: parts[2] || '',
      postcode: parts[3] || ''
    };
  }

  private buildFullAddress(): string {
    return [
      (this.editAddressLine1 || '').trim(),
      (this.editAddressLine2 || '').trim(),
      (this.editCity || '').trim(),
      (this.editPostcode || '').trim()
    ].filter(Boolean).join(', ');
  }

  // Payment form fields
  paymentAmount: number = 0;
  paymentDate: string = new Date().toISOString().split('T')[0];
  paymentMethod: string = 'cash';
  paymentNotes: string = '';
  editingPaymentId: string | null = null;

  /** When set via router `state`, `goBack` returns here (e.g. from tenant detail). */
  private backUrl: string | null = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private supabase: SupabaseService,
    private propertyService: PropertyService,
    private tenantService: TenantService,
    private rentHelper: RentHelperService,
    private rentDueService: RentDueService,
    public translate: TranslationService,
    private modalService: NgbModal,
    private confirmationService: ConfirmationModalService,
    private toast: ToastService,
    private modalOptions: PropzaModalOptionsService
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { backUrl?: string } | undefined;
    this.backUrl = state?.backUrl?.trim() ? state.backUrl.trim() : null;
  }

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
      status: prop.status,
      owner_id: prop.owner_id,
      created_at: prop.created_at,
      lease_url: null, // Not in PropertyData interface
      notes: null // Not in PropertyData interface
    };

    // Extract tenant data from nested tenants array
    if (prop.tenants && prop.tenants.length > 0) {
      const tenant = prop.tenants[0];
      // Preserve existing id and contact info if already loaded from loadPropertyDetails
      const existingId = this.tenantData?.id;
      const existingEmail = this.tenantData?.email;
      const existingPhone = this.tenantData?.phone;

      this.tenantData = {
        id: existingId,
        name: tenant.name,
        email: existingEmail || null,
        phone: existingPhone || null,
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
    if (this.property.status === 'occupied' && (this.tenantData?.id || this.tenancy)) {
      return 'Occupied';
    }
    return 'Vacant';
  }

  async loadPropertyDetails(): Promise<void> {
    // Load tenant data with full details (name, email, phone, id)
    if (this.property?.status === 'occupied') {
      const { data: tenant } = await this.supabase.supabase
        .from('tenants')
        .select('id, name, email, phone, lease_start_date, lease_end_date, rent_due_date')
        .eq('property_id', this.propertyId)
        .single();
      
      if (tenant) {
        this.tenantData = tenant;
      } else {
        // No tenant found in database, clear tenant data
        this.tenantData = null;
      }
    } else {
      // Property is vacant, clear tenant data
      this.tenantData = null;
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

  /**
   * Recalculates tenant status using the centralized RentDueService.
   * This ensures consistent status calculation across the app.
   * Also advances the rent_due_date if the current due period is fully paid.
   * Called after payment create/update/delete operations.
   */
  private async recalculateTenantStatusFromPayments(): Promise<void> {
    // Only proceed if we have tenant data
    if (!this.tenantData || !this.tenantData.id || !this.propertyId) {
      return;
    }

    try {
      // Wait for payment service to refresh after database operation
      await new Promise(resolve => setTimeout(resolve, 150));

      const tenant = this.tenantService.getTenantById(this.tenantData.id);
      if (!tenant) {
        return;
      }

      // Get all payments for this property
      const allPayments = this.propertyService.getPayments();

      // Find the next unpaid period and set due date accordingly
      // This handles both adding payments (advancing) and deleting payments (reverting)
      let newDueDate: string | undefined = undefined;
      if (tenant.rent_due_date) {
        // Start from today and check forward for the first unpaid period
        const today = this.rentDueService.getTodayZA();
        const currentPeriod = this.rentDueService.getCurrentPeriod();
        let checkDate = this.rentDueService.toDateOnlyZA(currentPeriod + '-01');
        let foundUnpaidPeriod = false;
        
        // Check up to 12 months ahead to find first unpaid period
        for (let i = 0; i < 12; i++) {
          const checkPeriod = `${checkDate.getUTCFullYear()}-${String(checkDate.getUTCMonth() + 1).padStart(2, '0')}`;
          
          // Calculate collected amount for this period
          const collectedForPeriod = allPayments
            .filter(p => p.property_id === tenant.property_id && p.period === checkPeriod)
            .reduce((sum, p) => sum + Number(p.amount || 0), 0);
          
          // If this period is not fully paid, this is the next due date
          if (collectedForPeriod < tenant.rent_amount) {
            // Set due date to the rent_due_day of this month
            const rentDueDay = new Date(tenant.rent_due_date).getUTCDate();
            checkDate.setUTCDate(rentDueDay);
            newDueDate = checkDate.toISOString().split('T')[0];
            foundUnpaidPeriod = true;
            break;
          }
          
          // Move to next month
          checkDate = this.rentDueService.safeAddMonths(checkDate, 1);
        }
        
        // If all checked periods are paid, set due date 12 months from now
        if (!foundUnpaidPeriod) {
          const futureDate = this.rentDueService.safeAddMonths(checkDate, 1);
          const rentDueDay = new Date(tenant.rent_due_date).getUTCDate();
          futureDate.setUTCDate(rentDueDay);
          newDueDate = futureDate.toISOString().split('T')[0];
        }
      }

      // Use centralized service to calculate status (monthly billing)
      const calculatedStatus = this.rentDueService.getStatusForTenant(
        tenant,
        allPayments,
        this.property || undefined
      );

      // Map to database-compatible status
      const dbStatus = this.rentDueService.mapToDatabaseStatus(calculatedStatus);

      // Update tenant if status or due date changed
      const needsUpdate = tenant.rent_status !== dbStatus || (newDueDate && newDueDate !== tenant.rent_due_date);
      
      if (needsUpdate) {
        const updates: any = {};
        if (tenant.rent_status !== dbStatus) {
          updates.rent_status = dbStatus;
        }
        if (newDueDate && newDueDate !== tenant.rent_due_date) {
          updates.rent_due_date = newDueDate;
        }
        await this.tenantService.updateTenant(tenant.id, updates);
        
        // Also reload properties to ensure property detail view gets updated tenant data
        await this.propertyService.loadProperties();
      }
    } catch (error) {
      console.error('Error recalculating tenant status:', error);
      // Don't throw - this is a side effect, shouldn't fail the main operation
    }
  }

  async deletePayment(paymentId: string): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Payment',
      message: 'Are you sure you want to delete this payment record?',
      type: 'danger'
    });
    if (!confirmed) {
      return;
    }

    try {
      await this.propertyService.deletePayment(paymentId);
      
      // Recalculate tenant status after deletion
      await this.recalculateTenantStatusFromPayments();
    } catch (error) {
      this.toast.error('Could not delete payment', 'Please try again.');
    }
  }

  async savePayment(): Promise<void> {
    if (!this.property || this.paymentAmount <= 0) {
      this.toast.warning('Invalid amount', 'Enter a payment amount greater than zero.');
      return;
    }

    this.savingPayment = true;

    try {
      // Calculate the current rent period using centralized service
      if (!this.tenantData?.rent_due_date) {
        this.toast.warning('Rent due date required', 'Set the tenant rent due date before logging a payment.');
        return;
      }

      // Create a tenant object for the service (we need full tenant record)
      if (!this.tenantData.id) {
        this.toast.warning('Tenant ID missing', 'Cannot create payment without a tenant record.');
        return;
      }
      const tenant = this.tenantService.getTenantById(this.tenantData.id);
      if (!tenant) {
        this.toast.warning('Tenant not found', 'Refresh the page and try again.');
        return;
      }

      // Get current rent period (YYYY-MM format, monthly billing)
      let period = this.rentDueService.getCurrentPeriod();
      let paymentAttempts = 0;
      const maxAttempts = 12; // Limit to 12 months to avoid infinite loops

      if (this.editingPaymentId) {
        // Update existing payment using service
        await this.propertyService.updatePayment(this.editingPaymentId, {
          amount: this.paymentAmount,
          payment_date: this.paymentDate,
          payment_method: this.paymentMethod,
          notes: this.paymentNotes || null
        } as any);
      } else {
        // Create new payment - automatically use next period if current already has a payment
        while (paymentAttempts < maxAttempts) {
          try {
            await this.propertyService.addPayment({
              property_id: this.propertyId,
              period: period,
              amount: this.paymentAmount,
              payment_date: this.paymentDate,
              payment_method: this.paymentMethod,
              notes: this.paymentNotes || null
            } as any);
            // Success - break out of retry loop
            break;
          } catch (error: any) {
            // Check if it's a duplicate payment error for this period
            if (error?.code === '23505' && paymentAttempts < maxAttempts - 1) {
              // Duplicate payment - move to next period automatically
              const year = parseInt(period.split('-')[0]);
              const month = parseInt(period.split('-')[1]) - 1; // JS months are 0-indexed
              const periodDate = new Date(Date.UTC(year, month, 1));
              const nextPeriodDate = this.rentDueService.safeAddMonths(periodDate, 1);
              const nextYear = nextPeriodDate.getUTCFullYear();
              const nextMonth = String(nextPeriodDate.getUTCMonth() + 1).padStart(2, '0');
              period = `${nextYear}-${nextMonth}`;
              paymentAttempts++;
              // Continue to retry with next period
            } else {
              // Different error or max attempts reached - rethrow
              throw error;
            }
          }
        }
      }

      // Always recalculate tenant status after any payment change
      await this.recalculateTenantStatusFromPayments();

      this.showPaymentForm = false;
      this.editingPaymentId = null;
      // Service automatically refreshes, observable will update payments array
    } catch (error) {
      // Extract error message from various error formats (Supabase, Error, etc.)
      let errorMessage = 'Unknown error when logging a payment';
      const errorCode = (error as any)?.code;
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        // Supabase error format
        if ((error as any).message) {
          errorMessage = (error as any).message;
        } else if ((error as any).error?.message) {
          errorMessage = (error as any).error.message;
        } else if ((error as any).details) {
          errorMessage = (error as any).details;
        } else if ((error as any).hint) {
          errorMessage = (error as any).hint;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      if (errorCode === '42P01') {
        this.toast.error('Payments table missing', 'Run the database migration, then try again.');
      } else if (errorCode === '23503') {
        // Foreign key violation
        this.toast.error('Invalid reference', 'Property or tenant link is invalid.');
      } else if (errorMessage.includes('NavigatorLockAcquireTimeoutError')) {
        this.toast.warning('Session busy', 'Please try again in a moment.');
      } else if (errorMessage.includes('JWT') || errorMessage.includes('token')) {
        this.toast.error('Session error', 'Refresh the page and sign in again.');
      } else {
        this.toast.error('Payment not saved', errorMessage);
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
    const parts = this.parseAddressParts(this.property.address, this.property.name);
    this.editAddressLine1 = parts.line1;
    this.editAddressLine2 = parts.line2;
    this.editCity = parts.city;
    this.editPostcode = parts.postcode;
    this.editRentAmount = this.property.rent_amount;
    this.editTenant = this.tenantData?.name || '';
    this.editNotes = this.property.notes || '';

    // Load tenant data if exists
    if (this.property.status === 'occupied') {
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
      const propertyName = (this.editAddressLine1 || '').trim();
      const fullAddress = this.buildFullAddress();

      // Update basic property info using service
      await this.propertyService.updateProperty(this.propertyId, {
        name: propertyName,
        address: fullAddress || propertyName,
        rent_amount: this.editRentAmount,
        status: hasTenant ? 'occupied' : 'vacant'
      });

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
          this.toast.warning('Missing tenant dates', 'Fill in lease start and rent due date.');
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
      this.toast.error('Save failed', 'Please try again.');
    } finally {
      this.saving = false;
    }
  }

  async deleteTenant(): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Remove Tenant',
      message: 'Are you sure you want to remove this tenant? The property will be marked as vacant.',
      type: 'danger'
    });
    if (!confirmed) {
      return;
    }

    this.deletingTenant = true;

    try {
      // Find the tenant record for this property
      const tenants = this.tenantService.getTenants().filter(t => t.property_id === this.propertyId);
      
      if (tenants.length > 0) {
        await this.tenantService.deleteTenant(tenants[0].id);
        // Service automatically refreshes all data
      }
      
      // Delete all legacy tenancy records for this property
      await this.supabase.supabase
        .from('tenancies')
        .delete()
        .eq('property_id', this.propertyId);
      
      // Always update property status to vacant
      await this.propertyService.updateProperty(this.propertyId, {
        status: 'vacant'
      });
      
      // Clear tenant data and tenancy locally
      this.tenantData = null;
      this.tenancy = null;
      
      // Reload property details to ensure UI updates
      await this.loadPropertyDetails();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      this.toast.error('Could not remove tenant', 'Please try again.');
    } finally {
      this.deletingTenant = false;
    }
  }

  async deleteProperty(): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Property',
      message: 'Are you sure you want to delete this property? This action cannot be undone.',
      type: 'danger'
    });
    if (!confirmed) {
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
      this.router.navigate(['/properties']);
    } catch (error) {
      console.error('Error deleting property:', error);
      this.toast.error('Could not delete property', 'Please try again.');
    } finally {
      this.deletingProperty = false;
    }
  }

  goBack(): void {
    if (this.backUrl) {
      void this.router.navigateByUrl(this.backUrl);
      return;
    }
    this.location.back();
  }

  goToTenant(): void {
    if (this.tenantData?.id) {
      void this.router.navigate(['/tenant', this.tenantData.id], {
        state: { backUrl: `/property/${this.propertyId}` }
      });
    }
  }

  async openAddTenantModal(): Promise<void> {
    const modalRef = this.modalService.open(AddTenantModalComponent, this.modalOptions.createEntityFlow());

    // Pre-select the current property if it's vacant
    // Use setTimeout to allow the modal component to initialize and populate vacantProperties
    setTimeout(() => {
      const propertyId = this.propertyId;
      const vacantProperties = modalRef.componentInstance.vacantProperties;
      
      // Only pre-select if the property is in the vacant properties list
      if (vacantProperties && vacantProperties.some((p: { id: string }) => p.id === propertyId)) {
        modalRef.componentInstance.form.patchValue({
          propertyId: propertyId
        });
      }
    }, 100);

    try {
      const result = await modalRef.result;
      // Modal was closed successfully, property will be refreshed automatically
      await this.loadPropertyDetails();
    } catch (error) {
      // Modal dismissed or error occurred, no action needed
      console.error('Error adding tenant:', error);
    }
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

  /**
   * Check if lease is ending within 3 months
   */
  isLeaseEndingSoon(leaseEndDate: string): boolean {
    if (!leaseEndDate) return false;
    
    const today = new Date();
    const endDate = new Date(leaseEndDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    
    return endDate <= threeMonthsFromNow && endDate >= today;
  }

  /**
   * Calculate total rent collected for this property
   */
  get totalRentCollected(): number {
    if (!this.payments || this.payments.length === 0) return 0;
    
    return this.payments.reduce((total, payment) => {
      return total + (Number(payment.amount) || 0);
    }, 0);
  }

  /**
   * Get formatted total rent collected
   */
  get formattedTotalCollected(): string {
    if (!this.property) return 'R0';
    return this.formatMoney(this.totalRentCollected, this.property.currency);
  }

  /**
   * Get tenant status for display
   */
  get tenantStatus(): string | null {
    if (!this.tenantData?.id) return null;
    const tenant = this.tenantService.getTenantById(this.tenantData.id);
    if (!tenant) return null;
    
    // Use centralized service to calculate status
    const calculatedStatus = this.rentDueService.getStatusForTenant(
      tenant,
      this.propertyService.getPayments(),
      this.property || undefined
    );
    
    return calculatedStatus;
  }

  /**
   * Get status label for display
   */
  get statusLabel(): string {
    const status = this.tenantStatus;
    if (!status) return '';
    
    // Map status to user-friendly label
    const statusMap: Record<string, string> = {
      'paid': 'Paid',
      'partially_paid': 'Partially Paid',
      'due_soon': 'Due Soon',
      'due_today': 'Due Today',
      'overdue': 'Overdue',
      'upcoming': 'Upcoming',
      'vacant': 'Vacant'
    };
    
    return statusMap[status] || status;
  }

  /**
   * Get status color class for styling
   */
  get statusColor(): string {
    const status = this.tenantStatus;
    if (!status) return 'neutral';
    
    // Map status to color class
    const colorMap: Record<string, string> = {
      'paid': 'success',
      'partially_paid': 'warning',
      'due_soon': 'warning-light',
      'due_today': 'warning',
      'overdue': 'danger',
      'upcoming': 'info',
      'vacant': 'neutral'
    };
    
    return colorMap[status] || 'neutral';
  }

  /** Label for the header status-pill (rent status, or Occupied / Vacant). */
  get propertyStatusPillLabel(): string {
    return this.statusLabel || this.displayStatus;
  }

  /** `data-color` for the header status-pill. */
  get propertyStatusPillColor(): string {
    if (this.displayStatus === 'Vacant') return 'neutral';
    return this.statusColor;
  }

}
