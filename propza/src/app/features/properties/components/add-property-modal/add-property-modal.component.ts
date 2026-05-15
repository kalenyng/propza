import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { RentHelperService } from '../../../../core/services/rent-helper.service';
import { RentDueService } from '../../../../core/services/rent-due.service';
import { SanitizationService } from '../../../../core/services/sanitization.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-add-property-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-property-modal.component.html',
  styleUrls: ['./add-property-modal.component.scss']
})
export class AddPropertyModalComponent {
  private fb = inject(FormBuilder);
  private supa = inject(SupabaseService);
  activeModal = inject(NgbActiveModal);
  translate = inject(TranslationService);
  private rentHelper = inject(RentHelperService);
  private rentDueService = inject(RentDueService);
  private sanitizer = inject(SanitizationService);
  private toast = inject(ToastService);

  // Optional email validator: only validates format if a value is provided
  optionalEmailValidator = (control: any) => {
    const value = control.value;
    if (!value || value.trim() === '') {
      return null; // Empty is valid (optional field)
    }
    return Validators.email(control); // Validate format if provided
  };

  loading = false;
  leaseFile?: File;

  form = this.fb.group({
    property_name: ['', [Validators.maxLength(120)]],
    address_line1: ['', [Validators.required, Validators.maxLength(120)]],
    address_line2: ['', [Validators.maxLength(120)]],
    address_city: ['', [Validators.required, Validators.maxLength(80)]],
    address_postcode: ['', [Validators.maxLength(16)]],
    rent_amount: [null as number | null, [Validators.required, Validators.min(0)]],
    occupied: [false, [Validators.required]],
    tenant: [''],
    tenant_email: [''],
    tenant_phone: [''],
    deposit: [0],
    currentlyPaid: [false],
    tenancy_start: [null as string | null],
    next_payment_due: [null as string | null],
    tenancy_end: [null as string | null],
    tenant_notes: [''],
  }, { validators: this.nextPaymentAfterStartValidator });

  /**
   * Custom validator to ensure next payment date is after lease start date
   */
  nextPaymentAfterStartValidator(control: AbstractControl): ValidationErrors | null {
    const start = control.get('tenancy_start')?.value;
    const nextPayment = control.get('next_payment_due')?.value;
    const occupied = control.get('occupied')?.value;

    // Only validate if property is occupied and both dates are filled
    if (!occupied || !start || !nextPayment) {
      return null;
    }

    const startDate = new Date(start);
    const nextPaymentDate = new Date(nextPayment);

    if (nextPaymentDate < startDate) {
      // Set the error on the next_payment_due control
      control.get('next_payment_due')?.setErrors({ invalidNextPaymentDate: true });
      return { invalidNextPaymentDate: true };
    }

    // Clear the error if dates are valid
    const nextPaymentControl = control.get('next_payment_due');
    if (nextPaymentControl?.hasError('invalidNextPaymentDate')) {
      const errors = { ...nextPaymentControl.errors };
      delete errors['invalidNextPaymentDate'];
      nextPaymentControl.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
  }

  constructor() {
    this.form.get('occupied')?.valueChanges.subscribe((occupied) => {
      const tenant = this.form.get('tenant');
      const tenantEmail = this.form.get('tenant_email');
      const tenantPhone = this.form.get('tenant_phone');
      const start = this.form.get('tenancy_start');
      const nextDue = this.form.get('next_payment_due');
      const end = this.form.get('tenancy_end');

      if (occupied) {
        tenant?.addValidators([Validators.required]);
        tenantEmail?.addValidators([this.optionalEmailValidator]); // Optional: only validate format if provided
        tenantPhone?.clearValidators(); // Phone is optional
        start?.addValidators([Validators.required]);
        nextDue?.addValidators([Validators.required]);
        end?.clearValidators(); // make end optional
      } else {
        tenant?.clearValidators();
        tenantEmail?.clearValidators();
        tenantPhone?.clearValidators();
        start?.clearValidators();
        nextDue?.clearValidators();
        end?.clearValidators();
      }

      tenant?.updateValueAndValidity();
      tenantEmail?.updateValueAndValidity();
      tenantPhone?.updateValueAndValidity();
      start?.updateValueAndValidity();
      nextDue?.updateValueAndValidity();
      end?.updateValueAndValidity();
    });

    // Re-validate dates when either date changes
    this.form.get('tenancy_start')?.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity();
    });

