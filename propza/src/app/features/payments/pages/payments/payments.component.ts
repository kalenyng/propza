import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PropertyService, Payment, Property } from '../../../../core/services/property.service';

type PaymentVM = Payment & { propertyAddress: string };

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss'
})
export class PaymentsComponent implements OnInit, OnDestroy {
  loading = true;
  payments: PaymentVM[] = [];
  allPayments: PaymentVM[] = [];
  properties: Property[] = [];
  selectedProperty = 'all';
  searchQuery = '';

  /** Mobile: ledger controls behind launcher */
  mobileLedgerOpen = false;

  private destroy$ = new Subject<void>();

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    combineLatest([
      this.propertyService.properties$,
      this.propertyService.payments$,
      this.propertyService.loading$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([properties, payments, loading]) => {
        this.loading = loading;
        this.properties = properties;
        this.allPayments = this.toViewModel(payments, properties);
        this.applyFilters();
      });

    void this.propertyService.refreshAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private toViewModel(payments: Payment[], properties: Property[]): PaymentVM[] {
    const propertyMap = new Map(properties.map((property) => [property.id, property.address]));
    return [...payments]
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
      .map((payment) => ({
        ...payment,
        propertyAddress: propertyMap.get(payment.property_id) || 'Unknown property'
      }));
  }

  applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.payments = this.allPayments.filter((payment) => {
      const matchesProperty =
        this.selectedProperty === 'all' || payment.property_id === this.selectedProperty;
      const matchesQuery =
        query.length === 0 ||
        payment.propertyAddress.toLowerCase().includes(query) ||
        (payment.notes || '').toLowerCase().includes(query);
      return matchesProperty && matchesQuery;
    });
  }

  toggleMobileLedger(): void {
    this.mobileLedgerOpen = !this.mobileLedgerOpen;
  }

  onPropertyFilterChange(): void {
    this.applyFilters();
    if (typeof window !== 'undefined' && window.innerWidth < 900) {
      this.mobileLedgerOpen = false;
    }
  }

  mobileLedgerSummary(): string {
    if (this.selectedProperty === 'all') {
      return this.searchQuery.trim()
        ? `Search · ${this.filteredPaymentCount} results`
        : 'All properties';
    }
    const p = this.properties.find((x) => x.id === this.selectedProperty);
    const addr = p?.address ?? 'Property';
    return addr.length > 32 ? `${addr.slice(0, 30)}…` : addr;
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

  get totalCollected(): number {
    return this.allPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
  }

  get paymentCount(): number {
    return this.allPayments.length;
  }

  get averagePayment(): number {
    if (this.paymentCount === 0) {
      return 0;
    }
    return this.totalCollected / this.paymentCount;
  }

  get filteredPaymentCount(): number {
    return this.payments.length;
  }
}
