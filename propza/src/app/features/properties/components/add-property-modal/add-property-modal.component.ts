import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { RentHelperService } from '../../../../core/services/rent-helper.service';
import { SanitizationService } from '../../../../core/services/sanitization.service';

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
  private sanitizer = inject(SanitizationService);

  loading = false;
  leaseFile?: File;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
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
        tenantEmail?.addValidators([Validators.email]);
        tenantPhone?.addValidators([Validators.required]);
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
          name: this.sanitizer.sanitizeText(v.name || ''),
          rent_amount: this.sanitizer.sanitizeNumber(v.rent_amount) || 0,
          status: occupied ? 'occupied' : 'vacant',
          lease_url: lease_url || null,
          currency: 'ZAR', // ensure non-null text
          address: this.sanitizer.sanitizeAddress(v.name || 'No address'),
          tenant: occupied ? this.sanitizer.sanitizeText(v.tenant || '') : null,
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
        alert('Please fill in all tenancy details before saving an occupied property.');
        this.loading = false;
        return;
      }

      // Calculate rent_due_day from next_payment_due
      const nextDueDate = new Date(v.next_payment_due);
      const rentDueDay = nextDueDate.getDate();

      const { error: tenancyErr } = await this.supa.supabase.from('tenancies').insert({
        property_id: prop.id,
        start_date: v.tenancy_start,
        rent_due_day: rentDueDay,
        end_date: v.tenancy_end || null
      });

      if (tenancyErr) {
        console.error('Tenancy insert error:', tenancyErr);
        alert(`Property created but tenancy failed: ${tenancyErr.message}`);
        await this.supa.refreshAll(); // Refresh to show the property that was created
        this.loading = false;
        this.activeModal.close(true);
        return;
      }

      // 4) Insert tenant record in tenants table
      const { error: tenantErr } = await this.supa.supabase.from('tenants').insert({
        name: this.sanitizer.sanitizeText(v.tenant || ''),
        email: this.sanitizer.sanitizeEmail(v.tenant_email || ''),
        phone: this.sanitizer.sanitizePhone(v.tenant_phone || ''),
        property_id: prop.id,
        rent_amount: this.sanitizer.sanitizeNumber(v.rent_amount) || 0,
        rent_status: 'upcoming', // Default status for new tenants
        rent_due_date: v.next_payment_due,
        lease_start_date: v.tenancy_start,
        lease_end_date: v.tenancy_end || null,
        deposit_amount: this.sanitizer.sanitizeNumber(v.deposit) || 0,
        notes: this.sanitizer.sanitizeNotes(v.tenant_notes || '')
      });

      if (tenantErr) {
        console.error('Tenant insert error:', tenantErr);
        alert(`Property and tenancy created but tenant record failed: ${tenantErr.message}`);
        await this.supa.refreshAll(); // Refresh to show what was created
        this.loading = false;
        this.activeModal.close(true);
        return;
      }

      // 5) Create payment record if "currently paid" is checked
      if (v.currentlyPaid) {
        const rentDueDay = new Date(v.next_payment_due!).getDate();
        const period = this.rentHelper.getCurrentRentPeriod(rentDueDay);
        
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
          alert(`Property, tenancy, and tenant created but payment record failed: ${paymentErr.message}`);
        }
      }
    }

    // Refresh all data to keep everything in sync
    await this.supa.refreshAll();

    this.loading = false;
    this.activeModal.close(true); // signal success
  }
}
