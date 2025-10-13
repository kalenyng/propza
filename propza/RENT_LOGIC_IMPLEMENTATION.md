# Rent Logic Implementation - Complete

## Overview
Implemented comprehensive period-based rent tracking with time-aware statuses, replacing the simple "Unpaid" status with granular states based on due dates and grace periods.

## ✅ Completed Features

### 1. **Data Model & Database**

**Payments Table** (`supabase-migrations/001_payments_table.sql`):
```sql
- id (UUID, primary key)
- property_id (UUID, foreign key to properties)
- period (TEXT, format: YYYY-MM)
- amount (NUMERIC)
- payment_date (DATE)
- payment_method (TEXT)
- notes (TEXT)
- paid_at (TIMESTAMPTZ)
- UNIQUE constraint on (property_id, period) - prevents double payments
- Indexes on property_id, period, and combined for performance
```

### 2. **Rent Helper Service** (`core/rent-helper.service.ts`)

Pure helper functions for all rent calculations:

**Core Functions:**
- `nextDueDate(dueDay, tenancyStart)` - Calculates next due date
- `periodKey(date)` - Returns YYYY-MM format
- `isActive(tenancyStart, tenancyEnd)` - Checks if tenancy is active
- `daysUntilDue(dueDate)` - Days until/since due date
- `statusFor(isActive, nextDue, isPaid)` - Determines rent status
- `isDueThisMonth(dueDate)` - Checks if due date falls in current month

**Display Helpers:**
- `getStatusLabel(status)` - Human-readable status text
- `getStatusColor(status)` - Color coding for UI
- `getDueDateText(status, dueDate)` - Smart due date messages

### 3. **Status System**

**New Statuses** (replaces simple "Unpaid"):
- **Vacant** - No active tenancy
- **Paid** - Payment recorded for current period
- **Upcoming** - Due in > 7 days
- **Due Soon** - Due in 1-7 days
- **Due Today** - Due date is today
- **Grace** - 1-3 days overdue (grace period)
- **Overdue** - More than 3 days overdue

**Status Colors:**
- Vacant: Grey (neutral)
- Paid: Green (success)
- Upcoming: Blue (info)
- Due Soon: Light Amber (warning-light)
- Due Today: Amber (warning)
- Grace: Amber (warning)
- Overdue: Red (danger)

### 4. **Home Component Updates**

**Property Loading:**
- Fetches properties with tenancies
- Fetches payments for current and next month in single query
- Builds in-memory payment map: `{property_id}-{period}` → boolean
- Calculates status using RentHelperService

**Metrics Calculation:**
- **Total Rent Due**: Sum of rent_amount for properties due THIS MONTH that are unpaid
- **Total Expected**: Sum of rent_amount for all active properties due THIS MONTH
- **Collected %**: `(Expected - Due) / Expected * 100`
- Only includes current month, excludes vacant properties

**Filters:**
- All - Show everything
- Overdue - Only overdue properties
- **Unpaid (period)** - Groups: Upcoming + Due Soon + Due Today + Grace + Overdue
- Paid - Only paid for current period
- Vacant - No active tenancy

**Sorting:**
- Due Date (default) - Earliest first
- Amount - Highest first
- Status - Priority order: Overdue → Grace → Due Today → Due Soon → Upcoming → Paid → Vacant

### 5. **Property Card Updates**

**Status Display:**
- Color-coded pill with dot indicator
- Dynamic label using RentHelperService
- Supports all 7 status states

**Due Date Line:**
- "Next rent due {date}" - When paid
- "Due {date}" - For upcoming/due soon
- "Due today" - On due date
- "{N} days overdue" - When overdue
- Hidden for vacant properties

### 6. **Payment Recording**

**Period-Based System:**
- Payment date determines period (YYYY-MM)
- Automatically calculates period from next due date
- Unique constraint prevents double-payment
- Error handling for duplicate payments (code 23505)

