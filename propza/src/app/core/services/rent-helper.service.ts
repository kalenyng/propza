import { Injectable } from '@angular/core';

export type RentStatus = 'vacant' | 'paid' | 'partially_paid' | 'upcoming' | 'due_soon' | 'due_today' | 'grace' | 'overdue';
export type BillingFrequency = 'monthly' | 'weekly';

const GRACE_PERIOD_DAYS = 2;

// ISO 8601: 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
// JavaScript: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
// We'll use ISO (1-7) for storage and convert as needed

@Injectable({
  providedIn: 'root'
})
export class RentHelperService {

  // ========================================
  // MONTHLY BILLING HELPERS
  // ========================================

  /**
   * Calculate the next due date for MONTHLY billing
   * Clamps to actual last day of month (28-31)
   */
  nextDueDate(dueDay: number, tenancyStart?: string): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    
    // Clamp due day to valid range for current month (1 to last day of month)
    const maxDay = this.lastDayOfMonth(currentYear, currentMonth);
    const clampedDay = Math.min(Math.max(dueDay, 1), maxDay);
    
    // Calculate potential due date in current month
    let nextDue = new Date(currentYear, currentMonth, clampedDay);
    nextDue.setHours(0, 0, 0, 0);
    
    // If tenancy start is provided, ensure first due is on or after start
    if (tenancyStart) {
      const startDate = new Date(tenancyStart);
      startDate.setHours(0, 0, 0, 0);
      
      // If nextDue is before tenancy start, move to next month
      while (nextDue < startDate) {
        const nextMonth = nextDue.getMonth() + 1;
        const nextYear = nextDue.getFullYear();
        const nextMaxDay = this.lastDayOfMonth(nextYear, nextMonth);
        const nextClampedDay = Math.min(dueDay, nextMaxDay);
        nextDue = new Date(nextYear, nextMonth, nextClampedDay);
        nextDue.setHours(0, 0, 0, 0);
      }
    }
    
    // If due date has passed this month, move to next month
    if (nextDue < today || (nextDue.getTime() === today.getTime() && currentDay > clampedDay)) {
      const nextMonth = currentMonth + 1;
      const nextMaxDay = this.lastDayOfMonth(currentYear, nextMonth);
      const nextClampedDay = Math.min(dueDay, nextMaxDay);
      nextDue = new Date(currentYear, nextMonth, nextClampedDay);
      nextDue.setHours(0, 0, 0, 0);
    }
    
