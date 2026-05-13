import { RentStatus } from '../../../../core/services/rent-helper.service';

/** Normalized dashboard buckets — pills share metrics; only colors differ per bucket. */
export type PropertyDashboardStatus = 'paid' | 'overdue' | 'dueSoon' | 'partial' | 'vacant';

export type StatusPillColorAttr = 'success' | 'partial' | 'danger' | 'warning' | 'info' | 'neutral';

/**
 * Base config for the five visual families (labels use i18n via `labelKey` on each RentStatus).
 * `dueSoon` is a bucket for upcoming / due-soon / due-today / grace; actual pill color may vary — see `PROPERTY_CARD_STATUS_PRESENTATION`.
 */
export const PROPERTY_STATUS_CONFIG: Record<
  PropertyDashboardStatus,
  { pillColor: StatusPillColorAttr }
> = {
  paid: { pillColor: 'success' },
  overdue: { pillColor: 'danger' },
  dueSoon: { pillColor: 'info' },
  partial: { pillColor: 'partial' },
  vacant: { pillColor: 'neutral' },
};

/** Maps API rent status → dashboard category, pill color, and translation key for the pill label. */
export const PROPERTY_CARD_STATUS_PRESENTATION: Record<
  RentStatus,
  { category: PropertyDashboardStatus; pillColor: StatusPillColorAttr; labelKey: string }
> = {
  paid: { category: 'paid', pillColor: 'success', labelKey: 'status.paid' },
  vacant: { category: 'vacant', pillColor: 'neutral', labelKey: 'status.vacant' },
  partially_paid: { category: 'partial', pillColor: 'partial', labelKey: 'status.partiallyPaid' },
  overdue: { category: 'overdue', pillColor: 'danger', labelKey: 'status.overdue' },
  due_soon: { category: 'dueSoon', pillColor: 'info', labelKey: 'status.dueSoon' },
  upcoming: { category: 'dueSoon', pillColor: 'info', labelKey: 'status.upcoming' },
  due_today: { category: 'dueSoon', pillColor: 'warning', labelKey: 'status.dueToday' },
  grace: { category: 'dueSoon', pillColor: 'warning', labelKey: 'status.late' },
};
