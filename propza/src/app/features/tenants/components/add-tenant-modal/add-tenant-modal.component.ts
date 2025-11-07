import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { PropertyService } from '../../../../core/services/property.service';
import { RentHelperService } from '../../../../core/services/rent-helper.service';
import { RentDueService } from '../../../../core/services/rent-due.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { SanitizationService } from '../../../../core/services/sanitization.service';

@Component({
  selector: 'app-add-tenant-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-tenant-modal.component.html',
  styleUrl: './add-tenant-modal.component.scss'
})
export class AddTenantModalComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private supabase = inject(SupabaseService);
  private propertyService = inject(PropertyService);
  private rentHelper = inject(RentHelperService);
  private rentDueService = inject(RentDueService);
  private destroy$ = new Subject<void>();
  translate = inject(TranslationService);
  private sanitizer = inject(SanitizationService);

  // Optional email validator: only validates format if a value is provided
  optionalEmailValidator = (control: any) => {
    const value = control.value;
    if (!value || value.trim() === '') {
      return null; // Empty is valid (optional field)
    }
    return Validators.email(control); // Validate format if provided
  };

  // Optional phone validator: only validates format if a value is provided
  optionalPhoneValidator = (control: any) => {
    const value = control.value;
    if (!value || value.trim() === '') {
      return null; // Empty is valid (optional field)
    }
    return Validators.pattern(/^\+27\s?\d{2}\s?\d{3}\s?\d{4}$/)(control); // Validate format if provided
  };

  vacantProperties: Array<{ id: string; name: string; address: string; rent_amount: number }> = [];
  loading = false;
  saving = false;
  selectedFile: File | null = null;

  constructor(
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.propertyService.properties$
      .pipe(takeUntil(this.destroy$))
      .subscribe(properties => {
        this.vacantProperties = properties
          .filter(p => p.status === 'vacant')
          .map(p => ({
            id: p.id,
            name: p.name,
            address: p.address,
            rent_amount: p.rent_amount
          }));
      });

    // Auto-fill rent amount when property is selected
    this.form.get('propertyId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(propertyId => {
        if (propertyId) {
          const selectedProperty = this.vacantProperties.find(p => p.id === propertyId);
          if (selectedProperty && selectedProperty.rent_amount) {
            this.form.patchValue({
              rentAmount: selectedProperty.rent_amount
            });
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [this.optionalEmailValidator]], // Optional: only validate format if provided
    phone: ['', [this.optionalPhoneValidator]], // Optional: only validate format if provided
    propertyId: ['', Validators.required],
    rentAmount: [0, [Validators.required, Validators.min(1)]],
    deposit: [0, [Validators.min(0)]],
    currentlyPaid: [false],
    rentDueDate: [new Date().toISOString().split('T')[0], Validators.required],
    leaseStartDate: [new Date().toISOString().split('T')[0], Validators.required],
    leaseEndDate: [''],
    notes: ['']
  });

  async save(): Promise<void> {
    if (this.form.invalid) return;

    this.saving = true;

    try {
      const formValue = this.form.value;

      // Handle lease file upload if provided
      let leaseUrl: string | null = null;
      if (this.selectedFile) {
        const { data: userData } = await this.supabase.supabase.auth.getUser();
        const userId = userData.user?.id;
        if (userId) {
          const path = `${userId}/${Date.now()}_${this.selectedFile.name}`;
          const upload = await this.supabase.supabase.storage.from('leases').upload(path, this.selectedFile, {
            cacheControl: '3600', 
            upsert: false
          });
          if (!upload.error) {
            const publicUrl = this.supabase.supabase.storage.from('leases').getPublicUrl(path);
            leaseUrl = publicUrl.data.publicUrl;
          }
        }
      }

      // Calculate next due date based on "Currently Paid" checkbox
      // "Currently Paid" means: tenant has paid for the CURRENT period
      // Their NEXT payment is still due on the rent due date entered
      // We use the entered rent due date as-is for both cases
      const nextDueDate = this.rentDueService.toDateOnlyZA(formValue.rentDueDate!);

      // Convert next due date to ISO string for database
      const nextDueDateISO = nextDueDate.toISOString().split('T')[0];

      // Create a temporary tenant object to calculate status
      const tempTenant = {
        id: '',
        name: formValue.name!,
        email: formValue.email || null,
        phone: formValue.phone || null,
        property_id: formValue.propertyId!,
        rent_amount: formValue.rentAmount!,
        rent_status: 'upcoming' as const,
        rent_due_date: nextDueDateISO,
        lease_start_date: formValue.leaseStartDate!,
        lease_end_date: formValue.leaseEndDate || null,
        deposit_amount: formValue.deposit || 0,
        notes: formValue.notes || null,
        created_at: new Date().toISOString()
      };

      // Calculate actual status using RentDueService
      const calculatedStatus = this.rentDueService.getTenantStatus(tempTenant);
      const dbStatus = this.rentDueService.mapToDatabaseStatus(calculatedStatus);

      // Log tenant creation details
      const dueDate = new Date(formValue.rentDueDate!);
      const rentDueDay = dueDate.getDate();
      const currentPeriod = this.rentHelper.getCurrentRentPeriod(rentDueDay);
      
      console.log('🏘️ NEW TENANT ADDED:', {
        name: formValue.name,
        originalRentDueDate: formValue.rentDueDate,
        nextDueDate: nextDueDateISO,
        rentDueDay: rentDueDay,
        selectedRentalPeriod: currentPeriod,
        rentAmount: formValue.rentAmount,
        currentlyPaid: formValue.currentlyPaid,
        calculatedStatus: calculatedStatus,
        dbStatus: dbStatus
      });

      // Create tenant record with calculated status and next due date
      const { error: tenantErr } = await this.supabase.supabase.from('tenants').insert({
      name: this.sanitizer.sanitizeText(formValue.name!),
      email: this.sanitizer.sanitizeEmail(formValue.email || ''),
      phone: this.sanitizer.sanitizePhone(formValue.phone || ''),
      property_id: formValue.propertyId!,
      rent_amount: this.sanitizer.sanitizeNumber(formValue.rentAmount!) || 0,
      rent_status: dbStatus,  // Use calculated status, not hardcoded 'paid'
      rent_due_date: nextDueDateISO,  // Use next due date, not original rentDueDate
      lease_start_date: formValue.leaseStartDate!,
      lease_end_date: formValue.leaseEndDate || null,
      deposit_amount: this.sanitizer.sanitizeNumber(formValue.deposit) || 0,
      notes: this.sanitizer.sanitizeNotes(formValue.notes || '')
    });

      if (tenantErr) {
        console.error('Error creating tenant:', tenantErr);
        this.saving = false;
        alert('Failed to create tenant. Please try again.');
        return;
      }

      // Update property status to 'occupied' and set tenant name
      const { error: propertyErr } = await this.supabase.supabase
        .from('properties')
        .update({
          status: 'occupied',
          tenant: formValue.name,
          lease_url: leaseUrl
        })
        .eq('id', formValue.propertyId);

      if (propertyErr) {
        console.error('Error updating property:', propertyErr);
        this.saving = false;
        alert('Tenant created but failed to update property.');
        return;
      }

      // Create payment record if currently paid
      // The payment covers the CURRENT period (e.g., October)
      // Next due date is set to the entered date (e.g., Nov 1)
      if (formValue.currentlyPaid) {
        const dueDate = new Date(formValue.rentDueDate!);
        const rentDueDay = dueDate.getDate();
        
        // Calculate the CURRENT rent period (which period this payment covers)
        const currentPeriod = this.rentHelper.getCurrentRentPeriod(rentDueDay);
        
        // Check if payment already exists for this property/period
        const { data: existingPayments } = await this.supabase.supabase
          .from('payments')
          .select('id')
          .eq('property_id', formValue.propertyId!)
          .eq('period', currentPeriod);

        if (!existingPayments || existingPayments.length === 0) {
          // Only insert if no payment exists
          const { error: paymentErr } = await this.supabase.supabase
            .from('payments')
            .insert({
              property_id: formValue.propertyId!,
              period: currentPeriod,
              amount: formValue.rentAmount!,
              payment_date: new Date().toISOString().split('T')[0],
              payment_method: 'initial_payment',
              notes: 'Initial payment - tenant currently paid'
            });

          if (paymentErr) {
            console.error('Error creating payment record:', paymentErr);
            // Continue anyway - tenant was created successfully
          }
        } else {
          console.log(`Payment already exists for property ${formValue.propertyId} period ${currentPeriod}, skipping creation`);
        }
      }

      // Refresh both properties and tenants to keep everything in sync
      await this.supabase.refreshAll();

      this.activeModal.close(true);
    } catch (error) {
      console.error('Error saving tenant:', error);
      alert('An error occurred. Please try again.');
    } finally {
      this.saving = false;
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedFile = target.files?.[0] || null;
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

}
