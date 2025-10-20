import { Component, Input, OnInit, OnDestroy, inject, effect } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-banner.component.html',
  styleUrl: './header-banner.component.scss'
})
export class HeaderBannerComponent implements OnInit {
  @Input() userName: string = '';
  @Input() logoLetter: string = 'P';
  @Input() subtitle: string = '';
  
  greeting: string = '';

  constructor(private auth: AuthService) {
    // Use effect to reactively update greeting when language changes
    effect(() => {
      const lang = this.translate.currentLanguage(); // Read the signal
      this.greeting = this.getTimeBasedGreeting();
    });

    // Use effect to reactively update user name when user data changes
    effect(() => {
      const user = this.auth.user(); // Read the signal
      this.updateUserName(user);
    });
  }
  
  translate = inject(TranslationService);

  ngOnInit(): void {
    // Initial greeting
    this.greeting = this.getTimeBasedGreeting();
  }

  private updateUserName(user: any): void {
    if (user) {
      // Try to get name from user metadata (for both email signup and Google sign-in)
      const firstName = user.user_metadata?.['first_name'] || 
                       user.user_metadata?.['full_name']?.split(' ')[0] ||
                       user.user_metadata?.['name']?.split(' ')[0] || // Google provides 'name'
                       '';
      
      this.userName = firstName;
      this.greeting = this.getTimeBasedGreeting();
    }
  }

  private getTimeBasedGreeting(): string {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const lang = this.translate.currentLanguage();

    // Determine time period
    let timePeriod: 'morning' | 'afternoon' | 'evening' = 'morning';
    if (hour >= 5 && hour < 12) {
      timePeriod = 'morning';
    } else if (hour >= 12 && hour < 17) {
      timePeriod = 'afternoon';
    } else {
      timePeriod = 'evening';
    }

    // Get the greeting key for this day and time
    const greetingKey = `greeting.${timePeriod}.day${dayOfWeek}`;
    const greeting = this.translate.t(greetingKey);

    return this.userName ? `${greeting}, ${this.userName}` : greeting;
  }
}
