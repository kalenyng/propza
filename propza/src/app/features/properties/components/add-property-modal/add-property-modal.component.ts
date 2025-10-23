import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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
  });

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
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    this.leaseFile = input.files?.[0] || undefined;
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
