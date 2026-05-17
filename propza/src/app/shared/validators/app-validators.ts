import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/**
 * Validates an email address only when the control has a non-empty value.
 * Returns null (valid) when the field is blank, making it effectively optional.
 */
export const optionalEmailValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value || (value as string).trim() === '') return null;
  return Validators.email(control);
};

/**
 * Validates a South-African phone number (+27 XX XXX XXXX) only when the
 * control has a non-empty value. Returns null when the field is blank.
 */
export const optionalPhoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value || (value as string).trim() === '') return null;
  return Validators.pattern(/^\+27\s?\d{2}\s?\d{3}\s?\d{4}$/)(control);
};

/**
 * Returns a human-readable error message for a form control.
 * Pass `fieldLabel` as the display name shown in the message.
 */
export function getControlErrorMessage(
  control: AbstractControl | null,
  fieldLabel: string
): string {
  if (!control?.errors) return '';
  const e = control.errors;
  if (e['required'])   return `${fieldLabel} is required`;
  if (e['minlength'])  return `${fieldLabel} must be at least ${e['minlength'].requiredLength} characters`;
  if (e['maxlength'])  return `${fieldLabel} cannot exceed ${e['maxlength'].requiredLength} characters`;
  if (e['min'])        return `${fieldLabel} must be at least ${e['min'].min}`;
  if (e['email'])      return 'Invalid email address';
  if (e['pattern'])    return `Invalid ${fieldLabel} format`;
  return `Invalid ${fieldLabel}`;
}
