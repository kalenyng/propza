import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BetaAccessService } from '../../../../core/services/beta-access.service';

@Component({
  selector: 'app-beta-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './beta-access.component.html',
  styleUrl: './beta-access.component.scss'
})
export class BetaAccessComponent {
  accessCode = signal<string>('');
  errorMessage = signal<string>('');
  
  // Array to hold individual digit inputs
  digits = signal<string[]>(['', '', '', '', '', '']);

  constructor(
    private betaAccessService: BetaAccessService,
    private router: Router
  ) {}

  /**
   * Handle input in a digit field
   */
  onDigitInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Only allow single digit
    if (value.length > 1) {
      input.value = value.charAt(value.length - 1);
    }

    // Update the digits array
    const newDigits = [...this.digits()];
    newDigits[index] = input.value;
    this.digits.set(newDigits);

    // Auto-focus next input if digit was entered
    if (input.value && index < 5) {
      const nextInput = input.parentElement?.nextElementSibling?.querySelector('input');
      if (nextInput) {
        (nextInput as HTMLInputElement).focus();
      }
    }

    // Clear error when user starts typing
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }

  /**
   * Handle keydown events for better UX
   */
  onDigitKeydown(index: number, event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;

    // Handle backspace
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = input.parentElement?.previousElementSibling?.querySelector('input');
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }

    // Handle Enter key
    if (event.key === 'Enter') {
      this.validateAccess();
    }
  }

  /**
   * Handle paste event to auto-fill all digits
   */
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').substring(0, 6).split('');
    
    const newDigits = ['', '', '', '', '', ''];
    digits.forEach((digit, index) => {
      if (index < 6) {
        newDigits[index] = digit;
      }
    });
    
    this.digits.set(newDigits);

    // Update input fields
    const inputs = document.querySelectorAll('.digit-input');
    inputs.forEach((input, index) => {
      (input as HTMLInputElement).value = newDigits[index];
    });

    // Focus the last filled input or submit if complete
    if (digits.length >= 6) {
      this.validateAccess();
    } else if (digits.length > 0) {
      const lastInput = inputs[digits.length] as HTMLInputElement;
      lastInput?.focus();
    }
  }

  /**
   * Validate the entered access code
   */
  async validateAccess(): Promise<void> {
    const code = this.digits().join('');
    
    if (code.length !== 6) {
      this.errorMessage.set('Please enter all 6 digits');
      return;
    }

    const isValid = await this.betaAccessService.validateCode(code);
    
    if (isValid) {
      // Navigate to login page to start authentication
      this.router.navigateByUrl('/login');
    } else {
      this.errorMessage.set('Invalid access code. Please try again.');
      // Clear all digits
      this.digits.set(['', '', '', '', '', '']);
      // Clear input fields
      const inputs = document.querySelectorAll('.digit-input');
      inputs.forEach((input) => {
        (input as HTMLInputElement).value = '';
      });
      // Focus first input
      (inputs[0] as HTMLInputElement)?.focus();
    }
  }
}

