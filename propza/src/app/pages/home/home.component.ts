import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderBannerComponent } from '../../shared/header-banner/header-banner.component';
import { PropertyCardComponent } from '../../shared/property-card/property-card.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { SupabaseService } from '../../core/supabase.service';
import { RentHelperService, RentStatus } from '../../core/rent-helper.service';

import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AddPropertyModalComponent } from '../../shared/add-property-modal/add-property-modal.component';

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
  selector: 'app-home',
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
export class HomeComponent {
  allProperties: PropertyVM[] = [];
  properties: PropertyVM[] = [];
  totalRentDue = 0;
  totalRentExpected = 0;
  percentCollected = 0;
  activeCount = 0;
  overdueCount = 0;
  loading = true;
  
  selectedFilter: PropertyStatus | 'all' | 'unpaid_period' = 'all';
  sortBy: 'dueDate' | 'amount' | 'status' = 'dueDate';
  paymentsMap: Map<string, number> = new Map(); // Maps (propertyId-period) to sum of payments

  constructor(
    private supabaseService: SupabaseService, 
    private modal: NgbModal,
    private router: Router,
    private rentHelper: RentHelperService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.reloadProperties();
  }

  async reloadProperties(): Promise<void> {
    this.loading = true;
    const { data: userData } = await this.supabaseService.supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      this.allProperties = [];
      this.properties = [];
      this.activeCount = 0;
      this.overdueCount = 0;
      this.totalRentDue = 0;
      this.totalRentExpected = 0;
      this.percentCollected = 0;
      this.loading = false;
      return;
    }

    // Fetch properties with tenancies
    const { data, error } = await this.supabaseService.supabase
      .from('properties')
      .select(`
        id,
        address,
        tenant,
        rent_amount,
        currency,
        tenancies (
          start_date,
          end_date,
          rent_due_day
        )
      `)
      .eq('owner_id', userId)
      .limit(50);

    if (error) {
      console.error('Load properties error:', error);
      this.allProperties = [];
      this.properties = [];
      this.activeCount = 0;
      this.overdueCount = 0;
      this.totalRentDue = 0;
      this.totalRentExpected = 0;
      this.percentCollected = 0;
      this.loading = false;
      return;
    }

    if (data && data.length) {
      const currency = data[0].currency || 'ZAR';
      
      // Fetch payments for previous, current, and next month (to handle carryover)
      const propertyIds = data.map((p: any) => p.id);
      const today = new Date();
      const currentPeriod = this.rentHelper.getCurrentPeriod();
      
      const prevMonth = new Date(today);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      const prevPeriod = this.rentHelper.periodKey(prevMonth);
      
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextPeriod = this.rentHelper.periodKey(nextMonth);
      
      const { data: payments } = await this.supabaseService.supabase
        .from('payments')
        .select('property_id, period, amount')
        .in('property_id', propertyIds)
        .in('period', [prevPeriod, currentPeriod, nextPeriod]);

      // Build payments map - sum amounts per (property_id, period)
      this.paymentsMap.clear();
      if (payments) {
        payments.forEach((p: any) => {
          const key = `${p.property_id}-${p.period}`;
          const currentSum = this.paymentsMap.get(key) || 0;
          this.paymentsMap.set(key, currentSum + (Number(p.amount) || 0));
        });
      }

      // Map properties with status calculation
      this.allProperties = data.map((p: any) => {
        // Get active tenancy
        const activeTenancy = Array.isArray(p.tenancies) && p.tenancies.length > 0
          ? p.tenancies.find((t: any) => 
              this.rentHelper.isActive(t.start_date, t.end_date)
            )
          : null;

        let status: PropertyStatus = 'vacant';
        let nextDueDate: Date | undefined;
        let periodKey: string | undefined;
        let daysUntilDue: number | undefined;
        let collectedAmount = 0;
        let remaining = 0;
        let rentAmount = Number(p.rent_amount) || 0;

        if (activeTenancy && activeTenancy.rent_due_day) {
          // Calculate next due date
          nextDueDate = this.rentHelper.nextDueDate(
            activeTenancy.rent_due_day,
            activeTenancy.start_date
          );
          
          daysUntilDue = this.rentHelper.daysUntilDue(nextDueDate);
          
          // Get the CURRENT rent period we're in (not the next one)
          const currentRentPeriod = this.rentHelper.getCurrentRentPeriod(activeTenancy.rent_due_day);
          
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
          
          // Calculate status with partial payment support and carryover
          status = this.rentHelper.statusFor(
            true, 
            nextDueDate, 
            collectedAmount,
            rentAmount
          );
        }

        return {
          id: p.id,
          address: p.address,
          tenant: p.tenant || '',
          rent: this.formatMoney(p.rent_amount, currency) + '/mo',
          rentAmount,
          status,
          rent_due_day: activeTenancy?.rent_due_day,
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
    } else {
      this.allProperties = [];
      this.properties = [];
      this.activeCount = 0;
      this.overdueCount = 0;
      this.totalRentDue = 0;
      this.totalRentExpected = 0;
      this.percentCollected = 0;
    }
    
    this.loading = false;
  }

  applyFiltersAndSort(): void {
    // Filter
    let filtered = [...this.allProperties];
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
    ref.result
      .then((ok) => { if (ok) this.reloadProperties(); })
      .catch(() => {});
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
