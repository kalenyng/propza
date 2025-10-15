import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderBannerComponent } from '../../shared/header-banner/header-banner.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { TenantCardComponent } from '../../shared/tenant-card/tenant-card.component';
import { TenantDetailsModalComponent } from '../../shared/tenant-details-modal/tenant-details-modal.component';
import { AddTenantModalComponent } from '../../shared/add-tenant-modal/add-tenant-modal.component';
import { TranslationService } from '../../core/translation.service';
import { TenantService, Tenant } from '../../core/tenant.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';

type FilterType = 'all' | 'overdue';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderBannerComponent,
    BottomNavComponent,
    TenantCardComponent
  ],
  templateUrl: './tenants.component.html',
  styleUrl: './tenants.component.scss'
})
export class TenantsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  allTenants: Tenant[] = [];
  filteredTenants: Tenant[] = [];

  // Search and filtering
  searchQuery = '';
  selectedFilter: FilterType = 'all';

  // Loading state
  loading = false;


  constructor(
    public translate: TranslationService,
    private tenantService: TenantService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    // Initialize data loading
    this.loadTenantsData();

    // Subscribe for future updates
    this.tenantService.tenants$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tenants => {
        this.allTenants = tenants;
        this.applyFilters();
      });

    // Subscribe to loading state
    this.tenantService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });
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

    // Apply status filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(tenant => tenant.rent_status === this.selectedFilter);
    }

    this.filteredTenants = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  setFilter(filter: FilterType): void {
    this.selectedFilter = filter;
    this.applyFilters();
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

    return tenants.filter(tenant => tenant.rent_status === filter).length;
  }

  openTenantDetails(tenantId: string): void {
    const tenant = this.tenantService.getTenantById(tenantId);
    if (tenant) {
      const modalRef = this.modalService.open(TenantDetailsModalComponent, {
        size: 'lg',
        centered: true
      });
      modalRef.componentInstance.tenant = tenant;
    }
  }

  async openAddTenantModal(): Promise<void> {
    const modalRef = this.modalService.open(AddTenantModalComponent, {
      size: 'lg',
      centered: true
    });

    try {
      const result = await modalRef.result;
      // No need to manually refresh - the observable subscription will handle it
    } catch (error) {
      // Modal dismissed or error occurred, no action needed
      console.error('Error adding tenant:', error);
    }
  }

  trackByTenantId(index: number, tenant: Tenant): string {
    return tenant.id;
  }
}
