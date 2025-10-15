import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
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

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.loadUserName();
  }

  private async loadUserName(): Promise<void> {
    const user = this.auth.user();
    
    if (user) {
      // Try to get name from user metadata (for both email signup and Google sign-in)
      const firstName = user.user_metadata?.['first_name'] || 
                       user.user_metadata?.['full_name']?.split(' ')[0] ||
                       user.user_metadata?.['name']?.split(' ')[0] || // Google provides 'name'
                       '';
      
      this.userName = firstName;
    }
    
    this.greeting = this.getTimeBasedGreeting();
  }

  private getTimeBasedGreeting(): string {
    const now = new Date();
    const hour = now.getHours();
    let timeGreeting = '';
    let timePeriod = '';

    // Morning greetings (5 AM - 11:59 AM)
    if (hour >= 5 && hour < 12) {
      timePeriod = 'morning';
      const morningGreetings = [
        'Good morning',
        'Morning',
        'Sawubona',
        'Goeie môre',
        'Hello',
        'Hey there',
        'Rise and shine',
        'Hi',
        'Greetings'
      ];
      timeGreeting = this.getRandomGreeting(morningGreetings, timePeriod);
    } 
    // Afternoon greetings (12 PM - 4:59 PM)
    else if (hour >= 12 && hour < 17) {
      timePeriod = 'afternoon';
      const afternoonGreetings = [
        'Good afternoon',
        'Afternoon',
        'Sawubona',
        'Goeie middag',
        'Hello',
        'Hey',
        'Howzit',
        'Hi there',
        'Greetings',
        'Welcome'
      ];
      timeGreeting = this.getRandomGreeting(afternoonGreetings, timePeriod);
    } 
    // Evening greetings (5 PM - 9:59 PM)
    else if (hour >= 17 && hour < 22) {
      timePeriod = 'evening';
      const eveningGreetings = [
        'Good evening',
        'Evening',
        'Sawubona',
        'Goeie naand',
        'Hello',
        'Hey',
        'Welcome back',
        'Hi',
        'Howzit'
      ];
      timeGreeting = this.getRandomGreeting(eveningGreetings, timePeriod);
    } 
    // Night greetings (10 PM - 4:59 AM)
    else {
      timePeriod = 'night';
      const nightGreetings = [
        'Good night',
        'Evening',
        'Sawubona',
        'Goeienag',
        'Hello',
        'Hey',
        'Working late',
        'Late night',
        'Still here'
      ];
      timeGreeting = this.getRandomGreeting(nightGreetings, timePeriod);
    }

    return this.userName ? `${timeGreeting}, ${this.userName}` : timeGreeting;
  }

  private getRandomGreeting(greetings: string[], timePeriod: string): string {
    // Use date + time period based seed for unique greeting per time slot per day
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // Add time period offset to get different greeting for each time slot
    const timePeriodOffset = {
      'morning': 0,
      'afternoon': 1000,
      'evening': 2000,
      'night': 3000
    }[timePeriod] || 0;
    
    const seed = dateSeed + timePeriodOffset;
    const index = seed % greetings.length;
    return greetings[index];
  }
}
