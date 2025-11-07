import { Injectable } from '@angular/core';
import { Tenant } from '../models/tenant.model';
import { Payment } from '../models/property.model';
import { Property } from '../models/property.model';

/**
 * Tenant rent status following the property management model.
 * Status represents the current state of rent payment relative to the next due date.
 */
export type TenantStatus = 'vacant' | 'paid' | 'upcoming' | 'due_soon' | 'due_today' | 'overdue' | 'partially_paid';

/**
 * RentDueService - Centralized service for rent status calculations.
 * 
 * This service provides a single source of truth for determining tenant payment status
 * based on their next due date. All calculations are timezone-safe for South Africa (UTC+2).
 * 
 * **Propza only supports monthly billing cycles.**
 * 
 * Status Rules (based on days until next due date):
 * - daysUntil > 7 → "paid"
 * - 4 ≤ daysUntil ≤ 7 → "upcoming"
 * - 1 ≤ daysUntil ≤ 3 → "due_soon"
 * - daysUntil = 0 → "due_today"
 * - daysUntil < 0 → "overdue"
 * 
 * Example Tests:
 * - 28 Oct 2025 | nextDueDate = 1 Nov 2025 → "due_soon" (3 days)
 * - 22 Oct 2025 | nextDueDate = 1 Nov 2025 → "paid" (10 days)
 * - 26 Oct 2025 | nextDueDate = 1 Nov 2025 → "upcoming" (6 days)
 * - 1 Nov 2025 | nextDueDate = 1 Nov 2025 → "due_today" (0 days)
 * - 2 Nov 2025 | nextDueDate = 1 Nov 2025 → "overdue" (-1 days)
 */
@Injectable({
  providedIn: 'root'
})
export class RentDueService {

  /**
   * South Africa timezone offset (UTC+2, no DST)
   */
  private readonly ZA_OFFSET_HOURS = 2;

  /**
   * Converts a Date to date-only (midnight) in Africa/Johannesburg timezone (UTC+2).
   * This ensures consistent date comparisons regardless of time components.
   * 
   * @param date - Date to normalize
   * @returns Date object at midnight in ZA timezone
   */
  toDateOnlyZA(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    
    // Get the date components in UTC+2
    const utcTime = d.getTime();
    const zaTime = new Date(utcTime + this.ZA_OFFSET_HOURS * 60 * 60 * 1000);
    
    // Extract date components and create a clean date-only object
    const year = zaTime.getUTCFullYear();
    const month = zaTime.getUTCMonth();
    const day = zaTime.getUTCDate();
    
    // Return as UTC date representing the ZA date
    return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  }

  /**
   * Gets today's date at midnight in Africa/Johannesburg timezone.
   * 
   * @returns Today's date (date-only, no time component)
   */
  getTodayZA(): Date {
    return this.toDateOnlyZA(new Date());
  }

  /**
   * Calculates the difference between two dates in calendar days.
   * Positive result means `b` is after `a`.
   * 
   * @param a - First date
   * @param b - Second date
   * @returns Number of calendar days between dates (b - a)
   */
  diffInCalendarDays(a: Date, b: Date): number {
    const aTime = a.getTime();
    const bTime = b.getTime();
    const millisPerDay = 1000 * 60 * 60 * 24;
    return Math.round((bTime - aTime) / millisPerDay);
  }

  /**
   * Safely adds months to a date, handling month-end boundaries correctly.
   * Examples:
   * - 31 Jan 2024 + 1 month → 29 Feb 2024 (leap year)
   * - 31 Jan 2025 + 1 month → 28 Feb 2025
   * - 31 Mar 2025 + 1 month → 30 Apr 2025
   * 
   * @param date - Starting date
   * @param months - Number of months to add (can be negative)
   * @returns New date with months added
   */
  safeAddMonths(date: Date, months: number): Date {
    const result = new Date(date);
    const targetMonth = result.getUTCMonth() + months;
    const targetYear = result.getUTCFullYear() + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;
    
    // Get the original day
    const originalDay = result.getUTCDate();
    
    // Set to target month/year with day 1 first
    result.setUTCFullYear(targetYear);
    result.setUTCMonth(normalizedMonth, 1);
    
    // Get max day in target month
    result.setUTCMonth(normalizedMonth + 1, 0);
    const maxDayInTargetMonth = result.getUTCDate();
    
    // Clamp to valid day
    const targetDay = Math.min(originalDay, maxDayInTargetMonth);
    result.setUTCDate(targetDay);
    
    return result;
  }

  /**
   * Evaluates a tenant's rent status based on their next due date.
   * This is a pure function that depends only on the next due date and today's date.
   * 
   * Status determination:
   * - daysUntil > 7 → "paid" (payment received, next due is far away)
   * - 4 ≤ daysUntil ≤ 7 → "upcoming" (due in about a week)
   * - 1 ≤ daysUntil ≤ 3 → "due_soon" (due in next few days)
   * - daysUntil = 0 → "due_today" (due today)
   * - daysUntil < 0 → "overdue" (past due date)
   * 
   * @param nextDueDateISO - Next due date (ISO string or Date)
   * @param today - Optional reference date (defaults to today in ZA timezone)
   * @returns Tenant status
   */
  private evaluateTenantStatus(nextDueDateISO: string | Date, today?: Date): TenantStatus {
    const nextDueDate = this.toDateOnlyZA(nextDueDateISO);
    const referenceDate = today ? this.toDateOnlyZA(today) : this.getTodayZA();
    
    const daysUntil = this.diffInCalendarDays(referenceDate, nextDueDate);
    
    if (daysUntil < 0) {
      return 'overdue';
    } else if (daysUntil === 0) {
      return 'due_today';
    } else if (daysUntil >= 1 && daysUntil <= 3) {
      return 'due_soon';
    } else if (daysUntil >= 4 && daysUntil <= 7) {
      return 'upcoming';
    } else {
      return 'paid'; // daysUntil > 7
    }
  }