    this.form.get('next_payment_due')?.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity();
    });
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    this.leaseFile = input.files?.[0] || undefined;
  }

  /**
   * Open calendar picker when clicking the icon
   */
  openDatePicker(controlName: string): void {
    // Find the hidden date input
    const hiddenDateInputs = Array.from(document.querySelectorAll<HTMLInputElement>('.hidden-date-picker'));
    const targetInput = hiddenDateInputs.find((input) => {
      return input.getAttribute('formControlName') === controlName;
    });
    
    if (!targetInput) {
      return;
    }

    // Trigger the picker
    this.triggerDatePicker(targetInput);
    
    // Listen for changes and update the visible text input
    this.setupDateChangeListener(targetInput, controlName);
  }

  private triggerDatePicker(input: HTMLInputElement): void {
    try {
      // Try the modern showPicker API first
      if ('showPicker' in input && typeof (input as any).showPicker === 'function') {
        (input as any).showPicker();
      } else {
        input.click();
      }
    } catch (e) {
      input.click();
    }
  }

  private setupDateChangeListener(hiddenInput: HTMLInputElement, controlName: string): void {
    const handler = () => {
      const isoDate = hiddenInput.value;
      if (isoDate) {
        const textInput = document.getElementById(controlName) as HTMLInputElement | null;
        if (textInput) {
          textInput.value = this.convertToDisplay(isoDate);
        }
      }
    };
    
    hiddenInput.addEventListener('change', handler, { once: true });
  }

  /**
   * Handle manual date input in dd/mm/yyyy format
   */
  onDateInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Auto-format as user types: add slashes automatically
    value = this.formatDateInput(value);
    input.value = value;
    
    // If user typed a complete date in dd/mm/yyyy format, convert to YYYY-MM-DD and set in form
    if (value.length === 10) {
      const isoDate = this.convertToISO(value);
      if (isoDate) {
        this.form.get(controlName)?.setValue(isoDate, { emitEvent: false });
      }
    }
  }

  /**
   * Handle Enter key press to finalize date entry
   */
  onDateKeydown(event: KeyboardEvent, controlName: string): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      const value = input.value;
      
      // If complete date, validate and set it
      if (value.length === 10) {
        const isoDate = this.convertToISO(value);
        if (isoDate) {
          this.form.get(controlName)?.setValue(isoDate, { emitEvent: true });
          this.form.get(controlName)?.markAsTouched();
          input.blur(); // Remove focus to trigger validation display
        }
      }
    }
  }

  /**
   * Format input as dd/mm/yyyy with auto-slashes
   */
  private formatDateInput(value: string): string {
    // Remove any non-numeric characters except slashes
    const digitsOnly = value.replace(/[^\d]/g, '');
    
    // Add slashes at appropriate positions
    let formatted = '';
    for (let i = 0; i < Math.min(digitsOnly.length, 8); i++) {
      if (i === 2 || i === 4) {
        formatted += '/';
      }
      formatted += digitsOnly[i];
    }
    
    return formatted;
  }

  /**
   * Convert dd/mm/yyyy to YYYY-MM-DD
   */
  private convertToISO(ddmmyyyy: string): string | null {
    const parts = ddmmyyyy.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    // Validate ranges
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) {
      return null;
    }
    
    // Create date and validate it's real (handles Feb 30, etc.)
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return null;
    }
    
    // Return in YYYY-MM-DD format
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  /**
   * Convert YYYY-MM-DD to dd/mm/yyyy for display
   */
  private convertToDisplay(isoDate: string): string {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  /**
   * Load display value when form is initialized
   */
  loadDisplayDate(controlName: string): string {
    const value = this.form.get(controlName)?.value;
    return value ? this.convertToDisplay(value) : '';
  }

  async save() {
    if (this.form.invalid) return;
    this.loading = true;

    const { data: userData } = await this.supa.supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) { this.loading = false; return; }

    const v = this.form.value;
    const occupied = !!v.occupied;
    const optionalPropertyName = this.sanitizer.sanitizeText((v.property_name || '').trim());
    const fullAddress = [
      this.sanitizer.sanitizeText(v.address_line1 || ''),
      this.sanitizer.sanitizeText(v.address_line2 || ''),
      this.sanitizer.sanitizeText(v.address_city || ''),
      this.sanitizer.sanitizeText(v.address_postcode || ''),
    ].filter((x) => !!x && x.trim().length > 0).join(', ');
    const addressLine1 = this.sanitizer.sanitizeText(v.address_line1 || '');

    // 1) Upload lease if occupied + file provided (to storage bucket "leases")
    let lease_url: string | null = null;
    if (occupied && this.leaseFile) {
      const path = `${userId}/${Date.now()}_${this.leaseFile.name}`;
      const up = await this.supa.supabase.storage.from('leases').upload(path, this.leaseFile, {
        cacheControl: '3600', upsert: false
      });
      if (up.error) { this.loading = false; return; }
      // get a public URL (make bucket public or use signed URL later)
      const pub = this.supa.supabase.storage.from('leases').getPublicUrl(path);
      lease_url = pub.data.publicUrl;
    }

    // 2) Insert property
    const { data: prop, error: propErr } = await this.supa.supabase
      .from('properties')
      .insert([
        {
          owner_id: userId,
          name: optionalPropertyName,
          rent_amount: this.sanitizer.sanitizeNumber(v.rent_amount) || 0,
          status: occupied ? 'occupied' : 'vacant',
          lease_url: lease_url || null,
          currency: 'ZAR', // ensure non-null text
          address: this.sanitizer.sanitizeAddress(fullAddress || addressLine1),
        }
      ])
      .select()
      .single();

    if (propErr) {
      console.error('Supabase insert error:', propErr.message, propErr.details, propErr.hint);
      this.loading = false;
      return;
    }

    // 3) Insert tenancy only if occupied
    if (occupied) {
      if (!v.tenant?.trim() || !v.tenancy_start || !v.next_payment_due) {
        this.toast.warning(
          'Missing tenancy details',
          'Fill in tenant name, lease start, and next payment due for an occupied property.'
        );
        this.loading = false;
        return;
      }

      // Calculate rent_due_day from next_payment_due
      const tenancyDueDate = new Date(v.next_payment_due);
      const tenancyRentDueDay = tenancyDueDate.getDate();

      const { error: tenancyErr } = await this.supa.supabase.from('tenancies').insert({
        property_id: prop.id,
        start_date: v.tenancy_start,
        rent_due_day: tenancyRentDueDay,
        end_date: v.tenancy_end || null
      });

      if (tenancyErr) {
        console.error('Tenancy insert error:', tenancyErr);
        this.toast.error('Property saved, tenancy failed', tenancyErr.message);
        this.supa.triggerRefreshAll(); // Refresh to show the property that was created
        this.loading = false;
        this.activeModal.close(true);
        return;
      }

      // 4) Insert tenant record in tenants table
      // "Currently Paid" means: tenant has paid for the CURRENT period
      // Their NEXT payment is still due on the entered date
      // We use the entered next payment due date as-is for both cases
      const nextDueDate = this.rentDueService.toDateOnlyZA(v.next_payment_due!);

      // Convert next due date to ISO string for database
      const nextDueDateISO = nextDueDate.toISOString().split('T')[0];

      // Create a temporary tenant object to calculate status
      const tempTenant = {
        id: '',
        name: v.tenant!,
        email: v.tenant_email || null,
        phone: v.tenant_phone || null,
        property_id: prop.id,
        rent_amount: v.rent_amount!,
        rent_status: 'upcoming' as const,
        rent_due_date: nextDueDateISO,
        lease_start_date: v.tenancy_start!,
        lease_end_date: v.tenancy_end || null,
        deposit_amount: v.deposit || 0,
        notes: v.tenant_notes || null,
        created_at: new Date().toISOString()
      };

      // Calculate actual status using RentDueService
      const calculatedStatus = this.rentDueService.getTenantStatus(tempTenant);
      const dbStatus = this.rentDueService.mapToDatabaseStatus(calculatedStatus);

      // Log tenant creation details
      const logRentDueDay = new Date(v.next_payment_due!).getDate();
      const period = this.rentHelper.getCurrentRentPeriod(logRentDueDay);
      
      console.log('🏡 NEW PROPERTY WITH TENANT ADDED:', {
        propertyName: optionalPropertyName || fullAddress,
        tenantName: v.tenant,
        originalNextPaymentDue: v.next_payment_due,
        nextDueDate: nextDueDateISO,
        rentDueDay: logRentDueDay,
        selectedRentalPeriod: period,
        rentAmount: v.rent_amount,
        currentlyPaid: v.currentlyPaid,
        calculatedStatus: calculatedStatus,
        dbStatus: dbStatus
      });
      
      const { error: tenantErr } = await this.supa.supabase.from('tenants').insert({
        name: this.sanitizer.sanitizeText(v.tenant || ''),
        email: this.sanitizer.sanitizeEmail(v.tenant_email || ''),
        phone: this.sanitizer.sanitizePhone(v.tenant_phone || ''),
        property_id: prop.id,
        rent_amount: this.sanitizer.sanitizeNumber(v.rent_amount) || 0,
        rent_status: dbStatus,  // Use calculated status, not hardcoded 'upcoming'
        rent_due_date: nextDueDateISO,  // Use next due date, not original next_payment_due
        lease_start_date: v.tenancy_start,
        lease_end_date: v.tenancy_end || null,
        deposit_amount: this.sanitizer.sanitizeNumber(v.deposit) || 0,
        notes: this.sanitizer.sanitizeNotes(v.tenant_notes || '')
      });

      if (tenantErr) {
        console.error('Tenant insert error:', tenantErr);
        this.toast.error('Tenant record failed', tenantErr.message);
        this.supa.triggerRefreshAll(); // Refresh to show what was created
        this.loading = false;
        this.activeModal.close(true);
        return;
      }

      // 5) Create payment record if "currently paid" is checked
      // The payment covers the CURRENT period (e.g., October)
      // Next due date is set to the entered date (e.g., Nov 1)
      if (v.currentlyPaid) {
        const rentDueDay = new Date(v.next_payment_due!).getDate();
        const period = this.rentHelper.getCurrentRentPeriod(rentDueDay);
        
        // Check if payment already exists for this property/period
        const { data: existingPayments } = await this.supa.supabase
          .from('payments')
          .select('id')
          .eq('property_id', prop.id)
          .eq('period', period);

        if (!existingPayments || existingPayments.length === 0) {
          // Only insert if no payment exists
          const { error: paymentErr } = await this.supa.supabase.from('payments').insert({
            property_id: prop.id,
            period: period,
            amount: Number(v.rent_amount),
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'cash',
            notes: 'Initial payment - tenant currently paid'
          });

          if (paymentErr) {
            console.error('Payment insert error:', paymentErr);
            this.toast.warning('Payment not recorded', paymentErr.message);
          }
        } else {
          console.log(`Payment already exists for property ${prop.id} period ${period}, skipping creation`);
        }
      }
    }

    // Refresh all data to keep everything in sync
    this.supa.triggerRefreshAll();

    this.loading = false;
    this.activeModal.close(true); // signal success
  }
}