**Property Detail Component:**
- Calculates next due date using RentHelperService
- Extracts period key from due date
- Records payment with period
- Reloads property to reflect new status

### 7. **Edge Cases Handled**

**Date Calculations:**
- Due day clamped to 1-28 (avoids month-end issues)
- Tenancy start mid-month: First due is first valid due_day on/after start
- Tenancy end before next due: Property becomes vacant
- Time zones: All dates normalized to midnight (00:00:00)

**Payment Logic:**
- Duplicate payment detection (unique constraint)
- Period-based tracking (not individual payments)
- Supports partial/multiple payments (sum by period)

**Status Logic:**
- Grace period (3 days) before marking overdue
- Proper handling of month boundaries
- Vacant status takes precedence over all others

## 🗄️ Database Migration

Run this SQL in Supabase:

```sql
-- See supabase-migrations/001_payments_table.sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  notes TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_property_period UNIQUE (property_id, period)
);

CREATE INDEX idx_payments_property_id ON payments(property_id);
CREATE INDEX idx_payments_period ON payments(period);
CREATE INDEX idx_payments_property_period ON payments(property_id, period);
CREATE INDEX idx_payments_paid_at ON payments(paid_at DESC);
```

## 📊 Testing Checklist

### Status Transitions
- [ ] Property >7 days before due shows "Upcoming" (blue)
- [ ] Property 1-7 days before due shows "Due Soon" (light amber)
- [ ] Property on due date shows "Due Today" (amber)
- [ ] Property 1-3 days after due shows "Grace Period" (amber)
- [ ] Property >3 days after due shows "Overdue" (red)
- [ ] After recording payment, status changes to "Paid" (green)

### Metrics
- [ ] Total Rent Due only includes THIS month's unpaid
- [ ] Collected % = (Expected - Due) / Expected
- [ ] Vacant properties excluded from totals
- [ ] Future month rents show as "Upcoming", not included in total due

### Filters
- [ ] "All" shows all properties
- [ ] "Overdue" shows only overdue
- [ ] "Unpaid" groups all non-paid, non-vacant
- [ ] "Paid" shows only paid for current period
- [ ] "Vacant" shows only vacant

### Payments
- [ ] Can record payment for current period
- [ ] Duplicate payment for same period blocked
- [ ] Payment updates status to "Paid"
- [ ] Next due date shown after payment
- [ ] Payment history shows period (YYYY-MM)

### Edge Cases
- [ ] Due day 29-31 clamped to 28
- [ ] Tenancy starting mid-month calculates first due correctly
- [ ] Tenancy ending marks property as vacant
- [ ] Month boundaries handled (Dec→Jan, Feb 28/29)

## 🎨 UI Updates

### Home Page
- Summary bar shows "Total Rent Due" and "Collected %"
- Filter chips: All | Overdue | Unpaid | Paid | Vacant
- Property cards show status pills with colors
- Due date text adapts to status

### Property Detail
- Payment form includes period calculation
- Payment history shows period (YYYY-MM)
- Status updates immediately after payment
- Duplicate payment error handled gracefully

## 🔧 Configuration

**Grace Period**: 3 days (defined in `RentHelperService.GRACE_PERIOD_DAYS`)

To change:
```typescript
const GRACE_PERIOD_DAYS = 3; // Adjust as needed
```

## 📝 Notes

1. **Time Zones**: All date comparisons use local time with hours set to midnight
2. **Performance**: Single query for payments (current + next month), in-memory mapping
3. **Scalability**: Indexes support efficient lookups even with large payment history
4. **Extensibility**: Helper service makes it easy to add new status logic
5. **Type Safety**: Full TypeScript types for RentStatus throughout

## 🚀 Next Steps (Optional)

1. Add payment reports/exports
2. Email notifications for due dates
3. Bulk payment recording
4. Payment receipts/invoices
5. SMS reminders for overdue
6. Multi-currency support refinement
7. Weekly rent calculation for short-term

