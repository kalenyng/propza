# Fix Tenant Creation Issues

## 🐛 Issue 1: Duplicate Key Error

**Error:** `duplicate key value violates unique constraint "unique_property_period"`

**Cause:** Your database still has the `unique_property_period` constraint that prevents multiple payments for the same property/period.

**Solution:** Run this migration in your Supabase SQL Editor:

```sql
-- Remove the unique constraint to allow partial payments
ALTER TABLE payments DROP CONSTRAINT IF EXISTS unique_property_period;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_payments_property_period_agg 
ON payments(property_id, period);

-- Verify the constraint is gone
SELECT conname FROM pg_constraint 
WHERE conrelid = 'payments'::regclass AND conname = 'unique_property_period';
-- Should return no rows
```

---

## 🤔 Issue 2: Status Shows "Paid" When Expected "Due Soon"

**Scenario:**
- Today: Oct 29, 2025
- Rent Due Date entered: Nov 1, 2025 (3 days away)
- "Currently Paid" checkbox: ☑️ CHECKED
- **Current behavior:** Shows "paid"
- **Expected (?):** Shows "due soon"

### Why This Happens

When you check "Currently Paid", the system interprets this as:
> "The tenant has ALREADY paid for the upcoming period (Nov 2025)"

So the logic calculates:
1. **Current period:** October 2025
2. **Payment created for:** October 2025 period
3. **Next due date:** December 1, 2025 (one month after Nov 1)
4. **Days until next payment:** ~33 days
5. **Status:** "paid" (because > 7 days until next payment)

### This is Actually Correct!

If the tenant has "currently paid", they've paid for November, so their next payment is due in December. The status "paid" means they're up to date.

---

## 💡 What "Currently Paid" Really Means

The checkbox has two behaviors:

### ☑️ CHECKED = "Tenant has paid for upcoming period"
```
Original Rent Due: Nov 1, 2025
↓
Creates payment for: Oct 2025 period (current)
Next due date set to: Dec 1, 2025 (next period)
Status: "paid" (33 days away)
```

### ☐ UNCHECKED = "Tenant hasn't paid yet"
```
Original Rent Due: Nov 1, 2025
↓
No payment created
Next due date set to: Nov 1, 2025 (as entered)
Status: "due_soon" (3 days away)
```

---

## 🎯 Expected Use Cases

### Use Case 1: New Tenant Moving In (Not Paid Yet)
```
Today: Oct 29
Lease Start: Oct 1
Rent Due: Nov 1 (first payment)
Currently Paid: ☐ (unchecked)
→ Result: Status = "due_soon", needs to pay by Nov 1
```

### Use Case 2: Existing Tenant You're Adding to System (Already Paid)
```
Today: Oct 29
Lease Start: Jan 1 (been living there)
Rent Due: Nov 1 (next payment)
Currently Paid: ☑️ (they paid for Nov already)
→ Result: Status = "paid", next payment due Dec 1
```

### Use Case 3: New Tenant Who Paid First Month Upfront
```
Today: Oct 29
Lease Start: Oct 1
Rent Due: Nov 1
Currently Paid: ☑️ (paid Oct rent upfront)
→ Result: Status = "paid", next payment due Nov 1... wait, this is wrong!
```

---

## 🔧 The Real Issue: Logic Mismatch

I see the problem now! When a NEW tenant moves in and pays their first month upfront:
- They should be marked as "paid" for the current period
- But their NEXT due date should still be Nov 1 (not Dec 1)
- Because they paid for October (current), not November (next)

The current logic incorrectly advances the due date by TWO months instead of ONE.

### Current (Wrong) Logic:
```
User enters: Nov 1 as rent due date
Currently Paid: YES
System calculates: Dec 1 as next due date
Problem: Skips November entirely!
```

### Correct Logic Should Be:
```
User enters: Nov 1 as rent due date (when first payment is due)
Currently Paid: YES (means they paid for October)
System should calculate: Nov 1 as next due date (still due Nov 1!)
Payment created for: October 2025
```

The "Currently Paid" checkbox should mean:
- "They've paid for the CURRENT month (October)"
- "Their next payment is still the rent due date you entered (November 1)"

NOT:
- "Skip ahead an extra month"

---

## 🛠️ Required Fix

The issue is in how we interpret "Currently Paid":
- **Payment period:** Should be CURRENT month (Oct 2025)
- **Next due date:** Should be the ENTERED rent due date (Nov 1), not one month later

Let me know if you want me to update the logic to match this interpretation!

