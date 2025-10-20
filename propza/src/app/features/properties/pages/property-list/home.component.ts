import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderBannerComponent } from '../../../../shared/components/header-banner/header-banner.component';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { PropertyService, Property, Payment } from '../../../../core/services/property.service';
import { RentHelperService, RentStatus } from '../../../../core/services/rent-helper.service';
import { TranslationService } from '../../../../core/services/translation.service';

import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AddPropertyModalComponent } from '../../components/add-property-modal/add-property-modal.component';

type PropertyStatus = RentStatus;

type PropertyVM = {
  id: string;
  address: string;
  tenant: string;
  rent: string;
  rentAmount: number;
  status: PropertyStatus;
  rent_due_day?: number;
  nextDueDate?: Date;
  periodKey?: string;
  daysUntilDue?: number;
  collectedAmount?: number;
  remainingAmount?: number;
};

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [
    FormsModule,
    HeaderBannerComponent,
    PropertyCardComponent,
    BottomNavComponent,
    NgbModalModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class PropertyListComponent implements OnInit, OnDestroy {
  allProperties: PropertyVM[] = [];
  properties: PropertyVM[] = [];
  totalRentDue = 0;
  totalRentExpected = 0;
  percentCollected = 0;
  activeCount = 0;
  overdueCount = 0;
  loading = true;
  
  selectedFilter: PropertyStatus | 'all' | 'unpaid_period' = 'all';
  searchQuery: string = '';
  sortBy: 'dueDate' | 'amount' | 'status' = 'dueDate';
  paymentsMap: Map<string, number> = new Map(); // Maps (propertyId-period) to sum of payments
  
  private destroy$ = new Subject<void>();

  constructor(
    private propertyService: PropertyService,
    private modal: NgbModal,
    private router: Router,
    private rentHelper: RentHelperService,
    public translate: TranslationService
  ) {}

  ngOnInit(): void {
    // Subscribe to properties and payments observables
    combineLatest([
      this.propertyService.properties$,
      this.propertyService.payments$,
      this.propertyService.loading$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([properties, payments, loading]) => {
        this.loading = loading;
        this.processPropertiesData(properties, payments);
      });

    // Initial load
    this.propertyService.refreshAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private processPropertiesData(data: Property[], payments: Payment[]): void {
    if (!data || data.length === 0) {
      this.allProperties = [];
      this.properties = [];
      this.activeCount = 0;
      this.overdueCount = 0;
      this.totalRentDue = 0;
      this.totalRentExpected = 0;
      this.percentCollected = 0;
      return;
    }

    const currency = data[0].currency || 'ZAR';
    const today = new Date();

    this.paymentsMap.clear();
    if (payments) {
      payments.forEach((p) => {
        const key = `${p.property_id}-${p.period}`;
        const currentSum = this.paymentsMap.get(key) || 0;
        this.paymentsMap.set(key, currentSum + (Number(p.amount) || 0));
      });
    }

    this.allProperties = data.map((p) => {
      // Get active tenant
      const activeTenant = Array.isArray(p.tenants) && p.tenants.length > 0
        ? p.tenants[0] // Get the first (and should be only) tenant
        : null;

      let status: PropertyStatus = 'vacant';
      let nextDueDate: Date | undefined;
      let periodKey: string | undefined;
      let daysUntilDue: number | undefined;
      let collectedAmount = 0;
      let remaining = 0;
      let rentAmount = Number(p.rent_amount) || 0;

      if (activeTenant && p.status === 'occupied') {
        // Use tenant's rent due date
        nextDueDate = new Date(activeTenant.rent_due_date);
        daysUntilDue = this.rentHelper.daysUntilDue(nextDueDate);
        
        // Get the CURRENT rent period we're in (not the next one)
        const currentRentPeriod = this.rentHelper.getCurrentRentPeriod(nextDueDate.getDate());
        
        // Get payments for current period
        const currentPaymentKey = `${p.id}-${currentRentPeriod}`;
        const currentPeriodPayments = this.paymentsMap.get(currentPaymentKey) || 0;
        
        // Get overpayment from previous period (carryover)
        const prevMonth = new Date(today);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        const prevPeriod = this.rentHelper.periodKey(prevMonth);
        const prevPaymentKey = `${p.id}-${prevPeriod}`;
        const prevPeriodPayments = this.paymentsMap.get(prevPaymentKey) || 0;
        const prevOverpayment = this.rentHelper.getOverpayment(prevPeriodPayments, rentAmount);
        
        // Total collected = current period payments + previous overpayment
        collectedAmount = currentPeriodPayments + prevOverpayment;
        remaining = this.rentHelper.getRemaining(collectedAmount, rentAmount);
        
        periodKey = currentRentPeriod;
        
        // Calculate status dynamically based on due date and payments
        status = this.rentHelper.statusFor(
          true,              // tenancy is active
          nextDueDate,       // next due date
          collectedAmount,   // total collected (including carryover)
          rentAmount         // expected rent amount
        );
      }

      return {
        id: p.id,
        address: p.address,
        tenant: p.tenant || '',
        rent: this.formatMoney(p.rent_amount, currency) + '/mo',
        rentAmount,
        status,
        rent_due_day: activeTenant ? nextDueDate?.getDate() : undefined,
        nextDueDate,
        periodKey,
        daysUntilDue,
        collectedAmount,
        remainingAmount: remaining
      };
    });

    // Calculate metrics
    const activeProperties = this.allProperties.filter(p => p.status !== 'vacant');
    this.activeCount = activeProperties.length;
    this.overdueCount = this.allProperties.filter(p => p.status === 'overdue').length;
    
    // Total rent due this month (sum of REMAINING amounts for current month)
    this.totalRentDue = this.allProperties
      .filter(p => {
        if (p.status === 'vacant' || !p.nextDueDate) {
          return false;
        }
        return this.rentHelper.isDueThisMonth(p.nextDueDate);
      })
      .reduce((sum, p) => sum + (p.remainingAmount || 0), 0);
    
    // Total expected this month (all rent amounts for properties due this month)
    this.totalRentExpected = this.allProperties
      .filter(p => {
        if (p.status === 'vacant' || !p.nextDueDate) {
          return false;
        }
        return this.rentHelper.isDueThisMonth(p.nextDueDate);
      })
      .reduce((sum, p) => sum + p.rentAmount, 0);
    
    // Calculate % collected
    if (this.totalRentExpected > 0) {
      const collected = this.totalRentExpected - this.totalRentDue;
      this.percentCollected = Math.round((collected / this.totalRentExpected) * 100);
    } else {
      this.percentCollected = 0;
    }

    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    // Filter
    let filtered = [...this.allProperties];
    
    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.address.toLowerCase().includes(query) ||
        (p.tenant && p.tenant.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (this.selectedFilter === 'unpaid_period') {
      // Group all non-paid, non-vacant statuses
      filtered = filtered.filter(p => 
        p.status !== 'paid' && p.status !== 'vacant'
      );
    } else if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.selectedFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (this.sortBy === 'dueDate') {
        if (!a.nextDueDate) return 1;
        if (!b.nextDueDate) return -1;
        return a.nextDueDate.getTime() - b.nextDueDate.getTime();
      } else if (this.sortBy === 'amount') {
        return b.rentAmount - a.rentAmount;
      } else if (this.sortBy === 'status') {
        const statusOrder: Record<PropertyStatus, number> = { 
          overdue: 0, 
          grace: 1, 
          due_today: 2, 
          due_soon: 3, 
          partially_paid: 4,
          upcoming: 5,
          paid: 6,
          vacant: 7 
        };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return 0;
    });

    this.properties = filtered;
  }

  setFilter(filter: PropertyStatus | 'all' | 'unpaid_period'): void {
    this.selectedFilter = filter;
    this.applyFiltersAndSort();
  }

  onSearchChange(): void {
    this.applyFiltersAndSort();
  }

  setSortBy(sortBy: 'dueDate' | 'amount' | 'status'): void {
    this.sortBy = sortBy;
    this.applyFiltersAndSort();
  }

  getFilterCount(filter: PropertyStatus | 'all' | 'unpaid_period'): number {
    if (filter === 'all') return this.allProperties.length;
    if (filter === 'unpaid_period') {
      return this.allProperties.filter(p => 
        p.status !== 'paid' && p.status !== 'vacant'
      ).length;
    }
    return this.allProperties.filter(p => p.status === filter).length;
  }

  openPropertyDetail(propertyId: string): void {
    this.router.navigate(['/property', propertyId]);
  }

  openAddProperty(): void {
    const ref = this.modal.open(AddPropertyModalComponent, { size: 'lg', backdrop: 'static' });
    ref.result.catch(() => {
      // Modal dismissed - no action needed
    });
  }

  formatMoney(amount: number, currency: string): string {
    const locale = currency === 'ZAR' ? 'en-ZA' : 'en-US';
    const code = currency === 'ZAR' ? 'ZAR' : currency;
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 0
      }).format(amount ?? 0);
    } catch {
      return `${currency === 'ZAR' ? 'R' : ''}${(amount ?? 0).toLocaleString(locale)}`;
    }
  }
}
