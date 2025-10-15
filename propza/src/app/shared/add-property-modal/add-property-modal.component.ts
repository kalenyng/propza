import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SupabaseService } from '../../core/supabase.service';
import { TranslationService } from '../../core/translation.service';

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

  loading = false;
  leaseFile?: File;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    rent_amount: [null as number | null, [Validators.required, Validators.min(0)]],
    occupied: [false, [Validators.required]],
    tenant: [''],
    tenant_email: [''],
    tenancy_start: [null as string | null],
    next_payment_due: [null as string | null],
    tenancy_end: [null as string | null],
  });

  constructor() {
    this.form.get('occupied')?.valueChanges.subscribe((occupied) => {
      const tenant = this.form.get('tenant');
      const tenantEmail = this.form.get('tenant_email');
      const start = this.form.get('tenancy_start');
      const nextDue = this.form.get('next_payment_due');
      const end = this.form.get('tenancy_end');

      if (occupied) {
        tenant?.addValidators([Validators.required]);
        tenantEmail?.addValidators([Validators.email]);
        start?.addValidators([Validators.required]);
        nextDue?.addValidators([Validators.required]);
        end?.clearValidators(); // make end optional
      } else {
        tenant?.clearValidators();
        tenantEmail?.clearValidators();
        start?.clearValidators();
        nextDue?.clearValidators();
        end?.clearValidators();
      }

      tenant?.updateValueAndValidity();
      tenantEmail?.updateValueAndValidity();
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
          name: v.name,
          rent_amount: Number(v.rent_amount),
          status: occupied ? 'occupied' : 'vacant',
          lease_url: lease_url || null,
          currency: 'ZAR', // ensure non-null text
          address: v.name || 'No address', // temp default
          tenant: occupied ? v.tenant || null : null,
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
        name: v.tenant,
        email: v.tenant_email || null,
        phone: null, // No phone collected in form
        property_id: prop.id,
        rent_amount: Number(v.rent_amount),
        rent_status: 'upcoming', // Default status for new tenants
        rent_due_date: v.next_payment_due,
        lease_start_date: v.tenancy_start,
        lease_end_date: v.tenancy_end || null,
        notes: null
      });

      if (tenantErr) {
        console.error('Tenant insert error:', tenantErr);
        alert(`Property and tenancy created but tenant record failed: ${tenantErr.message}`);
        await this.supa.refreshAll(); // Refresh to show what was created
        this.loading = false;
        this.activeModal.close(true);
        return;
      }
    }

    // Refresh all data to keep everything in sync
    await this.supa.refreshAll();

    this.loading = false;
    this.activeModal.close(true); // signal success
  }
}
