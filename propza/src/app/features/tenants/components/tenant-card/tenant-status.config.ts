/**
 * Normalized tenant dashboard buckets — pills share the same metrics; only colors differ.
 * `partial` is reserved for future partial-payment states on the tenant model.
 */
export type TenantDashboardBucket = 'paid' | 'overdue' | 'upcoming' | 'partial' | 'vacant';

export type StatusPillColorAttr = 'success' | 'partial' | 'danger' | 'warning' | 'info' | 'neutral';

export const TENANT_STATUS_CONFIG: Record<TenantDashboardBucket, { pillColor: StatusPillColorAttr }> = {
  paid: { pillColor: 'success' },
  overdue: { pillColor: 'danger' },
  upcoming: { pillColor: 'info' },
  partial: { pillColor: 'partial' },
  vacant: { pillColor: 'neutral' },
};

/** Computed card status from `TenantCardComponent.actualStatus` (matches `Tenant.rent_status` + date rules). */
export type TenantCardComputedStatus = 'paid' | 'overdue' | 'upcoming' | 'vacant';

export const TENANT_CARD_PRESENTATION: Record<
  TenantCardComputedStatus,
  { bucket: TenantDashboardBucket; pillColor: StatusPillColorAttr; labelKey: string }
> = {
  paid: { bucket: 'paid', pillColor: 'success', labelKey: 'status.paid' },
  overdue: { bucket: 'overdue', pillColor: 'danger', labelKey: 'status.overdue' },
  upcoming: { bucket: 'upcoming', pillColor: 'info', labelKey: 'status.upcoming' },
  vacant: { bucket: 'vacant', pillColor: 'neutral', labelKey: 'status.vacant' },
};
