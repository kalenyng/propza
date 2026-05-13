import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PropertyService, Property, Payment } from '../../../../core/services/property.service';
import { TenantService, Tenant } from '../../../../core/services/tenant.service';
import { RentDueService } from '../../../../core/services/rent-due.service';

type DashboardMetrics = {
  totalProperties: number;
  totalTenants: number;
  totalExpected: number;
  totalCollected: number;
  totalRemaining: number;
  upToDateCount: number;
  overdueCount: number;
  nextRentDueText: string;
};

type ActivityItem = {
  title: string;
  subtitle: string;
  amount?: number;
  date: string;
};

type UpcomingRent = {
  tenantName: string;
  dueDate: string;
  status: 'overdue' | 'due_soon' | 'upcoming' | 'paid';
  amount: number;
};

type ChartPoint = {
  label: string;
  collected: number;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  /** Full-page skeleton only on first blocking load (no cached rows yet). */
  showSkeleton = true;
  recentPayments: Payment[] = [];
  upcomingRents: UpcomingRent[] = [];
  activityItems: ActivityItem[] = [];
  chartData: ChartPoint[] = [];
  searchQuery = '';
  metrics: DashboardMetrics = {
    totalProperties: 0,
    totalTenants: 0,
    totalExpected: 0,
    totalCollected: 0,
    totalRemaining: 0,
    upToDateCount: 0,
    overdueCount: 0,
    nextRentDueText: 'No upcoming due date'
  };

  private destroy$ = new Subject<void>();

  constructor(
    private propertyService: PropertyService,
    private tenantService: TenantService,
    private rentDueService: RentDueService,
    private router: Router
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.propertyService.properties$,
      this.propertyService.payments$,
      this.tenantService.tenants$,
      this.propertyService.loading$,
      this.tenantService.loading$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        ([properties, payments, tenants, propertyLoading, tenantLoading]) => {
          this.showSkeleton =
            (propertyLoading && properties.length === 0) ||
            (tenantLoading && tenants.length === 0);
          this.metrics = this.computeMetrics(properties, payments, tenants);
          this.recentPayments = [...payments].sort((a, b) => {
            return new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime();
          }).slice(0, 5);
          this.upcomingRents = this.computeUpcomingRents(tenants, payments, properties).slice(0, 4);
          this.activityItems = this.computeActivityItems(payments, properties, tenants).slice(0, 6);
          this.chartData =
            payments.length === 0 ? [] : this.buildLastSixMonthsCollectionChart(payments);
        }
      );

    void this.propertyService.refreshAll();
    void this.tenantService.refreshTenants();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private computeMetrics(properties: Property[], payments: Payment[], tenants: Tenant[]): DashboardMetrics {
    const occupiedProperties = properties.filter((property) => property.status === 'occupied');
    const totalExpected = occupiedProperties.reduce((sum, property) => {
      return sum + (Number(property.rent_amount) || 0);
    }, 0);

    const currentPeriod = this.rentDueService.getCurrentPeriod();
    const totalCollected = payments
      .filter((payment) => payment.period === currentPeriod)
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    const totalRemaining = Math.max(0, totalExpected - totalCollected);

    let overdueCount = 0;
    let upToDateCount = 0;
    tenants.forEach((tenant) => {
      const status = this.rentDueService.getStatusForTenant(tenant, payments);
      if (status === 'overdue') {
        overdueCount++;
      } else if (status !== 'vacant') {
        upToDateCount++;
      }
    });

    const dueDates = tenants
      .filter((tenant) => !!tenant.rent_due_date)
      .map((tenant) => ({ tenantName: tenant.name, dueDate: new Date(tenant.rent_due_date) }))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const nextDue = dueDates[0];

    return {
      totalProperties: properties.length,
      totalTenants: tenants.length,
      totalExpected,
      totalCollected,
      totalRemaining,
      upToDateCount,
      overdueCount,
      nextRentDueText: nextDue
        ? `${nextDue.tenantName} - ${nextDue.dueDate.toLocaleDateString()}`
        : 'No upcoming due date'
    };
  }

  private computeUpcomingRents(tenants: Tenant[], payments: Payment[], properties: Property[]): UpcomingRent[] {
    const propertyMap = new Map(properties.map((property) => [property.id, property]));
    return tenants
      .filter((tenant) => !!tenant.rent_due_date)
      .map((tenant) => {
        const status = this.rentDueService.getStatusForTenant(tenant, payments);
        const normalizedStatus: UpcomingRent['status'] =
          status === 'overdue' || status === 'due_soon' || status === 'upcoming' || status === 'paid'
            ? status
            : 'upcoming';
        const property = propertyMap.get(tenant.property_id);
        return {
          tenantName: tenant.name || property?.address || 'Tenant',
          dueDate: tenant.rent_due_date,
          status: normalizedStatus,
          amount: Number(tenant.rent_amount) || Number(property?.rent_amount) || 0
        };
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  private computeActivityItems(payments: Payment[], properties: Property[], tenants: Tenant[]): ActivityItem[] {
    const propertyMap = new Map(properties.map((property) => [property.id, property.address]));
    const paymentActivity = payments.map((payment) => ({
      title: 'Payment recorded',
      subtitle: propertyMap.get(payment.property_id) || 'Property',
      amount: Number(payment.amount) || 0,
      date: payment.payment_date
    }));

    const tenantActivity = tenants
      .filter((tenant) => !!tenant.created_at)
      .map((tenant) => ({
        title: 'Tenant added',
        subtitle: tenant.name,
        date: tenant.created_at
      }));

    return [...paymentActivity, ...tenantActivity].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  /**
   * Last six calendar months (oldest → newest), including months with R0 collected,
   * so the chart always compares like-for-like instead of a single full-width bar.
   */
  private buildLastSixMonthsCollectionChart(payments: Payment[]): ChartPoint[] {
    const totals = new Map<string, number>();
    for (const payment of payments) {
      const key =
        (typeof payment.period === 'string' && payment.period.trim().length >= 7
          ? payment.period.trim().slice(0, 7)
          : null) ||
        (typeof payment.payment_date === 'string' && payment.payment_date.length >= 7
          ? payment.payment_date.slice(0, 7)
          : null);
      if (!key) {
        continue;
      }
      totals.set(key, (totals.get(key) || 0) + (Number(payment.amount) || 0));
    }

    const ref = this.rentDueService.getTodayZA();
    const monthStart = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1));
    const keys: string[] = [];
    for (let back = 5; back >= 0; back--) {
      const t = this.rentDueService.safeAddMonths(monthStart, -back);
      const y = t.getUTCFullYear();
      const m = String(t.getUTCMonth() + 1).padStart(2, '0');
      keys.push(`${y}-${m}`);
    }

    return keys.map((label) => ({
      label,
      collected: totals.get(label) || 0
    }));
  }

  chartAxisLabel(periodKey: string): string {
    if (!periodKey || periodKey.length < 7) {
      return periodKey;
    }
    const [ys, ms] = periodKey.split('-');
    const y = Number(ys);
    const m = Number(ms);
    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
      return periodKey.slice(5);
    }
    const d = new Date(Date.UTC(y, m - 1, 1));
    return d.toLocaleDateString('en-ZA', { month: 'short', timeZone: 'UTC' });
  }

  get maxChartValue(): number {
    if (this.chartData.length === 0) {
      return 1;
    }
    return Math.max(...this.chartData.map((item) => item.collected), 1);
  }

  get collectionRate(): number {
    if (this.metrics.totalExpected <= 0) {
      return 0;
    }
    return Math.min(100, Math.round((this.metrics.totalCollected / this.metrics.totalExpected) * 100));
  }

  get progressRingStyle(): string {
    const value = this.collectionRate;
    return `conic-gradient(#22c55e ${value * 3.6}deg, #e8edf3 0deg)`;
  }

  trackByLabel(_index: number, item: ChartPoint): string {
    return item.label;
  }

  formatMoney(amount: number): string {
    try {
      return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        maximumFractionDigits: 0
      }).format(amount || 0);
    } catch {
      return `R${(amount || 0).toLocaleString('en-ZA')}`;
    }
  }

  openProperties(): void {
    void this.router.navigateByUrl('/properties');
  }

  openPayments(): void {
    void this.router.navigateByUrl('/payments');
  }

  getStatusLabel(status: UpcomingRent['status']): string {
    if (status === 'due_soon') return 'Due soon';
    if (status === 'overdue') return 'Overdue';
    if (status === 'paid') return 'Paid';
    return 'Upcoming';
  }
}
