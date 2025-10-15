import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-edit-name-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-name-modal.component.html',
  styleUrls: ['./edit-name-modal.component.scss']
})
export class EditNameModalComponent {
  activeModal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    full_name: ['', [Validators.maxLength(200)]]
  });

  setInitial(fullName?: string): void {
    this.form.patchValue({ full_name: (fullName || '').trim() });
  }

  save(): void {
    if (this.form.invalid) return;
    const full_name = (this.form.value.full_name || '').trim();
    this.activeModal.close({ full_name });
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}


