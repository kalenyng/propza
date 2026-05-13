import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

export interface NavItem {
  route: string;
  label: string;
  icon: string; // SVG path data
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss'
})
export class BottomNavComponent {
  readonly items: NavItem[] = [
    {
      route: '/dashboard',
      label: 'Dashboard',
      icon: 'grid'
    },
    {
      route: '/properties',
      label: 'Properties',
      icon: 'home'
    },
    {
      route: '/tenants',
      label: 'Tenants',
      icon: 'users'
    },
    {
      route: '/payments',
      label: 'Payments',
      icon: 'credit-card'
    },
    {
      route: '/settings',
      label: 'Settings',
      icon: 'settings'
    }
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    const current = this.router.url;
    if (route === '/properties') {
      return current === '/properties' || current === '/home' || current.startsWith('/property/');
    }
    if (route === '/tenants') {
      return current === '/tenants' || current.startsWith('/tenant/');
    }
    return current === route;
  }
}
