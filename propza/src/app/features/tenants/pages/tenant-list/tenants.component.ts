import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TenantCardComponent } from '../../components/tenant-card/tenant-card.component';
import { AddTenantModalComponent } from '../../components/add-tenant-modal/add-tenant-modal.component';
import { TranslationService } from '../../../../core/services/translation.service';
import { TenantService, Tenant } from '../../../../core/services/tenant.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PropzaModalOptionsService } from '../../../../core/services/propza-modal-options.service';
import { Subject, takeUntil, combineLatest } from 'rxjs';

type FilterType = 'all' | 'overdue';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TenantCardComponent
  ],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.scss'
})
export class TenantListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  allTenants: Tenant[] = [];
  filteredTenants: Tenant[] = [];

  // Search and filtering
  searchQuery = '';
  selectedFilter: FilterType = 'all';

  // Loading state
  loading = false;

  /** Mobile: filters collapsed behind launcher (≤899px layout) */
  mobileFiltersOpen = false;

  constructor(
    public translate: TranslationService,
    private tenantService: TenantService,
    private modalService: NgbModal,
    private router: Router,
    private modalOptions: PropzaModalOptionsService
  ) {}

  ngOnInit(): void {
    combineLatest([this.tenantService.tenants$, this.tenantService.loading$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([tenants, loading]) => {
        this.allTenants = tenants;
        this.loading = loading;
        this.applyFilters();
      });

    void this.loadTenantsData();
  }

  private async loadTenantsData(): Promise<void> {
    try {
      await this.tenantService.loadTenants();
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  /**
   * Compute the actual rent status based on current date
   */
  private getActualRentStatus(tenant: Tenant): 'paid' | 'overdue' | 'upcoming' | 'vacant' {
    // If tenant has paid status, keep it (assuming payments are logged)
    if (tenant.rent_status === 'paid') {
      return 'paid';
    }

    // If tenant is marked as vacant, keep that status
    if (tenant.rent_status === 'vacant') {
      return 'vacant';
    }

    // Check if rent is overdue by comparing today with rent_due_date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    // Parse the due date - handle both ISO string and date string formats
    const dueDate = new Date(tenant.rent_due_date);
    dueDate.setHours(0, 0, 0, 0);

    // If due date has passed, tenant is overdue (unless already paid)
    if (dueDate < today) {
      return 'overdue';
    }

    // Otherwise, rent is upcoming
    return 'upcoming';
  }

  private applyFilters(): void {
    let filtered = [...this.allTenants];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(tenant =>
        tenant.name.toLowerCase().includes(query) ||
        (tenant.properties?.address || '').toLowerCase().includes(query) ||
        (tenant.email || '').toLowerCase().includes(query)
      );
    }

    // Apply status filter with dynamic status computation
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(tenant => {
        const actualStatus = this.getActualRentStatus(tenant);
        return actualStatus === this.selectedFilter;
      });
    }

    this.filteredTenants = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  setFilter(filter: FilterType): void {
    this.selectedFilter = filter;
    this.applyFilters();
    this.closeMobileFiltersIfNarrow();
  }

  toggleMobileFilters(): void {
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
  }

  mobileFilterSummary(): string {
    return this.selectedFilter === 'all'
      ? this.translate.t('filter.all')
      : this.translate.t('status.overdue');
  }

  private closeMobileFiltersIfNarrow(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 900) {
      this.mobileFiltersOpen = false;
    }
  }

  getFilterCount(filter: FilterType): number {
    if (filter === 'all') {
      return this.allTenants.length;
    }

    // First apply search filter if active
    let tenants = this.allTenants;
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      tenants = tenants.filter(tenant =>
        tenant.name.toLowerCase().includes(query) ||
        (tenant.properties?.address || '').toLowerCase().includes(query) ||
        (tenant.email || '').toLowerCase().includes(query)
      );
    }

    // Count tenants with computed actual status
    return tenants.filter(tenant => {
      const actualStatus = this.getActualRentStatus(tenant);
      return actualStatus === filter;
    }).length;
  }

  openTenantDetails(tenantId: string): void {
    void this.router.navigate(['/tenant', tenantId], {
      state: { backUrl: '/tenants' }
    });
  }

  async openAddTenantModal(): Promise<void> {
    const modalRef = this.modalService.open(AddTenantModalComponent, this.modalOptions.createEntityFlow());

    try {
      const result = await modalRef.result;
      // No need to manually refresh - the observable subscription will handle it
    } catch (error) {
      // Modal dismissed or error occurred, no action needed
      console.error('Error adding tenant:', error);
    }
  }

  get statTotalTenants(): number {
    return this.allTenants.length;
  }

  get statOverdueTenants(): number {
    return this.allTenants.filter((t) => this.getActualRentStatus(t) === 'overdue').length;
  }

  get statPaidTenants(): number {
    return this.allTenants.filter((t) => this.getActualRentStatus(t) === 'paid').length;
  }

  get statUpcomingTenants(): number {
    return this.allTenants.filter((t) => this.getActualRentStatus(t) === 'upcoming').length;
  }
}
