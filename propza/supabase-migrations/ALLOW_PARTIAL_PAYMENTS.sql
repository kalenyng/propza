-- ====================================
-- ALLOW PARTIAL PAYMENTS
-- Remove unique constraint, add index
-- Run this in Supabase SQL Editor
-- ====================================

-- Drop the unique constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_property_period'
  ) THEN
    ALTER TABLE payments DROP CONSTRAINT unique_property_period;
    RAISE NOTICE 'Removed unique_property_period constraint';
  ELSE
    RAISE NOTICE 'Constraint unique_property_period does not exist';
  END IF;
END $$;

-- Add index for fast aggregation (if not exists)
CREATE INDEX IF NOT EXISTS idx_payments_property_period_agg 
ON payments(property_id, period);

-- Verify changes
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'payments'::regclass;

-- Show indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'payments';

