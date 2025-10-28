import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderBannerComponent } from '../../../../shared/components/header-banner/header-banner.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { TenantCardComponent } from '../../components/tenant-card/tenant-card.component';
import { AddTenantModalComponent } from '../../components/add-tenant-modal/add-tenant-modal.component';
import { TranslationService } from '../../../../core/services/translation.service';
import { TenantService, Tenant } from '../../../../core/services/tenant.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';

type FilterType = 'all' | 'overdue';

@Component({
  selector: 'app-tenant-list',
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


  constructor(
    public translate: TranslationService,
    private tenantService: TenantService,
    private modalService: NgbModal,
    private router: Router
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

    // Debug logging (remove after testing)
    console.log(`Tenant: ${tenant.name}, Due Date: ${tenant.rent_due_date}, Parsed: ${dueDate.toISOString()}, Today: ${today.toISOString()}, Is Overdue: ${dueDate < today}`);

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
    // Navigate to tenant detail page instead of opening modal
    void this.router.navigate(['/tenant', tenantId]);
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