  /**
   * Gets the tenant's current rent status.
   * 
   * Special cases:
   * - If lease hasn't started yet → 'vacant'
   * - If lease has ended → 'vacant'
   * - Otherwise, evaluates based on next due date
   * 
   * @param tenant - Tenant to evaluate
   * @param today - Optional reference date (defaults to today)
   * @returns Tenant status
   */
  getTenantStatus(tenant: Tenant, today?: Date): TenantStatus {
    const referenceDate = today ? this.toDateOnlyZA(today) : this.getTodayZA();
    
    // Check if lease hasn't started
    if (tenant.lease_start_date) {
      const leaseStart = this.toDateOnlyZA(tenant.lease_start_date);
      if (referenceDate < leaseStart) {
        return 'vacant';
      }
    }
    
    // Check if lease has ended
    if (tenant.lease_end_date) {
      const leaseEnd = this.toDateOnlyZA(tenant.lease_end_date);
      if (referenceDate > leaseEnd) {
        return 'vacant';
      }
    }
    
    // Evaluate based on next due date
    if (!tenant.rent_due_date) {
      // If no due date set, consider upcoming
      return 'upcoming';
    }
    
    return this.evaluateTenantStatus(tenant.rent_due_date, referenceDate);
  }

  /**
   * Gets the tenant's status including payment analysis.
   * This variant checks if partial payments have been made for the current period.
   * 
   * @param tenant - Tenant to evaluate
   * @param payments - All payments for this property
   * @param property - Property details
   * @param today - Optional reference date
   * @returns Tenant status (including 'partially_paid' if applicable)
   */
  getStatusForTenant(
    tenant: Tenant,
    payments: Payment[],
    property?: Property,
    today?: Date
  ): TenantStatus {
    const referenceDate = today ? this.toDateOnlyZA(today) : this.getTodayZA();
    
    // First check vacancy status
    if (tenant.lease_end_date) {
      const leaseEnd = this.toDateOnlyZA(tenant.lease_end_date);
      if (referenceDate > leaseEnd) {
        return 'vacant';
      }
    }
    if (tenant.lease_start_date) {
      const leaseStart = this.toDateOnlyZA(tenant.lease_start_date);
      if (referenceDate < leaseStart) {
        return 'vacant';
      }
    }
    
    // Get base status from next due date FIRST (this is the priority)
    const baseStatus = tenant.rent_due_date 
      ? this.evaluateTenantStatus(tenant.rent_due_date, referenceDate)
      : 'upcoming';
    
    // Determine the due period from the tenant's next due date (YYYY-MM)
    // This allows early payments for upcoming periods to affect status immediately
    let duePeriod: string | null = null;
    if (tenant.rent_due_date) {
      const d = this.toDateOnlyZA(tenant.rent_due_date);
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      duePeriod = `${y}-${m}`;
    }

    // If we have a due period, evaluate payments against that period (supports early payments)
    if (duePeriod) {
      const collectedForDuePeriod = payments
        .filter(p => p.property_id === tenant.property_id && p.period === duePeriod)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      if (collectedForDuePeriod >= tenant.rent_amount) {
        // The upcoming due period is already fully paid → show 'paid'
        return 'paid';
      }

      if (collectedForDuePeriod > 0 && baseStatus !== 'overdue') {
        // Partial payment for the upcoming due period
        return 'partially_paid';
      }
    }

    // No full/partial coverage for the upcoming period → fall back to timeline status
    return baseStatus;
  }

  /**
   * Calculates the next due date after a payment is logged.
   * Simply adds one month to the current due date, handling month-end boundaries.
   * 
   * @param currentDueDate - Current due date
   * @returns Next due date (one month later)
   */
  getNextDueDate(currentDueDate: string | Date): Date {
    const current = this.toDateOnlyZA(currentDueDate);
    return this.safeAddMonths(current, 1);
  }

  /**
   * Gets the current rent period key (YYYY-MM format) based on today's date.
   * 
   * @param today - Optional reference date
   * @returns Period key in YYYY-MM format
   */
  getCurrentPeriod(today?: Date): string {
    const referenceDate = today ? this.toDateOnlyZA(today) : this.getTodayZA();
    const year = referenceDate.getUTCFullYear();
    const month = String(referenceDate.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Maps the detailed TenantStatus to the database rent_status field.
   * 
   * Note: The database currently supports: 'paid' | 'overdue' | 'upcoming' | 'vacant'
   * 
   * @param status - Detailed tenant status
   * @returns Database-compatible status
   */
  mapToDatabaseStatus(status: TenantStatus): 'paid' | 'overdue' | 'upcoming' | 'vacant' {
    switch (status) {
      case 'paid':
        return 'paid';
      case 'overdue':
        return 'overdue';
      case 'vacant':
        return 'vacant';
      case 'partially_paid':
      case 'upcoming':
      case 'due_soon':
      case 'due_today':
        // Map all "not yet overdue" statuses to 'upcoming' for DB compatibility
        return 'upcoming';
    }
  }

  /**
   * Calculates total payments collected for a specific period.
   * 
   * @param payments - All payments
   * @param propertyId - Property ID to filter by
   * @param period - Period key (YYYY-MM format)
   * @returns Total amount collected
   */
  getCollectedAmount(
    payments: Payment[],
    propertyId: string,
    period: string
  ): number {
    return payments
      .filter(p => p.property_id === propertyId && p.period === period)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }
}
