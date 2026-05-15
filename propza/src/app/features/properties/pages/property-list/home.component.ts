import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';
import { PropertyService, Property, Payment } from '../../../../core/services/property.service';
import { RentHelperService, RentStatus } from '../../../../core/services/rent-helper.service';
import { RentDueService, TenantStatus } from '../../../../core/services/rent-due.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { Tenant } from '../../../../core/services/tenant.service';

import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AddPropertyModalComponent } from '../../components/add-property-modal/add-property-modal.component';
import { PropzaModalOptionsService } from '../../../../core/services/propza-modal-options.service';
import { ShortNumberPipe } from '../../../../shared/pipes/short-number.pipe';

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
    PropertyCardComponent,
    NgbModalModule,
    ShortNumberPipe
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

  /** Collapsed by default on narrow viewports — filters live behind launcher (CSS + this flag) */
  mobileFiltersOpen = false;

  private destroy$ = new Subject<void>();

  constructor(
    private propertyService: PropertyService,
    private modal: NgbModal,
    private router: Router,
    private rentHelper: RentHelperService,
    private rentDueService: RentDueService,
    public translate: TranslationService,
    private modalOptions: PropzaModalOptionsService
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
    today.setUTCHours(0, 0, 0, 0);

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
        // Create a full tenant object for the service
        const tenant: Tenant = {
          id: '', // Not needed for status calculation
          name: activeTenant.name || '',
          email: null,
          phone: null,
          property_id: p.id,
          rent_amount: rentAmount,
          rent_status: activeTenant.rent_status,
          rent_due_date: activeTenant.rent_due_date,
          lease_start_date: activeTenant.lease_start_date,
          lease_end_date: activeTenant.lease_end_date,
          deposit_amount: 0,
          notes: null,
          created_at: ''
        };

        // Match RentDueService.getStatusForTenant: payments attach to the tenant's due month,
        // not necessarily the calendar month of "today" (fixes Collected % stuck at 0).
        periodKey = undefined;
        if (activeTenant.rent_due_date) {
          const d = this.rentDueService.toDateOnlyZA(activeTenant.rent_due_date);
          const y = d.getUTCFullYear();
          const m = String(d.getUTCMonth() + 1).padStart(2, '0');
          periodKey = `${y}-${m}`;
        }

        collectedAmount = periodKey
          ? this.rentDueService.getCollectedAmount(payments, p.id, periodKey)
          : 0;
        
        remaining = Math.max(0, rentAmount - collectedAmount);
        
        // Get next due date
        nextDueDate = tenant.rent_due_date ? new Date(tenant.rent_due_date) : new Date();
        daysUntilDue = Math.round((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculate status using centralized service
        const tenantStatus = this.rentDueService.getStatusForTenant(
          tenant,
          payments,
          p
        );
        
        // Map TenantStatus to RentStatus for display
        status = this.mapTenantStatusToRentStatus(tenantStatus);
      }

      return {
        id: p.id,
        address: p.address,
        tenant: activeTenant?.name || '',
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
    this.closeMobileFiltersIfNarrow();
  }

  onSearchChange(): void {
    this.applyFiltersAndSort();
  }

  setSortBy(sortBy: 'dueDate' | 'amount' | 'status'): void {
    this.sortBy = sortBy;
    this.applyFiltersAndSort();
    this.closeMobileFiltersIfNarrow();
  }

  toggleMobileFilters(): void {
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
  }

  mobileFilterSummary(): string {
    const sortKey = this.sortBy;
    const sortLabel =
      sortKey === 'dueDate'
        ? this.translate.t('dashboard.dueDate')
        : sortKey === 'amount'
          ? this.translate.t('dashboard.amount')
          : this.translate.t('dashboard.status');
    let filterLabel: string;
    switch (this.selectedFilter) {
      case 'all':
        filterLabel = this.translate.t('filter.all');
        break;
      case 'overdue':
        filterLabel = this.translate.t('status.overdue');
        break;
      case 'unpaid_period':
        filterLabel = this.translate.t('filter.unpaid');
        break;
      case 'paid':
        filterLabel = this.translate.t('status.paid');
        break;
      case 'vacant':
        filterLabel = this.translate.t('status.vacant');
        break;
      default:
        filterLabel = this.selectedFilter;
    }
    return `${filterLabel} · ${sortLabel}`;
  }

  private closeMobileFiltersIfNarrow(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 900) {
      this.mobileFiltersOpen = false;
    }
  }

  /**
   * Maps TenantStatus from RentDueService to RentStatus for display compatibility.
   */
  private mapTenantStatusToRentStatus(tenantStatus: TenantStatus): RentStatus {
    switch (tenantStatus) {
      case 'vacant':
        return 'vacant';
      case 'paid':
        return 'paid';
      case 'partially_paid':
        return 'partially_paid';
      case 'upcoming':
        return 'upcoming';
      case 'due_soon':
        return 'due_soon';
      case 'due_today':
        return 'due_today';
      case 'overdue':
        return 'overdue';
      default:
        return 'upcoming';
    }
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
    void this.router.navigate(['/property', propertyId], {
      state: { backUrl: '/properties' }
    });
  }

  openAddProperty(): void {
    const ref = this.modal.open(AddPropertyModalComponent, this.modalOptions.createEntityFlow());
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
