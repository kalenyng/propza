import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { PropertyService } from '../../../../core/services/property.service';
import { RentHelperService } from '../../../../core/services/rent-helper.service';
import { TranslationService } from '../../../../core/services/translation.service';

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
  private destroy$ = new Subject<void>();
  translate = inject(TranslationService);

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
    email: ['', [Validators.email]],
    phone: ['', [Validators.pattern(/^\+27\s?\d{2}\s?\d{3}\s?\d{4}$/)]],
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

      // Determine initial rent status based on whether currently paid
      const initialRentStatus = formValue.currentlyPaid ? 'paid' : 'upcoming';

      // Create tenant record
      const { error: tenantErr } = await this.supabase.supabase.from('tenants').insert({
      name: formValue.name!,
      email: formValue.email || null,
      phone: formValue.phone || null,
      property_id: formValue.propertyId!,
      rent_amount: formValue.rentAmount!,
      rent_status: initialRentStatus,
      rent_due_date: formValue.rentDueDate!,
      lease_start_date: formValue.leaseStartDate!,
      lease_end_date: formValue.leaseEndDate || null,
      deposit_amount: formValue.deposit || 0,
      notes: formValue.notes || null
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
      if (formValue.currentlyPaid) {
        const dueDate = new Date(formValue.rentDueDate!);
        const rentDueDay = dueDate.getDate();
        
        // Calculate the CURRENT rent period (which period this payment covers)
        const currentPeriod = this.rentHelper.getCurrentRentPeriod(rentDueDay);
        
        const { error: paymentErr } = await this.supabase.supabase
          .from('payments')
          .insert({
            property_id: formValue.propertyId!,
            period: currentPeriod,  // Use current rent period, not due date month
            amount: formValue.rentAmount!,
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'initial_payment',
            notes: 'Initial payment - tenant currently paid'
          });

        if (paymentErr) {
          console.error('Error creating payment record:', paymentErr);
          // Continue anyway - tenant was created successfully
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
