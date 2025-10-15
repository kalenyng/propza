import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Tenant, TenantService } from '../../core/tenant.service';
import { SupabaseService } from '../../core/supabase.service';
import { TranslationService } from '../../core/translation.service';

@Component({
  selector: 'app-tenant-details-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenant-details-modal.component.html',
  styleUrl: './tenant-details-modal.component.scss'
})
export class TenantDetailsModalComponent implements OnInit {
  @Input() tenant!: Tenant;
  
  private fb = inject(FormBuilder);
  translate = inject(TranslationService);

  payments: any[] = [];
  loading = true;
  editing = false;
  saving = false;
  deleting = false;
  
  editForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.email]],
    phone: ['', [Validators.pattern(/^\+27\s?\d{2}\s?\d{3}\s?\d{4}$/)]],
    rentAmount: [0, [Validators.required, Validators.min(1)]],
    deposit: [0, [Validators.min(0)]],
    rentDueDate: ['', Validators.required],
    leaseStartDate: ['', Validators.required],
    leaseEndDate: [''],
    notes: ['']
  });

  constructor(
    public activeModal: NgbActiveModal,
    private supabase: SupabaseService,
    private tenantService: TenantService
  ) {}

  get formattedRent(): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(this.tenant.rent_amount);
  }

  get formattedLeaseStart(): string {
    if (!this.tenant.lease_start_date) return 'No start date';
    return new Date(this.tenant.lease_start_date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  get formattedLeaseEnd(): string {
    if (!this.tenant.lease_end_date) return 'No end date';
    return new Date(this.tenant.lease_end_date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  get statusColor(): string {
    switch (this.tenant.rent_status) {
      case 'paid': return 'green';
      case 'upcoming': return 'green';
      case 'overdue': return 'red';
      case 'vacant': return 'gray';
      default: return 'gray';
    }
  }

  get statusLabel(): string {
    switch (this.tenant.rent_status) {
      case 'paid': return 'Paid';
      case 'upcoming': return 'Upcoming';
      case 'overdue': return 'Overdue';
      case 'vacant': return 'Vacant';
      default: return 'Unknown';
    }
  }

  get propertyAddress(): string {
    return this.tenant.properties?.address || 'Unknown Property';
  }

  get formattedRentDueDate(): string {
    return new Date(this.tenant.rent_due_date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadPayments();
    this.initializeForm();
  }

  private initializeForm(): void {
    this.editForm.patchValue({
      name: this.tenant.name,
      email: this.tenant.email || '',
      phone: this.tenant.phone || '',
      rentAmount: this.tenant.rent_amount,
      deposit: this.tenant.deposit_amount || 0,
      rentDueDate: this.tenant.rent_due_date,
      leaseStartDate: this.tenant.lease_start_date || '',
      leaseEndDate: this.tenant.lease_end_date || '',
      notes: this.tenant.notes || ''
    });
  }

  startEdit(): void {
    this.editing = true;
  }

  cancelEdit(): void {
    this.editing = false;
    this.initializeForm(); // Reset form to original values
  }

  async saveEdit(): Promise<void> {
    if (this.editForm.invalid) return;

    this.saving = true;

    const formValue = this.editForm.value;

    try {
      await this.tenantService.updateTenant(this.tenant.id, {
        name: formValue.name!,
        email: formValue.email || null,
        phone: formValue.phone || null,
        rent_amount: formValue.rentAmount!,
        deposit_amount: formValue.deposit || 0,
        rent_due_date: formValue.rentDueDate!,
        lease_start_date: formValue.leaseStartDate || null,
        lease_end_date: formValue.leaseEndDate || null,
        notes: formValue.notes || null
      });

      // Update local tenant data
      this.tenant = {
        ...this.tenant,
        name: formValue.name!,
        email: formValue.email || null,
        phone: formValue.phone || null,
        rent_amount: formValue.rentAmount!,
        deposit_amount: formValue.deposit || 0,
        rent_due_date: formValue.rentDueDate!,
        lease_start_date: formValue.leaseStartDate || null,
        lease_end_date: formValue.leaseEndDate || null,
        notes: formValue.notes || null
      };

      this.editing = false;
    } catch (error) {
      console.error('Error updating tenant:', error);
      alert('Failed to update tenant. Please try again.');
    } finally {
      this.saving = false;
    }
  }

  private async loadPayments(): Promise<void> {
    try {
      this.loading = true;
      const { data, error } = await this.supabase.supabase
        .from('payments')
        .select('*')
        .eq('property_id', this.tenant.property_id)
        .order('payment_date', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading payments:', error);
        this.payments = [];
      } else {
        this.payments = data || [];
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      this.payments = [];
    } finally {
      this.loading = false;
    }
  }

  formatPaymentAmount(amount: number): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatPaymentDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  async deleteTenant(): Promise<void> {
    if (!confirm(`Are you sure you want to delete ${this.tenant.name}? This will mark the property as vacant.`)) {
      return;
    }

    this.deleting = true;

    try {
      await this.tenantService.deleteTenant(this.tenant.id);
      // Close modal and signal success
      this.activeModal.close('deleted');
    } catch (error) {
      console.error('Error deleting tenant:', error);
      alert('Failed to delete tenant. Please try again.');
    } finally {
      this.deleting = false;
    }
  }

  close(): void {
    this.activeModal.dismiss();
  }
}