    return nextDue;
  }

  /**
   * Get period key (YYYY-MM) from a date for MONTHLY billing
   */
  periodKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Get last day of a month
   */
  private lastDayOfMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  // ========================================
  // WEEKLY BILLING HELPERS
  // ========================================

  /**
   * Convert JavaScript day (0=Sun) to ISO weekday (1=Mon...7=Sun)
   */
  private jsToIsoWeekday(jsDay: number): number {
    return jsDay === 0 ? 7 : jsDay;
  }

  /**
   * Convert ISO weekday (1=Mon...7=Sun) to JavaScript day (0=Sun)
   */
  private isoToJsWeekday(isoDay: number): number {
    return isoDay === 7 ? 0 : isoDay;
  }

  /**
   * Get ISO week number and year for a date
   * Returns: { year: number, week: number }
   */
  private getISOWeek(date: Date): { year: number, week: number } {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { year: d.getFullYear(), week: weekNo };
  }

  /**
   * Calculate next due date for WEEKLY billing
   * @param dueWeekday ISO weekday (1=Mon, 7=Sun)
   */
  nextDueDateWeekly(dueWeekday: number, tenancyStart?: string): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayIsoWeekday = this.jsToIsoWeekday(today.getDay());
    const targetJsDay = this.isoToJsWeekday(dueWeekday);
    
    // Calculate days until next occurrence of target weekday
    let daysUntil = targetJsDay - today.getDay();
    if (daysUntil < 0) {
      daysUntil += 7;
    } else if (daysUntil === 0 && today.getHours() > 0) {
      // If it's the target day but past midnight, go to next week
      daysUntil = 7;
    }
    
    const nextDue = new Date(today);
    nextDue.setDate(today.getDate() + daysUntil);
    
    // If tenancy start is provided, ensure first due is on or after start
    if (tenancyStart) {
      const startDate = new Date(tenancyStart);
      startDate.setHours(0, 0, 0, 0);
      
      while (nextDue < startDate) {
        nextDue.setDate(nextDue.getDate() + 7);
      }
    }
    
    return nextDue;
  }

  /**
   * Get period key for WEEKLY billing (ISO week format: YYYY-Www)
   */
  periodKeyWeekly(date: Date): string {
    const { year, week } = this.getISOWeek(date);
    return `${year}-W${String(week).padStart(2, '0')}`;
  }

  /**
   * Get current rent period for WEEKLY billing
   */
  getCurrentRentPeriodWeekly(dueWeekday: number): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayIsoWeekday = this.jsToIsoWeekday(today.getDay());
    
    // Find the most recent due date (this week or last week)
    let mostRecentDue: Date;
    
    if (todayIsoWeekday >= dueWeekday) {
      // We're on or after this week's due day
      // Current period = this week
      const targetJsDay = this.isoToJsWeekday(dueWeekday);
      const daysBack = today.getDay() - targetJsDay;
      mostRecentDue = new Date(today);
      mostRecentDue.setDate(today.getDate() - daysBack);
    } else {
      // We're before this week's due day
      // Current period = last week
      const targetJsDay = this.isoToJsWeekday(dueWeekday);
      const daysBack = 7 - (targetJsDay - today.getDay());
      mostRecentDue = new Date(today);
      mostRecentDue.setDate(today.getDate() - daysBack);
    }
    
    return this.periodKeyWeekly(mostRecentDue);
  }

  /**
   * Check if tenancy is active
   */
  isActive(tenancyStart: string, tenancyEnd?: string | null): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(tenancyStart);
    start.setHours(0, 0, 0, 0);
    
    if (start > today) {
      return false; // Tenancy hasn't started yet
    }
    
    if (tenancyEnd) {
      const end = new Date(tenancyEnd);
      end.setHours(0, 0, 0, 0);
      return today <= end;
    }
    
    return true; // No end date, still active
  }

  /**
   * Calculate days until due date
   */
  daysUntilDue(dueDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Determine rent status with partial payment support and overpayment carryover
   * EVALUATION ORDER (must short-circuit on Paid):
   * 1. Check if tenancy active → if not, return Vacant
   * 2. Check if totalCollected >= rentAmount → return Paid (SHORT-CIRCUIT, always!)
   * 3. If totalCollected > 0 → return Partially Paid
   * 4. Otherwise, calculate time-based urgency
   * 
   * @param isActiveTenancy - Whether tenancy is active
   * @param nextDue - Next due date
   * @param collectedAmount - Sum of payments for this period (including carryover)
   * @param rentAmount - Expected rent for this period
   */
  statusFor(
    isActiveTenancy: boolean,
    nextDue: Date,
    collectedAmount: number,
    rentAmount: number
  ): RentStatus {
    // Step 1: Check tenancy active
    if (!isActiveTenancy) {
      return 'vacant';
    }

    // Step 2: Check if fully paid (SHORT-CIRCUIT - ALWAYS return paid if collected >= rent)
    // This applies regardless of daysUntilDue (even if 1 day away, if paid → show Paid)
    // NO CAPPING - overpayments carry forward
    if (collectedAmount >= rentAmount) {
      return 'paid';
    }

    // Step 3: Check if partially paid
    if (collectedAmount > 0) {
      return 'partially_paid';
    }

  // Step 4: No payment - calculate time-based urgency
  const daysUntil = this.daysUntilDue(nextDue);

  if (daysUntil > 7) {
    return 'upcoming';      // More than 7 days away (blue)
  } else if (daysUntil >= 4) {
    return 'upcoming';      // 4-7 days away (blue)
  } else if (daysUntil >= 1) {
    return 'due_soon';      // 1-3 days away (yellow-orange)
  } else if (daysUntil === 0) {
    return 'due_today';     // Due today (reddish-orange)
  } else {
    return 'overdue';       // Past due (red)
  }
}

  /**
   * Calculate remaining balance for a period (allows negative for overpayment)
   */
  getRemaining(collectedAmount: number, rentAmount: number): number {
    return Math.max(0, rentAmount - collectedAmount);
  }

  /**
   * Calculate overpayment/credit for a period
   */
  getOverpayment(collectedAmount: number, rentAmount: number): number {
    return Math.max(0, collectedAmount - rentAmount);
  }

  /**
   * Get status label for display
   */
  getStatusLabel(status: RentStatus): string {
    const labels: Record<RentStatus, string> = {
      vacant: 'Vacant',
      paid: 'Paid',
      partially_paid: 'Partially Paid',
      upcoming: 'Upcoming',
      due_soon: 'Due Soon',
      due_today: 'Due Today',
      grace: 'Late',
      overdue: 'Overdue'
    };
    return labels[status];
  }

  /**
   * Get status color for display
   */
  getStatusColor(status: RentStatus): string {
    const colors: Record<RentStatus, string> = {
      vacant: 'neutral',
      paid: 'success',
      partially_paid: 'partial',
      upcoming: 'info',
      due_soon: 'info',
      due_today: 'warning',
      grace: 'warning',
      overdue: 'danger'
    };
    return colors[status];
  }

  /**
   * Check if a due date falls within the current month
   */
  isDueThisMonth(dueDate: Date): boolean {
    const today = new Date();
    const due = new Date(dueDate);
    
    return due.getMonth() === today.getMonth() && 
           due.getFullYear() === today.getFullYear();
  }

  /**
   * Get current month period key
   */
  getCurrentPeriod(): string {
    const today = new Date();
    return this.periodKey(today);
  }

  /**
   * Get the period we're currently in based on rent cycle
   * Returns the month of the most recent due date (past or today)
   * This represents which rent payment covers the current time
   */
  getCurrentRentPeriod(dueDay: number): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    
    // Clamp to actual month end
    const maxDay = this.lastDayOfMonth(currentYear, currentMonth);
    const clampedDay = Math.min(Math.max(dueDay, 1), maxDay);
    
    // Find the most recent due date (today or in the past)
    let mostRecentDue: Date;
    
    if (currentDay >= clampedDay) {
      // We're on or after this month's due date
      // Current period = this month
      mostRecentDue = new Date(currentYear, currentMonth, clampedDay);
    } else {
      // We're before this month's due date
      // Current period = last month
      const lastMonth = currentMonth - 1;
      const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const lastMonthIndex = currentMonth === 0 ? 11 : lastMonth;
      const lastMaxDay = this.lastDayOfMonth(lastYear, lastMonthIndex);
      const lastClampedDay = Math.min(dueDay, lastMaxDay);
      mostRecentDue = new Date(lastYear, lastMonthIndex, lastClampedDay);
    }
    
    mostRecentDue.setHours(0, 0, 0, 0);
    return this.periodKey(mostRecentDue);
  }

  /**
   * Get due date text for display
   */
  getDueDateText(status: RentStatus, dueDate: Date): string {
    const daysUntil = this.daysUntilDue(dueDate);
    
    if (status === 'paid') {
      return 'Next rent due';
    } else if (status === 'due_today') {
      return 'Due today';
    } else if (status === 'overdue') {
      const daysOverdue = Math.abs(daysUntil);
      return `${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`;
    } else {
      // For unpaid statuses (upcoming, due_soon, grace)
      return 'Due';
    }
  }
}
